"use client";
import { useEffect, useRef, useState } from "react";

interface CanvasBoardProps {
  cities: { x: number; y: number; id: number }[];
  onAddCity: (x: number, y: number) => void;
  bestPath: number[]; // Array of city IDs in order
  edges: { from: number; to: number; pheromone: number }[]; // For visualizing trails
}

export default function CanvasBoard({
  cities,
  onAddCity,
  bestPath,
  edges,
}: CanvasBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Function to draw everything
  const draw = (ctx: CanvasRenderingContext2D) => {
    // 1. Clear Screen
    ctx.clearRect(0, 0, 800, 600);
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, 800, 600);

    // 2. Draw Pheromones (faint lines between all cities)
    edges.forEach((edge) => {
      if (edge.pheromone > 0.1) {
        const c1 = cities[edge.from];
        const c2 = cities[edge.to];
        if (c1 && c2) {
          ctx.beginPath();
          ctx.moveTo(c1.x, c1.y);
          ctx.lineTo(c2.x, c2.y);
          // Opacity based on pheromone strength
          ctx.strokeStyle = `rgba(0, 255, 0, ${Math.min(edge.pheromone * 5, 0.8)})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    });

    // 3. Draw Best Path (Bold Red Line)
    if (bestPath.length > 0) {
      ctx.beginPath();
      const start = cities[bestPath[0]];
      ctx.moveTo(start.x, start.y);
      for (let i = 1; i < bestPath.length; i++) {
        const city = cities[bestPath[i]];
        ctx.lineTo(city.x, city.y);
      }
      ctx.strokeStyle = "red";
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // 4. Draw Cities (Dots)
    cities.forEach((city) => {
      ctx.beginPath();
      ctx.arc(city.x, city.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = "#333";
      ctx.fill();
      ctx.fillStyle = "white";
      ctx.fillText(city.id.toString(), city.x - 3, city.y + 3);
    });
  };

  // Re-draw whenever data changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    draw(ctx);
  }, [cities, bestPath, edges]);

  // Handle click to add city
  const handleClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    onAddCity(x, y);
  };

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      onClick={handleClick}
      className="border-2 border-gray-300 rounded-lg shadow-md cursor-crosshair bg-white"
    />
  );
}
