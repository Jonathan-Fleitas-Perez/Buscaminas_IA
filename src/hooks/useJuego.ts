import { useState, useCallback} from 'react';
import { ControladorJuego, EstadoJuego } from '../core/juego';
import { NivelJuego, NIVELES } from '../core/tipos';

export const useJuego = () => {
  const [controlador] = useState(() => new ControladorJuego());
  const [, setUpdate] = useState(0);
  const [autoResolviendoIntervalo, setAutoResolviendoIntervalo] = useState<NodeJS.Timeout | null>(null);
  
  const forceUpdate = useCallback(() => setUpdate(u => u + 1), []);

  const iniciarJuego = useCallback((nivel: NivelJuego) => {
    const config = NIVELES[nivel];
    controlador.iniciarJuego(config);
    forceUpdate();
  }, [controlador, forceUpdate]);

  const ejecutarPaso = useCallback(() => {
    const resultado = controlador.ejecutarPasoIA();
    forceUpdate();
    return resultado;
  }, [controlador, forceUpdate]);

  const iniciarAutoResolver = useCallback((velocidad: number) => {
    if (autoResolviendoIntervalo) return;

    const intervalo = setInterval(() => {
      if (controlador.estado !== EstadoJuego.EN_CURSO) {
        clearInterval(intervalo);
        setAutoResolviendoIntervalo(null);
        return;
      }

      const resultado = controlador.ejecutarPasoIA();
      forceUpdate();

      if (!resultado || !resultado.exito) {
        clearInterval(intervalo);
        setAutoResolviendoIntervalo(null);
      }
    }, velocidad);

    setAutoResolviendoIntervalo(intervalo);
  }, [controlador, autoResolviendoIntervalo, forceUpdate]);

  const detenerAutoResolver = useCallback(() => {
    if (autoResolviendoIntervalo) {
      clearInterval(autoResolviendoIntervalo);
      setAutoResolviendoIntervalo(null);
    }
  }, [autoResolviendoIntervalo]);

  const revelarManual = useCallback((fila: number, columna: number) => {
    const resultado = controlador.revelarManual(fila, columna);
    forceUpdate();
    return resultado;
  }, [controlador, forceUpdate]);

  const marcarManual = useCallback((fila: number, columna: number) => {
    const resultado = controlador.marcarManual(fila, columna);
    forceUpdate();
    return resultado;
  }, [controlador, forceUpdate]);

  return {
    controlador,
    iniciarJuego,
    ejecutarPaso,
    iniciarAutoResolver,
    detenerAutoResolver,
    revelarManual,
    marcarManual,
    estaAutoResolviendo: !!autoResolviendoIntervalo
  };
};