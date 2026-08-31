// characters/characterFactory.ts
// createCharacter(config, scene): builds a positioned, materialed character
// mesh (capsule body + sphere head, chest "badge" plane) from a
// CharacterConfig. Interactive characters wire their own click behavior —
// either opening the chat panel (with their greeting) or, for
// tooltip-style characters like the security guard, showing a toast.
//
// Real rigged/animated models are a later pass — see README "Next steps".

import {
  ActionManager,
  Color3,
  ExecuteCodeAction,
  MeshBuilder,
  StandardMaterial,
  TransformNode,
  Vector3,
  type Scene,
} from "@babylonjs/core";
import { BRAND_BG, BRAND_TEXT, hexToColor3 } from "../theme";
import type { CharacterConfig } from "./characterConfig";
import { openChat } from "../ui/chat";

let toastEl: HTMLDivElement | null = null;
let toastTimer: number | undefined;

/** Lightweight, dependency-free toast — reused in Phase 5 for pod-gating messages. */
export function showToast(message: string, durationMs = 3200): void {
  if (!toastEl) {
    toastEl = document.createElement("div");
    toastEl.style.position = "fixed";
    toastEl.style.left = "50%";
    toastEl.style.bottom = "48px";
    toastEl.style.transform = "translateX(-50%)";
    toastEl.style.padding = "10px 18px";
    toastEl.style.borderRadius = "8px";
    toastEl.style.background = BRAND_BG;
    toastEl.style.border = `1px solid ${hexToColor3(BRAND_TEXT).toHexString()}22`;
    toastEl.style.color = BRAND_TEXT;
    toastEl.style.font = "14px/1.4 sans-serif";
    toastEl.style.zIndex = "1000";
    toastEl.style.boxShadow = "0 4px 20px rgba(0,0,0,0.5)";
    toastEl.style.transition = "opacity 0.2s ease";
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = message;
  toastEl.style.opacity = "1";
  toastEl.style.display = "block";
  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    if (toastEl) toastEl.style.opacity = "0";
  }, durationMs);
}

let bobPhase = 0;

export function createCharacter(config: CharacterConfig, scene: Scene): TransformNode {
  const root = new TransformNode(`${config.id}_root`, scene);
  root.position = config.position.clone();
  root.rotation.y = config.rotationY ?? 0;

  const bodyMat = new StandardMaterial(`${config.id}_bodyMat`, scene);
  bodyMat.diffuseColor = hexToColor3(config.baseColor);
  bodyMat.specularColor = Color3.Black();

  const badgeMat = new StandardMaterial(`${config.id}_badgeMat`, scene);
  badgeMat.diffuseColor = hexToColor3(config.accentColor);
  badgeMat.emissiveColor = hexToColor3(config.accentColor).scale(0.3);
  badgeMat.specularColor = Color3.Black();

  const body = MeshBuilder.CreateCapsule(
    `${config.id}_body`,
    { height: 1.5, radius: 0.28 },
    scene
  );
  body.position = new Vector3(0, 0.75, 0);
  body.material = bodyMat;
  body.parent = root;

  const head = MeshBuilder.CreateSphere(
    `${config.id}_head`,
    { diameter: 0.42 },
    scene
  );
  head.position = new Vector3(0, 1.71, 0);
  head.material = bodyMat;
  head.parent = root;

  const badge = MeshBuilder.CreatePlane(
    `${config.id}_badge`,
    { width: 0.22, height: 0.22 },
    scene
  );
  badge.position = new Vector3(0, 1.05, 0.285);
  badge.material = badgeMat;
  badge.parent = root;

  if (config.interactive) {
    const onClick = () => {
      if (config.onInteract) {
        config.onInteract();
      } else if (config.tooltipMessage) {
        showToast(config.tooltipMessage);
      } else if (config.greeting) {
        openChat({
          title: config.role,
          department: config.department ?? "general",
          greeting: config.greeting,
        });
      }
    };
    // Wire all three meshes, not just the body — the body can be partly
    // occluded (e.g. a desk in front of it), and only the visibly-clickable
    // part (often just the head poking up) should still register the click.
    for (const mesh of [body, head, badge]) {
      mesh.actionManager = new ActionManager(scene);
      mesh.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnPickTrigger, onClick));
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
  }

  if (config.animationSet === "idleBob") {
    const phaseOffset = bobPhase;
    bobPhase += 1.3;
    const baseY = root.position.y;
    scene.onBeforeRenderObservable.add(() => {
      const t = performance.now() / 1000 + phaseOffset;
      root.position.y = baseY + Math.sin(t * 1.6) * 0.04;
      root.rotation.y = (config.rotationY ?? 0) + Math.sin(t * 0.8) * 0.08;
    });
  }

  return root;
}
