"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, OrbitControls, PointerLockControls, Sky, SoftShadows } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { HouseDesign } from "@/lib/types";

type V3=[number,number,number];
function Box({p,s,c="#eeeae2",glass=false,rough=.62}:{p:V3;s:V3;c?:string;glass?:boolean;rough?:number}) {
 return <mesh position={p} castShadow={!glass} receiveShadow>
  <boxGeometry args={s}/>
  {glass?<meshPhysicalMaterial color={c} transparent opacity={.28} transmission={.55} thickness={.15} roughness={.08} metalness={.05}/>:<meshStandardMaterial color={c} roughness={rough}/>}
 </mesh>;
}
function Plant({p=[0,0,0],scale=1}:{p?:V3;scale?:number}) {
 const leaves=[[0,2.6,0],[.7,3.1,.1],[-.65,3,.2],[.15,3.7,-.35],[-.3,2.4,-.6]] as V3[];
 return <group position={p} scale={scale}>
  <mesh position={[0,1.25,0]} castShadow><cylinderGeometry args={[.16,.24,2.5,8]}/><meshStandardMaterial color="#604632" roughness={1}/></mesh>
  {leaves.map((q,i)=><mesh key={i} position={q} castShadow><icosahedronGeometry args={[1.25,i%2?1:0]}/><meshStandardMaterial color={i%2?"#315b32":"#467443"} roughness={1}/></mesh>)}
 </group>;
}
function Palm({p,scale=1}:{p:V3;scale?:number}) {
 return <group position={p} scale={scale}><mesh position={[0,3.7,0]} castShadow><cylinderGeometry args={[.18,.35,7.4,9]}/><meshStandardMaterial color="#76533a"/></mesh>
 {Array.from({length:9}).map((_,i)=><mesh key={i} position={[Math.cos(i*.7)*1.5,7.2,Math.sin(i*.7)*1.5]} rotation={[0,-i*.7,Math.PI/2-.25]} castShadow><capsuleGeometry args={[.25,3.6,3,7]}/><meshStandardMaterial color="#356b38" roughness={.9}/></mesh>)}</group>;
}
function GlassRail({x,z,w,y}:{x:number;z:number;w:number;y:number}) {
 return <group><Box p={[x+w/2,y+1.45,z]} s={[w,.09,.1]} c="#40484a"/>{Array.from({length:Math.max(2,Math.ceil(w/5))}).map((_,i)=>{const pw=w/Math.max(2,Math.ceil(w/5));return <Box key={i} p={[x+pw*(i+.5),y+.75,z]} s={[pw-.08,1.35,.06]} c="#b7d6da" glass/>})}</group>;
}
function Sofa({p,rot=0}:{p:V3;rot?:number}) {return <group position={p} rotation={[0,rot,0]}><Box p={[0,.55,0]} s={[6,1.05,2.4]} c="#b9ad9d"/><Box p={[0,1.25,.95]} s={[6,1.3,.35]} c="#918474"/><Box p={[-2.65,1,.0]} s={[.35,1.2,2.4]} c="#918474"/><Box p={[2.65,1,.0]} s={[.35,1.2,2.4]} c="#918474"/></group>}
function Table({p}:{p:V3}) {return <group position={p}><Box p={[0,.65,0]} s={[4,.22,2.2]} c="#765d48"/>{[-1.6,1.6].flatMap(x=>[-.75,.75].map(z=><Box key={x+":"+z} p={[x,.3,z]} s={[.16,.6,.16]} c="#393735"/>))}</group>}
function Bed({p}:{p:V3}) {return <group position={p}><Box p={[0,.55,0]} s={[7,1.05,6]} c="#d8d0c4"/><Box p={[0,1.35,2.8]} s={[7,1.7,.35]} c="#806e5c"/><Box p={[-1.7,1.18,-1.2]} s={[2.5,.35,1.5]} c="#f0eee8"/><Box p={[1.7,1.18,-1.2]} s={[2.5,.35,1.5]} c="#f0eee8"/></group>}
function Stairs() {return <group position={[25,0,25]}>{Array.from({length:12}).map((_,i)=><Box key={i} p={[0,.42+i*.43,i*.58]} s={[5,.42,1.1]} c="#c7b8a3"/>)}</group>}

