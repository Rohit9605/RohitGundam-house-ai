import { NextRequest, NextResponse } from "next/server";
import { demoDesign } from "@/lib/demoDesign";
import type { HouseDesign, ArchitecturalFeature } from "@/lib/types";

export const runtime = "nodejs";

function extractJson(text:string){const c=text.replace(/```json/gi,"").replace(/```/g,"").trim();const a=c.indexOf("{"),b=c.lastIndexOf("}");if(a<0||b<0)throw new Error("Model did not return JSON");return JSON.parse(c.slice(a,b+1));}
const n=(v:any,min:number,max:number,f:number)=>Math.max(min,Math.min(max,Number(v)||f));

function validateDesign(v:any):HouseDesign{
  if(!v||!Array.isArray(v.rooms)||!v.analysis)throw new Error("Invalid house design");
  const floors=Math.round(n(v.floors,1,3,2));
  const rooms=v.rooms.filter((r:any)=>r&&Number.isFinite(Number(r.width))&&Number.isFinite(Number(r.depth))).slice(0,24).map((r:any)=>({
    name:String(r.name||"Room").slice(0,40),x:n(r.x,0,100,0),z:n(r.z,0,100,0),width:n(r.width,4,50,10),depth:n(r.depth,4,50,10),floor:Math.round(n(r.floor,0,floors-1,0))
  }));
  const allowed=new Set(["terrace","pool","glassWall","roofSlab","overhang"]);
  const features:ArchitecturalFeature[]=Array.isArray(v.features)?v.features.filter((f:any)=>f&&allowed.has(f.type)).slice(0,18).map((f:any)=>({
    type:f.type,x:n(f.x,-30,120,0),z:n(f.z,-30,120,0),width:n(f.width,.2,100,8),depth:n(f.depth,.1,100,4),floor:Math.round(n(f.floor,0,floors-1,0))
  })):[];
  return {title:String(v.title||"AI House Concept").slice(0,80),analysis:{style:String(v.analysis.style||"Contemporary"),massing:String(v.analysis.massing||"Residential massing"),roof:String(v.analysis.roof||"Low-pitch roof"),materials:Array.isArray(v.analysis.materials)?v.analysis.materials.slice(0,6).map(String):[],windows:String(v.analysis.windows||"Balanced glazing"),signatureFeatures:Array.isArray(v.analysis.signatureFeatures)?v.analysis.signatureFeatures.slice(0,6).map(String):[]},concept:String(v.concept||"An original concept inspired by the reference."),width:n(v.width,20,100,44),depth:n(v.depth,20,100,38),floors,ceilingHeight:n(v.ceilingHeight,8,14,10),rooms,features};
}

export async function POST(req:NextRequest){
 try{
  const {image,imageUrl,squareFeet=2800,bedrooms=4,floors=2}=await req.json();
  if(!image&&!imageUrl)return NextResponse.json({error:"Upload an inspiration image or provide an image URL."},{status:400});
  if(!process.env.OPENAI_API_KEY)return NextResponse.json({design:demoDesign,demo:true,note:"OPENAI_API_KEY is not configured."});
  const prompt=`You are House AI. Analyze the reference exterior and create an ORIGINAL conceptual residential design inspired by its visible architectural language, not a copy of a known floor plan. Target about ${squareFeet} sq ft, ${bedrooms} bedrooms, ${floors} floors.

Pay special attention to geometry visible in the image: stacked/offset volumes, cantilevers, terraces, balconies, pools, large glazed walls, roof slabs/overhangs, solid-vs-glass facade rhythm and indoor-outdoor relationships. The 3D renderer will directly build what you specify.

Return ONLY JSON:
{"title":"name","analysis":{"style":"style","massing":"massing","roof":"roof","materials":["material"],"windows":"glazing","signatureFeatures":["feature"]},"concept":"rationale","width":52,"depth":42,"floors":2,"ceilingHeight":10,"rooms":[{"name":"Living","x":2,"z":3,"width":24,"depth":18,"floor":0}],"features":[{"type":"terrace","x":0,"z":0,"width":30,"depth":6,"floor":0},{"type":"glassWall","x":2,"z":3,"width":20,"depth":0.2,"floor":0},{"type":"pool","x":10,"z":-10,"width":25,"depth":8,"floor":0},{"type":"overhang","x":0,"z":0,"width":30,"depth":7,"floor":1},{"type":"roofSlab","x":2,"z":2,"width":40,"depth":30,"floor":1}]}

Units are feet. Room x/z are top-left coordinates. Keep rooms mostly non-overlapping and plausible. floor is zero-based. Use features only when visually justified. A glassWall is a thin facade plane: width is its horizontal span and depth can be 0.2. Pools and terraces may extend outside the main footprint using negative coordinates. Keep rooms <=20 and features <=18. Concept only; not engineering or permit documentation.`;
  const response=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${process.env.OPENAI_API_KEY}`},body:JSON.stringify({model:process.env.OPENAI_MODEL||"gpt-5.6-luna",input:[{role:"user",content:[{type:"input_text",text:prompt},{type:"input_image",image_url:imageUrl||image}]}]})});
  const data=await response.json();if(!response.ok)return NextResponse.json({error:data?.error?.message||"AI request failed"},{status:500});
  const out=data.output_text||data.output?.flatMap((o:any)=>o.content||[])?.find((c:any)=>c.type==="output_text")?.text;if(!out)throw new Error("AI returned no text output");
  return NextResponse.json({design:validateDesign(extractJson(out)),demo:false});
 }catch(e:any){console.error(e);return NextResponse.json({error:e?.message||"Unable to generate house"},{status:500});}
}