/**
 * Controlador del Juego - Gestiona el flujo completo
 */

import { GrafoTablero, NodoGrafo } from "./grafo";
import { MotorInferencia } from "./motor";
import {
  ConfiguracionJuego,
  EstadoCasilla,
  AccionIA,
  ResultadoInferencia,
} from "./tipos";

export const EstadoJuego = {
  NO_INICIADO: "NO_INICIADO",
  EN_CURSO: "EN_CURSO",
  GANADO: "GANADO",
  PERDIDO: "PERDIDO",
} as const;

export type EstadoJuego = (typeof EstadoJuego)[keyof typeof EstadoJuego];

export class ControladorJuego {
  grafo: GrafoTablero | null = null;
  motor: MotorInferencia | null = null;
  estado: EstadoJuego = EstadoJuego.NO_INICIADO;
  primerMovimiento: boolean = true;
  movimientosTotales: number = 0;
  casillasReveladas: number = 0;
  minasMarcadas: number = 0;

  iniciarJuego(config: ConfiguracionJuego): void {
    this.grafo = new GrafoTablero(config.filas, config.columnas);
    this.grafo.colocarMinas(config.minas);
    this.motor = new MotorInferencia(this.grafo);

    this.estado = EstadoJuego.EN_CURSO;
    this.primerMovimiento = true;
    this.movimientosTotales = 0;
    this.casillasReveladas = 0;
    this.minasMarcadas = 0;
  }

  ejecutarPasoIA(): { exito: boolean; mensaje: string; info: object } | null {
    if (!this.grafo || !this.motor || this.estado !== EstadoJuego.EN_CURSO) {
      return null;
    }

    if (this.primerMovimiento) {
      return this.primerMovimientoSeguro();
    }

    const resultado = this.motor.ejecutarCicloCompleto();

    if (!resultado || !resultado.exito) {
      return {
        exito: false,
        mensaje: "No hay movimientos disponibles",
        info: {},
      };
    }

    const { exito, mensaje } = this.aplicarResultado(resultado);

    this.movimientosTotales++;
    this.verificarEstadoJuego();

    return {
      exito,
      mensaje,
      info: {
        tipo: resultado.tipo,
        certeza: resultado.certeza,
        razon: resultado.razon,
        nodosAfectados: resultado.coordenadas.length,
      },
    };
  }

  private primerMovimientoSeguro(): {
    exito: boolean;
    mensaje: string;
    info: object;
  } {
    if (!this.grafo) return { exito: false, mensaje: "Error", info: {} };

    for (const nodo of this.grafo.obtenerTodosNodos()) {
      if (nodo.numeroAdyacente === 0 && !nodo.tieneMina) {
        this.revelarCasilla(nodo.fila, nodo.columna);
        this.primerMovimiento = false;

        return {
          exito: true,
          mensaje: `Primer movimiento: (${nodo.fila},${nodo.columna}) con propagación`,
          info: {
            tipo: "PRIMER_MOVIMIENTO",
            certeza: 1.0,
            razon: "Casilla con 0 minas cercanas",
            nodosAfectados: this.casillasReveladas,
          },
        };
      }
    }

    const esquinas = [
      { fila: 0, columna: 0 },
      { fila: 0, columna: this.grafo.columnas - 1 },
      { fila: this.grafo.filas - 1, columna: 0 },
      { fila: this.grafo.filas - 1, columna: this.grafo.columnas - 1 },
    ];

    for (const coord of esquinas) {
      const nodo = this.grafo.obtenerNodo(coord.fila, coord.columna);
      if (nodo && !nodo.tieneMina) {
        this.revelarCasilla(coord.fila, coord.columna);
        this.primerMovimiento = false;

        return {
          exito: true,
          mensaje: `Primer movimiento: esquina (${coord.fila},${coord.columna})`,
          info: {
            tipo: "HEURISTICA",
            certeza: 0.7,
            razon: "Heurística: esquina",
            nodosAfectados: 1,
          },
        };
      }
    }

    return { exito: false, mensaje: "Error", info: {} };
  }

