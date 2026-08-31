// scene/sceneManager.ts
// Owns the Babylon Engine/Scene/Camera lifecycle and exposes helpers for
// enabling/disabling named "zone" mesh groups and moving the camera between
// them. Zone modules (exterior, reception, salesPod, ...) register their
// meshes here rather than managing visibility themselves.

import {
  ActionManager,
  ArcRotateCamera,
  Color3,
  Color4,
  DynamicTexture,
  Engine,
  ExecuteCodeAction,
  HemisphericLight,
  MeshBuilder,
  Scene,
  StandardMaterial,
  Vector3,
  type AbstractMesh,
  type Mesh,
  type Node,
} from "@babylonjs/core";

export type ZoneName =
  | "exterior"
  | "reception"
  | "salesPod"
  | "cloudPod"
  | "securityPod"
  | "softwarePod"
  | "openOffice"
  | "conferenceRoom"
  | "officeCabins";

interface CameraTarget {
  position: Vector3;
  target: Vector3;
}

export class SceneManager {
  readonly engine: Engine;
  readonly scene: Scene;
  readonly camera: ArcRotateCamera;

  private zones: Map<ZoneName, Node[]> = new Map();
  private cameraTargets: Map<ZoneName, CameraTarget> = new Map();
  private activeZone: ZoneName | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
    });
    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color4(0, 0, 0, 1);

    this.camera = new ArcRotateCamera(
      "mainCamera",
      -Math.PI / 2,
      Math.PI / 2.5,
      20,
      Vector3.Zero(),
      this.scene
    );
    this.camera.attachControl(canvas, true);
    this.camera.lowerRadiusLimit = 3;
    this.camera.upperRadiusLimit = 60;
    this.camera.wheelPrecision = 30;

    const ambientLight = new HemisphericLight(
      "ambientLight",
      new Vector3(0, 1, 0.2),
      this.scene
    );
    // Default groundColor is pure black, which leaves vertical surfaces
    // (doors, walls) almost unlit — lift it so they stay readable against
    // the near-black brand background.
    ambientLight.groundColor = new Color3(0.25, 0.28, 0.32);
    ambientLight.intensity = 1.1;

    window.addEventListener("resize", () => this.engine.resize());
  }

  /** Register meshes/nodes as belonging to a named zone. */
  registerZone(zone: ZoneName, nodes: Node[]): void {
    const existing = this.zones.get(zone) ?? [];
    this.zones.set(zone, [...existing, ...nodes]);
  }

  /** Register the camera position/target to use when entering a zone. */
  setCameraTarget(zone: ZoneName, position: Vector3, target: Vector3): void {
    this.cameraTargets.set(zone, { position, target });
  }

  setZoneVisible(zone: ZoneName, visible: boolean): void {
    const nodes = this.zones.get(zone);
    if (!nodes) return;
    for (const node of nodes) {
      if ("setEnabled" in node) {
        (node as AbstractMesh).setEnabled(visible);
      }
    }
  }

  /** Hide all registered zones except the one(s) passed in. */
  showOnly(...zonesToShow: ZoneName[]): void {
    for (const zone of this.zones.keys()) {
      this.setZoneVisible(zone, zonesToShow.includes(zone));
    }
  }

  /** Move the camera to a zone's registered target, instantly for now. */
  goToZone(zone: ZoneName): void {
    const camTarget = this.cameraTargets.get(zone);
    if (camTarget) {
      this.camera.setPosition(camTarget.position);
      this.camera.setTarget(camTarget.target);
    }
    this.activeZone = zone;
  }

  getActiveZone(): ZoneName | null {
    return this.activeZone;
  }

  /**
   * A small clickable labeled sign + pedestal, used for zone-to-zone
   * navigation (reception -> pods, pod -> back to reception, etc). Returns
   * the meshes so the caller can register them into a zone.
   */
  createNavMarker(
    name: string,
    position: Vector3,
    label: string,
    colorHex: string,
    onClick: () => void
  ): Mesh[] {
    const scene = this.scene;
    const color = Color3.FromHexString(colorHex);

    const pedestal = MeshBuilder.CreateCylinder(
      `${name}_pedestal`,
      { diameter: 0.6, height: 0.9 },
      scene
    );
    pedestal.position = position.add(new Vector3(0, 0.45, 0));
    const pedestalMat = new StandardMaterial(`${name}_pedestalMat`, scene);
    pedestalMat.diffuseColor = color;
    pedestalMat.emissiveColor = color.scale(0.25);
    pedestalMat.specularColor = Color3.Black();
    pedestal.material = pedestalMat;

    const sign = MeshBuilder.CreatePlane(
      `${name}_sign`,
      { width: 1.6, height: 0.5 },
      scene
    );
    sign.position = position.add(new Vector3(0, 1.3, 0));
    const signTex = new DynamicTexture(`${name}_signTex`, { width: 320, height: 100 }, scene);
    const ctx = signTex.getContext() as unknown as CanvasRenderingContext2D;
    ctx.fillStyle = colorHex;
    ctx.fillRect(0, 0, 320, 100);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 26px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, 160, 50);
    signTex.update();
    const signMat = new StandardMaterial(`${name}_signMat`, scene);
    signMat.diffuseTexture = signTex;
    signMat.emissiveColor = new Color3(0.85, 0.85, 0.85);
    signMat.specularColor = Color3.Black();
    signMat.backFaceCulling = false;
    sign.material = signMat;

    for (const mesh of [pedestal, sign]) {
      mesh.actionManager = new ActionManager(scene);
      mesh.actionManager.registerAction(
        new ExecuteCodeAction(ActionManager.OnPickTrigger, () => onClick())
      );
      mesh.actionManager.registerAction(
        new ExecuteCodeAction(ActionManager.OnPointerOverTrigger, () => {
          scene.getEngine().getRenderingCanvas()!.style.cursor = "pointer";
        })
      );
      mesh.actionManager.registerAction(
        new ExecuteCodeAction(ActionManager.OnPointerOutTrigger, () => {
          scene.getEngine().getRenderingCanvas()!.style.cursor = "default";
        })
      );
    }

    return [pedestal, sign];
  }

  startRenderLoop(): void {
    this.engine.runRenderLoop(() => {
      this.scene.render();
    });
  }
}
