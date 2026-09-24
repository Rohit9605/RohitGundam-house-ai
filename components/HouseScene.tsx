"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PointerLockControls, Sky } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { HouseDesign } from "@/lib/types";

function Walls({ design, floor }: { design: HouseDesign; floor: number }) {
  const rooms = design.rooms.filter((r) => r.floor === floor);
  const h = design.ceilingHeight;
  const t = 0.35;
  return (
    <group position={[-design.width / 2, floor * (h + 0.5), -design.depth / 2]}>
      {rooms.map((r, i) => {
        const cx = r.x + r.width / 2;
        const cz = r.z + r.depth / 2;
        const wallY = h / 2;
        return (
          <group key={`${r.name}-${i}`}>
            <mesh position={[cx, 0.08, cz]} receiveShadow>
              <boxGeometry args={[r.width, 0.16, r.depth]} />
              <meshStandardMaterial color={i % 2 ? "#d9d2c6" : "#e6e0d5"} />
            </mesh>
            <mesh position={[cx, wallY, r.z]}>
              <boxGeometry args={[r.width, h, t]} />
              <meshStandardMaterial color="#ece8df" />
            </mesh>
            <mesh position={[cx, wallY, r.z + r.depth]}>
              <boxGeometry args={[r.width, h, t]} />
              <meshStandardMaterial color="#ece8df" />
            </mesh>
            <mesh position={[r.x, wallY, cz]}>
              <boxGeometry args={[t, h, r.depth]} />
              <meshStandardMaterial color="#e4ded4" />
            </mesh>
            <mesh position={[r.x + r.width, wallY, cz]}>
              <boxGeometry args={[t, h, r.depth]} />
              <meshStandardMaterial color="#e4ded4" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function WalkController({ enabled }: { enabled: boolean }) {
  const { camera } = useThree();
  const keys = useRef<Record<string, boolean>>({});

  useEffect(() => {
    if (!enabled) return;
    camera.position.set(0, 5.5, 10);
    const down = (e: KeyboardEvent) => { keys.current[e.code] = true; };
    const up = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      keys.current = {};
    };
  }, [enabled, camera]);

  useFrame((_, delta) => {
    if (!enabled) return;
    const speed = 12 * delta;
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();

    if (keys.current["KeyW"] || keys.current["ArrowUp"]) camera.position.addScaledVector(forward, speed);
    if (keys.current["KeyS"] || keys.current["ArrowDown"]) camera.position.addScaledVector(forward, -speed);
    if (keys.current["KeyA"] || keys.current["ArrowLeft"]) camera.position.addScaledVector(right, -speed);
    if (keys.current["KeyD"] || keys.current["ArrowRight"]) camera.position.addScaledVector(right, speed);
    camera.position.y = 5.5;
  });

  return enabled ? <PointerLockControls /> : null;
}

export default function HouseScene({ design, walkthrough }: { design: HouseDesign; walkthrough: boolean }) {
  const cameraPosition = useMemo<[number, number, number]>(() => [design.width * 0.75, design.width * 0.55, design.depth * 0.8], [design]);

  return (
    <div className="scene">
      <Canvas shadows camera={{ position: cameraPosition, fov: 48 }}>
        <ambientLight intensity={1.2} />
        <directionalLight position={[20, 35, 15]} intensity={2.2} castShadow />
        <Sky sunPosition={[100, 30, 100]} />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
          <planeGeometry args={[220, 220]} />
          <meshStandardMaterial color="#b9c0aa" />
        </mesh>
        {Array.from({ length: design.floors }).map((_, floor) => (
          <Walls key={floor} design={design} floor={floor} />
        ))}
        {!walkthrough && <OrbitControls makeDefault target={[0, design.ceilingHeight * 0.8, 0]} />}
        <WalkController enabled={walkthrough} />
      </Canvas>
      {walkthrough && (
        <div className="walk-hint">
          Click the scene to look around · WASD to move · Esc releases cursor
        </div>
      )}
    </div>
  );
}
