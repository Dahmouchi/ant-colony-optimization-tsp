/**
 * Ant Colony Optimization (ACO) Algorithm for TSP
 * Pure mathematical implementation with dynamic parameter support
 */

export interface City {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface ACOParams {
  alpha: number; // Pheromone importance
  beta: number; // Heuristic (distance) importance
  rho: number; // Evaporation rate (0-1)
  numAnts: number;
  q: number; // Pheromone deposit factor
}

export interface ACOResult {
  bestPath: number[];
  bestDistance: number;
  iteration: number;
  pheromoneMatrix: number[][];
}

/**
 * Calculate Haversine distance between two coordinates (in meters)
 * Fallback when OSRM API is unavailable
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000; // Earth's radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Build distance matrix using Haversine formula
 */
export function buildHaversineMatrix(cities: City[]): number[][] {
  const n = cities.length;
  const matrix: number[][] = Array(n)
    .fill(null)
    .map(() => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        matrix[i][j] = haversineDistance(
          cities[i].lat,
          cities[i].lng,
          cities[j].lat,
          cities[j].lng,
        );
      }
    }
  }

  return matrix;
}

/**
 * Ant Colony Optimization Solver Class
 */
export class ACOSolver {
  private distanceMatrix: number[][];
  private pheromoneMatrix: number[][];
  private heuristicMatrix: number[][]; // η = 1/distance
  private numCities: number;
  private bestPath: number[];
  private bestDistance: number;
  private iteration: number;

  constructor(distanceMatrix: number[][]) {
    this.distanceMatrix = distanceMatrix;
    this.numCities = distanceMatrix.length;
    this.bestPath = [];
    this.bestDistance = Infinity;
    this.iteration = 0;

    // Initialize pheromone matrix with small uniform values
    const initialPheromone = 1.0;
    this.pheromoneMatrix = Array(this.numCities)
      .fill(null)
      .map(() => Array(this.numCities).fill(initialPheromone));

    // Build heuristic matrix (η_ij = 1 / d_ij)
    this.heuristicMatrix = Array(this.numCities)
      .fill(null)
      .map(() => Array(this.numCities).fill(0));

    for (let i = 0; i < this.numCities; i++) {
      for (let j = 0; j < this.numCities; j++) {
        if (i !== j && this.distanceMatrix[i][j] > 0) {
          this.heuristicMatrix[i][j] = 1 / this.distanceMatrix[i][j];
        }
      }
    }
  }

  /**
   * Calculate transition probability: P_ij = (τ_ij)^α * (η_ij)^β
   */
  private calculateProbabilities(
    currentCity: number,
    unvisited: Set<number>,
    alpha: number,
    beta: number,
  ): Map<number, number> {
    const probabilities = new Map<number, number>();
    let total = 0;

    for (const nextCity of unvisited) {
      const tau = this.pheromoneMatrix[currentCity][nextCity]; // τ_ij
      const eta = this.heuristicMatrix[currentCity][nextCity]; // η_ij

      const probability = Math.pow(tau, alpha) * Math.pow(eta, beta);
      probabilities.set(nextCity, probability);
      total += probability;
    }

    // Normalize probabilities
    if (total > 0) {
      for (const [city, prob] of probabilities) {
        probabilities.set(city, prob / total);
      }
    }

    return probabilities;
  }

  /**
   * Select next city using roulette wheel selection
   */
  private selectNextCity(probabilities: Map<number, number>): number {
    const random = Math.random();
    let cumulative = 0;

    for (const [city, prob] of probabilities) {
      cumulative += prob;
      if (random <= cumulative) {
        return city;
      }
    }

    // Fallback: return the last city
    const cities = Array.from(probabilities.keys());
    return cities[cities.length - 1];
  }

  /**
   * Calculate total path distance
   */
  private calculatePathDistance(path: number[]): number {
    let distance = 0;
    for (let i = 0; i < path.length - 1; i++) {
      distance += this.distanceMatrix[path[i]][path[i + 1]];
    }
    // Return to start (TSP is a cycle)
    distance += this.distanceMatrix[path[path.length - 1]][path[0]];
    return distance;
  }

  /**
   * Construct a single ant's tour
   */
  private constructAntTour(alpha: number, beta: number): number[] {
    const tour: number[] = [];
    const unvisited = new Set<number>();

    // Initialize unvisited cities
    for (let i = 0; i < this.numCities; i++) {
      unvisited.add(i);
    }

    // Start from a random city
    const startCity = Math.floor(Math.random() * this.numCities);
    tour.push(startCity);
    unvisited.delete(startCity);

    // Build the tour
    while (unvisited.size > 0) {
      const currentCity = tour[tour.length - 1];
      const probabilities = this.calculateProbabilities(
        currentCity,
        unvisited,
        alpha,
        beta,
      );

      if (probabilities.size === 0) break;

      const nextCity = this.selectNextCity(probabilities);
      tour.push(nextCity);
      unvisited.delete(nextCity);
    }

    return tour;
  }

