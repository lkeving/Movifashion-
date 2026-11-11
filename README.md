# MoviFashion AI — Plataforma de Comercio Electrónico

Tienda en línea de moda y calzado en Colombia con inteligencia artificial integrada, catálogo fotográfico real, gestión de inventario, analítica de datos, pasarela de checkout simulada y panel administrativo corporativo con control de acceso basado en roles (RBAC).

## Despliegue en Vercel

La arquitectura del proyecto en Vercel utiliza una función Serverless en `api/index.js` empaquetada mediante esbuild para máxima compatibilidad con ES Modules.

### 1. Variables de Entorno en Vercel

Configura las siguientes variables en **Settings > Environment Variables** de tu proyecto en Vercel:

| Variable | Estado | Descripción |
| :--- | :--- | :--- |
| `ADMIN_EMAIL` | **Requerida** | Correo del Super Administrador permanente. Se verifica en tiempo constante (`timingSafeEqual`). |
| `ADMIN_PASSWORD` | **Requerida** | Contraseña del Super Administrador (mínimo 8 caracteres con números y símbolos). |
| `JWT_SECRET` | **Requerida** | Secreto criptográfico para firma y verificación de tokens de sesión (mínimo 32 caracteres). |
| `UPSTASH_REDIS_REST_URL` | *Recomendada* | URL REST de Upstash Redis para almacenamiento compartido entre instancias serverless. |
| `UPSTASH_REDIS_REST_TOKEN` | *Recomendada* | Token REST de Upstash Redis. |
| `KV_REST_API_URL` | *Alternativa* | Inyectada automáticamente por Vercel Storage (Vercel KV / Upstash). |
| `KV_REST_API_TOKEN` | *Alternativa* | Inyectada automáticamente por Vercel Storage (Vercel KV / Upstash). |
| `SUPABASE_URL` | *Opcional* | URL de proyecto Supabase (PostgreSQL). |
| `SUPABASE_SERVICE_ROLE_KEY` | *Opcional* | Service role secret de Supabase (tablas `app_orders`, `app_users`, `returns`, etc.). |
| `GEMINI_API_KEY` | *Opcional* | API Key de Google GenAI para activar el asistente de moda MoviFashion AI. |
| `GEMINI_MODEL` | *Opcional* | Modelo de Gemini a usar (por defecto `gemini-2.5-flash`). |
| `ALLOW_VOLATILE_ACCOUNTS` | *Opcional* | Establece `'true'` para permitir registro y compras en memoria cuando no hay Redis ni Supabase. |
| `HIDE_VOLATILE_NOTICE` | *Opcional* | Establece `'true'` para ocultar el aviso discreto de demostración en el formulario de registro. |
| `APP_URL` | *Opcional* | Dominio público de la tienda (ej. `https://movifashion.vercel.app`) para CORS y sitemap. |

### 2. Conexión de Upstash Redis en 1 Clic (Vercel Marketplace)

