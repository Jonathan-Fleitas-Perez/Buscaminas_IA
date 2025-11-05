import React, { useState } from "react";
import { Play, Zap, FastForward, Square } from "lucide-react";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { Select } from "./ui/Select";
import { NivelJuego } from "../core/tipos";

interface PanelControlProps {
  onNuevoJuego: (nivel: NivelJuego) => void;
  onEjecutarPaso: () => void;
  onAutoResolver: (velocidad: number) => void;
  onDetener: () => void;
  estaAutoResolviendo: boolean;
  juegoIniciado: boolean;
}

export const PanelControl: React.FC<PanelControlProps> = ({
  onNuevoJuego,
  onEjecutarPaso,
  onAutoResolver,
  onDetener,
  estaAutoResolviendo,
  juegoIniciado,
}) => {
  const [nivelSeleccionado, setNivelSeleccionado] =
    useState<NivelJuego>("MEDIO");
  const [velocidadSeleccionada, setVelocidadSeleccionada] =
    useState<number>(800);

  const niveles = [
    { value: "FACIL", label: "Fácil (8x8)" },
    { value: "MEDIO", label: "Medio (16x16)" },
    { value: "DIFICIL", label: "Difícil (16x30)" },
  ];

  const velocidades = [
    { value: "1500", label: "Lento" },
    { value: "800", label: "Normal" },
    { value: "300", label: "Rápido" },
    { value: "0", label: "Instantáneo" },
  ];

  return (
    <Card className="space-y-6">
      {/* Configuración del Juego */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-accent-blue flex items-center gap-2">
          <Play className="w-5 h-5" />
          Configuración
        </h3>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">Nivel de dificultad</label>
          <Select
            options={niveles}
            value={nivelSeleccionado}
            onChange={(e) => setNivelSeleccionado(e.target.value as NivelJuego)}
            className="w-full"
          />
        </div>

        <Button
          variant="success"
          onClick={() => onNuevoJuego(nivelSeleccionado)}
          className="w-full"
        >
          <Play className="w-4 h-4" />
          Nuevo Juego
        </Button>
      </div>

      {/* Control de IA */}
      <div className="border-t border-white/10 pt-6 space-y-3">
        <h3 className="text-lg font-semibold text-accent-purple flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Control IA
        </h3>

        <Button
          variant="primary"
          onClick={onEjecutarPaso}
          disabled={!juegoIniciado || estaAutoResolviendo}
          className="w-full"
        >
          <Zap className="w-4 h-4" />
          Ejecutar Paso
        </Button>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">
            Velocidad auto-resolver
          </label>
          <Select
            options={velocidades}
            value={velocidadSeleccionada.toString()}
            onChange={(e: { target: { value: string } }) =>
              setVelocidadSeleccionada(Number(e.target.value))
            }
            className="w-full"
          />
        </div>

        {!estaAutoResolviendo ? (
          <Button
            variant="primary"
            onClick={() => onAutoResolver(velocidadSeleccionada)}
            disabled={!juegoIniciado}
            className="w-full bg-linear-to-r from-purple-500/20 to-blue-500/20 border-purple-500/50"
          >
            <FastForward className="w-4 h-4" />
            Auto-Resolver
          </Button>
        ) : (
          <Button
            variant="danger"
            onClick={onDetener}
            className="w-full animate-pulse"
          >
            <Square className="w-4 h-4" />
            Detener
          </Button>
        )}
      </div>

      {/* Controles Manuales */}
      <div className="border-t border-white/10 pt-6">
        <div className="text-sm text-gray-400 space-y-1">
          <p className="font-semibold mb-2">💡 Controles Manuales:</p>
          <p>
            • <span className="text-accent-blue">Click izquierdo</span>: Revelar
            casilla
          </p>
          <p>
            • <span className="text-accent-red">Click derecho</span>: Marcar
            mina
          </p>
        </div>
      </div>
    </Card>
  );
};
