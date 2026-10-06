// Textos del onboarding. Cada paso del recorrido apunta a un elemento existente
// de app/page.tsx marcado con data-tour="<id>"; los pasos sin elemento visible se omiten.

export interface PasoRecorrido {
  id: string;
  titulo: string;
  texto: string;
}

export const PASOS_RECORRIDO: PasoRecorrido[] = [
  {
    id: "vistas",
    titulo: "Vistas del programa",
    texto: "Cambia entre la vista completa, solo las gráficas o las comparaciones de nodos e irradiancia. Tus datos se conservan al cambiar de vista.",
  },
  {
    id: "ubicacion",
    titulo: "1 · Ubicación",
    texto: "Elige estado y municipio. Con ellos se cargan también los nodos disponibles para consultar precios.",
  },
  {
    id: "periodo",
    titulo: "2 · Período de tiempo",
    texto: "Define el rango de fechas a consultar. Las fechas de precios se sincronizan con este período.",
  },
  {
    id: "mapa",
    titulo: "Punto exacto",
    texto: "Busca una dirección o haz clic directamente en el mapa para fijar la latitud y longitud del proyecto.",
  },
  {
    id: "consultar-irradiancia",
    titulo: "Irradiancia solar",
    texto: "Revisa el resumen y consulta la irradiancia horaria de NASA POWER para el punto y período elegidos.",
  },
  {
    id: "nodo",
    titulo: "3 · Nodo y precios",
    texto: "Selecciona un nodo del municipio y consulta su Precio Marginal Local en el Mercado de Día en Adelanto (MDA).",
  },
  {
    id: "sistema",
    titulo: "4 · Sistema fotovoltaico",
    texto: "Captura la capacidad instalada, la eficiencia global y el tipo de cambio. Estos valores alimentan todos los cálculos.",
  },
  {
    id: "anual",
    titulo: "5 · Generación e ingresos",
    texto: "Consulta el año completo para obtener generación, ingresos mensuales, costo de instalación y años de retorno de la inversión.",
  },
  {
    id: "inclinacion",
    titulo: "6 · Inclinación y orientación",
    texto: "Recomendaciones de inclinación anual y estacional de los paneles, calculadas a partir de la latitud.",
  },
  {
    id: "distancia",
    titulo: "7 · Distancia entre hileras",
    texto: "Calcula la separación mínima para evitar sombras entre filas de paneles. Al final podrás generar el reporte PDF.",
  },
  {
    id: "ayuda",
    titulo: "Ayuda siempre disponible",
    texto: "Pulsa ? para ver qué hace cada vista o repetir este recorrido. Los íconos ? junto a cada sección explican su contenido.",
  },
];

export const AYUDA_VISTAS: Record<string, { titulo: string; texto: string }> = {
  normal: {
    titulo: "Vista normal",
    texto: "El análisis completo: a la izquierda la ubicación y la irradiancia solar; a la derecha el nodo y sus precios; debajo, los parámetros del sistema y los resultados de factibilidad.",
  },
  graficas: {
    titulo: "Ver solo gráficas",
    texto: "Muestra a mayor tamaño las gráficas de irradiancia y de precios que ya consultaste en la vista normal.",
  },
  "comparar-nodos": {
    titulo: "Comparar nodos",
    texto: "Consulta los precios de dos nodos lado a lado. Usa una ubicación compartida o elige estado y municipio por separado para cada nodo.",
  },
  "comparar-irradiancia": {
    titulo: "Comparar irradiancia",
    texto: "Compara la irradiancia solar de dos ubicaciones, cada una con su propio mapa y período de consulta.",
  },
};

export const AYUDA_SECCIONES = {
  ubicacion: "Estado y municipio del proyecto. Definen los nodos de precios disponibles y centran la búsqueda de dirección.",
  periodo: "Rango de fechas para la consulta de irradiancia horaria. Las fechas de precios se sincronizan con él.",
  nodo: "Nodo del sistema eléctrico más cercano al proyecto. Su Precio Marginal Local determina cuánto vale cada kWh generado.",
  sistema: "Capacidad instalada (kW), eficiencia global del sistema (pérdidas incluidas) y tipo de cambio usado para el costo de instalación.",
  anual: "Usa un año completo de irradiancia y precios MDA para estimar generación, ingresos y años de retorno de la inversión.",
  inclinacion: "Ángulos recomendados para los paneles según la latitud. Son recomendaciones geométricas; no cambian el cálculo de generación.",
  distancia: "Separación mínima entre filas para que una hilera no sombree a la siguiente en el día más desfavorable del año.",
  perdidas: "Factores típicos que reducen la energía aprovechable y justifican la eficiencia configurada en el paso 4.",
} as const;
