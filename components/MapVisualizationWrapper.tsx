/**
 * MapVisualizationWrapper.tsx - Wrapper for dynamic import of MapVisualization
 *
 * This wrapper ensures that the Leaflet map component is only loaded on the client side,
 * preventing SSR issues with the Leaflet library.
 */

"use client";

import React from "react";
import dynamic from "next/dynamic";
import { City } from "@/lib/AntColony";

interface MapVisualizationWrapperProps {
  cities: City[];
  bestPath: number[];
  pheromones: Map<string, number>;
  onCityClick: (x: number, y: number) => void;
  isRunning: boolean;
  maxPheromone: number;
}

// Dynamically import MapVisualization with SSR disabled
const MapVisualization = dynamic(
  () =>
    import("@/components/MapVisualization").then((mod) => ({
      default: mod.MapVisualization,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="relative w-full h-[600px] bg-slate-100 rounded-lg border border-slate-300 overflow-hidden shadow-inner flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-slate-600 font-medium">
            Chargement de la carte...
          </p>
        </div>
      </div>
    ),
  },
);

export const MapVisualizationWrapper: React.FC<MapVisualizationWrapperProps> = (
  props,
) => {
  return <MapVisualization {...props} />;
};
