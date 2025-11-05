import React from 'react';
import { motion } from 'framer-motion';
import { Bomb, Flag } from 'lucide-react';
import { NodoGrafo } from '../core/grafo';
import { EstadoCasilla } from '../core/tipos';
import { cn } from '../utils/cn';

interface CeldaProps {
  nodo: NodoGrafo;
  mostrarProbabilidades: boolean;
  onClickIzquierdo: () => void;
  onClickDerecho: () => void;
}

export const Celda: React.FC<CeldaProps> = ({ 
  nodo, 
  mostrarProbabilidades,
  onClickIzquierdo,
  onClickDerecho
}) => {
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onClickDerecho();
  };

  const obtenerColorNumero = (num: number): string => {
    const colores: Record<number, string> = {
      1: 'text-blue-400',
      2: 'text-green-400',
      3: 'text-red-400',
      4: 'text-purple-400',
      5: 'text-yellow-400',
      6: 'text-cyan-400',
      7: 'text-pink-400',
      8: 'text-gray-400'
    };
    return colores[num] || 'text-gray-400';
  };

  const obtenerClaseProbabilidad = (prob: number): string => {
    if (prob < 0.3) return 'bg-green-500/20 border-green-500/40';
    if (prob < 0.6) return 'bg-yellow-500/20 border-yellow-500/40';
    return 'bg-red-500/20 border-red-500/40';
  };

  const renderContenido = () => {
    if (nodo.estado === EstadoCasilla.DESCONOCIDA) {
      if (mostrarProbabilidades && nodo.probabilidadMina > 0) {
        return (
          <span className="text-xs font-bold">
            {(nodo.probabilidadMina * 100).toFixed(0)}%
          </span>
        );
      }
      return null;
    }

    if (nodo.estado === EstadoCasilla.MARCADA) {
      return <Flag className="w-4 h-4" />;
    }

    if (nodo.estado === EstadoCasilla.EXPLOSIONADA) {
      return <Bomb className="w-5 h-5 text-red-500 animate-pulse" />;
    }

    if (nodo.estado === EstadoCasilla.REVELADA) {
      if (nodo.tieneMina) {
        return <Bomb className="w-4 h-4 text-red-400" />;
      }
      if (nodo.numeroAdyacente > 0) {
        return (
          <span className={cn('font-bold text-lg', obtenerColorNumero(nodo.numeroAdyacente))}>
            {nodo.numeroAdyacente}
          </span>
        );
      }
    }

    return (
    <span className="text-gray-600 text-sm select-none">
      0
    </span>
  );;
  };

  const obtenerClaseBase = (): string => {
    const baseClasses = 'w-8 h-8 flex items-center justify-center border transition-all duration-200 cursor-pointer';

    if (nodo.estado === EstadoCasilla.DESCONOCIDA) {
      if (mostrarProbabilidades && nodo.probabilidadMina > 0) {
        return cn(
          baseClasses,
          obtenerClaseProbabilidad(nodo.probabilidadMina),
          'hover:scale-100'
        );
      }
      return cn(
        baseClasses,
        'bg-dark-600 border-dark-500 hover:bg-dark-500 hover:scale-105'
      );
    }

    if (nodo.estado === EstadoCasilla.MARCADA) {
      return cn(
        baseClasses,
        'bg-red-500/30 border-red-500/50 text-red-400'
      );
    }

    if (nodo.estado === EstadoCasilla.EXPLOSIONADA) {
      return cn(
        baseClasses,
        'bg-red-600/50 border-red-500 animate-pulse'
      );
    }

    if (nodo.estado === EstadoCasilla.REVELADA) {
      return cn(
        baseClasses,
        'bg-dark-800 border-dark-700 cursor-default'
      );
    }

    return baseClasses;
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: nodo.estado === EstadoCasilla.DESCONOCIDA ? 1.1 : 1 }}
      whileTap={{ scale: nodo.estado === EstadoCasilla.DESCONOCIDA ? 0.95 : 1 }}
      className={obtenerClaseBase()}
      onClick={onClickIzquierdo}
      onContextMenu={handleContextMenu}
    >
      {renderContenido()}
    </motion.div>
  );
};