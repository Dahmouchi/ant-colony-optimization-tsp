"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import { MapBoard } from "@/components/MapBoard";
import {
  City,
  ACOParams,
  ACOSolver,
  buildHaversineMatrix,
  fetchOSRMDistanceMatrix,
} from "@/utils/aco";
import { ControlPanel } from "@/components/ControlPanel";

// Default ACO parameters
const defaultParams: ACOParams = {
  alpha: 1.0,
  beta: 2.0,
  rho: 0.1,
  numAnts: 20,
  q: 100,
};

// Generate unique ID for cities
function generateId(): string {
  return `city_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default function Index() {
  // State
  const [cities, setCities] = useState<City[]>([]);
  const [params, setParams] = useState<ACOParams>(defaultParams);
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bestPath, setBestPath] = useState<number[]>([]);
  const [bestDistance, setBestDistance] = useState<number>(Infinity);
  const [iteration, setIteration] = useState(0);

  // Refs for simulation
  const solverRef = useRef<ACOSolver | null>(null);
  const intervalRef = useRef<number | null>(null);
  const distanceMatrixRef = useRef<number[][] | null>(null);

  // Add city handler
  const handleCityAdd = useCallback(
    (lat: number, lng: number) => {
      if (isRunning) return;

      const cityNumber = cities.length + 1;
      const newCity: City = {
        id: generateId(),
        name: `City ${cityNumber}`,
        lat,
        lng,
      };

      setCities((prev) => [...prev, newCity]);
      toast.success(`Added ${newCity.name}`);

      // Reset solver when cities change
      solverRef.current = null;
      distanceMatrixRef.current = null;
    },
    [isRunning, cities.length],
  );

  // Remove city handler
  const handleCityRemove = useCallback(
    (id: string) => {
      if (isRunning) return;

      setCities((prev) => {
        const filtered = prev.filter((c) => c.id !== id);
        // Rename remaining cities
        return filtered.map((city, index) => ({
          ...city,
          name: `City ${index + 1}`,
        }));
      });

      // Reset solver when cities change
      solverRef.current = null;
      distanceMatrixRef.current = null;
      setBestPath([]);
      setBestDistance(Infinity);
      setIteration(0);
    },
    [isRunning],
  );

  // Update params
  const handleParamsChange = useCallback((newParams: Partial<ACOParams>) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  }, []);

  // Fetch distance matrix and initialize solver
  const initializeSolver = useCallback(async () => {
    if (cities.length < 2) return false;

    setIsLoading(true);

    try {
      // Try OSRM API first
      const osrmMatrix = await fetchOSRMDistanceMatrix(cities);

      if (osrmMatrix) {
        distanceMatrixRef.current = osrmMatrix;
        toast.success("Using real driving distances from OSRM");
      } else {
        // Fallback to Haversine
        distanceMatrixRef.current = buildHaversineMatrix(cities);
        toast.info("Using straight-line distances (OSRM unavailable)");
      }

      // Create solver
      solverRef.current = new ACOSolver(distanceMatrixRef.current);

      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Failed to initialize solver:", error);

      // Fallback to Haversine
      distanceMatrixRef.current = buildHaversineMatrix(cities);
      solverRef.current = new ACOSolver(distanceMatrixRef.current);

      toast.info("Using straight-line distances");
      setIsLoading(false);
      return true;
    }
  }, [cities]);

  // Start simulation
  const handleStart = useCallback(async () => {
    if (cities.length < 3) {
      toast.error("Add at least 3 cities to start");
      return;
    }

    // Initialize solver if needed
    if (!solverRef.current) {
      const success = await initializeSolver();
      if (!success) return;
    }

    setIsRunning(true);

    // Run simulation loop
    intervalRef.current = window.setInterval(() => {
      if (!solverRef.current) return;

      const result = solverRef.current.solveIteration(params);

      setBestPath(result.bestPath);
      setBestDistance(result.bestDistance);
      setIteration(result.iteration);
    }, 100); // 10 iterations per second
  }, [cities.length, initializeSolver, params]);

  // Pause simulation
  const handlePause = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  // Reset simulation
  const handleReset = useCallback(() => {
    handlePause();

    if (solverRef.current) {
      solverRef.current.reset();
    }

    setBestPath([]);
    setBestDistance(Infinity);
    setIteration(0);
  }, [handlePause]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex p-10">
      {/* Sidebar */}
      <aside className="w-80 border-r bg-card p-5 flex flex-col shrink-0">
        <ControlPanel
          params={params}
          onParamsChange={handleParamsChange}
          isRunning={isRunning}
          onStart={handleStart}
          onPause={handlePause}
          onReset={handleReset}
          cityCount={cities.length}
          iteration={iteration}
          bestDistance={bestDistance}
          canStart={cities.length >= 3}
          isLoading={isLoading}
        />
      </aside>

      {/* Main Map Area */}
      <main className="flex-1 p-5">
        <div className="h-full animate-fade-in">
          <MapBoard
            cities={cities}
            onCityAdd={handleCityAdd}
            onCityRemove={handleCityRemove}
            bestPath={bestPath}
            isRunning={isRunning}
          />
        </div>
      </main>
    </div>
  );
}
