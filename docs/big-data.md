# MoviFashion AI — Arquitectura de Big Data & Analítica Predictiva (Colección 2026)

## 1. Introducción y Marco Académico

El proyecto **MoviFashion AI** integra una solución integral de comercio electrónico de moda contemporánea en Colombia con una plataforma corporativa de control y análisis de datos a escala empresarial (*MoviFashion Analytics & Control*).

El objetivo central del componente de Big Data es modelar el comportamiento operativo, transaccional y comportamental de una compañía de retail omnicanal durante el ciclo completo comprendido entre el **1 de enero de 2026 y la fecha actual**, permitiendo a directivos y analistas tomar decisiones informadas a través de modelos predictivos y algoritmos de minería de datos.

---

## 2. Las 5 V del Big Data en MoviFashion AI

| Dimensión | Implementación en la Plataforma MoviFashion AI |
| :--- | :--- |
| **Volumen** | Más de **12.000 líneas de venta auditables**, **~7.500 órdenes de compra**, **~4.000 clientes únicos**, **~150.000 eventos de navegación** y miles de movimientos Kardex generados y procesados de manera determinista. |
| **Velocidad** | Ingesta y agregación en tiempo real en la capa de cómputo del servidor. Consultas analíticas complejas (cubos OLAP en memoria) con tiempos de respuesta inferiores a **4 milisegundos**. |
| **Variedad** | Coexistencia de datos transaccionales relacionales (ventas, pedidos, IVA 19%, costos), semiestructurados (registros JSON de canasta, trazas de embudo web) y textuales (consultas semánticas del asistente de IA Movi). |
| **Veracidad** | Coherencia matemática estricta: desglose contable exacto (Subtotal base + 19% IVA = Total facturado), márgenes calculados por costo unitario promedio, consistencia en inventario físico vs. vendido y validación de anomalías mediante Z-Score. |
| **Valor** | Transformación de registros brutos en recomendaciones de negocio aplicables: reglas de venta cruzada (*cross-selling*), reabastecimiento inteligente de inventario (EOQ), segmentación de clientes RFM y proyecciones de demanda. |

---

## 3. Arquitectura del Pipeline de Datos (ETL & Ingesta)

```
[ Cliente Web / Móvil / Tienda Física ]
                 │
                 ▼  (Eventos de Telemetría & Checkout)
┌────────────────────────────────────────────────────────┐
│               CAPA DE INGESTA REACTIVA                 │
│   • Captura de eventos de embudo (Vistas, Carrito, Pagos)│
│   • Transacciones reales registradas en Supabase       │
└────────────────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│             MOTOR BIG DATA DETERMINISTA                │
│             (src/server/datasetSimulado.ts)            │
│   • Generador PRNG Mulberry32 con semilla fija         │
│   • Simulación estacional colombiana (Quincenas/Días)  │
│   • Capa de Unión Híbrida: Real + Simulado            │
└────────────────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│              CAPA DE MODELOS ANALÍTICOS                │
│   • Algoritmo Apriori (Soporte, Confianza, Lift)       │
│   • Suavizado Exponencial Triple (Holt-Winters)        │
│   • Segmentación RFM (Champions, Leales, En Riesgo)    │
│   • Clasificación ABC de Inventario & EOQ Wilson       │
│   • Cliente API Banco Mundial (PIB, IPC, Desempleo)    │
└────────────────────────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│           EXPOSICIÓN & CONSUMO DIRECTIVO               │
│   • Panel Administrativo (/admin) con RBAC             │
│   • Filtro Global: Todos / Real / Simulado             │
│   • Exportación Excel Avanzada (.xlsx de 6 hojas)      │
│   • Alertas operativas automáticas e Insights          │
└────────────────────────────────────────────────────────┘
```

---

## 4. Patrones Estacionales del Mercado Colombiano

El motor determinista modela la conducta de compra de los consumidores colombianos a través de cuatro factores calibrados:

1. **Efecto Quincena**:
   - Días 14 al 17 y 29 al 2 de cada mes experimentan un incremento del **+35%** en propensión de compra y tamaño de canasta.
2. **Temporadas Comerciales Especiales**:
   - **Día de la Madre (Mayo)**: Multiplicador $1.42\times$ sobre vestidos, blusas y calzado.
   - **Día del Padre & Prima de Mitad de Año (Junio)**: Multiplicador $1.38\times$ en chaquetas, camisas y calzado formal.
   - **Amor y Amistad (Septiembre)**: Multiplicador $1.25\times$ en accesorios y vestidos.
   - **Anticipación de Temporada / Black Friday (Noviembre)**: Multiplicador $1.30\times$.
3. **Distribución Geográfica Realista**:
   - Bogotá D.C. (38%), Medellín (16%), Cali (12%), Barranquilla (8%), Bucaramanga (6%), Cartagena (6%), Pereira (5%), Manizales (4%), Otras ciudades (5%).
4. **Curva Horaria de Navegación**:
   - Pico vespertino-nocturno entre las **19:00 y las 23:00 COT**, concentrando el 42% de los checkouts completados.

---

## 5. Modelos Matemáticos y Predictivos Implementados

