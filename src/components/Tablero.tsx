import React from 'react';
import { motion } from 'framer-motion';
import { Celda } from './Celda';
import { GrafoTablero } from '../core/grafo';

interface TableroProps {
  grafo: GrafoTablero | null;
  mostrarProbabilidades: boolean;
  onClickCelda: (fila: number, columna: number) => void;
  onClickDerechoCelda: (fila: number, columna: number) => void;
}

export const Tablero: React.FC<TableroProps> = ({ 
  grafo, 
  mostrarProbabilidades,
  onClickCelda,
  onClickDerechoCelda
}) => {
  if (!grafo) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 gap-2">
        <p>Inicia un nuevo juego para comenzar</p>
      </div>
    );
  }

  const filas = grafo.filas;
  const columnas = grafo.columnas;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-block bg-dark-800 p-4 rounded-xl border border-white/10 shadow-2xl"
    >
      <div 
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${columnas}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${filas}, minmax(0, 1fr))`
        }}
      >
        {Array.from({ length: filas }).map((_, fila) => (
          Array.from({ length: columnas }).map((_, columna) => {
            const nodo = grafo.obtenerNodo(fila, columna);
            if (!nodo) return null;

            return (
              <Celda
                key={`${fila}-${columna}`}
                nodo={nodo}
                mostrarProbabilidades={mostrarProbabilidades}
                onClickIzquierdo={() => onClickCelda(fila, columna)}
                onClickDerecho={() => onClickDerechoCelda(fila, columna)}
              />
            );
          })
        ))}
      </div>
    </motion.div>
  );
};