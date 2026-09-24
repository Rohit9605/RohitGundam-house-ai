"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, PointerLockControls, Sky } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { HouseDesign, Room } from "@/lib/types";

const T = 0.28;

function Wall({ p, s, glass=false }: { p:[number,number,number]; s:[number,number,number]; glass?:boolean }) {
  return <mesh position={p} castShadow receiveShadow>
    <boxGeometry args={s}/>
    <meshStandardMaterial color={glass ? "#9fc5cf" : "#eeeae2"} transparent={glass} opacity={glass ? .38 : 1} roughness={glass ? .08 : .82}/>
  </mesh>;
}

function RoomShell({r,h,i}:{r:Room;h:number;i:number}) {
  const y=r.floor*(h+.55), door=Math.min(3.5,r.width*.28), side=Math.max(.5,(r.width-door)/2);
  const glass=/living|kitchen|dining|lounge|primary/i.test(r.name);
  return <group>
    <mesh position={[r.x+r.width/2,y+.08,r.z+r.depth/2]} receiveShadow><boxGeometry args={[r.width,.16,r.depth]}/><meshStandardMaterial color={i%2?"#d7d0c4":"#e5dfd3"}/></mesh>
    {glass ? <Wall p={[r.x+r.width/2,y+h/2,r.z]} s={[r.width,h,.12]} glass/> : <>
      <Wall p={[r.x+side/2,y+h/2,r.z]} s={[side,h,T]}/>
      <Wall p={[r.x+r.width-side/2,y+h/2,r.z]} s={[side,h,T]}/>
      <Wall p={[r.x+r.width/2,y+h-.45,r.z]} s={[door,.9,T]}/>
    </>}
    <Wall p={[r.x+r.width/2,y+h/2,r.z+r.depth]} s={[r.width,h,T]}/>
    <Wall p={[r.x,y+h/2,r.z+r.depth/2]} s={[T,h,r.depth]}/>
    <Wall p={[r.x+r.width,y+h/2,r.z+r.depth/2]} s={[T,h,r.depth]}/>
  </group>;
}

function Features({design}:{design:HouseDesign}) {
  const h=design.ceilingHeight;
  return <>{(design.features||[]).map((f,i)=>{
    const y=f.floor*(h+.55);
    if(f.type==="pool") return <group key={i}><mesh position={[f.x+f.width/2,.08,f.z+f.depth/2]}><boxGeometry args={[f.width,.18,f.depth]}/><meshStandardMaterial color="#4d9bad" roughness={.15}/></mesh><mesh position={[f.x+f.width/2,.19,f.z+f.depth/2]}><boxGeometry args={[f.width-.7,.05,f.depth-.7]}/><meshStandardMaterial color="#79c7d5" transparent opacity={.82}/></mesh></group>;
    if(f.type==="terrace") return <mesh key={i} position={[f.x+f.width/2,y+.16,f.z+f.depth/2]} receiveShadow><boxGeometry args={[f.width,.32,f.depth]}/><meshStandardMaterial color="#d9d6cf"/></mesh>;
    if(f.type==="glassWall") return <Wall key={i} p={[f.x+f.width/2,y+h/2,f.z]} s={[f.width,h,.12]} glass/>;
    const roofY=(f.floor+1)*(h+.55)-.25;
    return <mesh key={i} position={[f.x+f.width/2,roofY,f.z+f.depth/2]} castShadow><boxGeometry args={[f.width,.45,f.depth]}/><meshStandardMaterial color="#d7d7d3" roughness={.72}/></mesh>;
  })}</>;
}

function Walk({enabled,design}:{enabled:boolean;design:HouseDesign}) {
  const {camera}=useThree(); const keys=useRef<Record<string,boolean>>({});
  useEffect(()=>{if(!enabled)return; camera.position.set(-design.width/2+8,5.5,-design.depth/2+9);
    const d=(e:KeyboardEvent)=>keys.current[e.code]=true,u=(e:KeyboardEvent)=>keys.current[e.code]=false;
    addEventListener("keydown",d);addEventListener("keyup",u);return()=>{removeEventListener("keydown",d);removeEventListener("keyup",u);keys.current={};};
  },[enabled,camera,design]);
  useFrame((_,dt)=>{if(!enabled)return;const s=10*dt,f=new THREE.Vector3();camera.getWorldDirection(f);f.y=0;f.normalize();const r=new THREE.Vector3().crossVectors(f,camera.up).normalize();
    if(keys.current.KeyW||keys.current.ArrowUp)camera.position.addScaledVector(f,s);if(keys.current.KeyS||keys.current.ArrowDown)camera.position.addScaledVector(f,-s);if(keys.current.KeyA||keys.current.ArrowLeft)camera.position.addScaledVector(r,-s);if(keys.current.KeyD||keys.current.ArrowRight)camera.position.addScaledVector(r,s);camera.position.y=5.5;
  });
  return enabled?<PointerLockControls/>:null;
}

export default function HouseScene({design,walkthrough}:{design:HouseDesign;walkthrough:boolean}) {
  const offset:[number,number,number]=[-design.width/2,0,-design.depth/2];
  const cam=useMemo<[number,number,number]>(()=>[design.width*.9,design.width*.62,design.depth*.95],[design]);
  return <div className="scene"><Canvas shadows camera={{position:cam,fov:48}}>
    <ambientLight intensity={1.25}/><directionalLight position={[30,45,20]} intensity={2.3} castShadow/><Sky sunPosition={[100,35,100]}/>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.12,0]} receiveShadow><planeGeometry args={[240,240]}/><meshStandardMaterial color="#aeb8a1"/></mesh>
    <group position={offset}>{design.rooms.map((r,i)=><RoomShell key={r.name+i} r={r} h={design.ceilingHeight} i={i}/>)}<Features design={design}/></group>
    {!walkthrough&&<OrbitControls makeDefault target={[0,design.ceilingHeight*.8,0]} maxPolarAngle={Math.PI*.48}/>}<Walk enabled={walkthrough} design={design}/>
  </Canvas>{walkthrough&&<div className="walk-hint">Click to look around · WASD to move · Esc releases cursor</div>}</div>;
}