// scene/exterior.ts
// Ground, building shell, entrance gate, and a distinct clickable door mesh.
// Registers the "exterior" zone and its camera target with the SceneManager.

import {
  ActionManager,
  Color3,
  DynamicTexture,
  ExecuteCodeAction,
  MeshBuilder,
  StandardMaterial,
  Vector3,
  type Mesh,
} from "@babylonjs/core";
import type { SceneManager } from "./sceneManager";
import {
  BRAND_ACCENT,
  BRAND_ACCENT_SECONDARY,
  BRAND_BG,
  BRAND_SURFACE,
  hexToColor3,
} from "../theme";
import { createCharacter } from "../characters/characterFactory";
import { securityGuardConfig } from "../characters/characterConfig";

export interface ExteriorHandles {
  door: Mesh;
}

export function createExterior(
  sceneManager: SceneManager,
  onDoorClick: () => void
): ExteriorHandles {
  const { scene } = sceneManager;

  const ground = MeshBuilder.CreateGround(
    "exteriorGround",
    { width: 60, height: 60 },
    scene
  );
  const groundMat = new StandardMaterial("exteriorGroundMat", scene);
  groundMat.diffuseColor = hexToColor3(BRAND_SURFACE);
  groundMat.specularColor = Color3.Black();
  ground.material = groundMat;

  const building = MeshBuilder.CreateBox(
    "building",
    { width: 16, height: 8, depth: 12 },
    scene
  );
  // Front face sits at z=3, well behind the gate (z=-0.5) and door (z=0.9)
  // so they aren't swallowed by the building's own solid geometry.
  building.position = new Vector3(0, 4, 9);
  const buildingMat = new StandardMaterial("buildingMat", scene);
  buildingMat.diffuseColor = hexToColor3(BRAND_BG);
  buildingMat.specularColor = Color3.Black();
  building.material = buildingMat;

  // Entrance gate: two posts + a lintel, framing the door.
  const gateMat = new StandardMaterial("gateMat", scene);
  gateMat.diffuseColor = hexToColor3(BRAND_ACCENT_SECONDARY);
  gateMat.emissiveColor = hexToColor3(BRAND_ACCENT_SECONDARY).scale(0.15);

  const postLeft = MeshBuilder.CreateBox(
    "gatePostLeft",
    { width: 0.4, height: 5, depth: 0.4 },
    scene
  );
  postLeft.position = new Vector3(-2.2, 2.5, -0.5);
  postLeft.material = gateMat;

  const postRight = postLeft.clone("gatePostRight");
  postRight.position = new Vector3(2.2, 2.5, -0.5);

  const lintel = MeshBuilder.CreateBox(
    "gateLintel",
    { width: 5.2, height: 0.4, depth: 0.6 },
    scene
  );
  lintel.position = new Vector3(0, 5.1, -0.5);
  lintel.material = gateMat;

  // "RenderedBy" nameboard, mounted above the gate lintel so it's visible
  // to the visitor before they've even reached the door. Same
  // no-rotation/backFaceCulling-off pattern as SceneManager.createNavMarker's
  // signs — proven to face this scene's camera correctly without needing
  // the 180-rotation + pre-mirrored-texture dance the wall-mounted reception
  // signs require.
  const nameboard = MeshBuilder.CreatePlane(
    "nameboard",
    { width: 4.6, height: 1.1 },
    scene
  );
  nameboard.position = new Vector3(0, 6.4, -0.5);
  const nameboardTex = new DynamicTexture(
    "nameboardTex",
    { width: 640, height: 160 },
    scene
  );
  const nbCtx = nameboardTex.getContext() as unknown as CanvasRenderingContext2D;
  nbCtx.fillStyle = BRAND_SURFACE;
  nbCtx.fillRect(0, 0, 640, 160);
  nbCtx.strokeStyle = BRAND_ACCENT_SECONDARY;
  nbCtx.lineWidth = 6;
  nbCtx.strokeRect(6, 6, 628, 148);
  nbCtx.fillStyle = BRAND_ACCENT;
  nbCtx.font = "bold 64px sans-serif";
  nbCtx.textAlign = "center";
  nbCtx.textBaseline = "middle";
  nbCtx.fillText("RenderedBy", 320, 84);
  nameboardTex.update();
  const nameboardMat = new StandardMaterial("nameboardMat", scene);
  nameboardMat.diffuseTexture = nameboardTex;
  nameboardMat.emissiveColor = new Color3(0.9, 0.9, 0.9);
  nameboardMat.specularColor = Color3.Black();
  nameboardMat.backFaceCulling = false;
  nameboard.material = nameboardMat;

  // The door: a distinct, clickable mesh with the brand accent color.
  const door = MeshBuilder.CreateBox(
    "entranceDoor",
    { width: 3, height: 4.4, depth: 0.3 },
    scene
  );
  door.position = new Vector3(0, 2.2, 0.9);
  const doorMat = new StandardMaterial("doorMat", scene);
  doorMat.diffuseColor = hexToColor3(BRAND_ACCENT);
  doorMat.emissiveColor = hexToColor3(BRAND_ACCENT).scale(0.35);
  door.material = doorMat;

  door.actionManager = new ActionManager(scene);
  door.actionManager.registerAction(
    new ExecuteCodeAction(ActionManager.OnPickTrigger, () => onDoorClick())
  );
  // Hover feedback so it reads as clickable.
  door.actionManager.registerAction(
    new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
      doorMat.emissiveColor = hexToColor3(BRAND_ACCENT).scale(0.6);
      scene.getEngine().getRenderingCanvas()!.style.cursor = "pointer";
    })
  );
  door.actionManager.registerAction(
    new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
      doorMat.emissiveColor = hexToColor3(BRAND_ACCENT).scale(0.35);
      scene.getEngine().getRenderingCanvas()!.style.cursor = "default";
    })
  );

  const guard = createCharacter(securityGuardConfig, scene);

  sceneManager.registerZone("exterior", [
    ground,
    building,
    postLeft,
    postRight,
    lintel,
    nameboard,
    door,
    guard,
  ]);
  sceneManager.setCameraTarget(
    "exterior",
    new Vector3(0, 5, -14),
    new Vector3(0, 2, 2)
  );

  return { door };
}
