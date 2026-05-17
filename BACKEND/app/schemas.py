from typing import Optional, Literal
from pydantic import BaseModel


class PatientOut(BaseModel):
    id: str
    first_name: str
    last_name: Optional[str] = None
    dni: str
    neglect_side: Optional[Literal["left", "right", "bilateral"]] = None
    severity: Optional[int] = 1
    doctor_id: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class PatientCreate(BaseModel):
    first_name: str
    last_name: Optional[str] = None
    dni: str
    password: str
    neglect_side: Optional[Literal["left", "right", "bilateral"]] = None
    severity: Optional[int] = 1
    doctor_id: Optional[str] = None


class PatientLogin(BaseModel):
    dni: str
    password: str


class SessionStartCreate(BaseModel):
    patient_id: str
    session_type: str = "vr_assessment"


class SessionResultCreate(BaseModel):
    session_id: str
    patient_id: str
    score: float
    duration_seconds: int

    total_trials: int
    hit_left: int
    hit_right: int
    total_left: int
    total_right: int

    detection_rate: float
    precision_left: float
    precision_right: float

    mean_detection_latency_ms: float | None = None


# NUEVO: crear sesión temporal para QR
class QRSessionCreate(BaseModel):
    patient_id: str