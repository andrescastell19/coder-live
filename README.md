
# Source Code Editor Interview

Plataforma de colaboración en tiempo real para entrevistas técnicas y coding sessions, con soporte multi-rol (admin, dev, observer), editor Monaco, WebSocket colaborativo y autenticación JWT.

## Características principales

- **Editor Monaco** con soporte para múltiples lenguajes (JavaScript, Python, Java, C, C++).
- **Colaboración en tiempo real** vía WebSocket, con sincronización de código y control de edición.
- **Roles diferenciados:**
  - **Admin:** controla el lenguaje, puede habilitar/deshabilitar edición, ejecutar código y crear salas.
  - **Dev:** edita y ejecuta código cuando el admin lo permite.
  - **Observer:** solo visualiza en tiempo real.
- **Autenticación JWT** y gestión de sesión segura.
- **Selección y sincronización de lenguaje** entre admin y dev.
- **Navegación moderna** con React Router.
- **Página de error dedicada** para manejo de errores inesperados.
- **UI moderna y responsiva** para login y cada rol.


## Repositorio del backend

El backend de Coder Live se encuentra en: [https://github.com/andrescastell19/code-board](https://github.com/andrescastell19/code-board#)

## Instalación y ejecución

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/tuusuario/coder-live.git
   cd coder-live
   ```
2. **Instala dependencias del frontend:**
   ```bash
   cd src
   npm install
   ```
3. **Instala dependencias del backend:**
   ```bash
   cd ../server
   npm install
   ```
4. **Inicia el backend:**
   ```bash
   node server.js
   # o npm start
   ```
5. **Inicia el frontend:**
   ```bash
   cd ../src
   npm start
   ```
6. Accede a `http://localhost:3000` en tu navegador.

## Flujo de uso

1. **Login:**
   - Ingresa usuario y contraseña (admin, dev, observer).
2. **Admin:**
   - Crea una sala (Room ID único).
   - Controla el lenguaje y la edición.
   - Puede ejecutar el código y ver la salida.
3. **Dev/Observer:**
   - Ingresa el Room ID proporcionado por el admin.
   - Dev puede editar/ejecutar si el admin lo permite.
   - Observer solo visualiza.

## Variables de entorno

- El backend distingue entre entorno local y producción automáticamente.
- El frontend detecta el entorno y ajusta las URLs de API y WebSocket.

## Seguridad

- Autenticación JWT en todas las rutas protegidas.
- Validación de roomId y token en cada conexión.
- CORS configurado para producción y desarrollo.

## Créditos

Desarrollado por Andres Castellanos.

---

¡Contribuciones y sugerencias son bienvenidas!
