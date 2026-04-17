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

class SessionCreate(BaseModel):
    patient_id: str
    stimulus_side: Literal["left", "right", "center"]
    reaction_time_ms: int
    correct_hits: int
    omissions: int