import React from 'react';
import { motion } from 'framer-motion';
import { Flame, TrendingDown } from 'lucide-react';
import { Card } from './ui/Card';

interface MapaProbabilidadesProps {
  probabilidades: Map<string, number>;
}

export const MapaProbabilidades: React.FC<MapaProbabilidadesProps> = ({ probabilidades }) => {
  const probabilidadesArray = Array.from(probabilidades.entries())
    .map(([key, prob]) => {
      const [fila, columna] = key.split('-').map(Number);
      return { fila, columna, probabilidad: prob };
    })
    .sort((a, b) => a.probabilidad - b.probabilidad)
    .slice(0, 10);

  if (probabilidadesArray.length === 0) {
    return (
      <Card title="🔥 Mapa de Probabilidades">
        <p className="text-gray-500">No hay probabilidades calculadas</p>
      </Card>
    );
  }

  const obtenerColorBarra = (prob: number): string => {
    if (prob < 0.3) return 'from-green-500 to-green-400';
    if (prob < 0.6) return 'from-yellow-500 to-yellow-400';
    return 'from-red-500 to-red-400';
  };

  return (
    <Card>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-accent-red/20 rounded-lg">
          <Flame className="w-6 h-6 text-accent-red" />
        </div>
        <h3 className="text-xl font-bold text-accent-red">
          Mapa de Probabilidades Bayesianas
        </h3>
      </div>

      <div className="flex items-center gap-2 mb-4 text-sm text-gray-400">
        <TrendingDown className="w-4 h-4" />
        <span>Top 10 casillas más seguras</span>
      </div>

      <div className="space-y-3">
        {probabilidadesArray.map((item, index) => (
          <motion.div
            key={`${item.fila}-${item.columna}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-3 p-3 bg-dark-800 rounded-lg hover:bg-dark-700 transition-colors"
          >
            <div className="shrink-0 w-16 text-sm text-gray-400 font-mono">
              ({item.fila},{item.columna})
            </div>

            <div className="flex-1">
              <div className="h-6 bg-dark-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.probabilidad * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={`h-full bg-linear-to-r ${obtenerColorBarra(item.probabilidad)}`}
                />
              </div>
            </div>

            <div className="shrink-0 w-16 text-right">
              <span className={`text-sm font-bold ${
                item.probabilidad < 0.3 ? 'text-green-400' :
                item.probabilidad < 0.6 ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {(item.probabilidad * 100).toFixed(1)}%
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-dark-800/50 rounded-lg border border-white/5">
        <p className="text-xs text-gray-400">
          Las probabilidades se calculan usando <span className="text-accent-purple font-semibold">Redes Bayesianas</span> y 
          <span className="text-accent-blue font-semibold"> CSP (Constraint Satisfaction Problem)</span> para encontrar 
          las casillas más seguras para revelar.
        </p>
      </div>
    </Card>
  );
};