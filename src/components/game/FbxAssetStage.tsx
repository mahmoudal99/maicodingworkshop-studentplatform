"use client";

import { memo, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

type Variant = "hero" | "board";

interface FbxAssetStageProps {
  modelPath: string;
  accent?: string;
  variant?: Variant;
  className?: string;
  title?: string;
  zoom?: number;
  autoRotate?: boolean;
  float?: boolean;
  modelRotation?: [number, number, number];
}

const VARIANT_CONFIG: Record<
  Variant,
  {
    cameraMode: "frontal" | "birdseye";
    ambientIntensity: number;
    keyIntensity: number;
    rimIntensity: number;
    baseScale: number;
    exposure: number;
    fitPadding: number;
    targetHeight: number;
    cameraLift: number;
  }
> = {
  hero: {
    cameraMode: "frontal",
    ambientIntensity: 2.1,
    keyIntensity: 2.4,
    rimIntensity: 1.4,
    baseScale: 2.65,
    exposure: 1.12,
    fitPadding: 1.6,
    targetHeight: 0.5,
    cameraLift: 0.18,
  },
  board: {
    cameraMode: "birdseye",
    ambientIntensity: 1.65,
    keyIntensity: 1.7,
    rimIntensity: 1.05,
    baseScale: 1.6,
    exposure: 1,
    fitPadding: 1.16,
    targetHeight: 0.42,
    cameraLift: 0.08,
  },
};

function disposeMaterial(material: THREE.Material) {
  material.dispose();
}

function FbxAssetStage({
  modelPath,
  accent = "#46d9ff",
  variant = "hero",
  className,
  title,
  zoom = 1,
  autoRotate = variant === "hero",
  float = variant === "hero",
  modelRotation = [0, 0, 0],
}: FbxAssetStageProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [rotationX, rotationY, rotationZ] = modelRotation;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const config = VARIANT_CONFIG[variant];
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
    camera.position.set(0, 0.8, 6);
    camera.up.set(0, 1, 0);
    camera.lookAt(0, 0.2, 0);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = config.exposure;
    renderer.setClearAlpha(0);
    renderer.domElement.className = "fbx-asset-stage-canvas";
    host.appendChild(renderer.domElement);

    const hemisphere = new THREE.HemisphereLight(0xe6f4ff, 0x07111e, config.ambientIntensity);
    const keyLight = new THREE.DirectionalLight(0xffffff, config.keyIntensity);
    keyLight.position.set(4, 5, 6);
    const rimLight = new THREE.DirectionalLight(new THREE.Color(accent), config.rimIntensity);
    rimLight.position.set(-5, 3, -4);
    scene.add(hemisphere, keyLight, rimLight);

    const loader = new FBXLoader();
    loader.setResourcePath("/Assets/Textures/");
    let frameId = 0;
    let mounted = true;
    let modelRoot: THREE.Group | null = null;
    let baseY = 0;
    let frameInfo:
      | {
          radius: number;
          sizeY: number;
          targetY: number;
        }
      | null = null;
    const timer = new THREE.Timer();
    timer.connect(document);

    const updateCameraFrame = () => {
      if (!frameInfo) return;

      const halfFovY = THREE.MathUtils.degToRad(camera.fov * 0.5);
      const halfFovX = Math.atan(Math.tan(halfFovY) * camera.aspect);
      const fitDistance = Math.max(
        frameInfo.radius / Math.tan(halfFovY),
        frameInfo.radius / Math.tan(halfFovX)
      );

      const target = new THREE.Vector3(0, frameInfo.targetY, 0);

      if (config.cameraMode === "birdseye") {
        camera.up.set(0, 0, -1);
        camera.position.set(
          0,
          frameInfo.targetY + fitDistance * config.fitPadding,
          fitDistance * 0.08
        );
      } else {
        camera.up.set(0, 1, 0);
        camera.position.set(
          0,
          frameInfo.targetY + frameInfo.sizeY * config.cameraLift,
          fitDistance * config.fitPadding
        );
      }

      camera.lookAt(target);
      camera.updateProjectionMatrix();
    };

    const resize = () => {
      const width = host.clientWidth || 1;
      const height = host.clientHeight || 1;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      updateCameraFrame();
    };

    const animate = (timestamp?: number) => {
      frameId = window.requestAnimationFrame(animate);
      timer.update(timestamp);
      const elapsed = timer.getElapsed();

      if (modelRoot) {
        if (autoRotate) {
          modelRoot.rotation.y += 0.0065;
        }

        if (float) {
          modelRoot.position.y = baseY + Math.sin(elapsed * 1.9) * 0.05;
        }
      }
      renderer.render(scene, camera);
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(host);

    loader.load(
      encodeURI(modelPath),
      (asset) => {
        if (!mounted) return;

        asset.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = false;
            mesh.receiveShadow = false;

            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            materials.forEach((material) => {
              const phongMaterial = material as THREE.MeshPhongMaterial;
              if ("shininess" in phongMaterial) {
                phongMaterial.shininess = 36;
              }
              if ("specular" in phongMaterial) {
                phongMaterial.specular = new THREE.Color(0x1b2d42);
              }
              material.transparent = true;
              material.opacity = 1;
              material.needsUpdate = true;
            });
          }
        });

        const bounds = new THREE.Box3().setFromObject(asset);
        const size = bounds.getSize(new THREE.Vector3());
        const maxAxis = Math.max(size.x, size.y, size.z) || 1;
        const scale = (config.baseScale / maxAxis) * zoom;
        asset.scale.setScalar(scale);
        asset.rotation.set(rotationX, rotationY, rotationZ);

        const scaledBounds = new THREE.Box3().setFromObject(asset);
        const scaledCenter = scaledBounds.getCenter(new THREE.Vector3());
        asset.position.x -= scaledCenter.x;
        asset.position.z -= scaledCenter.z;
        asset.position.y -= scaledBounds.min.y;

        const framedBounds = new THREE.Box3().setFromObject(asset);
        const framedSphere = framedBounds.getBoundingSphere(new THREE.Sphere());
        const framedSize = framedBounds.getSize(new THREE.Vector3());
        frameInfo = {
          radius: framedSphere.radius,
          sizeY: framedSize.y,
          targetY: framedBounds.min.y + framedSize.y * config.targetHeight,
        };

        modelRoot = new THREE.Group();
        modelRoot.add(asset);
        baseY = modelRoot.position.y;
        scene.add(modelRoot);
        updateCameraFrame();

        setStatus("ready");
      },
      undefined,
      () => {
        if (!mounted) return;
        setStatus("error");
      }
    );

    animate();

    return () => {
      mounted = false;
      observer.disconnect();
      window.cancelAnimationFrame(frameId);
      timer.dispose();

      if (modelRoot) {
        modelRoot.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.geometry.dispose();
            const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            materials.forEach(disposeMaterial);
          }
        });
      }

      renderer.dispose();
      if (renderer.domElement.parentNode === host) {
        host.removeChild(renderer.domElement);
      }
    };
  }, [accent, autoRotate, float, modelPath, rotationX, rotationY, rotationZ, variant, zoom]);

  return (
    <div
      ref={hostRef}
      className={`fbx-asset-stage fbx-asset-stage-${variant}${className ? ` ${className}` : ""}`}
      aria-label={title || "3D ship display"}
      data-state={status}
      role="img"
    >
      {status !== "ready" && (
        <div className="fbx-asset-stage-overlay" aria-hidden="true">
          <span>{status === "error" ? "Ship feed offline" : "Loading hull"}</span>
        </div>
      )}
    </div>
  );
}

function rotationValueAt(rotation: [number, number, number] | undefined, index: 0 | 1 | 2) {
  return rotation?.[index] ?? 0;
}

const MemoizedFbxAssetStage = memo(FbxAssetStage, (prevProps, nextProps) => {
  return (
    prevProps.modelPath === nextProps.modelPath &&
    prevProps.accent === nextProps.accent &&
    prevProps.variant === nextProps.variant &&
    prevProps.className === nextProps.className &&
    prevProps.title === nextProps.title &&
    prevProps.zoom === nextProps.zoom &&
    prevProps.autoRotate === nextProps.autoRotate &&
    prevProps.float === nextProps.float &&
    rotationValueAt(prevProps.modelRotation, 0) === rotationValueAt(nextProps.modelRotation, 0) &&
    rotationValueAt(prevProps.modelRotation, 1) === rotationValueAt(nextProps.modelRotation, 1) &&
    rotationValueAt(prevProps.modelRotation, 2) === rotationValueAt(nextProps.modelRotation, 2)
  );
});

MemoizedFbxAssetStage.displayName = "FbxAssetStage";

export default MemoizedFbxAssetStage;
