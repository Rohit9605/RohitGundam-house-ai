import { NextRequest, NextResponse } from "next/server";
import { demoDesign } from "@/lib/demoDesign";
import type { HouseDesign } from "@/lib/types";

export const runtime = "nodejs";

function extractJson(text: string) {
  const cleaned = text.replace(/\`\`\`json/gi, "").replace(/\`\`\`/g, "").trim();
  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");
  if (first === -1 || last === -1) throw new Error("Model did not return JSON");
  return JSON.parse(cleaned.slice(first, last + 1));
}

function validateDesign(value: any): HouseDesign {
  if (!value || !Array.isArray(value.rooms) || !value.analysis) throw new Error("Invalid house design");
  const rooms = value.rooms
    .filter((r: any) => r && Number.isFinite(Number(r.width)) && Number.isFinite(Number(r.depth)))
    .slice(0, 24)
    .map((r: any) => ({
      name: String(r.name || "Room").slice(0, 40),
      x: Math.max(0, Number(r.x) || 0),
      z: Math.max(0, Number(r.z) || 0),
      width: Math.max(4, Math.min(50, Number(r.width) || 10)),
      depth: Math.max(4, Math.min(50, Number(r.depth) || 10)),
      floor: Math.max(0, Math.min(2, Math.round(Number(r.floor) || 0))),
    }));

  return {
    title: String(value.title || "AI House Concept").slice(0, 80),
    analysis: {
      style: String(value.analysis.style || "Contemporary"),
      massing: String(value.analysis.massing || "Simple residential massing"),
      roof: String(value.analysis.roof || "Low-pitch roof"),
      materials: Array.isArray(value.analysis.materials) ? value.analysis.materials.slice(0, 6).map(String) : [],
      windows: String(value.analysis.windows || "Balanced window composition"),
      signatureFeatures: Array.isArray(value.analysis.signatureFeatures)
        ? value.analysis.signatureFeatures.slice(0, 6).map(String)
        : [],
    },
    concept: String(value.concept || "An original concept inspired by the reference architecture."),
    width: Math.max(20, Math.min(100, Number(value.width) || 44)),
    depth: Math.max(20, Math.min(100, Number(value.depth) || 38)),
    floors: Math.max(1, Math.min(3, Math.round(Number(value.floors) || 2))),
    ceilingHeight: Math.max(8, Math.min(14, Number(value.ceilingHeight) || 10)),
    rooms,
  };
}

export async function POST(req: NextRequest) {
  try {
    const { image, imageUrl, squareFeet = 2800, bedrooms = 4, floors = 2 } = await req.json();

    if (!image && !imageUrl) {
      return NextResponse.json({ error: "Upload an inspiration image or provide an image URL." }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        design: demoDesign,
        demo: true,
        note: "OPENAI_API_KEY is not configured, so House AI returned the built-in demo design."
      });
    }

    const prompt = `
You are House AI, a conceptual residential design assistant. Study the reference exterior image and create an ORIGINAL house concept inspired by its architectural language. Do not reproduce a known or copyrighted floor plan. This is conceptual visualization only, not construction, engineering, code, or permit documentation.

User constraints:
- target interior area: about ${squareFeet} sq ft
- bedrooms: ${bedrooms}
- floors: ${floors}

Return ONLY valid JSON using exactly this shape:
{
  "title": "short concept name",
  "analysis": {
    "style": "architectural style",
    "massing": "what you observe",
    "roof": "roof geometry",
    "materials": ["material"],
    "windows": "window pattern",
    "signatureFeatures": ["feature"]
  },
  "concept": "2-3 sentence original design rationale",
  "width": 44,
  "depth": 38,
  "floors": 2,
  "ceilingHeight": 10,
  "rooms": [
    { "name": "Living", "x": 0, "z": 0, "width": 20, "depth": 18, "floor": 0 }
  ]
}

Coordinate rules:
- Units are feet.
- x/z are the room's top-left coordinates inside a rectangular footprint.
- Keep every room inside width/depth.
- Use mostly non-overlapping rectangles that form a plausible adjacency layout.
- floor is zero-based.
- Include all major rooms needed for the requested bedroom count.
- Keep total rooms <= 20.
`;

    const imageInput = imageUrl || image;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
        input: [{
          role: "user",
          content: [
            { type: "input_text", text: prompt },
            { type: "input_image", image_url: imageInput }
          ]
        }]
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error(data);
      return NextResponse.json({ error: data?.error?.message || "AI request failed" }, { status: 500 });
    }

    const outputText = data.output_text || data.output
      ?.flatMap((o: any) => o.content || [])
      ?.find((c: any) => c.type === "output_text")?.text;

    if (!outputText) throw new Error("AI returned no text output");

    const design = validateDesign(extractJson(outputText));
    return NextResponse.json({ design, demo: false });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error?.message || "Unable to generate house" }, { status: 500 });
  }
}
