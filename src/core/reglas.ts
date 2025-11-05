/**
 * Sistema de reglas de inferencia lógica
 */

import { NodoGrafo, GrafoTablero } from './grafo';
import type { ResultadoInferencia, Coordenada } from './tipos';
import { 
  EstadoCasilla as EstadoCasillaEnum, 
  TipoInferencia, 
  AccionIA 
} from './tipos';

export abstract class ReglaInferencia {
  nombre: string;
  prioridad: number;
  tipo: TipoInferencia;
  aplicacionesExitosas: number = 0;
  aplicacionesTotales: number = 0;

  constructor(nombre: string, prioridad: number, tipo: TipoInferencia) {
    this.nombre = nombre;
    this.prioridad = prioridad;
    this.tipo = tipo;
  }

  abstract esAplicable(nodo: NodoGrafo, grafo: GrafoTablero): boolean;
  abstract aplicar(nodo: NodoGrafo, grafo: GrafoTablero): ResultadoInferencia;

  registrarAplicacion(exito: boolean): void {
    this.aplicacionesTotales++;
    if (exito) this.aplicacionesExitosas++;
  }

  obtenerTasaExito(): number {
    return this.aplicacionesTotales === 0 ? 0 : this.aplicacionesExitosas / this.aplicacionesTotales;
  }
}

export class ReglaMinasCompletas extends ReglaInferencia {
  constructor() {
    super('Minas Completas', 1, TipoInferencia.LOGICA_DETERMINISTA);
  }

  esAplicable(nodo: NodoGrafo): boolean {
    return nodo.estado === EstadoCasillaEnum.REVELADA && nodo.numeroAdyacente > 0;
  }

  aplicar(nodo: NodoGrafo): ResultadoInferencia {
    const desconocidos = nodo.obtenerVecinosPorEstado(EstadoCasillaEnum.DESCONOCIDA);
    const marcados = nodo.obtenerVecinosPorEstado(EstadoCasillaEnum.MARCADA);

    if (marcados.length === nodo.numeroAdyacente && desconocidos.length > 0) {
      const coordenadas: Coordenada[] = desconocidos.map(n => ({
        fila: n.fila,
        columna: n.columna
      }));

      this.registrarAplicacion(true);

      return {
        exito: true,
        accion: AccionIA.REVELAR,
        coordenadas,
        razon: `Todas las ${nodo.numeroAdyacente} minas están marcadas. ${desconocidos.length} casillas seguras.`,
        certeza: 1.0,
        tipo: this.tipo
      };
    }

    this.registrarAplicacion(false);
    return { exito: false, coordenadas: [], razon: '', certeza: 0, tipo: this.tipo };
  }
}

export class ReglaSaturacion extends ReglaInferencia {
  constructor() {
    super('Saturación', 1, TipoInferencia.LOGICA_DETERMINISTA);
  }

  esAplicable(nodo: NodoGrafo): boolean {
    return nodo.estado === EstadoCasillaEnum.REVELADA && nodo.numeroAdyacente > 0;
  }

  aplicar(nodo: NodoGrafo): ResultadoInferencia {
    const desconocidos = nodo.obtenerVecinosPorEstado(EstadoCasillaEnum.DESCONOCIDA);
    const minasRestantes = nodo.obtenerMinasRestantes();

    if (minasRestantes === desconocidos.length && desconocidos.length > 0) {
      const coordenadas: Coordenada[] = desconocidos.map(n => ({
        fila: n.fila,
        columna: n.columna
      }));

      this.registrarAplicacion(true);

      return {
        exito: true,
        accion: AccionIA.MARCAR_MINA,
        coordenadas,
        razon: `Saturación: ${minasRestantes} minas en ${desconocidos.length} espacios.`,
        certeza: 1.0,
        tipo: this.tipo
      };
    }

    this.registrarAplicacion(false);
    return { exito: false, coordenadas: [], razon: '', certeza: 0, tipo: this.tipo };
  }
}

export class ReglaSubconjunto extends ReglaInferencia {
  constructor() {
    super('Subconjunto', 2, TipoInferencia.LOGICA_DETERMINISTA);
  }

  esAplicable(nodo: NodoGrafo): boolean {
    return nodo.estado === EstadoCasillaEnum.REVELADA && nodo.numeroAdyacente > 0;
  }

