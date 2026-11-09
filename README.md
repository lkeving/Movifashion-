# MoviFashion AI — Plataforma de Comercio Electrónico

Tienda en línea de moda y calzado en Colombia con inteligencia artificial integrada, catálogo fotográfico real, gestión de inventario, analítica de datos, pasarela de checkout simulada y panel administrativo corporativo con control de acceso basado en roles (RBAC).

## Despliegue en Vercel

La arquitectura del proyecto en Vercel utiliza una función Serverless en `api/index.js` empaquetada mediante esbuild para máxima compatibilidad con ES Modules.

### Regla Fundamental de Compilación
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
En modo desarrollo (`NODE_ENV !== 'production'`), si no has definido las variables `ADMIN_EMAIL` y `ADMIN_PASSWORD`, el servidor crea automáticamente el administrador de pruebas con `admin@movifashion.ai` e imprime las credenciales exclusivamente en la consola del terminal al iniciar:
```
Admin de desarrollo: admin@movifashion.ai / AdminDev2026!
```
Para personalizar las credenciales locales, puedes definirlas en tu archivo `.env`:
```env
ADMIN_EMAIL="admin@movifashion.ai"
ADMIN_PASSWORD="TuContraseñaSegura2026!"
```

### 2. En Google AI Studio (Secrets)
Para configurar las credenciales en el entorno de AI Studio:
1. Dirígete a la configuración del proyecto (ícono de engranaje o panel de variables/secretos).
2. Agrega la variable `ADMIN_EMAIL` con el correo del administrador (ejemplo: `admin@movifashion.ai` o tu correo corporativo).
3. Agrega la variable `ADMIN_PASSWORD` con una contraseña robusta (alfanumérica con símbolos).
4. Asegúrate de tener también configurado `JWT_SECRET` (cadena de al menos 32 caracteres aleatorios).
5. Reinicia el servidor para que tome las nuevas variables.

### 3. En Vercel (Producción)
En producción, por seguridad estricta, no se crean cuentas con contraseñas por defecto. Si faltan estas variables, el servidor registrará un error en los logs y no creará ningún administrador:
1. Ve al panel de tu proyecto en [vercel.com](https://vercel.com).
2. Haz clic en **Settings** > **Environment Variables**.
3. Añade las siguientes variables para los entornos **Production** y **Preview**:
   - `ADMIN_EMAIL`: Tu correo de super administrador.
   - `ADMIN_PASSWORD`: Tu contraseña de super administrador.
   - `JWT_SECRET`: Clave de firma de tokens de sesión.
4. Realiza un nuevo despliegue (**Redeploy**) o haz commit a la rama principal para que los cambios surtan efecto.

### 4. Flujo de Acceso y Comportamiento de Rutas
- **Sin sesión activa**: Al navegar a `/admin`, la aplicación no te redirige al inicio; mantiene la URL en `/admin` y abre automáticamente la ventana de inicio de sesión con el mensaje:
  > *"Acceso exclusivo del personal de MoviFashion. Inicia sesión para continuar."*
- **Inicio de sesión como personal**: Tras autenticarte con cualquier rol de personal (`admin`, `super_admin`, `administrador`, `gerente_tienda`, etc.), la aplicación navega automáticamente a `/admin` y presenta el panel completo con sus 14 módulos numerados y la barra lateral azul marino.
- **Usuario con rol de cliente**: Si un cliente intenta acceder a `/admin`, es redirigido inmediatamente a la tienda (`/`) sin mostrar ningún mensaje ni pista sobre la existencia del panel. Los clientes tampoco ven enlaces a la administración en el menú ni en ninguna parte de la tienda.
- **Acceso desde el Header**: El personal activo verá en el menú de usuario de la tienda el botón **«Panel de Administración»** con el distintivo de su rol asignado.
- **Cerrar sesión desde el panel**: Al pulsar **«Cerrar sesión»** dentro del panel, se revoca la sesión y el usuario regresa de inmediato a la tienda pública (`/`).

## Variables de Entorno en Producción
- `JWT_SECRET`: Clave criptográfica para firmas JWT (mínimo 32 caracteres).
- `ADMIN_EMAIL`: Correo electrónico del super administrador.
- `ADMIN_PASSWORD`: Contraseña del super administrador.
- `SUPABASE_URL`: URL del proyecto Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: Service role secret de Supabase.
- `GEMINI_API_KEY`: API Key de Google GenAI para el asistente conversacional.

## Ejecución Local
```bash
npm run dev
```
Acceder a la aplicación en `http://localhost:3000`.
