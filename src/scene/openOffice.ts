// scene/openOffice.ts
// 4 engineer desks (with laptop props) + 2 managers standing nearby.
// Registers the "openOffice" zone and a "back to reception" nav marker.

import { Color3, MeshBuilder, StandardMaterial, Vector3 } from "@babylonjs/core";
import type { SceneManager } from "./sceneManager";
import { createCharacter } from "../characters/characterFactory";
import {
  OPEN_OFFICE_ORIGIN,
  engineerConfigs,
  managerConfigs,
} from "../characters/characterConfig";
import { BRAND_ACCENT_SECONDARY, BRAND_BG, BRAND_SURFACE, hexToColor3 } from "../theme";

export function createOpenOffice(sceneManager: SceneManager): void {
  const { scene } = sceneManager;
  const origin = OPEN_OFFICE_ORIGIN;

  const floor = MeshBuilder.CreateGround("openOfficeFloor", { width: 14, height: 10 }, scene);
  floor.position = origin.clone();
  const floorMat = new StandardMaterial("openOfficeFloorMat", scene);
  floorMat.diffuseColor = hexToColor3(BRAND_SURFACE);
  floorMat.specularColor = Color3.Black();
  floor.material = floorMat;

  const deskMat = new StandardMaterial("openOfficeDeskMat", scene);
  deskMat.diffuseColor = hexToColor3(BRAND_ACCENT_SECONDARY);
  deskMat.specularColor = Color3.Black();

  const laptopMat = new StandardMaterial("openOfficeLaptopMat", scene);
  laptopMat.diffuseColor = hexToColor3(BRAND_BG);
  laptopMat.emissiveColor = hexToColor3(BRAND_ACCENT_SECONDARY).scale(0.35);
  laptopMat.specularColor = Color3.Black();

  const deskMeshes = [-3, -1, 1, 3].flatMap((dx, i) => {
    const desk = MeshBuilder.CreateBox(
      `openOfficeDesk${i}`,
      { width: 1.4, height: 0.9, depth: 0.7 },
      scene
    );
    desk.position = origin.add(new Vector3(dx, 0.45, -1.3));
    desk.material = deskMat;

    const laptop = MeshBuilder.CreateBox(
      `openOfficeLaptop${i}`,
      { width: 0.35, height: 0.25, depth: 0.02 },
      scene
    );
    laptop.position = origin.add(new Vector3(dx, 1.0, -1.5));
    laptop.rotation.x = -0.3;
    laptop.material = laptopMat;

    return [desk, laptop];
  });

  const engineers = engineerConfigs.map((cfg) => createCharacter(cfg, scene));
  const managers = managerConfigs.map((cfg) => createCharacter(cfg, scene));

  const [backPedestal, backSign] = sceneManager.createNavMarker(
    "openOfficeBack",
    origin.add(new Vector3(0, 0, 6)),
    "< Reception",
    BRAND_ACCENT_SECONDARY,
    () => {
      sceneManager.showOnly("reception");
      sceneManager.goToZone("reception");
    }
  );

  sceneManager.registerZone("openOffice", [
    floor,
    ...deskMeshes,
    ...engineers,
    ...managers,
    backPedestal,
    backSign,
  ]);
  sceneManager.setCameraTarget(
    "openOffice",
    origin.add(new Vector3(0, 4, -8)),
    origin.add(new Vector3(0, 1.4, -0.5))
  );
  sceneManager.setZoneVisible("openOffice", false);
}
