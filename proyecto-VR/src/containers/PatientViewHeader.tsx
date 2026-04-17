type PatientTab = "details" | "metrics" | "sessions" | "vr";

type PatientViewHeaderProps = {
  activeTab: PatientTab;
  onChangeTab: (tab: PatientTab) => void;
};

export default function PatientViewHeader({
  activeTab,
  onChangeTab,
}: PatientViewHeaderProps) {
  const baseClass =
    "px-5 py-3 rounded-full text-sm font-semibold transition-all duration-300";

  const activeClass = "bg-green-100 text-green-800 shadow-sm";
  const inactiveClass = "bg-gray-100 text-gray-700 hover:bg-gray-200";

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
      <div className="flex flex-wrap gap-3">
        
        <button
          onClick={() => onChangeTab("details")}
          className={`${baseClass} ${
            activeTab === "details" ? activeClass : inactiveClass
          }`}
        >
          Resumen clínico
        </button>

        <button
          onClick={() => onChangeTab("metrics")}
          className={`${baseClass} ${
            activeTab === "metrics" ? activeClass : inactiveClass
          }`}
        >
          Evolución
        </button>

        <button
          onClick={() => onChangeTab("sessions")}
          className={`${baseClass} ${
            activeTab === "sessions" ? activeClass : inactiveClass
          }`}
        >
          Sesiones
        </button>

        <button
          onClick={() => onChangeTab("vr")}
          className={`${baseClass} ${
            activeTab === "vr" ? activeClass : inactiveClass
          }`}
        >
          Ejercicios VR
        </button>

      </div>
    </div>
  );
}