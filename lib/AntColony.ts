/**
 * AntColony.ts - Moteur d'optimisation par colonies de fourmis (ACO)
 *
 * Implémentation rigoureuse de l'algorithme ACO pour le TSP (Traveling Salesman Problem)
 *
 * Formule de transition probabiliste:
 * P_ij = (τ_ij^α · η_ij^β) / Σ_k(τ_ik^α · η_ik^β)
 *
 * Mise à jour des phéromones:
 * τ_ij(t+1) = ρ · τ_ij(t) + Δτ_ij
 * où Δτ_ij = Σ_k(1/L_k) si la fourmi k a traversé (i,j)
 */

export interface City {
  id: number;
  x: number;
  y: number;
}

export interface AntPath {
  path: number[];
  distance: number;
}

export interface SimulationState {
  iteration: number;
  bestDistance: number;
  bestPath: number[];
  averageDistance: number;
  pheromones: Map<string, number>;
}

export class AntColony {
  private cities: City[];
  private numAnts: number;
  private alpha: number; // Influence des phéromones
  private beta: number; // Influence de l'heuristique
  private evaporationRate: number; // ρ (taux d'évaporation)
  private pheromones: Map<string, number>; // τ_ij
  private distances: Map<string, number>; // Distance euclidienne pré-calculée
  private bestPath: number[] = [];
  private bestDistance: number = Infinity;
  private iteration: number = 0;
  private distanceHistory: number[] = [];

  constructor(
    cities: City[],
    numAnts: number = 30,
    alpha: number = 1.0,
    beta: number = 2.0,
    evaporationRate: number = 0.1,
  ) {
    this.cities = cities;
    this.numAnts = numAnts;
    this.alpha = alpha;
    this.beta = beta;
    this.evaporationRate = evaporationRate;
    this.pheromones = new Map();
    this.distances = new Map();

    this.initializePheromones();
    this.precomputeDistances();
  }

