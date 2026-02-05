/**
 * Home.tsx - Page principale de l'application ACO TSP Visualizer
 *
 * Intègre:
 * - Visualisation Canvas interactive
 * - Visualisation Google Maps interactive
 * - Panneau de contrôle avec sliders
 * - Tableau d'analytique avec graphiques
 * - Gestion de l'état de la simulation
 * - Bouton de bascule Canvas/Carte
 */
"use client";
import React, { useState, useEffect, useRef } from "react";
import { AntColony, City } from "@/lib/AntColony";
import { VisualizationCanvas } from "@/components/VisualizationCanvas";
import { MapVisualizationWrapper } from "@/components/MapVisualizationWrapper";
import { ControlPanel } from "@/components/ControlPanel";
import { AnalyticsBoard } from "@/components/AnalyticsBoard";
import { Button } from "@/components/ui/button";
import { Map as MapIcon, Grid3x3 } from "lucide-react";
import { ControlPanel2 } from "@/components/ControlPanel2";

export default function Home() {
  // État de la simulation
  const [cities, setCities] = useState<City[]>([]);
  const [antColony, setAntColony] = useState<AntColony | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [iteration, setIteration] = useState(0);
  const [bestDistance, setBestDistance] = useState(Infinity);
  const [bestPath, setBestPath] = useState<number[]>([]);
  const [averageDistance, setAverageDistance] = useState(0);
  const [distanceHistory, setDistanceHistory] = useState<number[]>([]);
  const [pheromones, setPheromones] = useState<any>(
    new Map() as Map<string, number>,
  );
  const [maxPheromone, setMaxPheromone] = useState(0);
  const [visualizationMode, setVisualizationMode] = useState<"canvas" | "map">(
    "canvas",
  );

  // Paramètres
  const [alpha, setAlpha] = useState(1.0);
  const [beta, setBeta] = useState(2.0);
  const [evaporationRate, setEvaporationRate] = useState(0.1);
  const [numAnts, setNumAnts] = useState(30);

  const animationFrameRef = useRef<number | null>(null);
  const iterationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Initialise la colonie de fourmis
   */
  useEffect(() => {
    if (cities.length >= 2) {
      const colony = new AntColony(
        cities,
        numAnts,
        alpha,
        beta,
        evaporationRate,
      );
      setAntColony(colony);
      setIteration(0);
      setBestDistance(Infinity);
      setBestPath([]);
      setDistanceHistory([]);
      setPheromones(new Map() as Map<string, number>);
      setMaxPheromone(0);
    }
  }, [cities, numAnts]);

  /**
   * Boucle de simulation
   */
  useEffect(() => {
    if (!isRunning || !antColony) return;

    console.log(
      "[DEBUG] Starting simulation loop. AntColony:",
      !!antColony,
      "Cities:",
      cities.length,
    );

    const runIteration = () => {
      const state = antColony.runIteration();
      console.log(
        "[DEBUG] Iteration:",
        state.iteration,
        "Best Distance:",
        state.bestDistance,
        "Best Path:",
        state.bestPath,
      );
      setIteration(state.iteration);
      setBestDistance(state.bestDistance);
      setBestPath(state.bestPath);
      setAverageDistance(state.averageDistance);
      setPheromones(state.pheromones);

      // Calculer le maximum de phéromone pour la normalisation
      let max = 0;
      for (const value of state.pheromones.values()) {
        if (value > max) max = value;
      }
      setMaxPheromone(max);

      // Mettre à jour l'historique
      setDistanceHistory(antColony.getDistanceHistory());
    };

    // Exécuter une itération toutes les 100ms
    iterationIntervalRef.current = setInterval(runIteration, 100);

    return () => {
      console.log("[DEBUG] Stopping simulation loop");
      if (iterationIntervalRef.current) {
        clearInterval(iterationIntervalRef.current);
      }
    };
  }, [isRunning, antColony]);

  /**
   * Ajoute une nouvelle ville
   */
  const handleAddCity = (x: number, y: number) => {
    const newCity: City = {
      id: cities.length,
      x,
      y,
    };
    setCities([...cities, newCity]);
  };

  /**
   * Gère le changement d'alpha
   */
  const handleAlphaChange = (value: number) => {
    setAlpha(value);
    if (antColony) {
      antColony.setParameters(value, beta, evaporationRate);
    }
  };

  /**
   * Gère le changement de beta
   */
  const handleBetaChange = (value: number) => {
    setBeta(value);
    if (antColony) {
      antColony.setParameters(alpha, value, evaporationRate);
    }
  };

  /**
   * Gère le changement du taux d'évaporation
   */
  const handleEvaporationChange = (value: number) => {
    setEvaporationRate(value);
    if (antColony) {
      antColony.setParameters(alpha, beta, value);
    }
  };

  /**
   * Gère le changement du nombre de fourmis
   */
  const handleNumAntsChange = (value: number) => {
    setNumAnts(value);
  };

  /**
   * Bascule Play/Pause
   */
  const handlePlayPause = () => {
    if (cities.length < 2) {
      alert("Veuillez ajouter au moins 2 villes pour démarrer la simulation");
      return;
    }
    console.log(
      "[DEBUG] Play/Pause clicked. Current isRunning:",
      isRunning,
      "Cities:",
      cities.length,
    );
    setIsRunning(!isRunning);
  };

  /**
   * Réinitialise la simulation
   */
  const handleReset = () => {
    setIsRunning(false);
    if (antColony) {
      antColony.reset();
      setIteration(0);
      setBestDistance(Infinity);
      setBestPath([]);
      setDistanceHistory([]);
      setPheromones(new Map() as Map<string, number>);
      setMaxPheromone(0);
    }
  };

  /**
   * Efface toutes les villes
   */
  const handleClearCities = () => {
    setCities([]);
    setIsRunning(false);
    setIteration(0);
    setBestDistance(Infinity);
    setBestPath([]);
    setDistanceHistory([]);
    setPheromones(new Map() as Map<string, number>);
    setMaxPheromone(0);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Visualisateur ACO TSP
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Visualisation de l'Optimisation par Colonies de Fourmis pour le
                Problème du Voyageur de Commerce
              </p>
            </div>
            <div className="flex items-center justify-end">
              <img src="/logo.jpg" className="w-16 h-16" alt="" />
              <img src="/um5.png" className="w-auto h-16" alt="" />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Visualisation Canvas / Map - Colonne Principale */}
          <div className="lg:col-span-2 space-y-8">
            {/* Canvas / Map Toggle */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1">
                  Espace de Visualisation
                </h2>
                <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                  <Button
                    variant={
                      visualizationMode === "canvas" ? "secondary" : "ghost"
                    }
                    size="sm"
                    onClick={() => setVisualizationMode("canvas")}
                    className={`flex items-center gap-2 rounded-md transition-all duration-200 ${
                      visualizationMode === "canvas"
                        ? "bg-white shadow-xs text-blue-600"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <Grid3x3 className="w-4 h-4" />
                    Canvas
                  </Button>
                  <Button
                    variant={
                      visualizationMode === "map" ? "secondary" : "ghost"
                    }
                    size="sm"
                    onClick={() => setVisualizationMode("map")}
                    className={`flex items-center gap-2 rounded-md transition-all duration-200 ${
                      visualizationMode === "map"
                        ? "bg-white shadow-xs text-cyan-600"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <MapIcon className="w-4 h-4" />
                    Carte
                  </Button>
                </div>
              </div>

              <div className="rounded-xl overflow-hidden border border-slate-100 ring-4 ring-slate-50/50">
                {visualizationMode === "canvas" ? (
                  <VisualizationCanvas
                    cities={cities}
                    bestPath={bestPath}
                    pheromones={pheromones}
                    onCityClick={handleAddCity}
                    isRunning={isRunning}
                    maxPheromone={maxPheromone}
                  />
                ) : (
                  <MapVisualizationWrapper
                    cities={cities}
                    bestPath={bestPath}
                    pheromones={pheromones}
                    onCityClick={handleAddCity}
                    isRunning={isRunning}
                    maxPheromone={maxPheromone}
                  />
                )}
              </div>
            </div>

            {/* Analytics Board */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                  Analyse de Performance
                </h2>
                <div className="h-px flex-1 mx-4 bg-slate-100" />
              </div>
              <AnalyticsBoard
                iteration={iteration}
                bestDistance={bestDistance}
                averageDistance={averageDistance}
                distanceHistory={distanceHistory}
                numCities={cities.length}
                alpha={alpha}
                beta={beta}
                evaporationRate={evaporationRate}
              />
            </div>
          </div>

          {/* Panneau de Contrôle - Barre Latérale */}
          <div className="lg:col-span-1">
            <div className="sticky top-28">
              <ControlPanel2
                alpha={alpha}
                beta={beta}
                evaporationRate={evaporationRate}
                numAnts={numAnts}
                isRunning={isRunning}
                onAlphaChange={handleAlphaChange}
                onBetaChange={handleBetaChange}
                onEvaporationChange={handleEvaporationChange}
                onNumAntsChange={handleNumAntsChange}
                onPlayPause={handlePlayPause}
                onReset={handleReset}
                onClearCities={handleClearCities}
              />

              <div className="mt-6 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">
                  Guide Rapide
                </h4>
                <ul className="text-[11px] text-blue-600/80 space-y-1.5 list-disc pl-4">
                  <li>Cliquez sur le canvas pour ajouter des villes</li>
                  <li>
                    Ajustez les paramètres &alpha; et &beta; pour l'équilibre
                  </li>
                  <li>Utilisez le mode Carte pour des coordonnées réelles</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Informations Académiques */}
        <div className="mt-16 border-t border-slate-200 pt-10 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                Transition Probabiliste
              </h3>
              <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs">
                <code className="block text-xs text-blue-600 font-mono overflow-x-auto">
                  P_ij = [τ_ij]^α · [η_ij]^β / Σ([τ_ik]^α · [η_ik]^β)
                </code>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed uppercase tracking-wider">
                Probabilité de choisir la ville j depuis i
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Dépôt de Phéromones
              </h3>
              <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs">
                <code className="block text-xs text-green-600 font-mono overflow-x-auto">
                  τ_ij(t+1) = (1 - ρ) · τ_ij(t) + Σ Δτ_ij
                </code>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed uppercase tracking-wider">
                Mise à jour avec évaporation et dépôt
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Visibilité (Heuristique)
              </h3>
              <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs">
                <code className="block text-xs text-blue-500 font-mono overflow-x-auto">
                  η_ij = 1 / d_ij
                </code>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed uppercase tracking-wider">
                Inverse de la distance entre deux villes
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
