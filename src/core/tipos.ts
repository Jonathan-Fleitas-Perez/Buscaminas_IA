export const EstadoCasilla = {
  DESCONOCIDA: 'DESCONOCIDA',
  REVELADA: 'REVELADA',
  MARCADA: 'MARCADA',
  EXPLOSIONADA: 'EXPLOSIONADA'
} as const;

export type EstadoCasilla = typeof EstadoCasilla[keyof typeof EstadoCasilla];

export const TipoInferencia = {
  LOGICA_DETERMINISTA: 'LOGICA_DETERMINISTA',
  PATRON_RECONOCIDO: 'PATRON_RECONOCIDO',
  RED_BAYESIANA: 'RED_BAYESIANA',
  HEURISTICA: 'HEURISTICA'
} as const;

export type TipoInferencia = typeof TipoInferencia[keyof typeof TipoInferencia];

export const AccionIA = {
  REVELAR: 'REVELAR',
  MARCAR_MINA: 'MARCAR_MINA'
} as const;

export type AccionIA = typeof AccionIA[keyof typeof AccionIA];

export interface Coordenada {
  fila: number;
  columna: number;
}

export interface ConfiguracionJuego {
  filas: number;
  columnas: number;
  minas: number;
}

export interface ResultadoInferencia {
  exito: boolean;
  accion?: AccionIA;
  coordenadas: Coordenada[];
  razon: string;
  certeza: number;
  tipo: TipoInferencia;
}

export interface EstadisticasMotor {
  movimientosTotales: number;
  certezaPromedio: number;
  tiposInferenciaUsados: Map<TipoInferencia, number>;
  tasaExitoReglas: Map<string, number>;
}

export interface ProbabilidadCasilla {
  coordenada: Coordenada;
  probabilidad: number;
}

export const NIVELES = {
  FACIL: { nombre: 'Fácil', filas: 8, columnas: 8, minas: 10 },
  MEDIO: { nombre: 'Medio', filas: 16, columnas: 16, minas: 40 },
  DIFICIL: { nombre: 'Difícil', filas: 16, columnas: 30, minas: 99 }
} as const;

export type NivelJuego = keyof typeof NIVELES;