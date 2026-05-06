from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException, Query
from .supabase_client import supabase
from .schemas import (
    PatientCreate,
    PatientLogin,
    SessionStartCreate,
    SessionResultCreate,
)


app = FastAPI(title="NeuroVision API")

#app.add_middleware(
#    CORSMiddleware,
#    allow_origins=[
#        "http://localhost:5173",
#        "http://127.0.0.1:5173",
#    ],
#    allow_credentials=True,
#    allow_methods=["*"],
#    allow_headers=["*"],
#)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://192.168.1.133:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def root():
    return {"message": "API funcionando correctamente"}


# ─────────────────────────────────────────
# PACIENTES
# ─────────────────────────────────────────

@app.get("/patients")
def get_patients(
    name: Optional[str] = Query(default=None),
    dni: Optional[str] = Query(default=None),
):
    try:
        query = supabase.table("patients").select(
            "id, first_name, last_name, dni, neglect_side, severity, doctor_id, created_at, updated_at"
        )

        if name:
            query = query.ilike("first_name", f"%{name}%")

        if dni:
            query = query.ilike("dni", f"%{dni}%")

        response = query.order("created_at", desc=True).execute()
        return response.data

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener pacientes: {str(e)}",
        )


@app.get("/patients/{patient_id}")
def get_patient_by_id(patient_id: str):
    try:
        response = (
            supabase.table("patients")
            .select(
                "id, first_name, last_name, dni, neglect_side, severity, doctor_id, created_at, updated_at"
            )
            .eq("id", patient_id)
            .execute()
        )

        if not response.data:
            raise HTTPException(status_code=404, detail="Paciente no encontrado")

        return response.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al obtener el paciente: {str(e)}",
        )


@app.post("/patients")
def create_patient(patient: PatientCreate):
    try:
        payload = patient.model_dump()

        response = supabase.table("patients").insert(payload).execute()

        if not response.data:
            raise HTTPException(status_code=400, detail="No se pudo crear el paciente")

        return {
            "message": "Paciente creado correctamente",
            "patient": response.data[0],
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al crear paciente: {str(e)}",
        )


# ─────────────────────────────────────────
# LOGIN PARA UNITY
# BackendManager.cs llama a: POST /patients/login
# ─────────────────────────────────────────

@app.post("/patients/login")
def login_patient(login: PatientLogin):
    try:
        response = (
            supabase.table("patients")
            .select("id, first_name, last_name, dni, password, neglect_side, severity")
            .eq("dni", login.dni)
            .eq("password", login.password)
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=401,
                detail="DNI o contraseña incorrectos",
            )

        patient = response.data[0]

        return {
            "patient_id": patient["id"],
            "first_name": patient["first_name"],
            "last_name": patient.get("last_name"),
            "neglect_side": patient.get("neglect_side") or "left",
            "severity": patient.get("severity") or 1,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error en login: {str(e)}",
        )


# ─────────────────────────────────────────
# CREAR SESIÓN PARA UNITY
# BackendManager.cs llama a: POST /sessions
# Unity espera recibir: { "session_id": "..." }
# ─────────────────────────────────────────

@app.post("/sessions")
def create_session(session: SessionStartCreate):
    try:
        patient_check = (
            supabase.table("patients")
            .select("id")
            .eq("id", session.patient_id)
            .execute()
        )

        if not patient_check.data:
            raise HTTPException(status_code=404, detail="Paciente no encontrado")

        payload = {
            "patient_id": session.patient_id,
            "session_type": session.session_type,
        }

        response = supabase.table("sessions").insert(payload).execute()

        if not response.data:
            raise HTTPException(status_code=400, detail="No se pudo crear la sesión")

        return {
            "session_id": response.data[0]["id"],
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al crear sesión: {str(e)}",
        )


# ─────────────────────────────────────────
# GUARDAR RESULTADOS DE UNITY
# BackendManager.cs llama a: POST /sessions/results
# ─────────────────────────────────────────

@app.post("/sessions/results")
def save_session_results(result: SessionResultCreate):
    try:
        total_hits = result.hit_left + result.hit_right

        omissions_left = max(result.total_left - result.hit_left, 0)
        omissions_right = max(result.total_right - result.hit_right, 0)
        omitted_trials = omissions_left + omissions_right

        # Unity manda ratios 0-1. El front espera porcentajes 0-100.
        detection_rate_percent = result.detection_rate * 100
        precision_left_percent = result.precision_left * 100
        precision_right_percent = result.precision_right * 100

        session_update = (
            supabase.table("sessions")
            .update(
                {
                    "duration_seconds": result.duration_seconds,
                    "score": result.score,
                    "notes": "Resultados recibidos desde Unity",
                }
            )
            .eq("id", result.session_id)
            .eq("patient_id", result.patient_id)
            .execute()
        )

        if not session_update.data:
            raise HTTPException(
                status_code=404,
                detail="Sesión no encontrada para este paciente",
            )

        metrics_payload = {
    "session_id": result.session_id,
    "total_trials": result.total_trials,
    "completed_trials": total_hits,
    "correct_trials": total_hits,
    "omitted_trials": omitted_trials,
    "omissions_left": omissions_left,
    "omissions_right": omissions_right,

    # Unity actualmente no mide estas métricas
    "mean_detection_latency_ms": None,
    "mean_first_fixation_latency_ms": None,
    "mean_search_time_ms": None,
    "exploration_bias_score": None,
    "extinction_index": None,
    "neglect_severity_score": None,

    # Métricas que sí vienen de Unity
    "detection_rate": detection_rate_percent,
    "precision_left": precision_left_percent,
    "precision_right": precision_right_percent,
}

        metrics_response = (
            supabase.table("session_metrics")
            .upsert(metrics_payload, on_conflict="session_id")
            .execute()
        )

        if not metrics_response.data:
            raise HTTPException(
                status_code=400,
                detail="No se pudieron guardar las métricas",
            )

        return {
            "message": "Resultados guardados correctamente",
            "session": session_update.data[0],
            "metrics": metrics_response.data[0],
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al guardar resultados: {str(e)}",
        )