// scene/reception.ts
// Floor, desk, decorative chairs, a wall-mounted logo sign, and a "monitor"
// plane near the desk. Registers the "reception" zone and its camera target.

import {
  Color3,
  DynamicTexture,
  MeshBuilder,
  StandardMaterial,
  Vector3,
  type Mesh,
} from "@babylonjs/core";
import type { SceneManager, ZoneName } from "./sceneManager";
import {
  BRAND_ACCENT,
  BRAND_ACCENT_COOL,
  BRAND_ACCENT_DARK,
  BRAND_ACCENT_SECONDARY,
  BRAND_ACCENT_WARM,
  BRAND_BG,
  BRAND_FORMAL,
  BRAND_FORMAL_DARK,
  BRAND_SURFACE,
  BRAND_TEXT_MUTED,
  hexToColor3,
} from "../theme";
import { createCharacter, showToast } from "../characters/characterFactory";
import { receptionistConfig, type CharacterConfig } from "../characters/characterConfig";
import { getJourney, issueToken, transitionTo, resetExchangeCount, JourneyState } from "../state/journeyState";
import { showCalledBanner } from "../ui/hud";
import { openChat, closeChat } from "../ui/chat";
import { openVisitorDetailsPanel } from "../ui/visitorDetailsPanel";

import faviconUrl from "../assets/images/favicon.svg";

// The real logo mark also lives at ../assets/images/logo.svg (pulled from
// renderedby.com's own header) but Babylon's Texture() loads images via an
// <img> element, and SVG decode there is unreliable across environments —
// so the sign below redraws the same mark (same gradient, same geometry)
// directly on a DynamicTexture, which never depends on image decoding.

