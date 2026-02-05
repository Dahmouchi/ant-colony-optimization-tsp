import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Play,
  Pause,
  RotateCcw,
  MapPin,
  Route,
  Zap,
  Activity,
} from "lucide-react";
import type { ACOParams } from "@/utils/aco";

interface ControlPanelProps {
  params: ACOParams;
  onParamsChange: (params: Partial<ACOParams>) => void;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  cityCount: number;
  iteration: number;
  bestDistance: number;
  canStart: boolean;
  isLoading: boolean;
}

function formatDistance(meters: number): string {
  if (meters === Infinity || meters === 0) return "—";
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`;
  }
  return `${meters.toFixed(0)} m`;
}

export function ControlPanel({
  params,
  onParamsChange,
  isRunning,
  onStart,
  onPause,
  onReset,
  cityCount,
  iteration,
  bestDistance,
  canStart,
  isLoading,
}: ControlPanelProps) {
  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">
          ACO TSP Visualizer
        </h1>
        <p className="text-sm text-muted-foreground">
          Ant Colony Optimization for Morocco
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="stat-card">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cities</p>
              <p className="text-lg font-semibold">{cityCount}</p>
            </div>
          </div>
        </Card>

        <Card className="stat-card">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10">
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Iteration</p>
              <p className="text-lg font-semibold font-mono">{iteration}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Best Distance Card */}
      <Card className="control-panel bg-gradient-to-br from-primary/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <Route className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Best Distance
            </p>
            <p className="text-2xl font-bold font-mono text-primary">
              {formatDistance(bestDistance)}
            </p>
          </div>
          {isRunning && (
            <Badge variant="outline" className="animate-pulse-slow">
              <Zap className="h-3 w-3 mr-1" />
              Live
            </Badge>
          )}
        </div>
      </Card>

      <Separator />

      {/* ACO Parameters */}
      <Card className="control-panel">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-sm font-medium">
            Algorithm Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 space-y-5">
          {/* Alpha */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                Alpha (α){" "}
                <span className="text-muted-foreground">Pheromone weight</span>
              </span>
              <span className="font-mono font-medium">{params.alpha}</span>
            </div>
            <Slider
              value={[params.alpha]}
              onValueChange={([value]) => onParamsChange({ alpha: value })}
              min={0}
              max={5}
              step={0.1}
              disabled={isRunning}
              className="cursor-pointer"
            />
          </div>

          {/* Beta */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                Beta (β){" "}
                <span className="text-muted-foreground">Distance weight</span>
              </span>
              <span className="font-mono font-medium">{params.beta}</span>
            </div>
            <Slider
              value={[params.beta]}
              onValueChange={([value]) => onParamsChange({ beta: value })}
              min={0}
              max={10}
              step={0.1}
              disabled={isRunning}
              className="cursor-pointer"
            />
          </div>

          {/* Rho */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                Rho (ρ){" "}
                <span className="text-muted-foreground">Evaporation</span>
              </span>
              <span className="font-mono font-medium">{params.rho}</span>
            </div>
            <Slider
              value={[params.rho]}
              onValueChange={([value]) => onParamsChange({ rho: value })}
              min={0.01}
              max={0.99}
              step={0.01}
              disabled={isRunning}
              className="cursor-pointer"
            />
          </div>

          {/* Number of Ants */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                Ants <span className="text-muted-foreground">per iteration</span>
              </span>
              <span className="font-mono font-medium">{params.numAnts}</span>
            </div>
            <Slider
              value={[params.numAnts]}
              onValueChange={([value]) => onParamsChange({ numAnts: value })}
              min={5}
              max={100}
              step={5}
              disabled={isRunning}
              className="cursor-pointer"
            />
          </div>
        </CardContent>
      </Card>

      {/* Control Buttons */}
      <div className="flex gap-2 mt-auto pt-4">
        {isRunning ? (
          <Button onClick={onPause} variant="secondary" className="flex-1">
            <Pause className="h-4 w-4 mr-2" />
            Pause
          </Button>
        ) : (
          <Button
            onClick={onStart}
            disabled={!canStart || isLoading}
            className="flex-1"
          >
            <Play className="h-4 w-4 mr-2" />
            {isLoading ? "Loading..." : "Start"}
          </Button>
        )}
        <Button
          onClick={onReset}
          variant="outline"
          disabled={isRunning}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Instructions */}
      <div className="text-xs text-muted-foreground space-y-1 pb-4">
        <p>• Click on the map to add cities</p>
        <p>• Add at least 3 cities to start</p>
        <p>• Adjust parameters before running</p>
      </div>
    </div>
  );
}
