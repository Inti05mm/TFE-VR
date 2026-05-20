import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabase/supabaseClient";
import type { Patient } from "./PatientList";
import PatientViewHeader from "./PatientViewHeader";
import PatientDetailsContainer from "./PatientDetail";
import PatientMetricsContainer from "./PatientMetricsContainer";
import SessionDetailContainer from "./SessionDetailContainer";
import VRExercisesContainer from "./VRExercisesContainer";

type PatientTab = "details" | "metrics" | "sessions" | "vr";
type SessionView = "list" | "detail";

type SessionRow = {
  id: string;
  started_at: string;
  session_type: string;
  duration_seconds: number | null;
  score: number | null;
  incidents: string | null;
  notes: string | null;
};

type SessionMetricsRow = {
  total_trials: number | null;
  completed_trials: number | null;
  correct_trials: number | null;
  omitted_trials: number | null;
  omissions_left: number | null;
  omissions_right: number | null;
  mean_detection_latency_ms: number | null;
  detection_rate: number | null;
  precision_left: number | null;
  precision_right: number | null;

  hit_left: number | null;
  hit_right: number | null;
  total_left: number | null;
  total_right: number | null;
};

type SessionDetailData = {
  sessionId: string;
  sessionLabel: string;
  startedAt: string;
  sessionType: string;
  durationSeconds: number | null;
  score: number | null;
  incidents: string | null;
  meanDetection: number | null;
  omissionsLeft: number | null;
  omissionsRight: number | null;
  explorationBias: number | null;
  parameters: { label: string; value: string | number }[];

  metrics: {
    totalStimuli: number;
    detectedStimuli: number;
    missedStimuli: number;

    totalLeft: number;
    totalRight: number;
    leftDetections: number;
    rightDetections: number;

    centerDetections: number;
    reactionTimeMin: number | null;
    reactionTimeMax: number | null;
    fixationCount: number;
    accuracy: number | null;
    precisionLeft: number | null;
    precisionRight: number | null;
  };

  events: {
    id: string;
    time: string;
    eventType: string;
    position: string;
    result: string;
    details: string;
  }[];

  doctorNotes: string | null;
};

type PatientProfileContainerProps = {
  patient: Patient;
  onBack: () => void;
  onStartSession?: (patient: Patient) => void;

  /**
   * Props para modo paciente.
   * Si activeTabExternal existe, el tab se controla desde fuera,
   * por ejemplo desde SidebarPaciente.
   */
  activeTabExternal?: PatientTab;
  setActiveTabExternal?: (tab: PatientTab) => void;
  hidePatientTabs?: boolean;
  isPatientView?: boolean;
};

