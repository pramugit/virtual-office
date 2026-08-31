// scene/softwarePod.ts
// Pod for the Software Consultant — a general software showcase (formerly
// the GMS-only pod; GMS is now discussed as one product within this
// broader "our software" conversation). Registers the "softwarePod" zone
// and a "back to reception" nav marker.

import { Color3, MeshBuilder, StandardMaterial, Vector3 } from "@babylonjs/core";
import type { SceneManager } from "./sceneManager";
import { createCharacter } from "../characters/characterFactory";
import { SOFTWARE_POD_ORIGIN, softwareConsultantConfig } from "../characters/characterConfig";
import { BRAND_ACCENT_WARM, BRAND_SURFACE, hexToColor3 } from "../theme";

export function createSoftwarePod(sceneManager: SceneManager): void {
  const { scene } = sceneManager;
  const origin = SOFTWARE_POD_ORIGIN;

  const floor = MeshBuilder.CreateGround("softwarePodFloor", { width: 8, height: 8 }, scene);
  floor.position = origin.clone();
  const floorMat = new StandardMaterial("softwarePodFloorMat", scene);
  floorMat.diffuseColor = hexToColor3(BRAND_SURFACE);
  floorMat.specularColor = Color3.Black();
  floor.material = floorMat;

  const desk = MeshBuilder.CreateBox("softwarePodDesk", { width: 2.2, height: 1, depth: 1 }, scene);
  desk.position = origin.add(new Vector3(0, 0.5, 0));
  const deskMat = new StandardMaterial("softwarePodDeskMat", scene);
  deskMat.diffuseColor = hexToColor3(BRAND_ACCENT_WARM);
  deskMat.specularColor = Color3.Black();
  desk.material = deskMat;

  const chairMat = new StandardMaterial("softwarePodChairMat", scene);
  chairMat.diffuseColor = hexToColor3(BRAND_SURFACE);
  chairMat.specularColor = Color3.Black();
  const chair = MeshBuilder.CreateCylinder("softwarePodChair", { diameter: 0.7, height: 0.9 }, scene);
  chair.position = origin.add(new Vector3(0, 0.45, -2));
  chair.material = chairMat;

  const consultant = createCharacter(softwareConsultantConfig, scene);

  const [backPedestal, backSign] = sceneManager.createNavMarker(
    "softwarePodBack",
    origin.add(new Vector3(0, 0, 3.2)),
    "< Reception",
    BRAND_ACCENT_WARM,
    () => {
      sceneManager.showOnly("reception");
      sceneManager.goToZone("reception");
    }
  );

  sceneManager.registerZone("softwarePod", [floor, desk, chair, consultant, backPedestal, backSign]);
  sceneManager.setCameraTarget(
    "softwarePod",
    origin.add(new Vector3(0, 3, -4.5)),
    origin.add(new Vector3(0, 1.4, 0))
  );
  sceneManager.setZoneVisible("softwarePod", false);
}
