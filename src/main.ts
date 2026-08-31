// main.ts
// Entry point: boots the SceneManager, builds every zone, wires the door
// click to enter the building, and connects the journey state machine —
// chat responses that count toward a quote, the HUD, and reacting to a
// post-exit reset by returning the scene to the exterior.

import { SceneManager } from "./scene/sceneManager";
import { createExterior } from "./scene/exterior";
import { createReception } from "./scene/reception";
import { createSalesPod } from "./scene/salesPod";
import { createCloudPod } from "./scene/cloudPod";
import { createSecurityPod } from "./scene/securityPod";
import { createSoftwarePod } from "./scene/softwarePod";
import { createOpenOffice } from "./scene/openOffice";
import { createConferenceRoom } from "./scene/conferenceRoom";
import { createOfficeCabins } from "./scene/officeCabins";
import { setChatResponder, closeChat } from "./ui/chat";
import { getAIResponse } from "./ai/getAIResponse";
import { openQuotePanel } from "./ui/quotePanel";
import { initHud } from "./ui/hud";
import {
  JourneyState,
  getJourney,
  transitionTo,
  onJourneyChange,
  incrementExchangeCount,
  resetExchangeCount,
  setQuoteForCurrentDepartment,
} from "./state/journeyState";

// A pod chat only counts toward the quote once the visitor has actually
// been let into that pod (POD_CONVERSATION) for the matching department —
// casual chats with the receptionist never trigger this.
setChatResponder(async (userText, department) => {
  const journey = getJourney();
  const isGatedPodChat =
    journey.state === JourneyState.POD_CONVERSATION && journey.department === department;

  if (isGatedPodChat) {
    const count = incrementExchangeCount();
    if (count >= 3) {
      setQuoteForCurrentDepartment();
      transitionTo(JourneyState.QUOTE_GENERATED);
      resetExchangeCount();
      window.setTimeout(() => openQuotePanel(), 900);
      return "I think I have enough to put together a proposal — one moment.";
    }
  }

  return getAIResponse(userText, { department });
});

const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

const sceneManager = new SceneManager(canvas);

createReception(sceneManager);
createExterior(sceneManager, () => {
  transitionTo(JourneyState.RECEPTION);
  sceneManager.showOnly("reception");
  sceneManager.goToZone("reception");
});
createSalesPod(sceneManager);
createCloudPod(sceneManager);
createSecurityPod(sceneManager);
createSoftwarePod(sceneManager);
createOpenOffice(sceneManager);
createConferenceRoom(sceneManager);
createOfficeCabins(sceneManager);

sceneManager.showOnly("exterior");
sceneManager.goToZone("exterior");

sceneManager.startRenderLoop();
initHud();

// Reacts to the journey re-entering EXTERIOR (the kickoff panel's Exit
// button resets the journey data) by reversing the scene back to the
// exterior zone for a fresh visit.
onJourneyChange((journey) => {
  if (journey.state === JourneyState.EXTERIOR) {
    closeChat();
    sceneManager.showOnly("exterior");
    sceneManager.goToZone("exterior");
  }
});

// Exposed for quick debugging in the browser console during development.
(window as unknown as { sceneManager: SceneManager }).sceneManager = sceneManager;
