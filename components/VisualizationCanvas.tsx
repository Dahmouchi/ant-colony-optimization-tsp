/**
 * VisualizationCanvas.tsx - Rendu Canvas des nœuds et phéromones
 *
 * Affiche:
 * - Les villes (nœuds) en tant que cercles interactifs
 * - Les pheromones comme des lignes semi-transparentes avec gradient d'opacité
 * - Le meilleur chemin trouvé en surbrillance
 * - Interactions: clic pour ajouter des villes
 */

import React, { useRef, useEffect, useState } from "react";
import { City } from "@/lib/AntColony";

interface VisualizationCanvasProps {
  cities: City[];
  bestPath: number[];
  pheromones: Map<string, number>;
  onCityClick: (x: number, y: number) => void;
  isRunning: boolean;
  maxPheromone: number;
}

export const VisualizationCanvas: React.FC<VisualizationCanvasProps> = ({
  cities,
  bestPath,
  pheromones,
  onCityClick,
  isRunning,
  maxPheromone,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredCity, setHoveredCity] = useState<number | null>(null);

  const CITY_RADIUS = 6;
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;

  /**
   * Génère une clé unique pour une arête (i, j)
   */
  const edgeKey = (i: number, j: number): string => {
    return `${Math.min(i, j)}-${Math.max(i, j)}`;
  };

  /**
   * Obtient la phéromone pour une arête (i, j)
   */
  const getPheromone = (i: number, j: number): number => {
    return pheromones.get(edgeKey(i, j)) || 0;
  };

  /**
   * Dessine les phéromones
   */
  const drawPheromones = (ctx: CanvasRenderingContext2D) => {
    if (cities.length < 2) return;

    for (let i = 0; i < cities.length; i++) {
      for (let j = i + 1; j < cities.length; j++) {
        const pheromone = getPheromone(i, j);
        if (pheromone <= 0) continue;

        const city1 = cities[i];
        const city2 = cities[j];

        // Normaliser l'intensité de la phéromone
        const intensity = Math.min(1, pheromone / (maxPheromone || 1));

        // Gradient de couleur : bleu faible → cyan fort
        const hue = 200 + intensity * 40; // Bleu vers cyan
        const saturation = 50 + intensity * 50;
        const lightness = 50 - intensity * 20;

        ctx.strokeStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${intensity * 0.6})`;
        ctx.lineWidth = 1 + intensity * 3;

        ctx.beginPath();
        ctx.moveTo(city1.x, city1.y);
        ctx.lineTo(city2.x, city2.y);
        ctx.stroke();
      }
    }
  };

  /**
   * Dessine le meilleur chemin trouvé
   */
  const drawBestPath = (ctx: CanvasRenderingContext2D) => {
    if (bestPath.length < 2) return;

    ctx.strokeStyle = "rgba(34, 197, 94, 0.8)"; // Vert vif
    ctx.lineWidth = 2.5;
    ctx.setLineDash([5, 5]);

    for (let i = 0; i < bestPath.length - 1; i++) {
      const city1 = cities[bestPath[i]];
      const city2 = cities[bestPath[i + 1]];

      ctx.beginPath();
      ctx.moveTo(city1.x, city1.y);
      ctx.lineTo(city2.x, city2.y);
      ctx.stroke();
    }

    ctx.setLineDash([]);
  };

  /**
   * Dessine les villes
   */
  const drawCities = (ctx: CanvasRenderingContext2D) => {
    for (let i = 0; i < cities.length; i++) {
      const city = cities[i];
      const isHovered = hoveredCity === i;
      const isInBestPath = bestPath.includes(i);

      // Cercle de la ville
      ctx.fillStyle = isHovered
        ? "rgba(59, 130, 246, 0.9)" // Bleu clair au survol
        : isInBestPath
          ? "rgba(34, 197, 94, 0.8)" // Vert si dans le meilleur chemin
          : "rgba(59, 130, 246, 0.7)"; // Bleu par défaut

      ctx.beginPath();
      ctx.arc(city.x, city.y, CITY_RADIUS, 0, 2 * Math.PI);
      ctx.fill();

      // Bordure
      ctx.strokeStyle = isHovered
        ? "rgba(59, 130, 246, 1)"
        : "rgba(59, 130, 246, 0.5)";
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.stroke();

      // Numéro de la ville
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${i}`, city.x, city.y);
    }
  };

  /**
   * Dessine l'arrière-plan et la grille
   */
  const drawBackground = (ctx: CanvasRenderingContext2D) => {
    // Arrière-plan
    ctx.fillStyle = "rgba(255, 255, 255, 1)"; // Blanc pur
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Grille légère
    ctx.strokeStyle = "rgba(203, 213, 225, 0.4)"; // Gris très clair
    ctx.lineWidth = 1;
    const gridSize = 50;

    for (let x = 0; x <= CANVAS_WIDTH; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }

    for (let y = 0; y <= CANVAS_HEIGHT; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }
  };

  /**
   * Redessine le canvas
   */
  const redraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawBackground(ctx);
    drawPheromones(ctx);
    drawBestPath(ctx);
    drawCities(ctx);
  };

  useEffect(() => {
    redraw();
  }, [cities, bestPath, pheromones, hoveredCity, maxPheromone]);

  /**
   * Gère le clic sur le canvas
   */
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Vérifier si on a cliqué sur une ville existante
    for (const city of cities) {
      const dx = city.x - x;
      const dy = city.y - y;
      if (Math.sqrt(dx * dx + dy * dy) < CITY_RADIUS + 5) {
        return; // Clic sur une ville existante, ignorer
      }
    }

    onCityClick(x, y);
  };

  /**
   * Gère le mouvement de la souris
   */
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    let found = false;
    for (let i = 0; i < cities.length; i++) {
      const city = cities[i];
      const dx = city.x - x;
      const dy = city.y - y;
      if (Math.sqrt(dx * dx + dy * dy) < CITY_RADIUS + 5) {
        setHoveredCity(i);
        found = true;
        break;
      }
    }

    if (!found) {
      setHoveredCity(null);
    }
  };

  return (
    <div className="relative w-full h-[600px] flex flex-col items-center justify-center bg-white rounded-lg border border-slate-200 overflow-hidden shadow-inner">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredCity(null)}
        className="cursor-crosshair w-full h-full object-contain"
      />
      <div className="absolute bottom-4 left-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-white/80 px-2 py-1 rounded border border-slate-100 backdrop-blur-sm">
        {cities.length === 0 ? (
          <span>Cliquez pour ajouter des villes</span>
        ) : (
          <span>
            {cities.length} ville{cities.length > 1 ? "s" : ""}
          </span>
        )}
      </div>
      {isRunning && (
        <div className="absolute top-4 right-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-cyan-600 bg-white/80 px-2 py-1 rounded border border-slate-100 backdrop-blur-sm">
          <div className="w-2 h-2 bg-cyan-600 rounded-full animate-pulse" />
          Simulation active
        </div>
      )}
    </div>
  );
};
