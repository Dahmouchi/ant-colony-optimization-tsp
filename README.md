# 🐜 ACO TSP Visualizer

**Ant Colony Optimization for the Traveling Salesperson Problem on Real-World Maps.**

![Project Status](https://img.shields.io/badge/Status-Completed-success)
![Tech Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20TypeScript%20%7C%20Leaflet-blue)

## 📖 Overview

This project is a Master's Thesis implementation of the **Ant Colony Optimization (ACO)** meta-heuristic to solve the **Traveling Salesperson Problem (TSP)**.

Unlike traditional academic implementations that use abstract Euclidean 2D planes, this application solves the problem on **real-world road networks**. It integrates the **OSRM API** to calculate actual driving distances between cities and visualizes the "pheromone trails" and optimal path on an interactive map.

It serves as a **virtual laboratory** for students and researchers to study how hyper-parameters (Alpha, Beta, Evaporation) affect the convergence of Swarm Intelligence algorithms.

## ✨ Key Features

-   **🌍 Interactive Real-World Map:** Click anywhere on the map (Leaflet/OpenStreetMap) to add delivery stops.
-   **🛣️ Real Road Distances:** Uses the **OSRM API** to fetch the actual driving distance (in meters) between cities, not just straight lines.
-   **🐜 Real-Time Simulation:** Watch the "ants" explore the graph and converge on the optimal solution live.
-   **🎛️ Hyperparameter Tuning:** Adjust the algorithm's behavior in real-time using the sidebar sliders:
    -   **Alpha ($\alpha$):** Importance of Pheromone (History).
    -   **Beta ($\beta$):** Importance of Heuristic Distance (Greedy).
    -   **Rho ($\rho$):** Pheromone Evaporation Rate.
-   **📊 Live Analytics:** Real-time tracking of iteration count, best distance found, and pheromone evolution.

## 🛠️ Tech Stack

-   **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **Mapping:** [React Leaflet](https://react-leaflet.js.org/) & [Leaflet](https://leafletjs.com/)
-   **Routing API:** [OSRM (Open Source Routing Machine)](http://project-osrm.org/)

## 🚀 Getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/your-username/aco-tsp-visualizer.git](https://github.com/your-username/aco-tsp-visualizer.git)
    cd aco-tsp-visualizer
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Open the app:**
    Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

## 🎮 How to Use

1.  **Add Cities:** Click on the map to place markers (e.g., Casablanca, Rabat, Fes). You need at least 2 cities.
2.  **Configure:** Use the sidebar to set your preferred parameters (Standard ACO values are $\alpha=1$, $\beta=5$, $\rho=0.5$).
3.  **Run:** Click the **"Start Optimization"** button.
4.  **Observe:**
    -   The system will fetch real driving distances.
    -   The **Red Line** represents the best path found so far.
    -   Watch the "Distance" counter drop as the colony learns.
5.  **Experiment:** Try moving the sliders while the simulation is running to see how the ants react!

## 📸 Screenshots

*(Add your screenshots here)*

| Interface Overview | Simulation in Progress |
|:------------------:|:----------------------:|
| ![Dashboard](./public/screen1.png) | ![Simulation](./public/screen2.png) |

## 📐 The Algorithm (Math)

The probability $P_{ij}^k$ for an ant $k$ to move from city $i$ to city $j$ is given by:

$$P_{ij}^k = \frac{(\tau_{ij})^\alpha \cdot (\eta_{ij})^\beta}{\sum (\tau)^\alpha \cdot (\eta)^\beta}$$

Where:
-   $\tau_{ij}$: Pheromone intensity on edge $(i,j)$.
-   $\eta_{ij}$: Visibility ($1 / distance_{ij}$).

## 🤝 Contributing

Contributions are welcome! If you want to add features like "Traffic Integration" or "3D Maps", please fork the repo and submit a PR.

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Developed by Students** for Master's Thesis Project (2026).
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
