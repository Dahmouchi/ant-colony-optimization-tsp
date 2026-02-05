import React from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RotateCcw, Trash2 } from "lucide-react";

interface ControlPanelProps {
  alpha: number;
  beta: number;
  evaporationRate: number;
  numAnts: number;
  isRunning: boolean;
  onAlphaChange: (value: number) => void;
  onBetaChange: (value: number) => void;
  onEvaporationChange: (value: number) => void;
  onNumAntsChange: (value: number) => void;
  onPlayPause: () => void;
  onReset: () => void;
  onClearCities: () => void;
}

export const ControlPanel2: React.FC<ControlPanelProps> = ({
  alpha,
  beta,
  evaporationRate,
  numAnts,
  isRunning,
  onAlphaChange,
  onBetaChange,
  onEvaporationChange,
  onNumAntsChange,
  onPlayPause,
  onReset,
  onClearCities,
}) => {
  return (
    <div className="w-full max-w-sm bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-sm">
      {/* Titre */}
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-lg font-bold text-slate-800">Contrôles ACO</h2>
        <p className="text-xs text-slate-500 mt-1">
          Ajustez les paramètres en temps réel
        </p>
      </div>

      {/* Paramètres Algorithmiques */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Paramètres Algorithmiques
        </h3>

        {/* Alpha - Influence des phéromones */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-slate-700">
              α (Phéromones)
            </label>
            <span className="text-sm font-mono bg-slate-50 border border-slate-100 px-2 py-1 rounded text-cyan-600">
              {alpha.toFixed(2)}
            </span>
          </div>
          <Slider
            value={[alpha]}
            onValueChange={(value) => onAlphaChange(value[0])}
            min={0.1}
            max={5}
            step={0.1}
            className="w-full"
          />
          <p className="text-[10px] text-slate-400 leading-tight">
            Contrôle l'influence des phéromones précédentes
          </p>
        </div>

        {/* Beta - Influence de l'heuristique */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-slate-700">
              β (Heuristique)
            </label>
            <span className="text-sm font-mono bg-slate-50 border border-slate-100 px-2 py-1 rounded text-cyan-600">
              {beta.toFixed(2)}
            </span>
          </div>
          <Slider
            value={[beta]}
            onValueChange={(value) => onBetaChange(value[0])}
            min={0.1}
            max={5}
            step={0.1}
            className="w-full"
          />
          <p className="text-[10px] text-slate-400 leading-tight">
            Contrôle l'influence de la distance (heuristique)
          </p>
        </div>

        {/* Taux d'évaporation */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-slate-700">
              ρ (Évaporation)
            </label>
            <span className="text-sm font-mono bg-slate-50 border border-slate-100 px-2 py-1 rounded text-cyan-600">
              {(evaporationRate * 100).toFixed(0)}%
            </span>
          </div>
          <Slider
            value={[evaporationRate]}
            onValueChange={(value) => onEvaporationChange(value[0])}
            min={0.01}
            max={0.99}
            step={0.01}
            className="w-full"
          />
          <p className="text-[10px] text-slate-400 leading-tight">
            Taux de décroissance des phéromones par itération
          </p>
        </div>
      </div>

      {/* Configuration */}
      <div className="space-y-4 border-t border-slate-100 pt-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Configuration
        </h3>

        {/* Nombre de fourmis */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-slate-700">
              Fourmis
            </label>
            <span className="text-sm font-mono bg-slate-50 border border-slate-100 px-2 py-1 rounded text-cyan-600">
              {numAnts}
            </span>
          </div>
          <Slider
            value={[numAnts]}
            onValueChange={(value) => onNumAntsChange(value[0])}
            min={5}
            max={100}
            step={5}
            className="w-full"
          />
          <p className="text-[10px] text-slate-400 leading-tight">
            Nombre de fourmis par itération
          </p>
        </div>
      </div>

      {/* Contrôles de Simulation */}
      <div className="space-y-3 border-t border-slate-100 pt-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Simulation
        </h3>

        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={onPlayPause}
            variant={isRunning ? "destructive" : "default"}
            className="w-full shadow-sm"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Lancer
              </>
            )}
          </Button>

          <Button
            onClick={onReset}
            variant="outline"
            className="w-full border-slate-200"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Réinitialiser
          </Button>
        </div>

        <Button
          onClick={onClearCities}
          variant="ghost"
          className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Effacer Villes
        </Button>
      </div>

      {/* Légende */}
      <div className="border-t border-slate-100 pt-4 space-y-2 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-cyan-500 rounded-full" />
          <span>Phéromones (intensité)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-green-500" />
          <span>Meilleur chemin</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full" />
          <span>Villes</span>
        </div>
      </div>
    </div>
  );
};
