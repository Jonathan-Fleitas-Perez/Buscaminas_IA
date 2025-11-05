import type { EstadoCasilla} from './tipos';
import { EstadoCasilla as EstadoCasillaEnum } from './tipos';

export class NodoGrafo {
  fila: number;
  columna: number;
  estado: EstadoCasilla;
  tieneMina: boolean;
  numeroAdyacente: number;
  vecinos: NodoGrafo[];
  probabilidadMina: number;

  constructor(fila: number, columna: number) {
    this.fila = fila;
    this.columna = columna;
    this.estado = EstadoCasillaEnum.DESCONOCIDA;
    this.tieneMina = false;
    this.numeroAdyacente = 0;
    this.vecinos = [];
    this.probabilidadMina = 0;
  }

  getId(): string {
    return `${this.fila}-${this.columna}`;
  }

  obtenerVecinosPorEstado(estado: EstadoCasilla): NodoGrafo[] {
    return this.vecinos.filter(v => v.estado === estado);
  }

  contarVecinosPorEstado(estado: EstadoCasilla): number {
    return this.obtenerVecinosPorEstado(estado).length;
  }

  obtenerMinasRestantes(): number {
    const marcadas = this.contarVecinosPorEstado(EstadoCasillaEnum.MARCADA);
    return this.numeroAdyacente - marcadas;
  }

  obtenerEspaciosLibres(): number {
    return this.contarVecinosPorEstado(EstadoCasillaEnum.DESCONOCIDA);
  }
}

export class GrafoTablero {
  filas: number;
  columnas: number;
  nodos: NodoGrafo[][];
  totalMinas: number;

  constructor(filas: number, columnas: number) {
    this.filas = filas;
    this.columnas = columnas;
    this.nodos = [];
    this.totalMinas = 0;
    this.construirGrafo();
  }

  private construirGrafo(): void {
    // Crear nodos
    for (let f = 0; f < this.filas; f++) {
      this.nodos[f] = [];
      for (let c = 0; c < this.columnas; c++) {
        this.nodos[f][c] = new NodoGrafo(f, c);
      }
    }

    // Conectar vecinos (8 direcciones)
    for (let f = 0; f < this.filas; f++) {
      for (let c = 0; c < this.columnas; c++) {
        const nodo = this.nodos[f][c];
        
        for (let df = -1; df <= 1; df++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (df === 0 && dc === 0) continue;
            
            const nf = f + df;
            const nc = c + dc;
            
            if (nf >= 0 && nf < this.filas && nc >= 0 && nc < this.columnas) {
              nodo.vecinos.push(this.nodos[nf][nc]);
            }
          }
        }
      }
    }
  }

  obtenerNodo(fila: number, columna: number): NodoGrafo | null {
    if (fila >= 0 && fila < this.filas && columna >= 0 && columna < this.columnas) {
      return this.nodos[fila][columna];
    }
    return null;
  }

  obtenerTodosNodos(): NodoGrafo[] {
    return this.nodos.flat();
  }

  obtenerNodosFrontera(): NodoGrafo[] {
    const frontera: NodoGrafo[] = [];
    
    for (const nodo of this.obtenerTodosNodos()) {
      if (nodo.estado === EstadoCasillaEnum.DESCONOCIDA) {
        const tieneVecinoRevelado = nodo.vecinos.some(
          v => v.estado === EstadoCasillaEnum.REVELADA
        );
        if (tieneVecinoRevelado) {
          frontera.push(nodo);
        }
      }
    }
    
    return frontera;
  }

  colocarMinas(numeroMinas: number): void {
    this.totalMinas = numeroMinas;
    const todosNodos = this.obtenerTodosNodos();
    const nodosAleatorios = [...todosNodos].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < numeroMinas && i < nodosAleatorios.length; i++) {
      nodosAleatorios[i].tieneMina = true;
    }

    this.calcularNumerosAdyacentes();
  }

  private calcularNumerosAdyacentes(): void {
    for (const nodo of this.obtenerTodosNodos()) {
      if (!nodo.tieneMina) {
        nodo.numeroAdyacente = nodo.vecinos.filter(v => v.tieneMina).length;
      }
    }
  }
}