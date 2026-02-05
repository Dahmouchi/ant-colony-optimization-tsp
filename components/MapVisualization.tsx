/**
 * MapVisualization.tsx - Visualisation Leaflet interactive
 *
 * Affiche les villes et phéromones sur une carte géographique réelle.
 * Utilise Leaflet (OpenStreetMap) pour éviter les problèmes de clés API Google Maps.
 */

import React, { useRef, useEffect, useState } from "react";
import L from "leaflet";
import { City } from "@/lib/AntColony";
import { MapPin } from "lucide-react";

// Correction pour les icônes par défaut de Leaflet - configuré côté client uniquement
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });
}

interface MapVisualizationProps {
  cities: City[];
  bestPath: number[];
  pheromones: Map<string, number>;
  onCityClick: (x: number, y: number) => void;
  isRunning: boolean;
  maxPheromone: number;
}

export const MapVisualization: React.FC<MapVisualizationProps> = ({
  cities,
  bestPath,
  pheromones,
  onCityClick,
  isRunning,
  maxPheromone,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Layer[]>([]);
  const pheromoneLinesRef = useRef<L.Polyline[]>([]);
  const bestPathLineRef = useRef<L.Polyline | null>(null);

  // Debug logging
  useEffect(() => {
    console.log("[MapViz DEBUG] Props updated:", {
      citiesCount: cities.length,
      bestPathLength: bestPath.length,
      isRunning,
      maxPheromone,
      pheromonesSize: pheromones.size,
    });
  }, [cities, bestPath, isRunning, maxPheromone, pheromones]);

  /**
   * Initialise la carte Leaflet
   */
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    // Morocco center coordinates
    const map = L.map(mapRef.current).setView([31.7917, -7.0926], 6);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Écouteur de clic pour ajouter des villes
    map.on("click", (e: L.LeafletMouseEvent) => {
      if (!isRunning) {
        // On passe lng pour x et lat pour y
        onCityClick(e.latlng.lng, e.latlng.lat);
      }
    });

    leafletMapRef.current = map;

    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, []); // Only initialize once

  /**
   * Update click handler when isRunning changes
   */
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    // Remove old handler and add new one with current isRunning state
    map.off("click");
    map.on("click", (e: L.LeafletMouseEvent) => {
      if (!isRunning) {
        onCityClick(e.latlng.lng, e.latlng.lat);
      }
    });
  }, [isRunning, onCityClick]);

  /**
   * Invalidate map size when component is mounted/visible
   * This fixes the issue where the map doesn't render properly when switching from canvas
   */
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    // Small delay to ensure the container has rendered
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  /**
   * Clé pour les phéromones
   */
  const edgeKey = (i: number, j: number): string => {
    return `${Math.min(i, j)}-${Math.max(i, j)}`;
  };

  /**
   * Met à jour les marqueurs
   */
  useEffect(() => {
    if (!leafletMapRef.current) return;
    const map = leafletMapRef.current;

    // Supprimer les anciens marqueurs
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Créer les nouveaux marqueurs
    cities.forEach((city, index) => {
      const isInBestPath = bestPath.includes(index);
      const marker = L.circleMarker([city.y, city.x], {
        radius: isInBestPath ? 8 : 6,
        fillColor: isInBestPath ? "#22c55e" : "#3b82f6",
        color: "#fff",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      }).addTo(map);

      marker.bindPopup(
        `<b>Ville ${index}</b><br>Lat: ${city.y.toFixed(4)}<br>Lng: ${city.x.toFixed(4)}`,
      );
      markersRef.current.push(marker);
    });

    // Only fit bounds on first load if we have multiple cities
    // Don't auto-zoom on every update to avoid jarring experience
    if (cities.length >= 2 && markersRef.current.length === cities.length) {
      const bounds = L.latLngBounds(cities.map((c) => [c.y, c.x]));
      // Only fit if bounds are not already visible
      if (!map.getBounds().contains(bounds)) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
      }
    }
  }, [cities, bestPath]);

  /**
   * Met à jour le meilleur chemin
   */
  useEffect(() => {
    if (!leafletMapRef.current) return;
    const map = leafletMapRef.current;

    if (bestPathLineRef.current) {
      bestPathLineRef.current.remove();
      bestPathLineRef.current = null;
    }

    if (bestPath.length > 1) {
      const pathPoints: L.LatLngExpression[] = bestPath
        .map((id) => cities[id])
        .filter((c) => !!c)
        .map((c) => [c.y, c.x]);

      // Fermer la boucle si c'est un tour complet
      if (pathPoints.length === cities.length && cities.length > 2) {
        pathPoints.push(pathPoints[0]);
      }

      bestPathLineRef.current = L.polyline(pathPoints, {
        color: "#22c55e",
        weight: 3,
        opacity: 0.8,
        dashArray: "10, 5",
      }).addTo(map);
    }
  }, [bestPath, cities]);

  /**
   * Met à jour les phéromones
   */
  useEffect(() => {
    if (!leafletMapRef.current) return;
    const map = leafletMapRef.current;

    pheromoneLinesRef.current.forEach((l) => l.remove());
    pheromoneLinesRef.current = [];

    if (cities.length < 2) return;

    for (let i = 0; i < cities.length; i++) {
      for (let j = i + 1; j < cities.length; j++) {
        const key = edgeKey(i, j);
        const pheromone = pheromones.get(key) || 0;
        if (pheromone <= 0) continue;

        const intensity = Math.min(1, pheromone / (maxPheromone || 1));
        const hue = 200 + intensity * 40;
        const saturation = 50 + intensity * 50;
        const lightness = 50 - intensity * 20;

        const line = L.polyline(
          [
            [cities[i].y, cities[i].x],
            [cities[j].y, cities[j].x],
          ],
          {
            color: `hsl(${hue}, ${saturation}%, ${lightness}%)`,
            weight: 1 + intensity * 4,
            opacity: intensity * 0.6,
          },
        ).addTo(map);

        pheromoneLinesRef.current.push(line);
      }
    }
  }, [pheromones, cities, maxPheromone]);

  return (
    <div className="relative w-full h-[600px] bg-slate-100 rounded-lg border border-slate-300 overflow-hidden shadow-inner">
      <div ref={mapRef} className="w-full h-full z-0" />

      <div className="absolute bottom-4 left-4 z-1000 text-[10px] font-bold uppercase tracking-widest text-slate-600 bg-white/90 px-2 py-1 rounded border border-slate-200 shadow-sm backdrop-blur-sm">
        {cities.length === 0 ? (
          <span>Cliquez sur la carte pour ajouter des villes</span>
        ) : (
          <span>
            {cities.length} ville{cities.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {isRunning && (
        <div className="absolute top-4 right-4 z-1000 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-white/90 px-2 py-1 rounded border border-slate-200 shadow-sm backdrop-blur-sm">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
          Simulation en cours...
        </div>
      )}

      <div className="absolute top-4 left-4 z-1000 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-600 bg-white/90 px-2 py-1 rounded border border-slate-200 shadow-sm backdrop-blur-sm">
        <MapPin className="w-3 h-3 text-red-500" />
        OpenStreetMap (Leaflet)
      </div>
    </div>
  );
};
