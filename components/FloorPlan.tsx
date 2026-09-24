"use client";

import type { HouseDesign } from "@/lib/types";

export default function FloorPlan({ design, floor }: { design: HouseDesign; floor: number }) {
  const rooms = design.rooms.filter((room) => room.floor === floor);
  const W = 760;
  const H = Math.max(420, Math.round((design.depth / design.width) * W));
  const sx = W / design.width;
  const sz = H / design.depth;

  return (
    <div className="plan-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="floor-plan" role="img" aria-label={`Floor ${floor + 1} plan`}>
        <rect x="2" y="2" width={W - 4} height={H - 4} fill="#f7f3eb" stroke="#171717" strokeWidth="4" />
        {rooms.map((room, i) => {
          const x = room.x * sx;
          const y = room.z * sz;
          const width = room.width * sx;
          const height = room.depth * sz;
          return (
            <g key={`${room.name}-${i}`}>
              <rect x={x} y={y} width={width} height={height} fill={i % 2 ? "#ebe6dc" : "#f3efe7"} stroke="#404040" strokeWidth="2" />
              <text x={x + width / 2} y={y + height / 2 - 4} textAnchor="middle" className="room-name">
                {room.name}
              </text>
              <text x={x + width / 2} y={y + height / 2 + 15} textAnchor="middle" className="room-size">
                {Math.round(room.width)}' × {Math.round(room.depth)}'
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
