// scene/conferenceRoom.ts
// Long table + chairs, with directors standing mid-discussion. Registers
// the "conferenceRoom" zone and a "back to reception" nav marker.

import { Color3, MeshBuilder, StandardMaterial, Vector3 } from "@babylonjs/core";
import type { SceneManager } from "./sceneManager";
import { createCharacter } from "../characters/characterFactory";
import { CONFERENCE_ROOM_ORIGIN, directorConfigs } from "../characters/characterConfig";
import { BRAND_FORMAL_DARK, BRAND_SURFACE, hexToColor3 } from "../theme";

export function createConferenceRoom(sceneManager: SceneManager): void {
  const { scene } = sceneManager;
  const origin = CONFERENCE_ROOM_ORIGIN;

  const floor = MeshBuilder.CreateGround("conferenceRoomFloor", { width: 10, height: 8 }, scene);
  floor.position = origin.clone();
  const floorMat = new StandardMaterial("conferenceRoomFloorMat", scene);
  floorMat.diffuseColor = hexToColor3(BRAND_SURFACE);
  floorMat.specularColor = Color3.Black();
  floor.material = floorMat;

  const table = MeshBuilder.CreateBox(
    "conferenceRoomTable",
    { width: 4.5, height: 0.8, depth: 1.6 },
    scene
  );
  table.position = origin.add(new Vector3(0, 0.4, -1.5));
  const tableMat = new StandardMaterial("conferenceRoomTableMat", scene);
  tableMat.diffuseColor = hexToColor3(BRAND_FORMAL_DARK);
  tableMat.specularColor = Color3.Black();
  table.material = tableMat;

  const chairMat = new StandardMaterial("conferenceRoomChairMat", scene);
  chairMat.diffuseColor = hexToColor3(BRAND_SURFACE);
  chairMat.specularColor = Color3.Black();
  const chairs = [-1.6, -0.5, 0.5, 1.6].flatMap((dx, i) => {
    const north = MeshBuilder.CreateCylinder(
      `conferenceRoomChairN${i}`,
      { diameter: 0.55, height: 0.85 },
      scene
    );
    north.position = origin.add(new Vector3(dx, 0.42, -0.4));
    north.material = chairMat;
    const south = MeshBuilder.CreateCylinder(
      `conferenceRoomChairS${i}`,
      { diameter: 0.55, height: 0.85 },
      scene
    );
    south.position = origin.add(new Vector3(dx, 0.42, -2.6));
    south.material = chairMat;
    return [north, south];
  });

  const directors = directorConfigs.map((cfg) => createCharacter(cfg, scene));

  const [backPedestal, backSign] = sceneManager.createNavMarker(
    "conferenceRoomBack",
    origin.add(new Vector3(0, 0, 3.2)),
    "< Reception",
    BRAND_FORMAL_DARK,
    () => {
      sceneManager.showOnly("reception");
      sceneManager.goToZone("reception");
    }
  );

  sceneManager.registerZone("conferenceRoom", [
    floor,
    table,
    ...chairs,
    ...directors,
    backPedestal,
    backSign,
  ]);
  sceneManager.setCameraTarget(
    "conferenceRoom",
    origin.add(new Vector3(0, 3.5, -6)),
    origin.add(new Vector3(0, 1.4, -1.5))
  );
  sceneManager.setZoneVisible("conferenceRoom", false);
}
