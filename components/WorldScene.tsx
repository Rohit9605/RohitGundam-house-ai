"use client";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, PointerLockControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

function GlbModel({url}:{url:string}) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={2.2} position={[0,-1.2,0]} />;
}
export default function WorldScene({urls,walkthrough}:{urls:string[];walkthrough:boolean}) {
  return <div className="scene">
    <Canvas shadows camera={{position:[4,2.4,6],fov:55}} gl={{toneMapping:THREE.ACESFilmicToneMapping}}>
      <ambientLight intensity={0.8}/><directionalLight position={[8,12,6]} intensity={2} castShadow/>
      <Environment preset="city"/>
      {urls.map(u => <GlbModel key={u} url={u}/>)}
      {walkthrough ? <PointerLockControls/> : <OrbitControls makeDefault target={[0,0,0]}/>}
    </Canvas>
    {walkthrough && <div className="walk-hint">Click to look around · Esc releases cursor</div>}
  </div>;
}