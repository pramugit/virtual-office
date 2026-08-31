// characters/characterConfig.ts
// CharacterConfig type + one config per roster member. Positions are world
// coordinates (each zone occupies its own clear patch of the shared scene
// space, matching the room-origin constants zone files build their
// furniture around) so characterFactory.createCharacter(config, scene) can
// place a mesh from the config alone.

import { Vector3 } from "@babylonjs/core";
import type { ZoneName } from "../scene/sceneManager";
import {
  BRAND_ACCENT,
  BRAND_ACCENT_COOL,
  BRAND_ACCENT_DARK,
  BRAND_ACCENT_SECONDARY,
  BRAND_ACCENT_WARM,
  BRAND_FORMAL,
  BRAND_FORMAL_DARK,
  GUARD_UNIFORM,
} from "../theme";

export type AnimationSet = "idleBob" | "static";

export interface CharacterConfig {
  id: string;
  role: string;
  department?: string;
  baseColor: string;
  accentColor: string;
  interactive: boolean;
  zone: ZoneName;
  animationSet: AnimationSet;
  /** Ground position (feet), world space. */
  position: Vector3;
  /** Facing, radians around Y. Defaults to 0. */
  rotationY?: number;
  /** Shown as the opening chat message for interactive, chat-style characters. */
  greeting?: string;
  /** If set on an interactive character, click shows this as a toast instead of opening chat. */
  tooltipMessage?: string;
  /**
   * Full override for click behavior — takes precedence over tooltipMessage
   * and greeting. Used when a character's click needs external wiring (e.g.
   * the receptionist's quick-select intake, which needs scene-scoped
   * helpers like the pod-marker pulse). Set per-instance via a spread copy
   * of the shared config, not on the shared config object itself.
   */
  onInteract?: () => void;
}

// Room origins — the world-space anchor each zone's furniture is built
// around. Kept here (not duplicated per pod file) so character placement
// and room geometry always agree.
export const SALES_POD_ORIGIN = new Vector3(-30, 0, 0);
export const CLOUD_POD_ORIGIN = new Vector3(-10, 0, 0);
export const SECURITY_POD_ORIGIN = new Vector3(10, 0, 0);
export const SOFTWARE_POD_ORIGIN = new Vector3(30, 0, 0);
export const OPEN_OFFICE_ORIGIN = new Vector3(0, 0, 30);
export const CONFERENCE_ROOM_ORIGIN = new Vector3(0, 0, 55);

export const receptionistConfig: CharacterConfig = {
  id: "receptionist",
  role: "Receptionist",
  baseColor: BRAND_ACCENT,
  accentColor: BRAND_ACCENT_SECONDARY,
  interactive: true,
  zone: "reception",
  animationSet: "static",
  position: new Vector3(0, 0, 9.3),
  rotationY: Math.PI,
  greeting:
    "Welcome to RenderedBy! I can help point you to the right team — what brings you in today?",
};

export const salesConsultantConfig: CharacterConfig = {
  id: "salesConsultant",
  role: "Sales & Marketing Consultant",
  department: "sales",
  baseColor: BRAND_ACCENT_SECONDARY,
  accentColor: BRAND_ACCENT,
  interactive: true,
  zone: "salesPod",
  animationSet: "static",
  position: SALES_POD_ORIGIN.add(new Vector3(0, 0, 1.3)),
  rotationY: Math.PI,
  greeting:
    "Hi, I'm on the Sales & Marketing team — tell me a bit about what you're trying to achieve.",
};

export const cloudConsultantConfig: CharacterConfig = {
  id: "cloudConsultant",
  role: "Cloud/DevOps Consultant",
  department: "cloud",
  baseColor: BRAND_ACCENT_COOL,
  accentColor: BRAND_ACCENT_SECONDARY,
  interactive: true,
  zone: "cloudPod",
  animationSet: "static",
  position: CLOUD_POD_ORIGIN.add(new Vector3(0, 0, 1.3)),
  rotationY: Math.PI,
  greeting:
    "Welcome — I handle cloud migration, cost optimization, and CI/CD. What does your current setup look like?",
};

