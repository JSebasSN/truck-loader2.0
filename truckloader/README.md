# TruckLoader 🚛

Sistema de control de carga de camiones con Firebase.

## Stack
- **Frontend:** React 18 + Vite
- **Auth:** Firebase Authentication (Email/Password)
- **Database:** Cloud Firestore (real-time)
- **Deploy:** Netlify

## Setup local

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build para producción
npm run build
```

## Deploy en Netlify

### Opción A: Desde GitHub
1. Sube el proyecto a un repo de GitHub
2. Ve a [netlify.com](https://netlify.com) → "Add new site" → "Import from Git"
3. Selecciona el repo
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Deploy!

### Opción B: Manual
```bash
npm run build
# Sube la carpeta dist/ a Netlify
```

## Firestore Collections

| Collection | Descripción |
|-----------|-------------|
| `users`   | Perfiles de usuario (name, email, role) |
| `trucks`  | Camiones con posiciones de carga |
| `assigns` | Asignaciones admin → carretilleros |
| `history` | Historial de jornadas guardadas |

## Firestore Rules
Copia el contenido de `firestore.rules` en la consola de Firebase → Firestore → Rules.

## Primer uso
1. Regístrate como **Admin** desde la pantalla de login
2. Crea camiones desde la pestaña Gestión
3. Crea carretilleros desde Asignar (o que se registren ellos)
4. Los carretilleros ven los camiones y cargan posiciones desde el móvil
5. Al final del día, usa "Guardar Día y Reiniciar" para archivar

## Credenciales
Cada usuario se registra con su email y contraseña via Firebase Auth.
No hay credenciales por defecto — el primer registro crea el primer usuario.
