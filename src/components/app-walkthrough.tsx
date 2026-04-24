"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Joyride, {
  Step,
  CallBackProps,
  STATUS,
  ACTIONS,
  EVENTS,
} from "react-joyride";
import { usePathname } from "next/navigation";
import { completeWalkthrough } from "@/services/profiles";
import { useIncidents } from "@/hooks/use-incidents";

const incidentListSteps: Step[] = [
  {
    target: "body",
    title: "Welcome to NFA Alerts!",
    content:
      "Let's take a quick tour to help you get started. This will only take a minute.",
    placement: "center",
    disableBeacon: true,
  },
  {
    target: "[data-tour='incident-card']",
    title: "Incident Cards",
    content:
      "Each card shows an incident with distance, alarm level, and location. Tap any card to view details.",
    placement: "bottom",
  },
  {
    target: "[data-tour='activity-bars']",
    title: "Activity Indicator",
    content:
      "These bars show how active an incident is - more filled bars means more recent updates.",
    placement: "right",
  },
];

const chaserDetailSteps: Step[] = [
  {
    target: "[data-tour='incident-map']",
    title: "Map & Directions",
    content:
      "View the incident location on the map. Tap for turn-by-turn directions.",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: "[data-tour='incident-actions']",
    title: "Quick Actions",
    content:
      "Favorite, bookmark, mute, or hide incidents. Organize your work your way.",
    placement: "left",
  },
  {
    target: "[data-tour='respond-button']",
    title: "Respond to Win!",
    content:
      "Tap to respond! Race to the scene, secure the homeowner, and earn the job. First to secure wins.",
    placement: "top",
  },
];

const supeDetailSteps: Step[] = [
  {
    target: "[data-tour='incident-map']",
    title: "Map & Location",
    content: "View the incident location. See nearby incidents on the map.",
    placement: "bottom",
    disableBeacon: true,
  },
  {
    target: "[data-tour='incident-actions']",
    title: "Quick Actions",
    content:
      "Favorite, bookmark, mute, or hide incidents to organize your dashboard.",
    placement: "left",
  },
  {
    target: "[data-tour='supe-actions']",
    title: "Manage Incidents",
    content:
      "Close incidents when complete, or reopen if needed. Assign jobs to responders.",
    placement: "top",
  },
];

const chaserNavSteps: Step[] = [
  {
    target: "body",
    title: "Navigation Menu",
    content:
      "Scroll the bottom navigation menu horizontally to explore all available sections: Incidents, Favorites, Route Planner, Notifications, Chat, and Profile.",
    placement: "center",
    disableBeacon: true,
  },
];

const supeNavSteps: Step[] = [
  {
    target: "body",
    title: "Navigation Menu",
    content:
      "Scroll the bottom navigation menu horizontally to explore all available sections: Incidents, Favorites, Route Planner, Notifications, Chasers, Chat, and Profile.",
    placement: "center",
    disableBeacon: true,
  },
];

