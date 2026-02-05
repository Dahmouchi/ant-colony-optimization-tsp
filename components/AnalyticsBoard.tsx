/**
 * AnalyticsBoard.tsx - Tableau d'analytique avec graphiques en temps réel
 *
 * Affiche:
 * - Graphique de convergence (meilleure distance vs. itération)
 * - Statistiques actuelles (itération, meilleure distance, nombre de villes)
 * - Informations sur les paramètres
 */

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";

interface AnalyticsBoardProps {
  iteration: number;
  bestDistance: number;
  averageDistance: number;
  distanceHistory: number[];
  numCities: number;
  alpha: number;
  beta: number;
  evaporationRate: number;
}

export const AnalyticsBoard: React.FC<AnalyticsBoardProps> = ({
  iteration,
  bestDistance,
  averageDistance,
  distanceHistory,
  numCities,
  alpha,
  beta,
  evaporationRate,
}) => {
  // Préparer les données pour le graphique
  const chartData = distanceHistory.map((distance, index) => ({
    iteration: index + 1,
    bestDistance: distance,
  }));

  // Calculer les statistiques
  const convergenceRate =
    distanceHistory.length > 1
      ? ((distanceHistory[0] - bestDistance) / distanceHistory[0]) * 100
      : 0;

  return (
    <div className="w-full space-y-4">
      {/* Graphique de Convergence */}
      <Card className="bg-white border-slate-200 p-4 shadow-sm">
        <h3 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-widest">
          Convergence de l'Algorithme
        </h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(203, 213, 225, 0.4)"
              />
              <XAxis
                dataKey="iteration"
                stroke="rgba(100, 116, 139, 0.5)"
                style={{ fontSize: "10px", fontWeight: "600" }}
              />
              <YAxis
                stroke="rgba(100, 116, 139, 0.5)"
                style={{ fontSize: "10px", fontWeight: "600" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid rgba(203, 213, 225, 0.8)",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                labelStyle={{
                  color: "rgba(100, 116, 139, 0.8)",
                  fontWeight: "bold",
                }}
                itemStyle={{ fontSize: "12px" }}
                formatter={(value: any) => value.toFixed(2)}
              />
              <Legend
                wrapperStyle={{ paddingTop: "20px", fontSize: "12px" }}
                iconType="circle"
              />
              <Line
                type="monotone"
                dataKey="bestDistance"
                stroke="#22c55e"
                dot={false}
                strokeWidth={3}
                name="Meilleure Distance"
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Statistiques */}
      <div className="grid grid-cols-2 gap-3">
        {/* Itération actuelle */}
        <Card className="bg-white border-slate-200 p-4 shadow-sm">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">
            Itération
          </p>
          <p className="text-2xl font-black text-cyan-600">{iteration}</p>
        </Card>

        {/* Meilleure distance */}
        <Card className="bg-white border-slate-200 p-4 shadow-sm">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">
            Distance Min.
          </p>
          <p className="text-2xl font-black text-green-600">
            {bestDistance === Infinity ? "-" : bestDistance.toFixed(2)}
          </p>
        </Card>

        {/* Nombre de villes */}
        <Card className="bg-white border-slate-200 p-4 shadow-sm">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">
            Villes
          </p>
          <p className="text-2xl font-black text-blue-600">{numCities}</p>
        </Card>

        {/* Taux de convergence */}
        <Card className="bg-white border-slate-200 p-4 shadow-sm">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">
            Convergence
          </p>
          <p className="text-2xl font-black text-purple-600">
            {convergenceRate.toFixed(1)}%
          </p>
        </Card>
      </div>

      {/* Paramètres Actuels */}
      <Card className="bg-slate-50 border-slate-200 p-4">
        <h3 className="text-[10px] font-bold text-slate-400 mb-3 uppercase tracking-widest">
          Paramètres Actuels
        </h3>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-slate-500 text-[10px] font-semibold">
              α (Phéromones)
            </p>
            <p className="text-cyan-700 font-mono font-bold">
              {alpha.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-slate-500 text-[10px] font-semibold">
              β (Heuristique)
            </p>
            <p className="text-cyan-700 font-mono font-bold">
              {beta.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-slate-500 text-[10px] font-semibold">
              ρ (Évaporation)
            </p>
            <p className="text-cyan-700 font-mono font-bold">
              {(evaporationRate * 100).toFixed(0)}%
            </p>
          </div>
        </div>
      </Card>

      {/* Informations */}
      <Card className="bg-white border-slate-200 p-4 shadow-sm border-l-4 border-l-cyan-500">
        <p className="text-xs text-slate-600 leading-relaxed italic">
          <strong>Formule:</strong> P<sub>ij</sub> = (τ
          <sup>α</sup> · η<sup>β</sup>) / Σ(τ<sup>α</sup> · η<sup>β</sup>)
        </p>
        <p className="text-xs text-slate-600 leading-relaxed mt-2 italic">
          <strong>Mise à jour:</strong> τ(t+1) = ρ·τ(t) + Δτ
        </p>
      </Card>
    </div>
  );
};
