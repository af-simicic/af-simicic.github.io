---
title: "INDEX + MATCH vs VLOOKUP: cuándo y por qué importa la diferencia"
date: 2026-04-24
categories: ["data-science"]
tags: ["excel", "analisis", "funciones"]
summary: "Más que una comparación de funciones, una exploración de cómo pensar en lookups bidireccionales."
related: ["base-conocimiento-llm"]
---

Aunque XLOOKUP llegó para estandarizar las búsquedas en herramientas modernas, entender la composición de `INDEX` y `MATCH` desarrolla intuición estructural sobre matrices bidimensionales que trasciende cualquier función específica.

## El problema con VLOOKUP

`VLOOKUP` asume que la clave de búsqueda está en la **primera columna** del rango. Esta limitación obliga a reorganizar datos o crear columnas auxiliares, rompiendo la inmutabilidad de la fuente de datos crudos.

Además, el argumento de número de columna es un valor hardcodeado y frágil: si insertás una columna en el medio, la fórmula devuelve el valor equivocado sin avisar.

```
=VLOOKUP(A2, $D$2:$G$100, 3, 0)
```

## La abstracción de INDEX + MATCH

La composición separa la lógica en dos responsabilidades claras:

- `MATCH` encuentra la **posición relativa** (índice 1D) del elemento buscado en un vector.
- `INDEX` recupera el valor de una matriz en las coordenadas que le pasamos.

```
=INDEX(Columna_Retorno, MATCH(Valor_Buscado, Columna_Búsqueda, 0))
```

Esta separación permite **lookups bidireccionales**: podés buscar tanto por filas como por columnas simultáneamente.

```
=INDEX(B2:E10, MATCH(H2, A2:A10, 0), MATCH(I2, B1:E1, 0))
```

{{< nota >}}
El tercer argumento `0` en `MATCH` indica búsqueda exacta. Usá `1` o `-1` solo cuando el rango esté ordenado y quieras coincidencia aproximada.
{{< /nota >}}

## Por qué importa hoy

Incluso si usás XLOOKUP en el día a día, la mentalidad de `INDEX + MATCH` — separar "dónde está" de "qué devuelvo" — es directamente aplicable en pandas, SQL y cualquier sistema de lookups en tablas relacionales.

{{< tip >}}
En pandas, la equivalencia es `df.loc[df['col'] == valor, 'col_retorno']`. Misma lógica, diferente sintaxis.
{{< /tip >}}
