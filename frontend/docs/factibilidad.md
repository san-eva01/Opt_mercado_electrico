# Actualización del análisis fotovoltaico

La implementación completa está en `app/page.tsx`, `components/DiagramaPaneles.tsx` y `lib/factibilidad.ts`.

## Consultas anuales

`fetchFactibilidadAnual` consulta NASA POWER y MDA desde el 1 de enero al 31 de diciembre del año de `start`. Se ejecuta con **Consultar año completo** en el paso 5. Las consultas exploratorias anteriores conservan sus rangos y las vistas comparativas existentes.

El año se obtiene con `new Date(start).getUTCFullYear()`: para fechas HTML `YYYY-MM-DD`, `getFullYear()` puede convertir el 1 de enero en el 31 de diciembre del año anterior en México.

NASA recibe `start: YYYY0101` y `end: YYYY1231` por el endpoint existente. MDA usa filtros `gte/lte` y paginación hasta una página vacía, incluso si el límite configurado en Supabase es menor que el tamaño solicitado. Nunca se emplea MTR para el ROI.

Los registros se unen por fecha y hora, sin promedios semanales y sin redondear antes de sumar. Se normalizan las horas 1–24 a 0–23; también se admiten tablas ya normalizadas a 0–23. Las copias con la misma fecha, hora y precio MDA se cuentan una sola vez. Los precios iguales de fechas u horas distintas se conservan. Si una misma fecha y hora contiene precios diferentes, se informa el conflicto sin elegir o promediar arbitrariamente. La paginación ordena por fecha, hora y precio para estabilizar sus límites. Las horas sin irradiancia o precio válido no cuentan como cobertura. El ROI y el PDF requieren 8760 horas válidas (8784 para año bisiesto).

## Fórmulas preservadas

- Generación horaria (kWh) = irradiancia horaria (kWh/m²) × capacidad (kW) × eficiencia.
- Ingreso horario (MXN) = generación × precio MDA (MXN/MWh) / 1000.
- Costo de instalación (MXN) = (capacidad × 1000) × eficiencia × tipo de cambio (MXN/USD), según la fórmula indicada por el usuario.
- Retorno (años) = costo de instalación / suma del ingreso anual.

Si el ingreso anual es cero o negativo se muestra «Sin retorno». Los precios negativos son válidos y se incluyen en la suma. El backend existente ya divide el dato NASA entre 1000; el frontend no vuelve a convertirlo.

## Estados y memos nuevos

- `alturaPanel`, `mesSeleccionadoGeneracion`, `mesSeleccionadoIngreso`.
- `consultaAnual`, `loadingAnual`, `errorAnual`: datos y estado de la consulta anual independiente.
- `exportandoPDF`, `errorPDF`: estado de exportación y errores visibles.
- `datosFactibilidadAnual: DatoAnual[]`.
- `datosGeneracionMensual: DatoMensual[]` (12 meses, incluso sin datos).
- `ingresoTotalAnual: number`, `generacionTotalAnual: number`.
- `datosGeneracionDiaria: DatoDiario[]`, `datosIngresoDiario: DatoDiario[]`.
- `calculos`: costo, ingreso anual y retorno; sin dependencias de los selectores de mes.
- Memo de `orientation`, `tiltAnual`, `tiltVerano`, `tiltInvierno`, `tiltPromedio`.
- Memo de `{ H, d }`, dependiente de latitud, altura e inclinación anual.

`eficiencia` ahora inicia en `0.8` y siempre se maneja como factor de 0 a 1. El campo y el PDF muestran porcentajes (80%); solo el evento de entrada divide entre 100. Sigue siendo editable. La latitud cero es válida para los cálculos geométricos. El backend conserva su restricción geográfica existente a México.

## Eliminados

- Estado `semanaActiva` y su setter `setSemanaActiva`.
- Efecto que restablecía la semana activa al cambiar fechas.
- Memos `semanas`, `datosFactibilidad`, `totalSemana`, `ingresoTotalPeriodo`.
- Variables `ingresoMes`, `mesesPeriodo`, `multiplicador` del cálculo anterior.
- Flechas, etiquetas, textos y filas PDF correspondientes a semanas y extrapolación mensual.

## Imports añadidos

- `BarChart` y `Bar` desde `recharts`; `LineChart` se conserva para el detalle diario.
- `DiagramaPaneles` mediante `dynamic(() => import("../components/DiagramaPaneles"), { ssr: false })`.
- Constantes, agregadores, tipos y cálculo de separación desde `../lib/factibilidad`.
- Los imports dinámicos de `jspdf` y `dom-to-image-more` permanecen dentro de `generarPDF`, ahora sin `any`.

No se añadieron dependencias. La declaración `types/dom-to-image-more.d.ts` describe opciones, exportación por defecto y elementos SVG.

## Pasos 6–8 y PDF

El JSX de los pasos 6, 7 y 8 está inmediatamente después de las gráficas del paso 5. El diagrama recibe `beta={tiltAnual}`, `gammaSolar={H}`, `d={d}` y `b={alturaPanel}`. Los selectores de detalle son independientes y solo añaden la gráfica diaria debajo de cada resumen mensual.

`generarPDF` incluye, en orden: encabezado, parámetros con altura del panel, inclinaciones, distancia, diagrama, gráficas mensuales, desglose de 12 meses con total anual, resultados financieros y pies con números de página. Se comprueba la altura de cada fila e imagen antes de llegar a 270 mm; las tablas repiten encabezados si continúan en otra página. Una captura fallida muestra un error y no descarga un documento incompleto.

## Supuestos conservados del encargo

El cálculo de separación conserva exactamente declinación -23.45° y ángulo horario 37.5°, además del texto solicitado de las 10h solares. Ese ángulo no coincide con las 10:00 en la convención habitual de 15° por hora (corresponderían 30° de magnitud); confirmar este parámetro antes de utilizarlo para diseño definitivo. En la fórmula, `b` corresponde a la longitud inclinada del panel, aunque la etiqueta solicitada dice «Altura del panel».

La unión horaria conserva la base temporal del backend existente: NASA entrega LST por defecto. No se ha incorporado una conversión entre LST y la hora de operación del nodo, porque el proyecto no contiene metadatos de zona horaria del nodo. Referencias: [NASA POWER: Hourly API](https://power.larc.nasa.gov/docs/services/api/temporal/hourly/) y [CENACE: Manual técnico SW-PML](https://www.cenace.gob.mx/DocsMEM/2020-01-14%20Manual%20T%C3%A9cnico%20SW-PML.pdf).

## Verificación

Desde `frontend`:

```sh
npx tsc --noEmit
npm run lint -- --quiet
node --test tests/factibilidad.test.mjs
```

Las pruebas de Node requieren Node 24 (o una versión con soporte para ejecutar TypeScript sin transformación). Cubren agregación horaria, precios negativos, año bisiesto, datos faltantes, duplicados y geometría.

También se verificó en Edge con datos simulados de 2024: 8784 horas, paginación de 500 registros por respuesta, filtros independientes, ROI estable, diagrama reactivo, invalidación al cambiar el año y descarga del PDF de tres páginas. La prueba no valida la cobertura de datos de un nodo real.
