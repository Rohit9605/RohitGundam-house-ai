"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PointerLockControls, Sky } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { HouseDesign } from "@/lib/types";

function Box({p,s,c="#e8e6e0",glass=false}:{p:[number,number,number];s:[number,number,number];c?:string;glass?:boolean}) {
 return <mesh position={p} castShadow receiveShadow><boxGeometry args={s}/><meshPhysicalMaterial color={c} roughness={glass?.08:.72} metalness={glass?.05:0} transparent={glass} opacity={glass?.34:1} transmission={glass?.18:0}/></mesh>;
}
function Rail({x,z,w,y}:{x:number;z:number;w:number;y:number}) {
 const posts=Array.from({length:Math.max(2,Math.floor(w/5)+1)});
 return <group>{<Box p={[x+w/2,y+1.6,z]} s={[w,.09,.09]} c="#5e6668"/>}{posts.map((_,i)=><Box key={i} p={[x+i*(w/(posts.length-1)),y+.8,z]} s={[.08,1.6,.08]} c="#62696b"/>)}</group>;
}
function Furnish({floor,h}:{floor:number;h:number}) {
 const y=floor*(h+.75);
 return <group>
  <Box p={[15,y+.55,13]} s={[7,1.1,3]} c="#8d8173"/><Box p={[20,y+.45,12]} s={[2.5,.9,2.5]} c="#6d6258"/>
  <Box p={[35,y+1.4,13]} s={[7,2.8,2.5]} c="#a8947a"/><Box p={[35,y+3.1,13]} s={[7,.25,3]} c="#c4b7a2"/>
  {floor===1&&<><Box p={[14,y+.55,14]} s={[8,1.1,6]} c="#c8c1b6"/><Box p={[14,y+1.2,16.5]} s={[8,1.3,.4]} c="#80766b"/></>}
 </group>;
}
function ArchitecturalHouse({design}:{design:HouseDesign}) {
 const h=design.ceilingHeight, step=h+.75;
 return <group position={[-design.width/2,0,-design.depth/2]}>
   {/* lower level: open concrete plinth + glazed pavilion */}
   <Box p={[26,.45,22]} s={[52,.9,38]} c="#d7d6d1"/>
   <Box p={[7,h/2,25]} s={[14,h,24]} c="#deddd8"/>
   <Box p={[28,h/2,13]} s={[31,h,.18]} c="#9fc6cf" glass/>
   <Box p={[43,h/2,24]} s={[10,h,22]} c="#deddd8"/>
   <Box p={[26,h+.25,21]} s={[55,.5,43]} c="#e5e4df"/>
   {/* upper level is offset and more transparent, like the reference */}
   <Box p={[9,step+h/2,24]} s={[13,h,23]} c="#deddd8"/>
   <Box p={[27,step+h/2,10]} s={[30,h,.18]} c="#91bdc8" glass/>
   <Box p={[44,step+h/2,21]} s={[10,h,22]} c="#deddd8"/>
   <Box p={[26,step+h/2,32]} s={[38,h,.18]} c="#9fc6cf" glass/>
   {/* deep horizontal roof / cantilever planes */}
   <Box p={[25,step+h+.3,21]} s={[58,.6,45]} c="#eeeeea"/>
   <Box p={[25,step+h+.75,21]} s={[52,.16,39]} c="#c9c9c4"/>
   {/* front terraces */}
   <Box p={[26,.3,-2]} s={[55,.6,8]} c="#e1dfda"/><Rail x={0} z={-6} w={52} y={.6}/>
   <Box p={[25,step+.2,1]} s={[50,.4,8]} c="#e7e5e0"/><Rail x={2} z={-3} w={46} y={step+.4}/>
   {/* vertical timber sun screens */}
   {Array.from({length:8}).map((_,i)=><Box key={i} p={[21+i*2.15,step+h/2,9.72]} s={[.22,h,1]} c="#765f49"/>)}
   {/* pool with raised dark rim */}
   <Box p={[27,.2,-13]} s={[31,.4,12]} c="#343b3c"/><Box p={[27,.43,-13]} s={[29.8,.12,10.8]} c="#4aa5b7" glass/>
   {/* stepping deck and columns create the reference's layered cliffside feel */}
   <Box p={[9,.25,-10]} s={[12,.5,10]} c="#e4e1db"/>
   {[7,20,34,47].map(x=><Box key={x} p={[x,h/2,-.5]} s={[.65,h, .65]} c="#d8d7d2"/>)}
   <Furnish floor={0} h={h}/><Furnish floor={1} h={h}/>
 </group>;
}
function Walk({enabled,design}:{enabled:boolean;design:HouseDesign}) {
 const {camera}=useThree(), keys=useRef<Record<string,boolean>>({});
 useEffect(()=>{if(!enabled)return;camera.position.set(-design.width/2+25,5.5,-design.depth/2+8);const d=(e:KeyboardEvent)=>keys.current[e.code]=true,u=(e:KeyboardEvent)=>keys.current[e.code]=false;addEventListener("keydown",d);addEventListener("keyup",u);return()=>{removeEventListener("keydown",d);removeEventListener("keyup",u);keys.current={};};},[enabled,camera,design]);
 useFrame((_,dt)=>{if(!enabled)return;const s=10*dt,f=new THREE.Vector3();camera.getWorldDirection(f);f.y=0;f.normalize();const r=new THREE.Vector3().crossVectors(f,camera.up).normalize();if(keys.current.KeyW)camera.position.addScaledVector(f,s);if(keys.current.KeyS)camera.position.addScaledVector(f,-s);if(keys.current.KeyA)camera.position.addScaledVector(r,-s);if(keys.current.KeyD)camera.position.addScaledVector(r,s);camera.position.y=5.5;});
 return enabled?<PointerLockControls/>:null;
}
export default function HouseScene({design,walkthrough}:{design:HouseDesign;walkthrough:boolean}) {
 const cam=useMemo<[number,number,number]>(()=>[62,35,66],[]);
 return <div className="scene"><Canvas shadows camera={{position:cam,fov:42}}>
  <ambientLight intensity={1.05}/><hemisphereLight intensity={.7} groundColor="#58634c"/><directionalLight position={[35,50,25]} intensity={2.5} castShadow/><Sky sunPosition={[100,35,80]}/>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.22,0]} receiveShadow><planeGeometry args={[260,260]}/><meshStandardMaterial color="#76856c" roughness={1}/></mesh>
  {/* hillside backdrop */}
  <mesh position={[0,-4,38]} rotation={[-.15,0,0]} receiveShadow><boxGeometry args={[150,12,45]}/><meshStandardMaterial color="#65775d" roughness={1}/></mesh>
  <ArchitecturalHouse design={design}/>
  {!walkthrough&&<OrbitControls makeDefault target={[0,11,0]} minDistance={35} maxDistance={120} maxPolarAngle={Math.PI*.49}/>}<Walk enabled={walkthrough} design={design}/>
 </Canvas>{walkthrough&&<div className="walk-hint">Click to look around · WASD to move · Esc releases cursor</div>}</div>;
}