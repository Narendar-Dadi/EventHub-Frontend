import React from "react";

export function generatePseudoQRCode(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = Math.imul(31, hash) + seed.charCodeAt(i) | 0;
  const grid = [];
  for (let i = 0; i < 15; i++) {
    for (let j = 0; j < 15; j++) {
      if ((Math.sin(hash + i * j) * 10000) % 1 > 0.5) grid.push({ x: i, y: j });
    }
  }
  return (
    <svg viewBox="0 0 17 17" className="w-full h-full bg-white p-1 rounded">
      <path d="M1,1 h4 v4 h-4 z M2,2 h2 v2 h-2 z" fill="black" />
      <path d="M12,1 h4 v4 h-4 z M13,2 h2 v2 h-2 z" fill="black" />
      <path d="M1,12 h4 v4 h-4 z M2,13 h2 v2 h-2 z" fill="black" />
      {grid.map((dot, idx) => (
        <rect key={idx} x={dot.x + 1} y={dot.y + 1} width="1" height="1" fill="black" />
      ))}
    </svg>
  );
}
