export type Room = {
  name: string; x: number; z: number; width: number; depth: number; floor: number;
};

export type ArchitecturalFeature = {
  type: "terrace" | "pool" | "glassWall" | "roofSlab" | "overhang";
  x: number; z: number; width: number; depth: number; floor: number;
};

export type HouseDesign = {
  title: string;
  analysis: { style: string; massing: string; roof: string; materials: string[]; windows: string; signatureFeatures: string[]; };
  concept: string; width: number; depth: number; floors: number; ceilingHeight: number;
  rooms: Room[];
  features?: ArchitecturalFeature[];
};