Para que los pedidos, usuarios, radicados PQRS y logs persistan de forma compartida entre todas las ejecuciones serverless:
1. En el panel de tu proyecto en [vercel.com](https://vercel.com), ve a la pestaña **Storage**.
2. Haz clic en **Create Database** y selecciona **Upstash Redis** (o **Vercel KV**).
3. Selecciona tu región geográfica más cercana (por ejemplo, `us-east-1`) y haz clic en **Create**.
4. Conecta la base de datos al proyecto de MoviFashion AI: Vercel inyectará automáticamente las variables `KV_REST_API_URL` y `KV_REST_API_TOKEN` (o `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN`).
5. Al desplegar de nuevo (**Redeploy**), MoviFashion detecta automáticamente Redis con cuota optimizada (caché de 20 segundos y lecturas por lotes de 50 claves).

### 3. Verificación del Despliegue (`GET /api/health`)

Una vez desplegada la aplicación, consulta el endpoint público de salud:
```bash
curl https://tu-tienda.vercel.app/api/health
```

El servidor responderá con el estado de los subsistemas sin exponer credenciales ni secretos:
```json
{
  "almacenamiento": "redis",
  "jwt": true,
  "gemini": true,
  "admin": {
    "variablesDefinidas": true
  }
}
```
* `almacenamiento`: indica `"redis"` si Upstash está conectado, `"supabase"` si está configurado, o `"memoria"` si corre en modo volátil.
* `jwt`: `true` si `JWT_SECRET` está cargado.
* `gemini`: `true` si el asistente de inteligencia artificial está listo.
* `admin.variablesDefinidas`: `true` si `ADMIN_EMAIL` y `ADMIN_PASSWORD` están definidas para el superadministrador permanente.

### 4. Regla Fundamental de Compilación
Cada vez que se modifique `server.ts` o cualquier archivo que `server.ts` importe (`src/server/**`, `src/data/**`, `src/utils/**`, `src/config/**`, `src/types/**`, `scripts/seed-staff.ts`):
1. Ejecutar:
   ```bash
   npm run build:api
   ```
2. Confirmar que `api/index.js` quede generado/actualizado.
3. El script `npm run build` ejecuta automáticamente `vite build && npm run build:api` para asegurar que tanto la SPA estática como la función de Vercel queden sincronizadas.
4. **IMPORTANTE**: No eliminar ni agregar a `.gitignore` el archivo `api/index.js`, ya que es el punto de entrada que ejecuta Vercel en producción.

## Cómo entrar al panel

El panel de administración corporativo se encuentra en la ruta `/admin`.

### 1. En Entorno de Desarrollo Local
En modo desarrollo (`NODE_ENV !== 'production'`), si no has definido las variables `ADMIN_EMAIL` y `ADMIN_PASSWORD`, el servidor crea automáticamente el administrador de pruebas con `admin@movifashion.ai` e imprime las credenciales en la consola al iniciar:
```
Admin de desarrollo: admin@movifashion.ai / AdminDev2026!
```
Para personalizar las credenciales locales, defínelas en tu archivo `.env`:
```env
ADMIN_EMAIL="admin@movifashion.ai"
ADMIN_PASSWORD="cambia-esto"
```

### 2. En Google AI Studio (Secrets)
Para configurar las credenciales en AI Studio:
1. Agrega `ADMIN_EMAIL` con el correo del administrador.
2. Agrega `ADMIN_PASSWORD` con una contraseña robusta.
3. Agrega `JWT_SECRET` (cadena aleatoria de 32 caracteres).
4. Reinicia el servidor.

### 3. En Vercel (Producción)
En producción, el superadministrador permanente se valida de forma inmediata en tiempo constante con `ADMIN_EMAIL` y `ADMIN_PASSWORD`, garantizando acceso aunque no haya base de datos conectada.
1. En [vercel.com](https://vercel.com), ve a **Settings > Environment Variables**.
2. Define `ADMIN_EMAIL`, `ADMIN_PASSWORD` y `JWT_SECRET`.
3. Haz un nuevo **Redeploy**.

### 4. Flujo de Acceso y Comportamiento de Rutas
- **Sin sesión activa**: Al navegar a `/admin`, la aplicación mantiene la URL en `/admin` y abre automáticamente la ventana de inicio de sesión con el mensaje:
  > *"Acceso exclusivo del personal de MoviFashion. Inicia sesión para continuar."*
- **Inicio de sesión como personal**: Tras autenticarte con cualquier rol de personal (`admin`, `super_admin`, `gerente_tienda`, etc.), la aplicación presenta el panel completo con sus módulos unificados y métricas en tiempo real.
- **Usuario con rol de cliente**: Si un cliente intenta acceder a `/admin`, es redirigido inmediatamente a la tienda (`/`) sin mostrar ningún mensaje ni pista sobre la existencia del panel.
- **Acceso desde el Header**: El personal activo verá en el menú de usuario de la tienda el botón **«Panel de Administración»** con el distintivo de su rol asignado.
- **Cerrar sesión desde el panel**: Al pulsar **«Cerrar sesión»** dentro del panel, se revoca la sesión y el usuario regresa de inmediato a la tienda pública (`/`).

## Ejecución Local
```bash
npm run dev
```
Acceder a la aplicación en `http://localhost:3000`.