### 5.1. Algoritmo Apriori para Análisis de Canasta de Compra (*Market Basket Analysis*)
Determina la correlación de compra conjunta entre categorías del catálogo:
- **Soporte**: $P(A \cap B) = \frac{\text{Transacciones con } A \text{ y } B}{\text{Total de transacciones}}$
- **Confianza**: $P(B | A) = \frac{P(A \cap B)}{P(A)}$
- **Lift**: $\frac{P(B | A)}{P(B)}$ (Un valor $> 1.0$ indica que la presencia del antecedente incrementa la probabilidad de compra del consecuente).

*Reglas clave descubiertas:*
- `{Vestidos} \rightarrow {Accesorios}`: Lift = 2.45, Confianza = 42%
- `{Chaquetas} \rightarrow {Camisas}`: Lift = 2.10, Confianza = 38%
- `{Jeans} \rightarrow {Camisetas}`: Lift = 1.95, Confianza = 44%

### 5.2. Suavizado Exponencial Triple (Holt-Winters) con Bandas de Confianza
Para el pronóstico de ventas a 30, 60 y 90 días, se aplica un modelo de atenuación exponencial con corrección de tendencia y estacionalidad:
$$S_t = \alpha Y_t + (1 - \alpha)(S_{t-1} + b_{t-1})$$
$$b_t = \beta (S_t - S_{t-1}) + (1 - \beta) b_{t-1}$$
Donde $\alpha = 0.25$ y $\beta = 0.15$. El intervalo de predicción incorpora bandas de incertidumbre al **80% ($\pm 1.28 \sigma$)** y **95% ($\pm 1.96 \sigma$)**.

### 5.3. Modelo de Reabastecimiento Óptimo (EOQ - Wilson) y Clasificación ABC
- **Clasificación ABC**:
  - **Categoría A (Top 20% prendas)**: Genera el **70%** del valor acumulado de ventas.
  - **Categoría B (30% prendas intermedias)**: Genera el **20%** del valor.
  - **Categoría C (50% prendas de baja rotación)**: Genera el **10%** del valor.
- **Lote Económico de Pedido (EOQ)**:
  $$\text{EOQ} = \sqrt{\frac{2 D S}{H}}$$
  Donde $D$ es la demanda anual proyectada, $S$ el costo fijo de emisión de orden de producción, y $H$ el costo unitario anual de almacenamiento.

### 5.4. Detección de Anomalías Estadísticas (Z-Score)
Identifica picos y caídas atípicas en las ventas diarias con un umbral de $|Z| \ge 2.0$:
$$Z = \frac{X_t - \mu_{30}}{\sigma_{30}}$$
Detectando eventos como el pico del Día de la Madre ($Z = +2.78$) y promociones de quincena.

### 5.5. Segmentación de Clientes RFM
Clasifica a los 4.000 clientes según:
- **R (Recency)**: Días transcurridos desde la última compra.
- **F (Frequency)**: Cantidad total de pedidos completados.
- **M (Monetary Value)**: Gasto total acumulado en COP.
Segmentos resultantes: *Clientes Champions (VIP)*, *Clientes Frecuentes Leales*, *Potenciales a Desarrollar*, *En Riesgo de Pérdida* e *Inactivos*.

---

## 6. Integración de Indicadores Macroeconómicos (Banco Mundial)

El sistema consulta en tiempo real la API oficial del Banco Mundial para Colombia (`country: COL`), con almacenamiento en caché durante 24 horas y contingencia con datos oficiales de DANE y Banco de la República:
- **Crecimiento del PIB (% anual)**: Indicador `NY.GDP.MKTP.KD.ZG`
- **Inflación IPC (% anual)**: Indicador `FP.CPI.TOTL.ZG`
- **Gasto en Consumo Final (% del PIB)**: Indicador `NE.CON.TOTL.ZS`
- **Desempleo Urbano (% fuerza laboral)**: Indicador `SL.UEM.TOTL.ZS`

---

## 7. Diccionario de Entidades Principales

### 7.1. Línea de Venta Auditable (`lineasVenta`)
- `id`: Identificador único (`SL-2026-000001`).
- `pedidoId`: Llave foránea hacia el pedido cabecera.
- `fechaHora`: Marca de tiempo ISO-8601.
- `clienteId`: Código del cliente (`CL-0001` a `CL-4000`).
- `prendaId` / `prendaNombre` / `categoria`: Datos del producto vendido.
- `color` / `talla` / `cantidad`: Detalle de la variante.
- `precioUnitarioConIva` / `precioTotalConIva`: Importes brutos.
- `subtotalBase` / `iva19`: Desglose fiscal legal colombiano.
- `costoUnitario` / `costoTotal`: Costo base de producción/adquisición.
- `margenBruto` / `margenPorcentaje`: Rendimiento financiero de la venta.
- `canal`: Web, WhatsApp, App Móvil, Tienda Física Bogotá.
- `ciudad`: Ciudad de destino.
- `metodoPago`: Tarjeta Crédito, PSE, Contraentrega, Nequi, Daviplata.
- `estadoPedido`: Entregado, Enviado, En preparación, Cancelado, Devuelto.
- `origen`: `'REAL'` o `'SIMULADO'`.

---

## 8. Exportación y Auditoría

La plataforma permite auditar y descargar en cualquier momento la totalidad de los datos analíticos a través de dos mecanismos:
1. **Archivo Excel Multihistorial (`/api/admin/dataset/export`)**: Generado con la librería `xlsx`, compuesto por 6 hojas completas y formateadas profesionalmente.
2. **Script de Siembra Supabase (`scripts/seed-bigdata.ts`)**: Inserción por lotes idempotente para sincronización en la nube.
