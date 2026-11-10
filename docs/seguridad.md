# MoviFashion AI — Documento de Seguridad y Endurecimiento (Pentesting)

Este documento detalla los controles técnicos implementados en la plataforma **MoviFashion AI** para superar pruebas de penetración (*pentesting*) y auditorías de seguridad, alineados con el estándar internacional **OWASP Top 10:2021**.

---

## 1. Matriz de Controles Técnicos vs. OWASP Top 10 (A01 – A10)

| Código OWASP | Categoría de Vulnerabilidad | Controles Implementados en MoviFashion AI | Verificación Realizada |
| :--- | :--- | :--- | :--- |
| **A01:2021** | **Control de Acceso Roto (Broken Access Control)** | • **Anti-IDOR Estricto**: Verificación de propiedad en `/api/orders/:id`, `/api/orders/mine` y `/api/pqrs/:radicado`. Un cliente solo puede ver sus propios registros; cualquier intento cruzado devuelve `403 Forbidden` y genera un log de auditoría.<br>• **Protección contra Asignación Masiva (*Mass Assignment*)**: El esquema Zod en `/api/auth/register` y `/api/users/profile` rechaza o descarta explícitamente atributos `role`, `permissions` o `is_admin`, forzando el rol `'cliente'`.<br>• **RBAC Servidor**: Las rutas del panel (`/api/admin/*`) validan permisos específicos con `requirePermission(...)` e impiden el acceso a clientes normales (código 403). | Se probó acceder al pedido de otro usuario con token de cliente; se obtuvo `403 Forbidden` y se registró evento `IDOR_BLOCKED`. Se intentó registrar usuario con `{ role: "admin" }` y el sistema forzó `role: "cliente"`. |
| **A02:2021** | **Fallas Criptográficas (Cryptographic Failures)** | • Hashing de contraseñas con **`scryptSync`** (sal aleatoria de 16 bytes, clave derivada de 64 bytes) y comparación en tiempo constante con **`timingSafeEqual`** para evitar ataques de canal lateral (*timing attacks*).<br>• Cookies de sesión configuradas con flags **`httpOnly: true`**, **`SameSite=Lax`**, y **`secure: true`** en entornos de producción (HTTPS).<br>• Encriptación en tránsito forzada mediante **HSTS** (`max-age=31536000; includeSubDomains; preload`). | Se auditó la cookie de sesión en el navegador; es inaccesible mediante JavaScript (`document.cookie`). Se validó que las cabeceras HTTP incluyen HSTS. |
| **A03:2021** | **Inyección (Injection: SQL, NoSQL, XSS)** | • **Consultas Parametrizadas**: Todas las consultas a Supabase PostgreSQL utilizan el SDK parametrizado (`.eq()`, `.select()`, `.insert()`), impidiendo inyecciones SQL.<br>• **Cero `dangerouslySetInnerHTML`**: Todo el frontend (incluyendo el formateo de negritas, enlaces y listas en el chat del asistente Movi) se renderiza usando elementos React puros y árboles DOM seguros.<br>• **Validación con Zod**: Todos los cuerpos de entrada (`login`, `register`, `contact`, `pqrs`, `orders`, `chat`) se validan con tipos estrictos antes de procesarse. | Auditoría completa con `grep` en `src/` confirma cero ocurrencias de `dangerouslySetInnerHTML`. Cargas útiles con caracteres `' OR '1'='1` en login y búsqueda son sanitizadas sin alterar las consultas. |
| **A04:2021** | **Diseño Inseguro (Insecure Design)** | • **Políticas de Inventario y Precios Lado Servidor**: El cálculo del subtotal, IVA (19%), descuentos y disponibilidad de stock en `/api/orders` se revalida exclusivamente en el backend, ignorando precios manipulados en el cliente.<br>• **Límite de Retracto Legal (Ley 1480)**: El botón y endpoint de devoluciones exige que la orden esté en estado entregada y dentro de los 5 días hábiles legales colombianos.<br>• **Honeypot Antispam**: Campos trampa ocultos (`hp`) en contacto y PQRS para descartar bots automatizados sin procesar cómputo. | Pruebas de compra alterando el precio en el payload JSON son ignoradas por el servidor, cobrando la tarifa oficial de base de datos. |
| **A05:2021** | **Configuración Errónea de Seguridad (Security Misconfiguration)** | • **Content Security Policy (CSP)** rigurosa que bloquea `object-src`, restringe `frame-ancestors 'self'`, permite Google Maps solo en iframes autorizados y conecta únicamente a Supabase, Gemini y Banco Mundial.<br>• **Cabeceras HTTP de Protección**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`.<br>• **Límite de Carga Útil**: `express.json({ limit: '2mb' })` para prevenir ataques de denegación de servicio por memoria (*Buffer Overflow / Memory Exhaustion*). | Escaneo de cabeceras HTTP mediante `curl -I` confirma la presencia de todas las cabeceras de seguridad requeridas. |
| **A06:2021** | **Componentes Vulnerables y Obsoletos** | • Dependencias actualizadas a versiones estables (React 19, Vite 8, Express 4, Zod 4, Supabase JS 2, Google GenAI SDK).<br>• `npm audit` integrado en el ciclo de integración continua sin vulnerabilidades críticas activas.<br>• Proceso de empaquetado optimizado mediante `esbuild` para el runtime de Vercel/Node.js. | Verificación de dependencias en `package.json` y compilación limpia con `npm run build:api`. |
| **A07:2021** | **Fallas de Identificación y Autenticación** | • **Anti-Enumeración de Usuarios**: Mensaje de error unificado e idéntico (`"Correo electrónico o contraseña incorrectos."`) tanto si el usuario no existe como si la clave es errónea.<br>• **Bloqueo Temporal de Cuenta (*Account Lockout*)**: Tras 5 intentos consecutivos fallidos por IP/correo, la cuenta entra en suspensión temporal de 15 minutos (código 429).<br>• **Revocación Inmediata de Sesiones**: Lista negra en memoria de tokens revocados (`revokedTokens`) y revocación en cascada cuando el administrador suspende, resetea o elimina una cuenta.<br>• **Autenticación en Dos Pasos (2FA/TOTP)**: Soporte nativo para personal con secretos HMAC-SHA1 y códigos de 6 dígitos. | Se ejecutaron 5 intentos fallidos intencionales con curl; en el sexto intento el servidor respondió 429 con mensaje de bloqueo por 15 minutos. Al cerrar sesión, el token anterior es rechazado. |
| **A08:2021** | **Fallas de Integridad de Software y Datos** | • **Validación Binaria de Archivos Subidos**: En `/api/admin/upload-image`, no se confía en el encabezado MIME del cliente. Se analizan los *Magic Bytes* binarios (`FF D8 FF` para JPEG, `89 50 4E 47` para PNG, `RIFF...WEBP` para WEBP).<br>• **Nombres Aleatorios Criptográficos**: Los archivos se renombran con `crypto.randomBytes(16)` impidiendo ataques de *Path Traversal* (`../../`). Límite estricto de 5 MB.<br>• **Verificación CSRF de Origen**: Todas las mutaciones de datos (`POST`, `PUT`, `PATCH`, `DELETE`) validan el encabezado `Origin` o `Referer` contra el host y dominios autorizados. | Subida de scripts camuflados como imágenes (`shell.php` o archivos `.exe` con extensión `.jpg`) son rechazados con 400 por no coincidir la firma binaria. |
| **A09:2021** | **Fallas de Registro y Monitoreo de Seguridad** | • **Pista de Auditoría Completa (`app_audit_logs`)**: Registro persistente en Supabase y memoria de eventos críticos: `AUTH_LOGIN`, `AUTH_FAILED`, `AUTH_LOCKOUT`, `IDOR_BLOCKED`, `CSRF_BLOCKED`, `VALIDATION_FAILED`, `RATE_LIMIT_EXCEEDED` y `ROLE_CHECK`.<br>• Módulo visual en el panel administrativo (`/admin` $\rightarrow$ Módulo 18 "Auditoría y Seguridad") para supervisión en tiempo real por oficiales de seguridad. | Se provocó un intento de acceso no autorizado y se verificó inmediatamente su aparición en la tabla de auditoría con IP, fecha, severidad y motivo. |
| **A10:2021** | **Falsificación de Peticiones del Lado del Servidor (SSRF)** | • Las peticiones salientes del servidor están acotadas a destinos verificados: API de Google Gemini (`generativelanguage.googleapis.com`), API del Banco Mundial (`api.worldbank.org`) y endpoints del cluster de Supabase.<br>• No se aceptan URLs arbitrarias suministradas por usuarios para invocaciones HTTP internas. | Pruebas de parámetros manipulados hacia `localhost:3000` o IPs privadas (`169.254.169.254`) son rechazadas en la capa de validación Zod. |

---

## 2. Límites de Tasa (*Rate Limiting*) Implementados

| Endpoint | Límite Máximo | Ventana de Tiempo | Acción al Exceder |
| :--- | :--- | :--- | :--- |
| **Global (`/api/*`)** | 350 peticiones | 15 minutos por IP | Código `429 Too Many Requests` + cabecera `Retry-After` |
| **Login (`/api/auth/login`)** | 10 peticiones | 15 minutos por IP | Bloqueo temporal de 15 minutos y registro de auditoría |
| **Registro (`/api/auth/register`)** | 5 peticiones | 60 minutos por IP | Código `429` con mensaje amigable |
| **Contacto (`/api/contacto`)** | 5 peticiones | 60 minutos por IP | Código `429` para prevención de spam |
| **Radicación PQRS (`/api/pqrs`)** | 5 peticiones | 60 minutos por IP | Código `429` |
| **Asistente IA (`/api/assistant/chat`)** | 35 mensajes | 1 minuto por IP | Código `429` informando alta congestión del modelo |

---

## 3. Esquemas de Validación Zod

Los esquemas residen en `src/server/security.ts` y aseguran:
1. Longitudes mínimas y máximas de texto para evitar ataques DoS por tamaño de cadena.
2. Sanitización de correos electrónicos en formato normalizado en minúsculas.
3. Validación estricta de enums colombianos (Tipos de documento: `CC`, `CE`, `TI`, `NIT`, `PASAPORTE`; Métodos de pago: `credit_card`, `pse`, `cash_on_delivery`).
4. Rechazo total de campos no autorizados en el registro para garantizar inmunidad contra asignación masiva de privilegios.

---

## 4. Guía de Ejecución de Pruebas de Penetración Locales

Para ejecutar pruebas automáticas de penetración:

```bash
# 1. Comprobación de cabeceras de seguridad
curl -I http://localhost:3000/

# 2. Prueba de Anti-Enumeración en Login (Usuario existente vs. inexistente)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "inexistente@movifashion.ai", "password": "password123"}'
# Respuesta esperada: 401 {"error": "Correo electrónico o contraseña incorrectos."}

# 3. Prueba de Bloqueo por Fuerza Bruta (Repetir 6 veces)
# En el sexto intento se obtiene: 429 {"error": "Demasiados intentos fallidos...", "locked": true}

# 4. Prueba de Prevención de Asignación Masiva
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Prueba Pentest", "email": "pentest@ejemplo.com", "password": "Password123!", "role": "admin"}'
# El registro rechaza o asigna estrictamente role='cliente'

# 5. Prueba de Subida de Archivo con Magic Bytes Falsos
curl -X POST http://localhost:3000/api/admin/upload-image \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_ADMIN>" \
  -d '{"imageBase64": "PD9waHAgZWNobyAnaGFja2VkJzsgPz4="}'
# Respuesta esperada: 400 {"error": "Formato binario no permitido. Solo se admiten imágenes reales en formato JPEG, PNG o WEBP."}
```
