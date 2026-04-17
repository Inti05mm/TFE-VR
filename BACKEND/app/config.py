import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"

load_dotenv(dotenv_path=ENV_PATH)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

print("Leyendo .env desde:", ENV_PATH)
print("SUPABASE_URL cargada:", bool(SUPABASE_URL))
print("SUPABASE_KEY cargada:", bool(SUPABASE_KEY))

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError(f"Faltan SUPABASE_URL o SUPABASE_KEY en el archivo .env: {ENV_PATH}")