import type { HouseDesign } from "./types";
export const demoDesign: HouseDesign = {
 title:"Tropical Cantilever House",
 analysis:{style:"Tropical modernism",massing:"Three strongly horizontal, offset levels stepping down a hillside",roof:"Thin broad flat roof planes with deep cantilevered eaves",materials:["white concrete","floor-to-ceiling glass","dark metal","warm timber"],windows:"Continuous view-facing glazing with shaded floor-to-ceiling panels",signatureFeatures:["stacked cantilevered slabs","infinity-style pool","deep terraces","timber sun screens","open glass pavilions","hillside composition"]},
 concept:"A dramatic original hillside residence built from offset concrete slabs and transparent pavilions. Deep terraces, a projecting pool and shaded glazing create the same indoor-outdoor architectural language as the reference while using a new conceptual layout.",
 width:52,depth:42,floors:2,ceilingHeight:10,
 rooms:[
 {name:"Great Room",x:14,z:4,width:30,depth:17,floor:0},{name:"Guest Wing",x:2,z:18,width:17,depth:20,floor:0},{name:"Kitchen",x:31,z:20,width:17,depth:18,floor:0},
 {name:"Primary Suite",x:6,z:5,width:23,depth:18,floor:1},{name:"Bedroom Wing",x:29,z:5,width:18,depth:31,floor:1},{name:"Upper Lounge",x:6,z:23,width:23,depth:13,floor:1}
 ],
 features:[{type:"pool",x:12,z:-14,width:31,depth:12,floor:0},{type:"terrace",x:0,z:-6,width:52,depth:8,floor:0},{type:"terrace",x:2,z:-3,width:46,depth:8,floor:1},{type:"glassWall",x:14,z:4,width:30,depth:.2,floor:0},{type:"glassWall",x:6,z:5,width:23,depth:.2,floor:1},{type:"overhang",x:-3,z:-4,width:58,depth:12,floor:1},{type:"roofSlab",x:-3,z:0,width:58,depth:45,floor:1}]
};