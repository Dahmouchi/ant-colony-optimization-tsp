export type Point = {
  x: number;
  y: number;
  id: number;
};

export type Edge = {
  from: number;
  to: number;
  pheromone: number;
};
