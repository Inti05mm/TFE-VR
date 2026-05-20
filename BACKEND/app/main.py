from typing import Optional
from datetime import datetime, timedelta, timezone
import secrets

from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException, Query

from .supabase_client import supabase
from .schemas import (
    PatientCreate,
    PatientLogin,
    SessionStartCreate,
    SessionResultCreate,
    QRSessionCreate,
)


app = FastAPI(title="NeuroVision API")


# ─────────────────────────────────────────
# CONFIGURACIÓN RED LOCAL
# ─────────────────────────────────────────

COMPUTER_IP = "10.161.202.146"

FRONTEND_PORT = "5173"
BACKEND_PORT = "8000"

FRONTEND_BASE_URL = f"http://{COMPUTER_IP}:{FRONTEND_PORT}"
BACKEND_BASE_URL = f"http://{COMPUTER_IP}:{BACKEND_PORT}"


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://10.161.202.146:5173",
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
# LOGIN PACIENTE
# Frontend llama a: POST /patients/login
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
# SESIÓN TEMPORAL QR PARA ABRIR WEBGL EN GAFAS
# Frontend llama a: POST /qr-sessions
# Unity/WebGL valida con: GET /qr-sessions/{token}
# ─────────────────────────────────────────

@app.post("/qr-sessions")
def create_qr_session(data: QRSessionCreate):
    try:
        # 1. Comprobar que el paciente existe
        patient_response = (
            supabase.table("patients")
            .select("id, first_name, last_name, neglect_side, severity, doctor_id")
            .eq("id", data.patient_id)
            .execute()
        )

        if not patient_response.data:
            raise HTTPException(status_code=404, detail="Paciente no encontrado")

        patient = patient_response.data[0]

        # 2. Crear token temporal seguro
        token = secrets.token_urlsafe(24)

        # 3. Caducidad del QR
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)

        # 4. URL que abrirán las gafas
        game_url = f"neurovision://session?qr_token={token}"

        # 5. Guardar en Supabase
        payload = {
            "token": token,
            "patient_id": patient["id"],
            "doctor_id": patient.get("doctor_id"),
            "game_url": game_url,
            "used": False,
            "expires_at": expires_at.isoformat(),
        }

        qr_response = supabase.table("qr_sessions").insert(payload).execute()

        if not qr_response.data:
            raise HTTPException(
                status_code=400,
                detail="No se pudo crear la sesión QR",
            )

        return {
            "message": "Sesión QR creada correctamente",
            "qr_token": token,
            "game_url": game_url,
            "expires_at": expires_at.isoformat(),
            "patient": {
                "id": patient["id"],
                "first_name": patient["first_name"],
                "last_name": patient.get("last_name"),
                "neglect_side": patient.get("neglect_side") or "left",
                "severity": patient.get("severity") or 1,
            },
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al crear sesión QR: {str(e)}",
        )


@app.get("/qr-sessions/{token}")
def validate_qr_session(token: str):
    try:
        # 1. Buscar token en qr_sessions
        qr_response = (
            supabase.table("qr_sessions")
            .select("id, token, patient_id, doctor_id, used, expires_at")
            .eq("token", token)
            .execute()
        )

        if not qr_response.data:
            raise HTTPException(
                status_code=404,
                detail="Token QR no encontrado",
            )

        qr_session = qr_response.data[0]

        # 2. Comprobar si ya fue usado
        if qr_session.get("used"):
            raise HTTPException(
                status_code=401,
                detail="Este QR ya ha sido usado",
            )

        # 3. Comprobar caducidad
        expires_at_raw = qr_session["expires_at"]
        expires_at = datetime.fromisoformat(
            expires_at_raw.replace("Z", "+00:00")
        )

        now = datetime.now(timezone.utc)

        if expires_at < now:
            raise HTTPException(
                status_code=401,
                detail="El QR ha caducado",
            )

        # 4. Obtener paciente asociado
        patient_response = (
            supabase.table("patients")
            .select("id, first_name, last_name, dni, neglect_side, severity, doctor_id")
            .eq("id", qr_session["patient_id"])
            .execute()
        )

        if not patient_response.data:
            raise HTTPException(
                status_code=404,
                detail="Paciente asociado al QR no encontrado",
            )

        patient = patient_response.data[0]

        # Para pruebas NO marcamos el QR como usado.
        # Cuando funcione todo, puedes activar esto:
        #
        # supabase.table("qr_sessions").update(
        #     {"used": True}
        # ).eq("token", token).execute()

        return {
            "valid": True,
            "qr_session_id": qr_session["id"],
            "patient_id": patient["id"],
            "first_name": patient["first_name"],
            "last_name": patient.get("last_name"),
            "neglect_side": patient.get("neglect_side") or "left",
            "severity": patient.get("severity") or 1,
            "doctor_id": patient.get("doctor_id"),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error al validar sesión QR: {str(e)}",
        )


# ─────────────────────────────────────────
# CREAR SESIÓN REAL DEL EJERCICIO
# Unity llama a: POST /sessions
# Unity espera recibir: { "session_id": "..." }
# ─────────────────────────────────────────

@app.post("/sessions")
def create_session(session: SessionStartCreate):
    try:
        patient_check = (
            supabase.table("patients")
            .select("id, doctor_id")
            .eq("id", session.patient_id)
            .execute()
        )

        if not patient_check.data:
            raise HTTPException(status_code=404, detail="Paciente no encontrado")

        patient = patient_check.data[0]

        payload = {
            "patient_id": session.patient_id,
            "doctor_id": patient.get("doctor_id"),
            "session_type": session.session_type,
        }

        response = supabase.table("sessions").insert(payload).execute()

        if not response.data:
            raise HTTPException(
                status_code=400,
                detail="No se pudo crear la sesión",
            )

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
# Unity llama a: POST /sessions/results
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

            # Totales generales
            "total_trials": result.total_trials,
            "completed_trials": total_hits,
            "correct_trials": total_hits,
            "omitted_trials": omitted_trials,

            # Omisiones por lado
            "omissions_left": omissions_left,
            "omissions_right": omissions_right,

            # Detecciones y totales por lado recibidos desde Unity
            "hit_left": result.hit_left,
            "hit_right": result.hit_right,
            "total_left": result.total_left,
            "total_right": result.total_right,

            "mean_detection_latency_ms": result.mean_detection_latency_ms,

            # Métricas porcentuales para el frontend
            "detection_rate": detection_rate_percent,
            "precision_left": precision_left_percent,
            "precision_right": precision_right_percent,
        }

        print("RESULTADO RECIBIDO DESDE UNITY:")
        print(result)

        print("PAYLOAD QUE SE GUARDA EN session_metrics:")
        print(metrics_payload)

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