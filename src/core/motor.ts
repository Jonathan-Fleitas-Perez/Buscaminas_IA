/**
 * Motor de Inferencia - Coordina todas las estrategias
 */

import { GrafoTablero} from './grafo';
import { 
  ReglaInferencia, 
  ReglaMinasCompletas, 
  ReglaSaturacion, 
  ReglaSubconjunto,
  ReglaPatron121
} from './reglas';
import { RedBayesiana } from './bayesiano';
import { ResultadoInferencia, TipoInferencia, AccionIA, EstadisticasMotor } from './tipos';

export class MotorInferencia {
  grafo: GrafoTablero;
  redBayesiana: RedBayesiana;
  reglas: ReglaInferencia[];
  historialInferencias: ResultadoInferencia[];
  movimientosTotales: number;

  constructor(grafo: GrafoTablero) {
    this.grafo = grafo;
    this.redBayesiana = new RedBayesiana(grafo);
    
    this.reglas = [
      new ReglaMinasCompletas(),
      new ReglaSaturacion(),
      new ReglaSubconjunto(),
      new ReglaPatron121()
    ];

    this.reglas.sort((a, b) => a.prioridad - b.prioridad);
    this.historialInferencias = [];
    this.movimientosTotales = 0;
  }

  ejecutarCicloCompleto(): ResultadoInferencia | null {
    // Fase 1: Lógica determinista
    let resultado = this.faseLogicaDeterminista();
    if (resultado?.exito) return resultado;

    // Fase 2: Patrones
    resultado = this.fasePatrones();
    if (resultado?.exito) return resultado;

    // Fase 3: Red Bayesiana
    resultado = this.faseRedBayesiana();
    if (resultado?.exito) return resultado;

    return null;
  }

  private faseLogicaDeterminista(): ResultadoInferencia | null {
    const nodosRevelados = this.grafo.obtenerTodosNodos().filter(
      n => n.estado === 'REVELADA'
    );

    for (const nodo of nodosRevelados) {
      for (const regla of this.reglas) {
        if (regla.tipo === TipoInferencia.LOGICA_DETERMINISTA) {
          if (regla.esAplicable(nodo, this.grafo)) {
            const resultado = regla.aplicar(nodo, this.grafo);
            
            if (resultado.exito) {
              this.registrarInferencia(resultado);
              return resultado;
            }
          }
        }
      }
    }

    return null;
  }

  private fasePatrones(): ResultadoInferencia | null {
    const nodosRevelados = this.grafo.obtenerTodosNodos().filter(
      n => n.estado === 'REVELADA'
    );

    for (const nodo of nodosRevelados) {
      for (const regla of this.reglas) {
        if (regla.tipo === TipoInferencia.PATRON_RECONOCIDO) {
          if (regla.esAplicable(nodo, this.grafo)) {
            const resultado = regla.aplicar(nodo, this.grafo);
            
            if (resultado.exito && resultado.certeza >= 0.9) {
              this.registrarInferencia(resultado);
              return resultado;
            }
          }
        }
      }
    }

    return null;
  }

  private faseRedBayesiana(): ResultadoInferencia | null {
    const { nodo, probabilidad, razon } = this.redBayesiana.obtenerMejorMovimiento();

    if (nodo && probabilidad < 0.5) {
      const resultado: ResultadoInferencia = {
        exito: true,
        accion: AccionIA.REVELAR,
        coordenadas: [{ fila: nodo.fila, columna: nodo.columna }],
        razon,
        certeza: 1.0 - probabilidad,
        tipo: TipoInferencia.RED_BAYESIANA
      };

      this.registrarInferencia(resultado);
      return resultado;
    }

    if (nodo && probabilidad > 0.85) {
      const resultado: ResultadoInferencia = {
        exito: true,
        accion: AccionIA.MARCAR_MINA,
        coordenadas: [{ fila: nodo.fila, columna: nodo.columna }],
        razon: `Alta probabilidad: ${(probabilidad * 100).toFixed(1)}%`,
        certeza: probabilidad,
        tipo: TipoInferencia.RED_BAYESIANA
      };

      this.registrarInferencia(resultado);
      return resultado;
    }

    return null;
  }

  private registrarInferencia(resultado: ResultadoInferencia): void {
    this.historialInferencias.push(resultado);
    this.movimientosTotales++;
    this.redBayesiana.limpiarCache();
  }

  obtenerEstadisticas(): EstadisticasMotor {
    const tiposUsados = new Map<TipoInferencia, number>();
    let sumaCerteza = 0;

    for (const inf of this.historialInferencias) {
      const actual = tiposUsados.get(inf.tipo) || 0;
      tiposUsados.set(inf.tipo, actual + 1);
      sumaCerteza += inf.certeza;
    }

    const certezaPromedio = this.historialInferencias.length > 0 
      ? sumaCerteza / this.historialInferencias.length 
      : 0;

    const tasaExitoReglas = new Map<string, number>();
    for (const regla of this.reglas) {
      tasaExitoReglas.set(regla.nombre, regla.obtenerTasaExito());
    }

    return {
      movimientosTotales: this.movimientosTotales,
      certezaPromedio,
      tiposInferenciaUsados: tiposUsados,
      tasaExitoReglas
    };
  }

  obtenerMapaProbabilidades(): Map<string, number> {
    const mapa = new Map<string, number>();
    const probabilidades = this.redBayesiana.calcularMapaProbabilidades();

    for (const item of probabilidades) {
      const key = `${item.coordenada.fila}-${item.coordenada.columna}`;
      mapa.set(key, item.probabilidad);
    }

    return mapa;
  }
}