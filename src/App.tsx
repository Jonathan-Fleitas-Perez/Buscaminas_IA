/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { motion } from "framer-motion";
import { Brain } from "lucide-react";
import { useJuego } from "./hooks/useJuego";
import { Tablero } from "./components/Tablero";
import { PanelControl } from "./components/PanelControl";
import { InfoJuego } from "./components/InfoJuego";
import { Card } from "./components/ui/Card";
import { NivelJuego } from "./core/tipos";

function App() {
  const {
    controlador,
    iniciarJuego,
    ejecutarPaso,
    iniciarAutoResolver,
    detenerAutoResolver,
    revelarManual,
    marcarManual,
    estaAutoResolviendo,
  } = useJuego();

 
  const [mostrarProbabilidades, setMostrarProbabilidades] = useState(false);

  const handleNuevoJuego = (nivel: NivelJuego) => {
    iniciarJuego(nivel);
  };

  const handleEjecutarPaso = () => {
    ejecutarPaso();
  };

  const handleAutoResolver = (velocidad: number) => {
    iniciarAutoResolver(velocidad);
  };

  const stats = controlador.motor?.obtenerEstadisticas() || null;
  const mapaProbabilidades =
    controlador.motor?.obtenerMapaProbabilidades() || new Map();

  return (
    <div className="min-h-screen bg-linear-to-b from-[#0b0b0c] via-[#121213] to-[#0d0d0e] p-4 md:p-8 text-gray-200">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="p-3 bg-linear-to-br from-gray-800/40 to-gray-700/20 rounded-2xl shadow-inner"
            >
              <Brain className="w-10 h-10 text-gray-300" />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-100 tracking-tight">
              Sistema Inteligente de Buscaminas
            </h1>
          </div>
        </motion.header>

        {/* Grid Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Panel de Control */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-3"
          >
            <PanelControl
              onNuevoJuego={handleNuevoJuego}
              onEjecutarPaso={handleEjecutarPaso}
              onAutoResolver={handleAutoResolver}
              onDetener={detenerAutoResolver}
              estaAutoResolviendo={estaAutoResolviendo}
              juegoIniciado={controlador.estado !== "NO_INICIADO"}
            />
          </motion.div>

          {/* Área Central */}
          <div className="lg:col-span-9 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <InfoJuego
                estado={controlador.estado}
                movimientos={controlador.movimientosTotales}
                minasMarcadas={controlador.minasMarcadas}
                totalMinas={controlador.grafo?.totalMinas || 0}
                casillasReveladas={controlador.casillasReveladas}
                certezaPromedio={stats?.certezaPromedio || 0}
              />
            </motion.div>

        

            {/* Tablero */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center"
            >
              <Card className="bg-[#161617]/70 border border-gray-800 rounded-xl backdrop-blur-md shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-300">
                    Tablero de Juego
                  </h3>

                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={mostrarProbabilidades}
                      onChange={(e) => setMostrarProbabilidades(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-600 bg-[#1b1b1d] checked:bg-gray-500"
                    />
                    <span className="text-sm text-gray-500 group-hover:text-gray-300 transition-colors">
                      Mostrar Probabilidades
                    </span>
                  </label>
                </div>

                <Tablero
                  grafo={controlador.grafo}
                  mostrarProbabilidades={mostrarProbabilidades}
                  onClickCelda={revelarManual}
                  onClickDerechoCelda={marcarManual}
                />
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-12"
        >
          <Card className="bg-[#141415]/80 border border-gray-800 rounded-xl p-6 shadow-inner">
            <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-gray-400" />
              ¿Cómo funciona la IA?
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-400">
              <div>
                <h4 className="font-semibold text-gray-300">1. Lógica Determinista</h4>
                <p>Usa reglas con certeza total: si todas las minas están marcadas, las demás son seguras.</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-300">2. Patrones</h4>
                <p>Detecta estructuras conocidas como 1-2-1 o subconjuntos que revelan minas seguras.</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-300">3. Red Bayesiana</h4>
                <p>Evalúa configuraciones probabilísticas cuando no hay certezas lógicas.</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-[#101011]/70 rounded-lg border border-gray-800 text-gray-400 text-xs text-center">
              💡 Estrategia multinivel: primero lógica, luego patrones, finalmente análisis probabilístico.
            </div>
          </Card>
        </motion.footer>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-xs text-gray-600 py-4"
        >
          <p className="mt-1">IA basada en Grafos, Reglas y Redes Bayesianas</p>
        </motion.div>
      </div>
    </div>
  );
}

export default App;
