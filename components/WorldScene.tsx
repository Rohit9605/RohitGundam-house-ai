"use client";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, PointerLockControls, Environment } from "@react-three/drei";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader.js";
import * as THREE from "three";

function Layer({url}:{url:string}) {
 const g=useLoader(PLYLoader,url); g.computeVertexNormals();
 const hasColor=Boolean(g.getAttribute("color"));
 return <mesh geometry={g} castShadow receiveShadow><meshStandardMaterial vertexColors={hasColor} color={hasColor?"#ffffff":"#d8d4ca"} roughness={.75} side={THREE.DoubleSide}/></mesh>;
}
export default function WorldScene({urls,walkthrough}:{urls:string[];walkthrough:boolean}) {
 return <div className="scene"><Canvas shadows camera={{position:[0,1.7,5],fov:65}} gl={{toneMapping:THREE.ACESFilmicToneMapping}}>
  <ambientLight intensity={.7}/><directionalLight position={[8,14,5]} intensity={2} castShadow/><Environment preset="forest"/>
  <group rotation={[-Math.PI/2,0,0]}>{urls.map(u=><Layer key={u} url={u}/>)}</group>
  {walkthrough?<PointerLockControls/>:<OrbitControls makeDefault/>}
 </Canvas>{walkthrough&&<div className="walk-hint">Click to look around · Esc releases cursor</div>}</div>;
}