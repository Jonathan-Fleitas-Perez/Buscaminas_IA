import { Activity, Target, Flag, Grid3x3, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import { EstadoJuego } from '../core/juego';
import { Badge } from './ui/Badge';

interface InfoJuegoProps {
  estado: EstadoJuego;
  movimientos: number;
  minasMarcadas: number;
  totalMinas: number;
  casillasReveladas: number;
  certezaPromedio: number;
}

export const InfoJuego= ({
  estado,
  movimientos,
  minasMarcadas,
  totalMinas,
  casillasReveladas,
  certezaPromedio
}:InfoJuegoProps) => {
  const obtenerBadgeEstado = () => {
    switch (estado) {
      case EstadoJuego.EN_CURSO:
        return <Badge variant="yellow">▶ En Curso</Badge>;
      case EstadoJuego.GANADO:
        return <Badge variant="green">★ ¡Ganado!</Badge>;
      case EstadoJuego.PERDIDO:
        return <Badge variant="red">✖ Perdido</Badge>;
      default:
        return <Badge variant="blue">○ No iniciado</Badge>;
    }
  };

  const stats = [
    { icon: Activity, label: 'Estado', value: obtenerBadgeEstado(), color: 'text-yellow-400' },
    { icon: Target, label: 'Movimientos', value: movimientos, color: 'text-blue-400' },
    { icon: Flag, label: 'Minas', value: `${minasMarcadas}/${totalMinas}`, color: 'text-red-400' },
    { icon: Grid3x3, label: 'Reveladas', value: casillasReveladas, color: 'text-green-400' },
    { icon: Brain, label: 'Certeza IA', value: `${(certezaPromedio * 100).toFixed(1)}%`, color: 'text-purple-400' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="glassmorphism rounded-xl p-4 text-center"
        >
          <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
          <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
          <div className="text-lg font-bold">
            {typeof stat.value === 'string' || typeof stat.value === 'number' ? stat.value : stat.value}
          </div>
        </motion.div>
      ))}
    </div>
  );
};