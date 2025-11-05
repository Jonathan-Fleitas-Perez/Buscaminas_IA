/**
 * Red Bayesiana para análisis probabilístico
 */

import { NodoGrafo, GrafoTablero } from './grafo';
import type { ProbabilidadCasilla } from './tipos';
import { EstadoCasilla as EstadoCasillaEnum } from './tipos';

export class RedBayesiana {
  grafo: GrafoTablero;
  cacheProbabilidades: Map<string, number>;

  constructor(grafo: GrafoTablero) {
    this.grafo = grafo;
    this.cacheProbabilidades = new Map();
  }

  calcularProbabilidadBayesiana(nodo: NodoGrafo): number {
    if (nodo.estado === EstadoCasillaEnum.MARCADA) return 1.0;
    if (nodo.estado === EstadoCasillaEnum.REVELADA) return 0.0;

    const cacheKey = nodo.getId();
    if (this.cacheProbabilidades.has(cacheKey)) {
      return this.cacheProbabilidades.get(cacheKey)!;
    }

    const vecinosInformativos = nodo.vecinos.filter(
      v => v.estado === EstadoCasillaEnum.REVELADA && v.numeroAdyacente > 0
    );

    if (vecinosInformativos.length === 0) {
      return this.calcularProbabilidadBase();
    }

    const probabilidad = this.calcularProbabilidadCSP(nodo, vecinosInformativos);
    this.cacheProbabilidades.set(cacheKey, probabilidad);
    return probabilidad;
  }

  private calcularProbabilidadBase(): number {
    const todosNodos = this.grafo.obtenerTodosNodos();
    const marcadas = todosNodos.filter(n => n.estado === EstadoCasillaEnum.MARCADA).length;
    const desconocidas = todosNodos.filter(n => n.estado === EstadoCasillaEnum.DESCONOCIDA).length;

    if (desconocidas === 0) return 0;

    const minasRestantes = this.grafo.totalMinas - marcadas;
    return Math.min(minasRestantes / desconocidas, 1.0);
  }

  private calcularProbabilidadCSP(nodoObjetivo: NodoGrafo, vecinosInformativos: NodoGrafo[]): number {
    const nodosRelevantes = new Set<NodoGrafo>([nodoObjetivo]);
    
    for (const vecino of vecinosInformativos) {
      for (const v of vecino.vecinos) {
        if (v.estado === EstadoCasillaEnum.DESCONOCIDA) {
          nodosRelevantes.add(v);
        }
      }
    }

    const nodosLista = Array.from(nodosRelevantes);

    if (nodosLista.length > 12) {
      return this.calcularProbabilidadAproximada(nodoObjetivo, vecinosInformativos);
    }

    let configuracionesValidas = 0;
    let objetivoTieneMina = 0;

    const totalCombinaciones = Math.pow(2, nodosLista.length);

    for (let mask = 0; mask < totalCombinaciones; mask++) {
      const configuracion = new Set<NodoGrafo>();

      for (let i = 0; i < nodosLista.length; i++) {
        if (mask & (1 << i)) {
          configuracion.add(nodosLista[i]);
        }
      }

      if (this.verificaRestricciones(configuracion, vecinosInformativos)) {
        configuracionesValidas++;
        
        if (configuracion.has(nodoObjetivo)) {
          objetivoTieneMina++;
        }
      }
    }

    if (configuracionesValidas === 0) {
      return this.calcularProbabilidadBase();
    }

    return objetivoTieneMina / configuracionesValidas;
  }

  private verificaRestricciones(configuracionMinas: Set<NodoGrafo>, vecinosInformativos: NodoGrafo[]): boolean {
    for (const vecino of vecinosInformativos) {
      const minasRequeridas = vecino.numeroAdyacente;
      const marcadas = vecino.contarVecinosPorEstado(EstadoCasillaEnum.MARCADA);
      const minasEnConfig = vecino.vecinos.filter(v => configuracionMinas.has(v)).length;
      const totalMinas = marcadas + minasEnConfig;

      if (totalMinas !== minasRequeridas) {
        return false;
      }
    }

    return true;
  }

  private calcularProbabilidadAproximada(nodoObjetivo: NodoGrafo, vecinosInformativos: NodoGrafo[]): number {
    const probabilidades: number[] = [];
    const pesos: number[] = [];

    for (const vecino of vecinosInformativos) {
      const minasRestantes = vecino.obtenerMinasRestantes();
      const espaciosLibres = vecino.obtenerEspaciosLibres();

      if (espaciosLibres > 0) {
        const probLocal = minasRestantes / espaciosLibres;
        const peso = 1.0 / (espaciosLibres + 1);

        probabilidades.push(probLocal);
        pesos.push(peso);
      }
    }

    if (probabilidades.length === 0) {
      return this.calcularProbabilidadBase();
    }

    const sumaPonderada = probabilidades.reduce((sum, prob, i) => sum + prob * pesos[i], 0);
    const sumaPesos = pesos.reduce((sum, peso) => sum + peso, 0);

    return sumaPonderada / sumaPesos;
  }

  calcularMapaProbabilidades(): ProbabilidadCasilla[] {
    const mapa: ProbabilidadCasilla[] = [];

    for (const nodo of this.grafo.obtenerTodosNodos()) {
      if (nodo.estado === EstadoCasillaEnum.DESCONOCIDA) {
        const prob = this.calcularProbabilidadBayesiana(nodo);
        nodo.probabilidadMina = prob;
        
        mapa.push({
          coordenada: { fila: nodo.fila, columna: nodo.columna },
          probabilidad: prob
        });
      }
    }

    return mapa.sort((a, b) => a.probabilidad - b.probabilidad);
  }

  obtenerMejorMovimiento(): { nodo: NodoGrafo | null; probabilidad: number; razon: string } {
    const mapa = this.calcularMapaProbabilidades();

    if (mapa.length === 0) {
      return { nodo: null, probabilidad: 0, razon: 'Sin movimientos' };
    }

    const mejorCasilla = mapa[0];
    const mejorNodo = this.grafo.obtenerNodo(mejorCasilla.coordenada.fila, mejorCasilla.coordenada.columna);

    const razon = `Red Bayesiana: ${(mejorCasilla.probabilidad * 100).toFixed(1)}% probabilidad de mina`;

    return { nodo: mejorNodo, probabilidad: mejorCasilla.probabilidad, razon };
  }

  limpiarCache(): void {
    this.cacheProbabilidades.clear();
  }
}