  aplicar(nodo: NodoGrafo): ResultadoInferencia {
    const desconocidosN = new Set(nodo.obtenerVecinosPorEstado(EstadoCasillaEnum.DESCONOCIDA));
    if (desconocidosN.size === 0) {
      return { exito: false, coordenadas: [], razon: '', certeza: 0, tipo: this.tipo };
    }

    const minasN = nodo.obtenerMinasRestantes();

    for (const vecino of nodo.vecinos) {
      if (vecino.estado !== EstadoCasillaEnum.REVELADA || vecino.numeroAdyacente === 0) continue;

      const desconocidosV = new Set(vecino.obtenerVecinosPorEstado(EstadoCasillaEnum.DESCONOCIDA));
      const minasV = vecino.obtenerMinasRestantes();

      const esSubconjunto = [...desconocidosN].every(n => desconocidosV.has(n));

      if (esSubconjunto && desconocidosN.size !== desconocidosV.size) {
        const diferencia = [...desconocidosV].filter(v => !desconocidosN.has(v));
        const minasEnDiferencia = minasV - minasN;

        if (minasEnDiferencia === diferencia.length && minasEnDiferencia > 0) {
          const coordenadas: Coordenada[] = diferencia.map(n => ({
            fila: n.fila,
            columna: n.columna
          }));

          this.registrarAplicacion(true);

          return {
            exito: true,
            accion: AccionIA.MARCAR_MINA,
            coordenadas,
            razon: `Análisis de subconjuntos: ${minasEnDiferencia} minas en diferencia.`,
            certeza: 1.0,
            tipo: this.tipo
          };
        }

        if (minasEnDiferencia === 0 && diferencia.length > 0) {
          const coordenadas: Coordenada[] = diferencia.map(n => ({
            fila: n.fila,
            columna: n.columna
          }));

          this.registrarAplicacion(true);

          return {
            exito: true,
            accion: AccionIA.REVELAR,
            coordenadas,
            razon: `Análisis de subconjuntos: ${diferencia.length} casillas seguras.`,
            certeza: 1.0,
            tipo: this.tipo
          };
        }
      }
    }

    this.registrarAplicacion(false);
    return { exito: false, coordenadas: [], razon: '', certeza: 0, tipo: this.tipo };
  }
}

export class ReglaPatron121 extends ReglaInferencia {
  constructor() {
    super('Patrón 1-2-1', 3, TipoInferencia.PATRON_RECONOCIDO);
  }

  esAplicable(nodo: NodoGrafo): boolean {
    return nodo.estado === EstadoCasillaEnum.REVELADA && nodo.numeroAdyacente === 2;
  }

  aplicar(nodo: NodoGrafo, grafo: GrafoTablero): ResultadoInferencia {
    const direcciones: [number, number][][] = [
      [[-1, 0], [1, 0]],
      [[0, -1], [0, 1]],
      [[-1, -1], [1, 1]],
      [[-1, 1], [1, -1]]
    ];

    for (const [dir1, dir2] of direcciones) {
      const vecino1 = grafo.obtenerNodo(nodo.fila + dir1[0], nodo.columna + dir1[1]);
      const vecino2 = grafo.obtenerNodo(nodo.fila + dir2[0], nodo.columna + dir2[1]);

      if (!vecino1 || !vecino2) continue;

      if (
        vecino1.estado === EstadoCasillaEnum.REVELADA &&
        vecino2.estado === EstadoCasillaEnum.REVELADA &&
        vecino1.numeroAdyacente === 1 &&
        vecino2.numeroAdyacente === 1
      ) {
        const minasCandidatas: NodoGrafo[] = [];

        for (const vecino of nodo.vecinos) {
          if (vecino.estado !== EstadoCasillaEnum.DESCONOCIDA) continue;
          if (vecino === vecino1 || vecino === vecino2) continue;

          const esVecinoV1 = vecino1.vecinos.includes(vecino);
          const esVecinoV2 = vecino2.vecinos.includes(vecino);

          if (esVecinoV1 || esVecinoV2) {
            minasCandidatas.push(vecino);
          }
        }

        if (minasCandidatas.length >= 2) {
          const coordenadas: Coordenada[] = minasCandidatas.slice(0, 2).map(n => ({
            fila: n.fila,
            columna: n.columna
          }));

          this.registrarAplicacion(true);

          return {
            exito: true,
            accion: AccionIA.MARCAR_MINA,
            coordenadas,
            razon: 'Patrón 1-2-1 detectado',
            certeza: 0.95,
            tipo: this.tipo
          };
        }
      }
    }

    this.registrarAplicacion(false);
    return { exito: false, coordenadas: [], razon: '', certeza: 0, tipo: this.tipo };
  }
}