// scene/securityPod.ts
// Pod for the Security/DevSecOps consultant. Registers the "securityPod"
// zone and a "back to reception" nav marker.

import { Color3, MeshBuilder, StandardMaterial, Vector3 } from "@babylonjs/core";
import type { SceneManager } from "./sceneManager";
import { createCharacter } from "../characters/characterFactory";
import { SECURITY_POD_ORIGIN, securityConsultantConfig } from "../characters/characterConfig";
import { BRAND_ACCENT_DARK, BRAND_FORMAL, hexToColor3 } from "../theme";

export function createSecurityPod(sceneManager: SceneManager): void {
  const { scene } = sceneManager;
  const origin = SECURITY_POD_ORIGIN;

  const floor = MeshBuilder.CreateGround("securityPodFloor", { width: 8, height: 8 }, scene);
  floor.position = origin.clone();
  const floorMat = new StandardMaterial("securityPodFloorMat", scene);
  floorMat.diffuseColor = hexToColor3(BRAND_FORMAL).scale(0.25);
  floorMat.specularColor = Color3.Black();
  floor.material = floorMat;

  const desk = MeshBuilder.CreateBox("securityPodDesk", { width: 2.2, height: 1, depth: 1 }, scene);
  desk.position = origin.add(new Vector3(0, 0.5, 0));
  const deskMat = new StandardMaterial("securityPodDeskMat", scene);
  deskMat.diffuseColor = hexToColor3(BRAND_ACCENT_DARK);
  deskMat.specularColor = Color3.Black();
  desk.material = deskMat;

  const chairMat = new StandardMaterial("securityPodChairMat", scene);
  chairMat.diffuseColor = hexToColor3(BRAND_FORMAL);
  chairMat.specularColor = Color3.Black();
  const chair = MeshBuilder.CreateCylinder(
    "securityPodChair",
    { diameter: 0.7, height: 0.9 },
    scene
  );
  chair.position = origin.add(new Vector3(0, 0.45, -2));
  chair.material = chairMat;

  const consultant = createCharacter(securityConsultantConfig, scene);

  const [backPedestal, backSign] = sceneManager.createNavMarker(
    "securityPodBack",
    origin.add(new Vector3(0, 0, 3.2)),
    "< Reception",
    BRAND_ACCENT_DARK,
    () => {
      sceneManager.showOnly("reception");
      sceneManager.goToZone("reception");
    }
  );

  sceneManager.registerZone("securityPod", [
    floor,
    desk,
    chair,
    consultant,
    backPedestal,
    backSign,
  ]);
  sceneManager.setCameraTarget(
    "securityPod",
    origin.add(new Vector3(0, 3, -4.5)),
    origin.add(new Vector3(0, 1.4, 0))
  );
  sceneManager.setZoneVisible("securityPod", false);
}