export default function PatientProfileContainer({
  patient,
  onBack,
  onStartSession,
  activeTabExternal,
  setActiveTabExternal,
  hidePatientTabs = false,
  isPatientView = false,
}: PatientProfileContainerProps) {
  const [internalActiveTab, setInternalActiveTab] =
    useState<PatientTab>("details");

  const activeTab = activeTabExternal ?? internalActiveTab;

  const [sessionView, setSessionView] = useState<SessionView>("list");
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );

  const [latestSession, setLatestSession] = useState<SessionRow | null>(null);
  const [loadingLatestSession, setLoadingLatestSession] = useState(false);

  const [selectedSessionDetail, setSelectedSessionDetail] =
    useState<SessionDetailData | null>(null);
  const [loadingSessionDetail, setLoadingSessionDetail] = useState(false);

  const formatNeglectSide = (side: Patient["neglect_side"]) => {
    switch (side) {
      case "left":
        return "Izquierdo";
      case "right":
        return "Derecho";
      case "bilateral":
        return "Bilateral";
      default:
        return "No especificado";
    }
  };

  const formatSeverity = (severity: Patient["severity"]) => {
    switch (severity) {
      case 1:
        return "Leve";
      case 2:
        return "Moderado";
      case 3:
        return "Severo";
      default:
        return "No especificado";
    }
  };

  const formatSessionType = (sessionType: string | null) => {
    switch (sessionType) {
      case "vr_assessment":
        return "Evaluación VR";
      case "vr_training":
        return "Entrenamiento VR";
      case "visual_search":
        return "Búsqueda visual";
      case "extinction_test":
        return "Test de extinción";
      case "custom":
        return "Personalizada";
      default:
        return "No especificado";
    }
  };

  const formatDateTime = (value: string | null) => {
    if (!value) return "No disponible";

    return new Date(value).toLocaleString("es-ES", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const formatDurationClock = (seconds: number | null) => {
    if (seconds == null) return "No disponible";

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const latestSessionLabel = useMemo(() => {
    if (loadingLatestSession) return "Cargando...";
    if (!latestSession) return "Sin sesiones";

    return formatDateTime(latestSession.started_at);
  }, [latestSession, loadingLatestSession]);

  useEffect(() => {
    const loadLatestSession = async () => {
      setLoadingLatestSession(true);

      const { data, error } = await supabase
        .from("sessions")
        .select(
          "id, started_at, session_type, duration_seconds, score, incidents, notes"
        )
        .eq("patient_id", patient.id)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error cargando última sesión:", error);
        setLatestSession(null);
      } else {
        setLatestSession(data ?? null);
      }

      setLoadingLatestSession(false);
    };

    loadLatestSession();
  }, [patient.id]);

  useEffect(() => {
    const loadSessionDetail = async () => {
      if (!selectedSessionId || sessionView !== "detail") {
        setSelectedSessionDetail(null);
        return;
      }

      setLoadingSessionDetail(true);

      const [sessionRes, metricsRes] = await Promise.all([
        supabase
          .from("sessions")
          .select(
            "id, started_at, session_type, duration_seconds, score, incidents, notes"
          )
          .eq("id", selectedSessionId)
          .maybeSingle(),

        supabase
          .from("session_metrics")
          .select(
            `
            total_trials,
            completed_trials,
            correct_trials,
            omitted_trials,
            omissions_left,
            omissions_right,
            mean_detection_latency_ms,
            detection_rate,
            precision_left,
            precision_right,
            hit_left,
            hit_right,
            total_left,
            total_right
          `
          )
          .eq("session_id", selectedSessionId)
          .maybeSingle(),
      ]);

      if (sessionRes.error) {
        console.error("Error cargando sesión:", sessionRes.error);
        setSelectedSessionDetail(null);
        setLoadingSessionDetail(false);
        return;
      }

      if (metricsRes.error) {
        console.error("Error cargando métricas de sesión:", metricsRes.error);
      }

      const session = sessionRes.data as SessionRow | null;
      const sessionMetrics =
        (metricsRes.data as SessionMetricsRow | null) ?? null;

      if (!session) {
        setSelectedSessionDetail(null);
        setLoadingSessionDetail(false);
        return;
      }

      const totalStimuli = sessionMetrics?.total_trials ?? 0;

      const detectedStimuli =
        sessionMetrics?.completed_trials ??
        sessionMetrics?.correct_trials ??
        Math.max(totalStimuli - (sessionMetrics?.omitted_trials ?? 0), 0);

      const missedStimuli =
        sessionMetrics?.omitted_trials ??
        Math.max(totalStimuli - detectedStimuli, 0);

      const totalLeft = sessionMetrics?.total_left ?? 0;
      const totalRight = sessionMetrics?.total_right ?? 0;
      const leftDetections = sessionMetrics?.hit_left ?? 0;
      const rightDetections = sessionMetrics?.hit_right ?? 0;

      const accuracy =
        sessionMetrics?.detection_rate != null
          ? Number(sessionMetrics.detection_rate)
          : totalStimuli > 0
            ? Number(((detectedStimuli / totalStimuli) * 100).toFixed(2))
            : null;

      const parameters: { label: string; value: string | number }[] = [
        {
          label: "Tipo de sesión",
          value: formatSessionType(session.session_type),
        },
        {
          label: "Duración real",
          value: formatDurationClock(session.duration_seconds),
        },
        {
          label: "Total de estímulos",
          value: totalStimuli,
        },
        {
          label: "Estímulos completados",
          value: detectedStimuli,
        },
        {
          label: "Omisiones",
          value: missedStimuli,
        },
        {
          label: "Soles generados izquierda",
          value: totalLeft,
        },
        {
          label: "Soles clicados izquierda",
          value: leftDetections,
        },
        {
          label: "Soles generados derecha",
          value: totalRight,
        },
        {
          label: "Soles clicados derecha",
          value: rightDetections,
        },
      ];

      const detailData: SessionDetailData = {
        sessionId: session.id,
        sessionLabel: `Sesión ${new Date(
          session.started_at
        ).toLocaleDateString("es-ES")}`,
        startedAt: session.started_at,
        sessionType: session.session_type,
        durationSeconds: session.duration_seconds,
        score: session.score != null ? Number(session.score) : null,
        incidents: session.incidents,

        meanDetection: sessionMetrics?.mean_detection_latency_ms ?? null,
        omissionsLeft: sessionMetrics?.omissions_left ?? null,
        omissionsRight: sessionMetrics?.omissions_right ?? null,
        explorationBias: null,

        parameters,

        metrics: {
          totalStimuli,
          detectedStimuli,
          missedStimuli,

          totalLeft,
          totalRight,
          leftDetections,
          rightDetections,

          centerDetections: 0,
          reactionTimeMin: null,
          reactionTimeMax: null,
          fixationCount: 0,
          accuracy,
          precisionLeft: sessionMetrics?.precision_left ?? null,
          precisionRight: sessionMetrics?.precision_right ?? null,
        },

        events: [],

        doctorNotes: session.notes,
      };

      setSelectedSessionDetail(detailData);
      setLoadingSessionDetail(false);
    };

    loadSessionDetail();
  }, [selectedSessionId, sessionView]);

  const handleOpenSessionDetail = (sessionId: string) => {
    setSelectedSessionId(sessionId);
    setSessionView("detail");
  };

  const handleBackToSessionList = () => {
    setSelectedSessionId(null);
    setSelectedSessionDetail(null);
    setSessionView("list");
  };

  const handleChangeTab = (tab: PatientTab) => {
    if (setActiveTabExternal) {
      setActiveTabExternal(tab);
      localStorage.setItem("patient_active_tab", tab);
    } else {
      setInternalActiveTab(tab);
    }

    if (tab !== "sessions") {
      setSessionView("list");
      setSelectedSessionId(null);
      setSelectedSessionDetail(null);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "details":
  return (
    <PatientDetailsContainer
      patient={patient}
      isPatientView={isPatientView}
    />
  );

      case "metrics":
        return (
          <PatientMetricsContainer patientId={patient.id} mode="metrics" />
        );

      case "sessions":
        if (sessionView === "detail" && selectedSessionId) {
          if (loadingSessionDetail) {
            return (
              <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
                <p className="text-gray-600">Cargando detalle de sesión...</p>
              </div>
            );
          }

          if (!selectedSessionDetail) {
            return (
              <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
                <button
                  onClick={handleBackToSessionList}
                  className="mb-4 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition font-medium"
                >
                  Volver a sesiones
                </button>
                <p className="text-red-600">
                  No se pudo cargar el detalle de la sesión.
                </p>
              </div>
            );
          }

          return (
            <SessionDetailContainer
              session={selectedSessionDetail}
              onBack={handleBackToSessionList}
            />
          );
        }

        return (
          <PatientMetricsContainer
            patientId={patient.id}
            mode="sessions"
            onViewDetail={handleOpenSessionDetail}
          />
        );

      case "vr":
  return (
    <VRExercisesContainer
      patientId={patient.id}
      patientName={`${patient.first_name} ${patient.last_name || ""}`}
      patientNeglectSide={patient.neglect_side}
      patientSeverity={patient.severity}
    />
  );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-gray-800">
              {patient.first_name} {patient.last_name || ""}
            </h1>

            <div className="mt-3 flex flex-col sm:flex-row sm:flex-wrap gap-2 text-sm text-gray-600">
              <span className="bg-gray-100 px-3 py-1 rounded-full">
                Severidad: {formatSeverity(patient.severity)}
              </span>

              <span className="bg-gray-100 px-3 py-1 rounded-full">
                Lado afectado: {formatNeglectSide(patient.neglect_side)}
              </span>

              <span className="bg-gray-100 px-3 py-1 rounded-full">
                Última sesión: {latestSessionLabel}
              </span>
            </div>

            <p className="text-gray-500 mt-4">
              {isPatientView
                ? "Vista general de tu seguimiento"
                : "Vista general del paciente"}
            </p>
          </div>

          {!isPatientView && (
            <div className="flex flex-wrap gap-3">
              {onStartSession && (
                <button
                  onClick={() => onStartSession(patient)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition font-medium"
                >
                  Iniciar sesión
                </button>
              )}

              <button
                onClick={onBack}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition font-medium"
              >
                Volver a pacientes
              </button>
            </div>
          )}
        </div>
      </div>

      {!hidePatientTabs && (
        <PatientViewHeader
          activeTab={activeTab}
          onChangeTab={handleChangeTab}
        />
      )}

      <div className="transition-all duration-300 ease-in-out animate-fadeIn">
        {renderTabContent()}
      </div>
    </div>
  );
}