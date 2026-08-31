// scene/cloudPod.ts
// Desk + laptop prop for the Cloud/DevOps consultant. Registers the
// "cloudPod" zone and a "back to reception" nav marker.

import { Color3, MeshBuilder, StandardMaterial, Vector3 } from "@babylonjs/core";
import type { SceneManager } from "./sceneManager";
import { createCharacter } from "../characters/characterFactory";
import { CLOUD_POD_ORIGIN, cloudConsultantConfig } from "../characters/characterConfig";
import { BRAND_ACCENT_COOL, BRAND_BG, BRAND_SURFACE, hexToColor3 } from "../theme";

export function createCloudPod(sceneManager: SceneManager): void {
  const { scene } = sceneManager;
  const origin = CLOUD_POD_ORIGIN;

  const floor = MeshBuilder.CreateGround("cloudPodFloor", { width: 8, height: 8 }, scene);
  floor.position = origin.clone();
  const floorMat = new StandardMaterial("cloudPodFloorMat", scene);
  floorMat.diffuseColor = hexToColor3(BRAND_SURFACE);
  floorMat.specularColor = Color3.Black();
  floor.material = floorMat;

  const desk = MeshBuilder.CreateBox("cloudPodDesk", { width: 2.2, height: 1, depth: 1 }, scene);
  desk.position = origin.add(new Vector3(0, 0.5, 0));
  const deskMat = new StandardMaterial("cloudPodDeskMat", scene);
  deskMat.diffuseColor = hexToColor3(BRAND_ACCENT_COOL);
  deskMat.specularColor = Color3.Black();
  desk.material = deskMat;

  // Laptop prop: base + screen.
  const laptopMat = new StandardMaterial("cloudPodLaptopMat", scene);
  laptopMat.diffuseColor = hexToColor3(BRAND_BG);
  laptopMat.emissiveColor = hexToColor3(BRAND_ACCENT_COOL).scale(0.4);
  laptopMat.specularColor = Color3.Black();

  const laptopBase = MeshBuilder.CreateBox(
    "cloudPodLaptopBase",
    { width: 0.5, height: 0.03, depth: 0.35 },
    scene
  );
  laptopBase.position = origin.add(new Vector3(0, 1.02, 0));
  laptopBase.material = laptopMat;

  const laptopScreen = MeshBuilder.CreateBox(
    "cloudPodLaptopScreen",
    { width: 0.5, height: 0.32, depth: 0.02 },
    scene
  );
  laptopScreen.position = origin.add(new Vector3(0, 1.19, -0.16));
  laptopScreen.rotation.x = -0.3;
  laptopScreen.material = laptopMat;

  const consultant = createCharacter(cloudConsultantConfig, scene);

  const [backPedestal, backSign] = sceneManager.createNavMarker(
    "cloudPodBack",
    origin.add(new Vector3(0, 0, 3.2)),
    "< Reception",
    BRAND_ACCENT_COOL,
    () => {
      sceneManager.showOnly("reception");
      sceneManager.goToZone("reception");
    }
  );

  sceneManager.registerZone("cloudPod", [
    floor,
    desk,
    laptopBase,
    laptopScreen,
    consultant,
    backPedestal,
    backSign,
  ]);
  sceneManager.setCameraTarget(
    "cloudPod",
    origin.add(new Vector3(0, 3, -4.5)),
    origin.add(new Vector3(0, 1.4, 0))
  );
  sceneManager.setZoneVisible("cloudPod", false);
}
