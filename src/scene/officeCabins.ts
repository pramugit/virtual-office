// scene/officeCabins.ts
// A row of small private cabin facades (door + nameplate each) — ambient
// atmosphere near the open office / conference room area, like those two
// zones not interactive. Registers the "officeCabins" zone and a
// "back to reception" nav marker.

import { Color3, DynamicTexture, MeshBuilder, StandardMaterial, Vector3, type Node } from "@babylonjs/core";
import type { SceneManager } from "./sceneManager";
import {
  BRAND_ACCENT,
  BRAND_ACCENT_SECONDARY,
  BRAND_BG,
  BRAND_FORMAL,
  BRAND_SURFACE,
  BRAND_TEXT,
  hexToColor3,
} from "../theme";

// Near OPEN_OFFICE_ORIGIN (0,0,30) — offset in x so it's a distinct room,
// not overlapping the open office floor.
const ORIGIN = new Vector3(-16, 0, 30);

const CABIN_NAMES = ["Focus Room", "Client Room", "1:1 Room", "Quiet Room"];
const CABIN_COLORS = [BRAND_ACCENT, BRAND_ACCENT_SECONDARY, BRAND_ACCENT, BRAND_ACCENT_SECONDARY];

export function createOfficeCabins(sceneManager: SceneManager): void {
  const { scene } = sceneManager;

  const floor = MeshBuilder.CreateGround("officeCabinsFloor", { width: 12, height: 6 }, scene);
  floor.position = ORIGIN.clone();
  const floorMat = new StandardMaterial("officeCabinsFloorMat", scene);
  floorMat.diffuseColor = hexToColor3(BRAND_SURFACE);
  floorMat.specularColor = Color3.Black();
  floor.material = floorMat;

  const nodes: Node[] = [floor];
  const cabinWidth = 2.6;
  const startX = -((CABIN_NAMES.length - 1) * cabinWidth) / 2;

  CABIN_NAMES.forEach((name, i) => {
    const x = startX + i * cabinWidth;
    const color = CABIN_COLORS[i % CABIN_COLORS.length];

    const wall = MeshBuilder.CreateBox(
      `officeCabinWall${i}`,
      { width: cabinWidth - 0.2, height: 2.6, depth: 0.25 },
      scene
    );
    wall.position = ORIGIN.add(new Vector3(x, 1.3, -2));
    const wallMat = new StandardMaterial(`officeCabinWallMat${i}`, scene);
    wallMat.diffuseColor = hexToColor3(BRAND_FORMAL);
    wallMat.specularColor = Color3.Black();
    wall.material = wallMat;

    // Camera approaches from very negative z looking toward +z, so "in
    // front of" the wall (i.e. closer to the camera, not occluded by it)
    // means a smaller z than the wall's near face (-2.125), not a larger one.
    const door = MeshBuilder.CreateBox(`officeCabinDoor${i}`, { width: 0.9, height: 2, depth: 0.1 }, scene);
    door.position = ORIGIN.add(new Vector3(x, 1, -2.15));
    const doorMat = new StandardMaterial(`officeCabinDoorMat${i}`, scene);
    doorMat.diffuseColor = hexToColor3(color);
    doorMat.emissiveColor = hexToColor3(color).scale(0.2);
    doorMat.specularColor = Color3.Black();
    door.material = doorMat;

    // Nameplate above the door — same no-rotation, backFaceCulling-off
    // pattern as SceneManager.createNavMarker's signs (proven to face this
    // scene's camera correctly without needing a texture pre-mirror).
    const plate = MeshBuilder.CreatePlane(`officeCabinPlate${i}`, { width: 1, height: 0.3 }, scene);
    plate.position = ORIGIN.add(new Vector3(x, 2.15, -2.2));
    const plateTex = new DynamicTexture(`officeCabinPlateTex${i}`, { width: 256, height: 80 }, scene);
    const ctx = plateTex.getContext() as unknown as CanvasRenderingContext2D;
    ctx.fillStyle = BRAND_BG;
    ctx.fillRect(0, 0, 256, 80);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.strokeRect(4, 4, 248, 72);
    ctx.fillStyle = BRAND_TEXT;
    ctx.font = "bold 22px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(name, 128, 40);
    plateTex.update();
    const plateMat = new StandardMaterial(`officeCabinPlateMat${i}`, scene);
    plateMat.diffuseTexture = plateTex;
    plateMat.emissiveColor = new Color3(0.9, 0.9, 0.9);
    plateMat.specularColor = Color3.Black();
    plateMat.backFaceCulling = false;
    plate.material = plateMat;

    nodes.push(wall, door, plate);
  });

  const [backPedestal, backSign] = sceneManager.createNavMarker(
    "officeCabinsBack",
    ORIGIN.add(new Vector3(0, 0, 3.2)),
    "< Reception",
    BRAND_FORMAL,
    () => {
      sceneManager.showOnly("reception");
      sceneManager.goToZone("reception");
    }
  );
  nodes.push(backPedestal, backSign);

  sceneManager.registerZone("officeCabins", nodes);
  // Far enough back to fit the full ~8-unit-wide cabin row in frame — the
  // row is wider than the other ambient zones' single-desk focal points.
  sceneManager.setCameraTarget(
    "officeCabins",
    ORIGIN.add(new Vector3(0, 4, -13)),
    ORIGIN.add(new Vector3(0, 1.4, -1.8))
  );
  sceneManager.setZoneVisible("officeCabins", false);
}