function HouseV2({design}:{design:HouseDesign}) {
 const h=design.ceilingHeight, upper=h+.8;
 return <group position={[-26,0,-21]}>
  {/* stepped hillside foundation and three asymmetric wings */}
  <Box p={[27,-1.3,27]} s={[55,2.6,38]} c="#d6d2c8"/>
  <Box p={[8,h/2,25]} s={[15,h,24]} c="#d9d8d2"/>
  <Box p={[43,h/2,25]} s={[12,h,25]} c="#d9d8d2"/>
  <Box p={[26,h/2,31]} s={[23,h,.22]} c="#b9d4d5" glass/>
  <Box p={[26,h+.22,22]} s={[55,.44,42]} c="#e5e3dd"/>
  {/* upper left bedroom wing + recessed central courtyard + glass right pavilion */}
  <Box p={[11,upper+h/2,24]} s={[19,h,22]} c="#deddd7"/>
  <Box p={[38,upper+h/2,23]} s={[22,h,22]} c="#deddd7"/>
  <Box p={[25,upper+h/2,10]} s={[25,h,.18]} c="#a9cccf" glass/>
  <Box p={[43,upper+h/2,12]} s={[12,h,.18]} c="#a9cccf" glass/>
  <Box p={[48,upper+h/2,23]} s={[.18,h,19]} c="#a9cccf" glass/>
  {/* reference-like thin, offset roof planes */}
  <Box p={[13,upper+h+.35,23]} s={[27,.55,29]} c="#efeee9"/>
  <Box p={[38,upper+h+.55,20]} s={[35,.48,34]} c="#efeee9"/>
  <Box p={[28,upper+h+.9,8]} s={[43,.25,13]} c="#d8d7d2"/>
  {/* large terraces and voids */}
  <Box p={[27,.28,3]} s={[55,.56,13]} c="#e5e1da"/><GlassRail x={0} z={-3.5} w={54} y={.55}/>
  <Box p={[27,upper+.25,5]} s={[54,.5,12]} c="#e9e6df"/><GlassRail x={0} z={-.8} w={54} y={upper+.5}/>
  <Box p={[15,upper+.25,34]} s={[22,.5,10]} c="#d9d4ca"/>
  {/* pool projects outward from middle terrace */}
  <Box p={[31,.35,-9]} s={[30,.7,18]} c="#2d3435"/>
  <Box p={[31,.74,-9]} s={[28.8,.12,16.8]} c="#45a0ae" glass/>
  {/* structural pilotis */}
  {[4,19,36,50].map(x=><Box key={x} p={[x,h/2,5]} s={[.62,h,.62]} c="#dad9d4"/>)}
  {/* timber screens */}
  {Array.from({length:7}).map((_,i)=><Box key={i} p={[18+i*1.7,upper+h/2,9.6]} s={[.18,h,.85]} c="#72523a"/>)}
  <Stairs/>
  <Sofa p={[17,1,16]}/><Table p={[25,0,15]}/><Sofa p={[37,1,17]} rot={Math.PI}/><Bed p={[12,upper,24]}/>
  {/* courtyard planting */}
  <Plant p={[27,.2,29]} scale={1.15}/><Plant p={[4,.2,9]} scale={.8}/><Plant p={[49,.2,34]} scale={.8}/>
 </group>;
}
function Landscape() {
 const shrubs=useMemo(()=>Array.from({length:38},(_,i)=>({x:Math.sin(i*17.3)*61,z:Math.cos(i*11.7)*55,s:.65+(i%5)*.13})),[]);
 return <group>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.28,0]} receiveShadow><planeGeometry args={[220,190,1,1]}/><meshStandardMaterial color="#637b58" roughness={1}/></mesh>
  {/* hillside rock/soil masses */}
  <Box p={[-47,5,22]} s={[35,18,85]} c="#65735b" rough={1}/><Box p={[52,2,34]} s={[40,12,70]} c="#718064" rough={1}/>
  {shrubs.map((v,i)=><Plant key={i} p={[v.x,-.1,v.z]} scale={v.s}/>)}
  <Palm p={[-38,0,-17]} scale={1.15}/><Palm p={[42,0,-21]} scale={.95}/><Palm p={[-45,0,40]} scale={1.3}/>
 </group>;
}
function Walk({enabled}:{enabled:boolean}) {
 const {camera}=useThree(),keys=useRef<Record<string,boolean>>({});
 useEffect(()=>{if(!enabled)return;camera.position.set(0,5.5,-17);const d=(e:KeyboardEvent)=>keys.current[e.code]=true,u=(e:KeyboardEvent)=>keys.current[e.code]=false;addEventListener("keydown",d);addEventListener("keyup",u);return()=>{removeEventListener("keydown",d);removeEventListener("keyup",u);keys.current={};};},[enabled,camera]);
 useFrame((_,dt)=>{if(!enabled)return;const speed=8*dt,f=new THREE.Vector3();camera.getWorldDirection(f);f.y=0;f.normalize();const r=new THREE.Vector3().crossVectors(f,camera.up).normalize();if(keys.current.KeyW)camera.position.addScaledVector(f,speed);if(keys.current.KeyS)camera.position.addScaledVector(f,-speed);if(keys.current.KeyA)camera.position.addScaledVector(r,-speed);if(keys.current.KeyD)camera.position.addScaledVector(r,speed);camera.position.y=5.5;});
 return enabled?<PointerLockControls/>:null;
}
export default function HouseScene({design,walkthrough}:{design:HouseDesign;walkthrough:boolean}) {
 return <div className="scene"><Canvas shadows dpr={[1,1.75]} gl={{antialias:true,toneMapping:THREE.ACESFilmicToneMapping,toneMappingExposure:1.05}} camera={{position:[61,34,64],fov:40}}>
  <SoftShadows size={18} samples={18} focus={.45}/><color attach="background" args={["#dce7e9"]}/><fog attach="fog" args={["#dce7e9",90,175]}/>
  <ambientLight intensity={.45}/><hemisphereLight intensity={.7} groundColor="#536247"/><directionalLight position={[-35,55,-28]} intensity={3.2} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048}/><Sky sunPosition={[-80,45,-60]}/>
  <Landscape/><HouseV2 design={design}/><Environment preset="forest" environmentIntensity={.35}/>
  {!walkthrough&&<OrbitControls makeDefault target={[0,10,0]} minDistance={25} maxDistance={105} maxPolarAngle={Math.PI*.49}/>}<Walk enabled={walkthrough}/>
 </Canvas>{walkthrough&&<div className="walk-hint">Click to look around · WASD to move · Esc releases cursor</div>}</div>;
}