  /**
   * Initialise les phéromones avec une valeur uniforme
   * Valeur initiale : 1 / (n * distance moyenne)
   */
  private initializePheromones(): void {
    const n = this.cities.length;
    if (n < 2) return;

    // Calcul de la distance moyenne
    let totalDistance = 0;
    let count = 0;
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        totalDistance += this.euclideanDistance(this.cities[i], this.cities[j]);
        count++;
      }
    }
    const avgDistance = totalDistance / count;
    const initialPheromone = 1 / (n * avgDistance);

    // Initialiser toutes les arêtes
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          this.pheromones.set(this.edgeKey(i, j), initialPheromone);
        }
      }
    }
  }

  /**
   * Pré-calcule toutes les distances euclidiennes
   */
  private precomputeDistances(): void {
    const n = this.cities.length;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          const dist = this.euclideanDistance(this.cities[i], this.cities[j]);
          this.distances.set(this.edgeKey(i, j), dist);
        }
      }
    }
  }

  /**
   * Calcule la distance euclidienne entre deux villes
   */
  private euclideanDistance(city1: City, city2: City): number {
    const dx = city1.x - city2.x;
    const dy = city1.y - city2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Génère une clé unique pour une arête (i, j)
   */
  private edgeKey(i: number, j: number): string {
    return `${Math.min(i, j)}-${Math.max(i, j)}`;
  }

  /**
   * Obtient la phéromone pour une arête (i, j)
   */
  private getPheromone(i: number, j: number): number {
    return this.pheromones.get(this.edgeKey(i, j)) || 0;
  }

  /**
   * Obtient la distance pour une arête (i, j)
   */
  private getDistance(i: number, j: number): number {
    return this.distances.get(this.edgeKey(i, j)) || Infinity;
  }

  /**
   * Heuristique : η_ij = 1 / distance(i, j)
   */
  private heuristic(i: number, j: number): number {
    const dist = this.getDistance(i, j);
    return dist > 0 ? 1 / dist : 0;
  }

  /**
   * Calcule la probabilité de transition P_ij
   * P_ij = (τ_ij^α · η_ij^β) / Σ_k(τ_ik^α · η_ik^β)
   */
  private transitionProbability(
    currentCity: number,
    nextCity: number,
    unvisited: Set<number>,
  ): number {
    if (!unvisited.has(nextCity)) return 0;

    const tau = this.getPheromone(currentCity, nextCity);
    const eta = this.heuristic(currentCity, nextCity);
    const numerator = Math.pow(tau, this.alpha) * Math.pow(eta, this.beta);

    // Calcul du dénominateur : somme sur toutes les villes non visitées
    let denominator = 0;
    for (const city of unvisited) {
      const tau_k = this.getPheromone(currentCity, city);
      const eta_k = this.heuristic(currentCity, city);
      denominator += Math.pow(tau_k, this.alpha) * Math.pow(eta_k, this.beta);
    }

    return denominator > 0 ? numerator / denominator : 0;
  }

  /**
   * Sélectionne la prochaine ville selon la probabilité de transition
   * Utilise la sélection par roulette (roulette wheel selection)
   */
  private selectNextCity(currentCity: number, unvisited: Set<number>): number {
    if (unvisited.size === 0) return -1;
    if (unvisited.size === 1) return Array.from(unvisited)[0];

    // Calcul des probabilités cumulées
    const probabilities: number[] = [];
    let cumulativeProbability = 0;

    for (const city of Array.from(unvisited)) {
      const prob = this.transitionProbability(currentCity, city, unvisited);
      cumulativeProbability += prob;
      probabilities.push(cumulativeProbability);
    }

    // Sélection par roulette
    const random = Math.random() * cumulativeProbability;
    const cities = Array.from(unvisited);
    for (let i = 0; i < probabilities.length; i++) {
      if (random <= probabilities[i]) {
        return cities[i];
      }
    }

    return cities[cities.length - 1];
  }

  /**
   * Construit un tour pour une fourmi
   */
  private buildAntTour(startCity: number = 0): AntPath {
    const n = this.cities.length;
    const path: number[] = [startCity];
    const unvisited = new Set<number>();
    for (let i = 0; i < n; i++) {
      if (i !== startCity) {
        unvisited.add(i);
      }
    }

    let currentCity = startCity;
    while (unvisited.size > 0) {
      const nextCity = this.selectNextCity(currentCity, unvisited);
      if (nextCity === -1) break;
      path.push(nextCity);
      unvisited.delete(nextCity);
      currentCity = nextCity;
    }

    // Retour à la ville de départ
    path.push(startCity);

    // Calcul de la distance totale
    let distance = 0;
    for (let i = 0; i < path.length - 1; i++) {
      distance += this.getDistance(path[i], path[i + 1]);
    }

    return { path, distance };
  }

  /**
   * Met à jour les phéromones selon les tours des fourmis
   * τ_ij(t+1) = ρ · τ_ij(t) + Δτ_ij
   */
  private updatePheromones(antTours: AntPath[]): void {
    const n = this.cities.length;

    // Évaporation : τ_ij(t+1) = ρ · τ_ij(t)
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          const key = this.edgeKey(i, j);
          const currentPheromone = this.pheromones.get(key) || 0;
          this.pheromones.set(
            key,
            (1 - this.evaporationRate) * currentPheromone,
          );
        }
      }
    }

    // Dépôt de phéromones : Δτ_ij = Σ_k(1/L_k)
    for (const tour of antTours) {
      const contribution = 1 / tour.distance;
      for (let i = 0; i < tour.path.length - 1; i++) {
        const from = tour.path[i];
        const to = tour.path[i + 1];
        const key = this.edgeKey(from, to);
        const currentPheromone = this.pheromones.get(key) || 0;
        this.pheromones.set(key, currentPheromone + contribution);
      }
    }
  }

  /**
   * Exécute une itération complète de l'algorithme ACO
   */
  public runIteration(): SimulationState {
    const antTours: AntPath[] = [];

    // Construction des tours pour chaque fourmi
    for (let i = 0; i < this.numAnts; i++) {
      const tour = this.buildAntTour(0);
      antTours.push(tour);

      // Mise à jour du meilleur tour trouvé
      if (tour.distance < this.bestDistance) {
        this.bestDistance = tour.distance;
        this.bestPath = [...tour.path];
      }
    }

    // Mise à jour des phéromones
    this.updatePheromones(antTours);

    // Calcul de la distance moyenne
    const totalDistance = antTours.reduce(
      (sum, tour) => sum + tour.distance,
      0,
    );
    const averageDistance = totalDistance / antTours.length;

    this.iteration++;
    this.distanceHistory.push(this.bestDistance);

    return {
      iteration: this.iteration,
      bestDistance: this.bestDistance,
      bestPath: this.bestPath,
      averageDistance,
      pheromones: new Map(this.pheromones),
    };
  }

  /**
   * Met à jour les paramètres en temps réel
   */
  public setParameters(
    alpha: number,
    beta: number,
    evaporationRate: number,
  ): void {
    this.alpha = Math.max(0.1, Math.min(5, alpha));
    this.beta = Math.max(0.1, Math.min(5, beta));
    this.evaporationRate = Math.max(0.01, Math.min(0.99, evaporationRate));
  }

  /**
   * Réinitialise l'algorithme
   */
  public reset(): void {
    this.iteration = 0;
    this.bestDistance = Infinity;
    this.bestPath = [];
    this.distanceHistory = [];
    this.pheromones.clear();
    this.initializePheromones();
  }

  /**
   * Ajoute une nouvelle ville et réinitialise
   */
  public addCity(city: City): void {
    this.cities.push(city);
    this.distances.clear();
    this.pheromones.clear();
    this.precomputeDistances();
    this.initializePheromones();
    this.reset();
  }

  /**
   * Obtient l'état actuel
   */
  public getState(): SimulationState {
    return {
      iteration: this.iteration,
      bestDistance: this.bestDistance,
      bestPath: this.bestPath,
      averageDistance: 0,
      pheromones: new Map(this.pheromones),
    };
  }

  /**
   * Obtient l'historique des distances
   */
  public getDistanceHistory(): number[] {
    return this.distanceHistory;
  }

  /**
   * Obtient les villes
   */
  public getCities(): City[] {
    return this.cities;
  }

  /**
   * Obtient le nombre de villes
   */
  public getNumCities(): number {
    return this.cities.length;
  }
}