export function AppWalkthrough({
  role,
  hasCompleted,
}: {
  role: "chaser" | "supe" | "admin";
  hasCompleted: boolean;
}) {
  const router = useRouter();
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [currentPhase, setCurrentPhase] = useState<"list" | "detail" | "nav">(
    "list",
  );
  const [waitingForNav, setWaitingForNav] = useState(false);
  const pathname = usePathname();
  const { incidents } = useIncidents();

  const isIncidentList = pathname === "/incidents";
  const isIncidentDetail =
    pathname.startsWith("/incidents/") && pathname !== "/incidents";

  const firstIncidentId = incidents[0]?._id;

  useEffect(() => {
    if (hasCompleted) return;

    if (isIncidentList && currentPhase === "list" && !waitingForNav) {
      const timer = setTimeout(() => setRun(true), 800);
      return () => clearTimeout(timer);
    }

    if (isIncidentDetail && currentPhase === "detail") {
      const timer = setTimeout(() => {
        setWaitingForNav(false);
        setStepIndex(0);
        setRun(true);
      }, 500);
      return () => clearTimeout(timer);
    }

    if (isIncidentList && currentPhase === "nav") {
      const timer = setTimeout(() => {
        setWaitingForNav(false);
        setStepIndex(0);
        setRun(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [
    hasCompleted,
    pathname,
    currentPhase,
    isIncidentList,
    isIncidentDetail,
    waitingForNav,
  ]);

  const getSteps = (): Step[] => {
    if (currentPhase === "list") {
      return incidentListSteps;
    }
    if (currentPhase === "detail") {
      return role === "chaser" ? chaserDetailSteps : supeDetailSteps;
    }
    if (currentPhase === "nav") {
      return role === "chaser" ? chaserNavSteps : supeNavSteps;
    }
    return [];
  };

  const handleCallback = async (data: CallBackProps) => {
    const { status, action, type, index, step } = data;

    if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
      setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1));
    }

    if (
      type === EVENTS.STEP_BEFORE &&
      step.target &&
      typeof step.target === "string"
    ) {
      const element = document.querySelector(step.target);
      if (element && step.target !== "body") {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }
    }

    if (status === STATUS.FINISHED) {
      setRun(false);

      if (currentPhase === "list") {
        setCurrentPhase("detail");
        setWaitingForNav(true);
        if (firstIncidentId) {
          router.push(`/incidents/${firstIncidentId}`);
        } else {
          setCurrentPhase("nav");
        }
      } else if (currentPhase === "detail") {
        setCurrentPhase("nav");
        setWaitingForNav(true);
        router.push("/incidents");
      } else if (currentPhase === "nav") {
        await completeWalkthrough();
      }
    }

    if (status === STATUS.SKIPPED) {
      setRun(false);
      await completeWalkthrough();
    }
  };

  if (hasCompleted) return null;

  const steps = getSteps();
  if (steps.length === 0) return null;

  if (currentPhase === "list" && incidents.length === 0) {
    return null;
  }

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      continuous
      showProgress
      showSkipButton
      callback={handleCallback}
      scrollToFirstStep
      scrollOffset={100}
      disableScrolling={false}
      disableOverlayClose
      floaterProps={{
        styles: {
          floater: {
            filter: "none",
          },
        },
      }}
      styles={{
        options: {
          zIndex: 10000,
          primaryColor: "#2563eb",
          textColor: "#1e293b",
          backgroundColor: "#ffffff",
          arrowColor: "#ffffff",
          overlayColor: "rgba(0, 0, 0, 0.6)",
        },
        tooltip: {
          borderRadius: "16px",
          padding: "20px",
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          maxWidth: "320px",
        },
        tooltipContainer: {
          textAlign: "left",
        },
        tooltipTitle: {
          fontSize: "18px",
          fontWeight: 700,
          marginBottom: "8px",
          color: "#1e293b",
        },
        tooltipContent: {
          fontSize: "15px",
          lineHeight: 1.6,
          padding: "4px 0 12px 0",
          color: "#64748b",
        },
        tooltipFooter: {
          marginTop: "12px",
        },
        buttonNext: {
          backgroundColor: "#2563eb",
          color: "#ffffff",
          borderRadius: "10px",
          padding: "12px 24px",
          fontSize: "14px",
          fontWeight: 600,
          boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        },
        buttonBack: {
          color: "#94a3b8",
          marginRight: "12px",
          fontSize: "14px",
          fontWeight: 500,
        },
        buttonSkip: {
          color: "#94a3b8",
          fontSize: "14px",
          fontWeight: 500,
        },
        buttonClose: {
          display: "none",
        },
        spotlight: {
          borderRadius: "16px",
        },
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.6)",
        },
      }}
      locale={{
        back: "Back",
        close: "Close",
        last:
          currentPhase === "nav"
            ? "Finish Tour"
            : currentPhase === "list"
              ? "View Incident Details →"
              : "Explore Navigation →",
        next: "Next",
        skip: "Skip Tour",
      }}
    />
  );
}
