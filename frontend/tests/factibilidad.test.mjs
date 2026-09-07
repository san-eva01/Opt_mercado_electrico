import { test } from 'node:test';
import assert from 'node:assert/strict';
import { unirDatosAnuales, agruparMeses, agruparDias, calcularSeparacion } from '../lib/factibilidad.ts';

test('suma productos horarios, conserva precios negativos y no promedia por semana', () => {
  const solar = [
    { datetime: '2024-01-01 00:00', ALLSKY_SFC_SW_DWN: 0.2 },
    { datetime: '2024-01-01 01:00', ALLSKY_SFC_SW_DWN: 0.8 },
  ];
  const precios = [{ fecha: '2024-01-01', hora: 1, precio: -100 }, { fecha: '2024-01-01', hora: 2, precio: 1000 }];
  const datos = unirDatosAnuales(solar, precios, 2024, 100, 0.85);
  assert.equal(datos[0].generacion, 17);
  assert.equal(datos[0].ingreso, -1.7);
  assert.equal(datos[1].ingreso, 68);
  assert.equal(agruparMeses(datos)[0].ingreso, 66.3);
});

test('incluye 8784 horas y 29 días de febrero en un año bisiesto', () => {
  const solar = [], precios = [];
  for (let t = Date.UTC(2024, 0, 1); t < Date.UTC(2025, 0, 1); t += 3600000) {
    const date = new Date(t).toISOString();
    solar.push({ datetime: date.slice(0, 16), ALLSKY_SFC_SW_DWN: 0.5 });
    precios.push({ fecha: date.slice(0, 10), hora: Number(date.slice(11, 13)), precio: 1000 });
  }
  const datos = unirDatosAnuales(solar, precios, 2024, 100, 0.85);
  assert.equal(datos.length, 8784);
  const mensual = agruparMeses(datos);
  assert.equal(mensual.length, 12);
  assert.equal(mensual[1].generacion, 29 * 24 * 42.5);
  assert.equal(mensual.reduce((s, r) => s + r.ingreso, 0), 8784 * 42.5);
  const antes = JSON.stringify(mensual);
  assert.equal(agruparDias(datos, 1, 2024).length, 29);
  assert.equal(agruparDias(datos, 0, 2024).length, 31);
  assert.equal(JSON.stringify(mensual), antes);
});

test('los datos faltantes no se convierten en horas válidas con ingreso cero', () => {
  const solar = [-999, -0.999, NaN, 0, 0.5].map((v, h) => ({ datetime: '2023-01-01 0' + h + ':00', ALLSKY_SFC_SW_DWN: v }));
  const precios = [0, 1, 2, 3].map((hora) => ({ fecha: '2023-01-01', hora, precio: 1000 }));
  assert.equal(unirDatosAnuales(solar, precios, 2023, 100, 0.85).length, 1);
  assert.equal(unirDatosAnuales(solar, [...precios, precios[0]], 2023, 100, 0.85).length, 1);
});

test('separación reactiva, latitud cero y fórmulas solicitadas', () => {
  const a = calcularSeparacion(23.5, 1, 23.5);
  const b = calcularSeparacion(23.5, 2, 23.5);
  assert.ok(a.H > 0 && a.d > 1);
  assert.equal(b.H, a.H);
  assert.equal(b.d, 2 * a.d);
  assert.equal(calcularSeparacion(0, 1, 0).d, 1);
  assert.notEqual(calcularSeparacion(-23.5, 1, 23.5).H, a.H);
});

test('precios iguales en días distintos conservan ambas horas y sus ingresos', () => {
  const solar = ['2024-05-01', '2024-05-02'].map(fecha => ({ datetime: fecha + ' 00:00', ALLSKY_SFC_SW_DWN: 0.5 }));
  const precios = ['2024-05-01', '2024-05-02'].map(fecha => ({ fecha, hora: 1, precio: 1000 }));
  const datos = unirDatosAnuales(solar, precios, 2024, 100, 0.85);
  assert.equal(datos.length, 2);
  assert.equal(agruparMeses(datos)[4].ingreso, 85);
});

test('copias idénticas de una fecha y hora no bloquean ni duplican ingresos', () => {
  const solar = [{ datetime: '2024-05-01 00:00', ALLSKY_SFC_SW_DWN: 0.5 }];
  for (const precio of [1000, 0, -100]) {
    const registro = { fecha: '2024-05-01', hora: 1, precio };
    const original = unirDatosAnuales(solar, [registro], 2024, 100, 0.85);
    assert.deepEqual(unirDatosAnuales(solar, [registro, { ...registro }, { ...registro }], 2024, 100, 0.85), original);
  }
});

test('precios distintos para una misma fecha y hora requieren resolver el conflicto', () => {
  const precios = [0, 1000].map(precio => ({ fecha: '2024-05-01', hora: 1, precio }));
  assert.throws(() => unirDatosAnuales([], precios, 2024, 100, 0.85), /Precios MDA distintos.*2024-05-01 00.*0 y 1000/);
});

test('eficiencia decimal 0.8 produce 80% de generación sin una segunda división', () => {
  const solar = [{ datetime: '2024-05-01 00:00', ALLSKY_SFC_SW_DWN: 0.5 }];
  const precios = [{ fecha: '2024-05-01', hora: 1, precio: 1000 }];
  const datos = unirDatosAnuales(solar, precios, 2024, 4500, 0.8);
  assert.equal(datos[0].generacion, 1800);
  assert.equal(datos[0].ingreso, 1800);
  assert.throws(() => unirDatosAnuales(solar, precios, 2024, 4500, 80), /factor entre 0 y 1/);
  assert.equal(unirDatosAnuales(solar, precios, 2024, 4500, 0)[0].generacion, 0);
  assert.equal(unirDatosAnuales(solar, precios, 2024, 4500, 1)[0].generacion, 2250);
});