export function createReception(sceneManager: SceneManager): void {
  const { scene } = sceneManager;

  // Set the real RenderedBy favicon now that we're wiring branded assets in.
  const faviconLink = document.getElementById(
    "favicon-link"
  ) as HTMLLinkElement | null;
  if (faviconLink) faviconLink.href = faviconUrl;

  const floor = MeshBuilder.CreateGround(
    "receptionFloor",
    { width: 14, height: 14 },
    scene
  );
  floor.position = new Vector3(0, 0, 5);
  const floorMat = new StandardMaterial("receptionFloorMat", scene);
  floorMat.diffuseColor = hexToColor3(BRAND_SURFACE);
  floorMat.specularColor = Color3.Black();
  floor.material = floorMat;

  const backWall = MeshBuilder.CreatePlane(
    "receptionBackWall",
    { width: 14, height: 8 },
    scene
  );
  backWall.position = new Vector3(0, 4, 10.9);
  backWall.rotation.y = Math.PI;
  const wallMat = new StandardMaterial("receptionWallMat", scene);
  // BRAND_SURFACE, not BRAND_BG — BRAND_BG matches the scene's clear color,
  // which would render an "invisible" wall indistinguishable from empty space.
  wallMat.diffuseColor = hexToColor3(BRAND_SURFACE);
  wallMat.specularColor = Color3.Black();
  wallMat.backFaceCulling = false;
  backWall.material = wallMat;

  // Reception desk.
  const desk = MeshBuilder.CreateBox(
    "receptionDesk",
    { width: 4, height: 1.1, depth: 1.2 },
    scene
  );
  desk.position = new Vector3(0, 0.55, 8.5);
  const deskMat = new StandardMaterial("receptionDeskMat", scene);
  deskMat.diffuseColor = hexToColor3(BRAND_ACCENT_SECONDARY);
  deskMat.specularColor = Color3.Black();
  desk.material = deskMat;

  // Decorative chairs (waiting area), simple cylinder seats + backs.
  const chairMat = new StandardMaterial("receptionChairMat", scene);
  chairMat.diffuseColor = hexToColor3(BRAND_ACCENT);
  chairMat.specularColor = Color3.Black();

  const chairs = [
    new Vector3(-4, 0.4, 3),
    new Vector3(-2.5, 0.4, 1.5),
    new Vector3(2.5, 0.4, 1.5),
    new Vector3(4, 0.4, 3),
  ].map((pos, i) => {
    const seat = MeshBuilder.CreateCylinder(
      `receptionChairSeat${i}`,
      { diameter: 0.9, height: 0.15 },
      scene
    );
    seat.position = pos;
    seat.material = chairMat;

    const back = MeshBuilder.CreateBox(
      `receptionChairBack${i}`,
      { width: 0.9, height: 0.9, depth: 0.12 },
      scene
    );
    back.position = new Vector3(pos.x, pos.y + 0.55, pos.z + 0.4);
    back.material = chairMat;

    return [seat, back];
  });

  // Wall-mounted logo sign, redrawing the real RenderedBy logo mark (same
  // gradient, same circle/rounded-rect geometry as the source SVG) onto a
  // DynamicTexture — see the import comment above for why.
  const sign = MeshBuilder.CreatePlane(
    "receptionLogoSign",
    { width: 3, height: 3 },
    scene
  );
  sign.position = new Vector3(0, 5, 10.85);
  sign.rotation.y = Math.PI;
  const signMat = new StandardMaterial("receptionLogoSignMat", scene);
  const signTex = new DynamicTexture(
    "receptionLogoSignTex",
    { width: 320, height: 320 },
    scene
  );
  const sctx = signTex.getContext() as unknown as CanvasRenderingContext2D;
  const s = 320;
  const scale = s / 40;
  // The sign plane is rotated 180 on Y to face the reception camera, which
  // mirrors how its texture reads — flip the drawing itself (not uScale;
  // negative uScale left DynamicTexture content blank in testing) so the
  // mark reads correctly instead of backwards.
  sctx.translate(s, 0);
  sctx.scale(-1, 1);
  sctx.save();
  sctx.beginPath();
  sctx.roundRect(0, 0, s, s, 9 * scale);
  sctx.clip();
  const grad = sctx.createLinearGradient(0, 0, s, s);
  grad.addColorStop(0, BRAND_ACCENT);
  grad.addColorStop(1, BRAND_ACCENT_SECONDARY);
  sctx.fillStyle = grad;
  sctx.fillRect(0, 0, s, s);
  sctx.restore();
  sctx.fillStyle = "#ffffff";
  sctx.beginPath();
  sctx.arc(15.6 * scale, 17.6 * scale, 8 * scale, 0, Math.PI * 2);
  sctx.fill();
  sctx.beginPath();
  sctx.arc(24.4 * scale, 14 * scale, 10 * scale, 0, Math.PI * 2);
  sctx.fill();
  sctx.beginPath();
  sctx.roundRect(7.2 * scale, 17.6 * scale, 26 * scale, 14.8 * scale, 7.2 * scale);
  sctx.fill();
  sctx.fillStyle = BRAND_SURFACE;
  sctx.beginPath();
  sctx.moveTo(18 * scale, 32.4 * scale);
  sctx.lineTo(18 * scale, 25.6 * scale);
  sctx.arc(22 * scale, 25.6 * scale, 4 * scale, Math.PI, 0, false);
  sctx.lineTo(26 * scale, 32.4 * scale);
  sctx.closePath();
  sctx.fill();
  signTex.update();
  signMat.diffuseTexture = signTex;
  signMat.emissiveColor = new Color3(0.9, 0.9, 0.9);
  signMat.specularColor = Color3.Black();
  signMat.backFaceCulling = false;
  sign.material = signMat;

  // "Monitor" plane near the desk. No real product/dashboard screenshot was
  // found on the public site (only stock photography), so this is a drawn
  // placeholder — swap for a real dashboard screenshot texture later.
  const monitor = MeshBuilder.CreatePlane(
    "receptionMonitor",
    { width: 1.8, height: 1.1 },
    scene
  );
  monitor.position = new Vector3(1.6, 1.6, 8.05);
  monitor.rotation.y = Math.PI;
  const monitorMat = new StandardMaterial("receptionMonitorMat", scene);
  const monitorTex = new DynamicTexture(
    "receptionMonitorTex",
    { width: 512, height: 320 },
    scene
  );
  const ctx = monitorTex.getContext() as unknown as CanvasRenderingContext2D;
  // Same pre-mirrored-drawing technique as the logo sign (see its comment).
  ctx.translate(512, 0);
  ctx.scale(-1, 1);
  ctx.fillStyle = BRAND_BG;
  ctx.fillRect(0, 0, 512, 320);
  ctx.strokeStyle = BRAND_ACCENT_SECONDARY;
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, 496, 304);
  ctx.fillStyle = BRAND_ACCENT;
  ctx.font = "bold 28px sans-serif";
  ctx.fillText("Product Dashboard", 30, 60);
  ctx.fillStyle = BRAND_TEXT_MUTED;
  ctx.font = "18px sans-serif";
  ctx.fillText("(placeholder — real build swaps in", 30, 100);
  ctx.fillText("a live product screenshot)", 30, 128);
  ctx.strokeStyle = BRAND_ACCENT_SECONDARY;
  ctx.strokeRect(30, 160, 200, 100);
  ctx.strokeRect(260, 160, 200, 100);
  monitorTex.update();
  monitorMat.diffuseTexture = monitorTex;
  monitorMat.emissiveColor = new Color3(0.9, 0.9, 0.9);
  monitorMat.specularColor = Color3.Black();
  monitorMat.backFaceCulling = false;
  monitor.material = monitorMat;

  const monitorStand = MeshBuilder.CreateBox(
    "receptionMonitorStand",
    { width: 0.15, height: 0.5, depth: 0.15 },
    scene
  );
  monitorStand.position = new Vector3(1.6, 1.05, 8.15);
  monitorStand.material = deskMat;

  // The 4 consultant pods are gated behind reception issuing a token (see
  // handlePodEntry/issueTokenAtReception below); open office, conference
  // room, and office cabins are just ambient zones, not part of the guided
  // journey, so they stay freely clickable (still gated by visitor details).
  const gatedDestinations: Array<{
    zone: ZoneName;
    department: string;
    label: string;
    color: string;
    x: number;
  }> = [
    { zone: "salesPod", department: "sales", label: "Sales", color: BRAND_ACCENT_SECONDARY, x: -7.5 },
    { zone: "cloudPod", department: "cloud", label: "Cloud", color: BRAND_ACCENT_COOL, x: -5 },
    { zone: "securityPod", department: "security", label: "Security", color: BRAND_ACCENT_DARK, x: -2.5 },
    { zone: "softwarePod", department: "software", label: "Software", color: BRAND_ACCENT_WARM, x: 0 },
  ];
  const freeDestinations: Array<{ zone: ZoneName; label: string; color: string; x: number }> = [
    { zone: "openOffice", label: "Open Office", color: BRAND_ACCENT, x: 2.5 },
    { zone: "conferenceRoom", label: "Conference", color: BRAND_FORMAL_DARK, x: 5 },
    { zone: "officeCabins", label: "Cabins", color: BRAND_FORMAL, x: 7.5 },
  ];

  const podMarkers = new Map<ZoneName, Mesh[]>();

  function pulseMarker(zone: ZoneName): void {
    const meshes = podMarkers.get(zone);
    if (!meshes) return;
    const start = performance.now();
    const durationMs = 4000;
    const observer = scene.onBeforeRenderObservable.add(() => {
      const elapsed = performance.now() - start;
      if (elapsed > durationMs) {
        for (const mesh of meshes) {
          const mat = mesh.material as StandardMaterial;
          mat.emissiveColor = mat.diffuseColor.scale(0.25);
        }
        scene.onBeforeRenderObservable.remove(observer);
        return;
      }
      const pulse = 0.25 + Math.abs(Math.sin(elapsed / 180)) * 0.9;
      for (const mesh of meshes) {
        const mat = mesh.material as StandardMaterial;
        mat.emissiveColor = mat.diffuseColor.scale(pulse);
      }
    });
  }

  // Reception must collect name/phone/email before a visitor is let through
  // to any department — pods, open office, conference room, or cabins.
  // Shared gate for every marker click and for handlePodEntry.
  function ensureVisitorDetails(): boolean {
    if (getJourney().visitorDetails) return true;
    showToast("Please share your name, phone, and email with reception first.");
    openVisitorDetailsPanel(() => {});
    return false;
  }

  // Reception is the token provider now — no simulated queue/wait. The
  // moment a department is picked, reception generates the token for it
  // right there and the visitor is called immediately (no client-side
  // timer to lose on a reload, nothing to go stale on an Exit reset).
  function issueTokenAtReception(zone: ZoneName, department: string): string {
    const token = issueToken(department);
    transitionTo(JourneyState.TOKEN_CALLED);
    showCalledBanner(token, department);
    showToast(`Token ${token} — reception has issued it for ${department}.`);
    pulseMarker(zone);
    return token;
  }

  function handlePodEntry(zone: ZoneName, department: string): void {
    if (!ensureVisitorDetails()) return;
    const journey = getJourney();

    if (journey.token && journey.department !== department) {
      showToast(`You already have a token for ${journey.department} — please go there first.`);
      return;
    }

    if (!journey.token) {
      issueTokenAtReception(zone, department);
    }

    resetExchangeCount();
    transitionTo(JourneyState.POD_CONVERSATION);
    sceneManager.showOnly(zone);
    sceneManager.goToZone(zone);
  }

  // Quick-select intake: instead of typing, the receptionist opens with
  // tappable buttons for all 7 destinations (the same list read out in the
  // post-intake greeting below). The 4 pods route through the same
  // handlePodEntry used by clicking a pod marker directly (issuing a token
  // on the spot); the 3 free zones (open office, conference, cabins) just
  // navigate straight there.
  const quickSelectOptions: Array<{ label: string; zone: ZoneName; department: string | null }> = [
    ...gatedDestinations.map(({ zone, department, label }) => ({ zone, department, label })),
    ...freeDestinations.map(({ zone, label }) => ({ zone, department: null, label })),
  ];

  const departmentList = "Sales, Cloud, Security, Software, Open Office, Conference, Cabins";

  // Opens the receptionist's chat — only reachable once visitor details are
  // on file (see receptionistCfg.onInteract below), so the greeting can
  // read out the full department list and send the visitor onward.
  function openReceptionChat(): void {
    const visitorName = getJourney().visitorDetails?.name;
    const greeting = `${visitorName ? `Thanks, ${visitorName}! ` : ""}You're all set — here's where you can go: ${departmentList}. Go into these offices and get your work done.`;

    openChat({
      title: receptionistConfig.role,
      department: "general",
      greeting,
      quickSelect: quickSelectOptions.map(({ label, zone, department }) => ({
        label,
        onSelect: () => {
          closeChat();
          if (department) {
            handlePodEntry(zone, department);
          } else {
            sceneManager.showOnly(zone);
            sceneManager.goToZone(zone);
          }
        },
      })),
    });
  }

  const receptionistCfg: CharacterConfig = {
    ...receptionistConfig,
    onInteract: () => {
      if (!getJourney().visitorDetails) {
        openVisitorDetailsPanel(() => openReceptionChat());
        return;
      }
      openReceptionChat();
    },
  };
  const receptionist = createCharacter(receptionistCfg, scene);

  const gatedMarkerNodes = gatedDestinations.flatMap(({ zone, department, label, color, x }) => {
    const meshes = sceneManager.createNavMarker(
      `receptionTo_${zone}`,
      new Vector3(x, 0, 1.5),
      label,
      color,
      () => handlePodEntry(zone, department)
    );
    podMarkers.set(zone, meshes);
    return meshes;
  });

  const freeMarkerNodes = freeDestinations.flatMap(({ zone, label, color, x }) =>
    sceneManager.createNavMarker(`receptionTo_${zone}`, new Vector3(x, 0, 1.5), label, color, () => {
      if (!ensureVisitorDetails()) return;
      sceneManager.showOnly(zone);
      sceneManager.goToZone(zone);
    })
  );

  const markerNodes = [...gatedMarkerNodes, ...freeMarkerNodes];

  // The door drops the visitor straight into reception with just the desk
  // and receptionist — the 7 destination markers (pods + open office/
  // conference/cabins) only appear once reception has taken name/phone/
  // email. Checked every frame (only while reception is the active zone)
  // rather than wired into every "back to reception" call site, since
  // several pod/room files independently call showOnly("reception").
  scene.onBeforeRenderObservable.add(() => {
    if (sceneManager.getActiveZone() !== "reception") return;
    const shouldShow = !!getJourney().visitorDetails;
    for (const mesh of markerNodes) {
      if (mesh.isEnabled() !== shouldShow) mesh.setEnabled(shouldShow);
    }
  });

  const receptionNodes = [
    floor,
    backWall,
    desk,
    sign,
    monitor,
    monitorStand,
    receptionist,
    ...chairs.flat(),
    ...markerNodes,
  ];

  sceneManager.registerZone("reception", receptionNodes);
  sceneManager.setCameraTarget(
    "reception",
    new Vector3(0, 3, -2),
    new Vector3(0, 1.6, 8)
  );

  // Reception starts hidden until the door is clicked from the exterior.
  sceneManager.setZoneVisible("reception", false);
}