  private aplicarResultado(resultado: ResultadoInferencia): {
    exito: boolean;
    mensaje: string;
  } {
    const mensajes: string[] = [];

    for (const coord of resultado.coordenadas) {
      if (resultado.accion === AccionIA.REVELAR) {
        const { exito, mensaje } = this.revelarCasilla(
          coord.fila,
          coord.columna
        );
        mensajes.push(mensaje);

        if (!exito && this.estado === EstadoJuego.PERDIDO) {
          return { exito: false, mensaje };
        }
      } else if (resultado.accion === AccionIA.MARCAR_MINA) {
        const { mensaje } = this.marcarMina(coord.fila, coord.columna);
        mensajes.push(mensaje);
      }
    }

    const mensajeFinal = `${resultado.razon} | ${mensajes.join(" | ")}`;
    return { exito: true, mensaje: mensajeFinal };
  }

  revelarCasilla(
    fila: number,
    columna: number
  ): { exito: boolean; mensaje: string } {
    if (!this.grafo) return { exito: false, mensaje: "Error" };

    const nodo = this.grafo.obtenerNodo(fila, columna);
    if (!nodo) return { exito: false, mensaje: "Coordenadas inválidas" };

    if (nodo.estado === EstadoCasilla.REVELADA) {
      return { exito: false, mensaje: `(${fila},${columna}) ya revelada` };
    }

    if (nodo.tieneMina) {
      nodo.estado = EstadoCasilla.EXPLOSIONADA;
      this.estado = EstadoJuego.PERDIDO;
      return { exito: false, mensaje: `💥 Explosión en (${fila},${columna})` };
    }

    nodo.estado = EstadoCasilla.REVELADA;
    this.casillasReveladas++;

    if (nodo.numeroAdyacente === 0) {
      const propagadas = this.propagarRevelacion(nodo);
      return {
        exito: true,
        mensaje: `(${fila},${columna}) [0] +${propagadas} propagadas`,
      };
    }

    return {
      exito: true,
      mensaje: `(${fila},${columna}) [${nodo.numeroAdyacente}]`,
    };
  }

  private propagarRevelacion(nodo: NodoGrafo): number {
    let propagadas = 0;

    for (const vecino of nodo.vecinos) {
      if (vecino.estado === EstadoCasilla.DESCONOCIDA && !vecino.tieneMina) {
        vecino.estado = EstadoCasilla.REVELADA;
        this.casillasReveladas++;
        propagadas++;

        if (vecino.numeroAdyacente === 0) {
          propagadas += this.propagarRevelacion(vecino);
        }
      }
    }

    return propagadas;
  }

  marcarMina(
    fila: number,
    columna: number
  ): { exito: boolean; mensaje: string } {
    if (!this.grafo) return { exito: false, mensaje: "Error" };

    const nodo = this.grafo.obtenerNodo(fila, columna);
    if (!nodo) return { exito: false, mensaje: "Coordenadas inválidas" };

    if (nodo.estado !== EstadoCasilla.DESCONOCIDA) {
      return {
        exito: false,
        mensaje: `(${fila},${columna}) no se puede marcar`,
      };
    }

    nodo.estado = EstadoCasilla.MARCADA;
    this.minasMarcadas++;

    const correcto = nodo.tieneMina ? "✓" : "✗";
    return {
      exito: true,
      mensaje: `🚩 Marcada (${fila},${columna}) [${correcto}]`,
    };
  }

  private verificarEstadoJuego(): void {
    if (!this.grafo) return;

    const totalCasillas = this.grafo.filas * this.grafo.columnas;
    const casillasSinMina = totalCasillas - this.grafo.totalMinas;

    if (this.casillasReveladas >= casillasSinMina) {
      this.estado = EstadoJuego.GANADO;
    }
  }

  revelarManual(
    fila: number,
    columna: number
  ): { exito: boolean; mensaje: string } {
    if (this.estado !== EstadoJuego.EN_CURSO) {
      return { exito: false, mensaje: "El juego ha terminado" };
    }

    this.primerMovimiento = false;
    const resultado = this.revelarCasilla(fila, columna);
    this.verificarEstadoJuego();

    return resultado;
  }

  marcarManual(
    fila: number,
    columna: number
  ): { exito: boolean; mensaje: string } {
    if (this.estado !== EstadoJuego.EN_CURSO) {
      return { exito: false, mensaje: "El juego ha terminado" };
    }

    return this.marcarMina(fila, columna);
  }
}
