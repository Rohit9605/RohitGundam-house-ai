import type { HouseDesign } from "./types";

export const demoDesign: HouseDesign = {
  title: "Cliffside Glass House",
  analysis: {
    style: "Tropical contemporary",
    massing: "Stacked and offset horizontal volumes with deep terraces and cantilevered slabs",
    roof: "Broad flat and low-pitch roof planes with generous overhangs",
    materials: ["white concrete", "clear glass", "dark metal", "warm timber"],
    windows: "Large floor-to-ceiling glazed walls concentrated along view-facing elevations",
    signatureFeatures: ["cantilevered upper volume", "deep terraces", "large glass walls", "reflecting pool", "indoor-outdoor connection"]
  },
  concept: "An original multi-level tropical house inspired by horizontal slabs, transparent living spaces and deep outdoor terraces.",
  width: 52, depth: 42, floors: 2, ceilingHeight: 10,
  rooms: [
    { name: "Living", x: 2, z: 3, width: 24, depth: 18, floor: 0 },
    { name: "Kitchen + Dining", x: 26, z: 3, width: 22, depth: 18, floor: 0 },
    { name: "Guest Suite", x: 2, z: 21, width: 17, depth: 17, floor: 0 },
    { name: "Entry + Stair", x: 19, z: 21, width: 12, depth: 17, floor: 0 },
    { name: "Studio", x: 31, z: 21, width: 17, depth: 17, floor: 0 },
    { name: "Primary Suite", x: 5, z: 5, width: 23, depth: 18, floor: 1 },
    { name: "Bedroom 2", x: 28, z: 5, width: 19, depth: 16, floor: 1 },
    { name: "Bedroom 3", x: 28, z: 21, width: 19, depth: 16, floor: 1 },
    { name: "Upper Lounge", x: 5, z: 23, width: 23, depth: 14, floor: 1 }
  ],
  features: [
    { type: "terrace", x: 0, z: -2, width: 52, depth: 5, floor: 0 },
    { type: "terrace", x: 3, z: 0, width: 34, depth: 5, floor: 1 },
    { type: "pool", x: 13, z: -12, width: 27, depth: 9, floor: 0 },
    { type: "glassWall", x: 2, z: 3, width: 24, depth: 0.2, floor: 0 },
    { type: "glassWall", x: 26, z: 3, width: 22, depth: 0.2, floor: 0 },
    { type: "glassWall", x: 5, z: 5, width: 23, depth: 0.2, floor: 1 },
    { type: "overhang", x: 0, z: -2, width: 54, depth: 8, floor: 1 },
    { type: "roofSlab", x: 3, z: 3, width: 46, depth: 36, floor: 1 }
  ]
};