export const securityConsultantConfig: CharacterConfig = {
  id: "securityConsultant",
  role: "Security/DevSecOps Consultant",
  department: "security",
  baseColor: BRAND_ACCENT_DARK,
  accentColor: BRAND_FORMAL,
  interactive: true,
  zone: "securityPod",
  animationSet: "static",
  position: SECURITY_POD_ORIGIN.add(new Vector3(0, 0, 1.3)),
  rotationY: Math.PI,
  greeting:
    "I'm on the DevSecOps side — audits, hardening, compliance. What's driving the need right now?",
};

export const softwareConsultantConfig: CharacterConfig = {
  id: "softwareConsultant",
  role: "Software Consultant",
  department: "software",
  baseColor: BRAND_ACCENT_WARM,
  accentColor: BRAND_ACCENT,
  interactive: true,
  zone: "softwarePod",
  animationSet: "static",
  position: SOFTWARE_POD_ORIGIN.add(new Vector3(0, 0, 1.3)),
  rotationY: Math.PI,
  greeting:
    "Welcome — I can walk you through everything we've built, including our Garage Management System (GMS) and our other software products. What are you looking for?",
};

const engineerOffsets: Vector3[] = [
  new Vector3(-3, 0, -2),
  new Vector3(-1, 0, -2),
  new Vector3(1, 0, -2),
  new Vector3(3, 0, -2),
];

export const engineerConfigs: CharacterConfig[] = engineerOffsets.map(
  (offset, i) => ({
    id: `engineer${i}`,
    role: "Computer Engineer",
    department: "engineering",
    // Casual tones: small programmatic variations on the teal accent rather
    // than four separately hardcoded hex values.
    baseColor: BRAND_ACCENT_SECONDARY,
    accentColor: i % 2 === 0 ? BRAND_ACCENT_COOL : BRAND_ACCENT,
    interactive: false,
    zone: "openOffice",
    animationSet: "idleBob",
    position: OPEN_OFFICE_ORIGIN.add(offset),
    rotationY: Math.PI,
  })
);

const managerOffsets: Vector3[] = [
  new Vector3(-4.5, 0, 1),
  new Vector3(4.5, 0, 1),
];

export const managerConfigs: CharacterConfig[] = managerOffsets.map(
  (offset, i) => ({
    id: `manager${i}`,
    role: "Manager",
    department: "management",
    baseColor: BRAND_FORMAL,
    accentColor: BRAND_ACCENT_SECONDARY,
    interactive: false,
    zone: "openOffice",
    animationSet: "static",
    position: OPEN_OFFICE_ORIGIN.add(offset),
    rotationY: Math.PI,
  })
);

const directorOffsets: Vector3[] = [
  new Vector3(-0.8, 0, 0),
  new Vector3(0.8, 0, 0),
];

export const directorConfigs: CharacterConfig[] = directorOffsets.map(
  (offset, i) => ({
    id: `director${i}`,
    role: "Director",
    department: "leadership",
    baseColor: BRAND_FORMAL_DARK,
    accentColor: BRAND_ACCENT,
    interactive: false,
    zone: "conferenceRoom",
    animationSet: "static",
    position: CONFERENCE_ROOM_ORIGIN.add(offset),
    // Face each other across the table, mid-discussion.
    rotationY: i === 0 ? Math.PI / 2 : -Math.PI / 2,
  })
);

export const securityGuardConfig: CharacterConfig = {
  id: "securityGuard",
  role: "Security Guard",
  baseColor: GUARD_UNIFORM,
  accentColor: GUARD_UNIFORM,
  interactive: true,
  zone: "exterior",
  animationSet: "static",
  position: new Vector3(-3.2, 0, -1.5),
  rotationY: Math.PI / 4,
  tooltipMessage: "Welcome to RenderedBy — the main entrance is straight ahead.",
};

export const allCharacterConfigs: CharacterConfig[] = [
  receptionistConfig,
  salesConsultantConfig,
  cloudConsultantConfig,
  securityConsultantConfig,
  softwareConsultantConfig,
  ...engineerConfigs,
  ...managerConfigs,
  ...directorConfigs,
  securityGuardConfig,
];