  /**
   * Update pheromone trails after all ants complete their tours
   */
  private updatePheromones(
    allTours: number[][],
    allDistances: number[],
    rho: number,
    q: number,
  ): void {
    // Evaporation: τ_ij = (1 - ρ) * τ_ij
    for (let i = 0; i < this.numCities; i++) {
      for (let j = 0; j < this.numCities; j++) {
        this.pheromoneMatrix[i][j] *= 1 - rho;
        // Ensure minimum pheromone level
        this.pheromoneMatrix[i][j] = Math.max(
          this.pheromoneMatrix[i][j],
          0.001,
        );
      }
    }

    // Deposit pheromones: Δτ_ij = Q / L_k for each ant k
    for (let k = 0; k < allTours.length; k++) {
      const tour = allTours[k];
      const distance = allDistances[k];

      if (distance > 0) {
        const deposit = q / distance;

        for (let i = 0; i < tour.length - 1; i++) {
          const from = tour[i];
          const to = tour[i + 1];
          this.pheromoneMatrix[from][to] += deposit;
          this.pheromoneMatrix[to][from] += deposit; // Symmetric
        }

        // Don't forget the return edge
        const last = tour[tour.length - 1];
        const first = tour[0];
        this.pheromoneMatrix[last][first] += deposit;
        this.pheromoneMatrix[first][last] += deposit;
      }
    }
  }

  /**
   * Run a single iteration of the ACO algorithm
   * Accepts dynamic parameters for real-time tuning
   */
  solveIteration(params: ACOParams): ACOResult {
    const { alpha, beta, rho, numAnts, q } = params;

    const allTours: number[][] = [];
    const allDistances: number[] = [];

    // Each ant constructs a tour
    for (let ant = 0; ant < numAnts; ant++) {
      const tour = this.constructAntTour(alpha, beta);
      const distance = this.calculatePathDistance(tour);

      allTours.push(tour);
      allDistances.push(distance);

      // Update best solution
      if (distance < this.bestDistance) {
        this.bestDistance = distance;
        this.bestPath = [...tour];
      }
    }

    // Update pheromones
    this.updatePheromones(allTours, allDistances, rho, q);

    this.iteration++;

    return {
      bestPath: this.bestPath,
      bestDistance: this.bestDistance,
      iteration: this.iteration,
      pheromoneMatrix: this.pheromoneMatrix.map((row) => [...row]),
    };
  }

  /**
   * Reset the solver to initial state
   */
  reset(): void {
    this.bestPath = [];
    this.bestDistance = Infinity;
    this.iteration = 0;

    const initialPheromone = 1.0;
    for (let i = 0; i < this.numCities; i++) {
      for (let j = 0; j < this.numCities; j++) {
        this.pheromoneMatrix[i][j] = initialPheromone;
      }
    }
  }

  /**
   * Get current best result
   */
  getBestResult(): ACOResult {
    return {
      bestPath: this.bestPath,
      bestDistance: this.bestDistance,
      iteration: this.iteration,
      pheromoneMatrix: this.pheromoneMatrix.map((row) => [...row]),
    };
  }

  /**
   * Update distance matrix (useful when OSRM data arrives)
   */
  updateDistanceMatrix(newMatrix: number[][]): void {
    this.distanceMatrix = newMatrix;

    // Rebuild heuristic matrix
    for (let i = 0; i < this.numCities; i++) {
      for (let j = 0; j < this.numCities; j++) {
        if (i !== j && this.distanceMatrix[i][j] > 0) {
          this.heuristicMatrix[i][j] = 1 / this.distanceMatrix[i][j];
        }
      }
    }
  }
}

/**
 * Fetch real driving distances from OSRM API
 */
export async function fetchOSRMDistanceMatrix(
  cities: City[],
): Promise<number[][] | null> {
  if (cities.length < 2) return null;

  try {
    // Build coordinates string: lng1,lat1;lng2,lat2;...
    const coords = cities.map((c) => `${c.lng},${c.lat}`).join(";");

    const url = `https://router.project-osrm.org/table/v1/driving/${coords}?annotations=distance`;

    const response = await fetch(url);

    if (!response.ok) {
      console.warn("OSRM API returned error:", response.status);
      return null;
    }

    const data = await response.json();

    if (data.code !== "Ok" || !data.distances) {
      console.warn("OSRM API response invalid:", data.code);
      return null;
    }

    return data.distances;
  } catch (error) {
    console.warn("OSRM API fetch failed:", error);
    return null;
  }
}
