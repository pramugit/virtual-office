// scene/salesPod.ts
// Desk + 2 chairs for the Sales & Marketing consultant. Registers the
// "salesPod" zone and a "back to reception" nav marker.

import { Color3, MeshBuilder, StandardMaterial, Vector3 } from "@babylonjs/core";
import type { SceneManager } from "./sceneManager";
import { createCharacter } from "../characters/characterFactory";
import { SALES_POD_ORIGIN, salesConsultantConfig } from "../characters/characterConfig";
import { BRAND_ACCENT, BRAND_SURFACE, hexToColor3 } from "../theme";

export function createSalesPod(sceneManager: SceneManager): void {
  const { scene } = sceneManager;
  const origin = SALES_POD_ORIGIN;

  const floor = MeshBuilder.CreateGround("salesPodFloor", { width: 8, height: 8 }, scene);
  floor.position = origin.clone();
  const floorMat = new StandardMaterial("salesPodFloorMat", scene);
  floorMat.diffuseColor = hexToColor3(BRAND_SURFACE);
  floorMat.specularColor = Color3.Black();
  floor.material = floorMat;

  const desk = MeshBuilder.CreateBox("salesPodDesk", { width: 2.6, height: 1, depth: 1 }, scene);
  desk.position = origin.add(new Vector3(0, 0.5, 0));
  const deskMat = new StandardMaterial("salesPodDeskMat", scene);
  deskMat.diffuseColor = hexToColor3(BRAND_ACCENT);
  deskMat.specularColor = Color3.Black();
  desk.material = deskMat;

  const chairMat = new StandardMaterial("salesPodChairMat", scene);
  chairMat.diffuseColor = hexToColor3(BRAND_SURFACE);
  chairMat.specularColor = Color3.Black();
  const chairs = [-1.2, 1.2].map((dx, i) => {
    const chair = MeshBuilder.CreateCylinder(
      `salesPodChair${i}`,
      { diameter: 0.7, height: 0.9 },
      scene
    );
    chair.position = origin.add(new Vector3(dx, 0.45, -2));
    chair.material = chairMat;
    return chair;
  });

  const consultant = createCharacter(salesConsultantConfig, scene);

  const [backPedestal, backSign] = sceneManager.createNavMarker(
    "salesPodBack",
    origin.add(new Vector3(0, 0, 3.2)),
    "< Reception",
    BRAND_ACCENT,
    () => {
      sceneManager.showOnly("reception");
      sceneManager.goToZone("reception");
    }
  );

  sceneManager.registerZone("salesPod", [floor, desk, ...chairs, consultant, backPedestal, backSign]);
  sceneManager.setCameraTarget(
    "salesPod",
    origin.add(new Vector3(0, 3, -4.5)),
    origin.add(new Vector3(0, 1.4, 0))
  );
  sceneManager.setZoneVisible("salesPod", false);
}
