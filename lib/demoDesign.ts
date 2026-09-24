import type { HouseDesign } from "./types";

export const demoDesign: HouseDesign = {
  title: "Courtyard Modern",
  analysis: {
    style: "Warm contemporary",
    massing: "Two offset rectangular volumes with a recessed entry",
    roof: "Low-pitch roof with clean horizontal lines",
    materials: ["light stucco", "warm wood", "dark metal"],
    windows: "Large grouped openings with strong indoor-outdoor emphasis",
    signatureFeatures: ["recessed entry", "wide glazing", "simple geometric massing"]
  },
  concept: "A calm two-story home that keeps the reference image's horizontal proportions and warm material contrast while creating an original interior layout.",
  width: 44,
  depth: 38,
  floors: 2,
  ceilingHeight: 10,
  rooms: [
    { name: "Living", x: 0, z: 0, width: 22, depth: 19, floor: 0 },
    { name: "Kitchen + Dining", x: 22, z: 0, width: 22, depth: 19, floor: 0 },
    { name: "Office", x: 0, z: 19, width: 13, depth: 19, floor: 0 },
    { name: "Guest Suite", x: 13, z: 19, width: 16, depth: 19, floor: 0 },
    { name: "Entry + Stair", x: 29, z: 19, width: 15, depth: 19, floor: 0 },
    { name: "Primary Suite", x: 0, z: 0, width: 24, depth: 22, floor: 1 },
    { name: "Bedroom 2", x: 24, z: 0, width: 20, depth: 19, floor: 1 },
    { name: "Bedroom 3", x: 24, z: 19, width: 20, depth: 19, floor: 1 },
    { name: "Loft", x: 0, z: 22, width: 24, depth: 16, floor: 1 }
  ]
};
