from typing import Optional
from fastapi import FastAPI, HTTPException, Query
from .supabase_client import supabase
from .schemas import PatientCreate, SessionCreate

app = FastAPI(title="NeuroVision API")


@app.get("/")
def root():
    return {"message": "API funcionando correctamente"}


@app.get("/patients")
def get_patients(
    name: Optional[str] = Query(default=None),
    dni: Optional[str] = Query(default=None),
):
    try:
        query = supabase.table("patients").select(
            "id, first_name, last_name, dni, neglect_side, severity, doctor_id, created_at, updated_at"
        )

        # filtro por nombre
        if name:
            query = query.ilike("first_name", f"%{name}%")

        # filtro por dni
        if dni:
            query = query.ilike("dni", f"%{dni}%")

        response = query.order("created_at", desc=True).execute()
        return response.data

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener pacientes: {str(e)}")


@app.get("/patients/{patient_id}")
def get_patient_by_id(patient_id: str):
    try:
        response = (
            supabase.table("patients")
            .select("id, first_name, last_name, dni, neglect_side, severity, doctor_id, created_at, updated_at")
            .eq("id", patient_id)
            .execute()
        )

        if not response.data:
            raise HTTPException(status_code=404, detail="Paciente no encontrado")

        return response.data[0]

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener el paciente: {str(e)}")


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
        raise HTTPException(status_code=500, detail=f"Error al crear paciente: {str(e)}")


@app.post("/sessions")
def save_session(session: SessionCreate):
    try:
        # Aquí podrías validar más cosas antes de guardar:
        # - si el paciente existe
        # - si el doctor tiene permiso
        # - si los valores tienen sentido

        payload = session.model_dump()

        # Ejemplo: guardar en una tabla "vr_sessions"
        response = supabase.table("vr_sessions").insert(payload).execute()

        if not response.data:
            raise HTTPException(status_code=400, detail="No se pudo guardar la sesión")

        return {
            "message": "Sesión guardada correctamente",
            "session": response.data[0],
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al guardar la sesión: {str(e)}")