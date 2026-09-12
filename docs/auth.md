# Autenticación — AEGIS

## Resumen

AEGIS utiliza JWT (JSON Web Tokens) con refresh tokens para manejar la autenticación. El access token tiene una vida corta (24 horas) y el refresh token tiene una vida larga (7 días). Cuando el access token expira, el frontend lo renueva automáticamente usando el refresh token sin que el usuario deba re-ingresar sus credenciales.

---

## Backend (apps/api)

### Tokens

| Token | Vida | Almacenamiento | Propósito |
|-------|------|----------------|-----------|
| Access Token | 24 horas | localStorage (FE) | Autenticar cada petición API |
| Refresh Token | 7 días | localStorage (FE) + BD (BE) | Renovar el access token |

### Endpoints de autenticación

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/users/login` | No | Login, retorna access + refresh token |
| POST | `/api/users/refresh` | No | Renueva tokens con refresh token válido |
| POST | `/api/users/logout` | Sí | Revoca el refresh token |
| GET | `/api/users/me` | Sí | Valida que el token sea válido |

### Login (`POST /api/users/login`)

**Request:**
```json
{
  "email": "admin@aegis.com",
  "password": "Admin1234!"
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "a1b2c3d4e5f6...",
  "email": "admin@aegis.com",
  "displayName": "Admin",
  "expiresAt": "2026-09-13T12:00:00Z"
}
```

**Response 401:** Credenciales inválidas.

### Refresh (`POST /api/users/refresh`)

Se llama cuando el access token está por expirar o ya expiró.

**Request:**
```json
{
  "refreshToken": "a1b2c3d4e5f6..."
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "nuevoRefreshToken...",
  "expiresAt": "2026-09-13T12:00:00Z"
}
```

**Response 401:** Refresh token inválido o expirado.

**Nota:** El refresh token se rota en cada uso. El token anterior se revoca y se emite uno nuevo. Esto previene que un token robado se use múltiples veces.

### Logout (`POST /api/users/logout`)

**Request:**
```json
{
  "refreshToken": "a1b2c3d4e5f6..."
}
```

**Response 200:**
```json
{
  "success": true
}
```

El refresh token se marca como revocado en la base de datos. No se puede usar novamente.

### Tabla RefreshTokens

```
Id          GUID (PK)
UserId      GUID (FK → Users)
Token       VARCHAR(500) UNIQUE
ExpiresAt   TIMESTAMP
IsRevoked   BOOLEAN
CreatedAt   TIMESTAMP
```

### Flujo del backend

```
Login
  ├── Validar credenciales (email + bcrypt)
  ├── Generar access token (JwtTokenService)
  ├── Generar refresh token (RefreshTokenService)
  ├── Guardar refresh token en BD
  └── Retornar ambos tokens

Refresh
  ├── Buscar refresh token en BD
  ├── Verificar que no esté revocado ni expirado
  ├── Revocar el refresh token anterior (rotación)
  ├── Generar nuevo access token
  ├── Generar nuevo refresh token
  ├── Guardar nuevo refresh token en BD
  └── Retornar nuevos tokens

Logout
  ├── Buscar refresh token en BD
  ├── Marcar como revocado
  └── Retornar éxito
```

---

## Frontend (apps/web)

### Archivos clave

| Archivo | Responsabilidad |
|---------|-----------------|
| `lib/auth-context.tsx` | Proveedor de contexto, estado de auth, login/logout, validación server-side, proactive refresh |
| `lib/api/client.ts` | `apiFetch()` con interceptor 401 y auto-refresh |
| `lib/api/auth.ts` | Funciones `login()`, `refreshAccessToken()`, `logoutUser()`, `getMe()` |
| `components/aegis/TokenSync.tsx` | Sincroniza token React → módulo `apiFetch`, registra handlers |
| `components/aegis/AuthGuard.tsx` | Redirige a `/login` si no hay usuario autenticado |
| `components/aegis/SessionWarning.tsx` | Modal de warning 5 minutos antes de expirar |
| `app/login/page.tsx` | Formulario de login |

### Almacenamiento en localStorage

| Key | Valor |
|-----|-------|
| `aegis_token` | Access token JWT |
| `aegis_refresh_token` | Refresh token |
| `aegis_expires_at` | Fecha de expiración del access token |

### Flujo de inicialización

Cuando la app carga (recarga de página):

```
1. Leer tokens de localStorage
2. Si no hay token → usuario no autenticado
3. Si el token está expirado localmente:
   a. Intentar refresh con refresh token
   b. Si éxito → guardar nuevos tokens, establecer usuario
   c. Si fracaso → limpiar tokens, usuario no autenticado
4. Si el token no está expirado localmente:
   a. Llamar GET /api/users/me para validar server-side
   b. Si 200 → establecer usuario
   c. Si 401 → limpiar tokens, usuario no autenticado
```

### Interceptor 401 en `apiFetch`

Toda llamada a `apiFetch()` pasa por este interceptor:

```
1. Hacer petición con Bearer token
2. Si respuesta es 200 → retornar datos
3. Si respuesta es 401:
   a. Si ya hay un refresh en curso → esperar su resultado
   b. Si no → intentar refresh silencioso
   c. Si refresh éxito → reintentar petición original con nuevo token
   d. Si refresh fracaso → redirigir a /login
4. Si respuesta es otro error → lanzar excepción
```

### Proactive refresh (renovación anticipada)

El sistema agenda un refresh automático **5 minutos antes** de que el access token expire:

```
1. Al hacer login o refresh, calcular expiración del token
2. Programar timer: expiresAt - 5 minutos
3. Cuando el timer dispara → llamar POST /api/users/refresh
4. Guardar nuevos tokens y re-programar timer
```

Esto evita que el usuario experimente un 401 inesperado mientras está trabajando.

### Session Warning (modal)

- Se muestra cuando quedan **menos de 5 minutos** de sesión
- Avisa al usuario que debe guardar su trabajo
- Ofrece "Sign out now" o "Dismiss"
- Se cierra automáticamente cuando el token se renueva

### AuthGuard

Envuelve todas las páginas protegidas a través del layout route group `(auth)`:

```
src/app/(auth)/layout.tsx
  └── AuthGuard
       └── AppShell
            └── {children}
```

`AuthGuard` verifica:
- Si `loading` está en `true` → muestra spinner
- Si `user` es `null` → redirige a `/login`
- Si `user` existe → renderiza children

### Workspace page

La página `/reviews/[id]/workspace` está **fuera** del grupo `(auth)` porque usa `ReviewWorkspace` con su propio layout completo. Tiene `AuthGuard` directamente en el componente:

```tsx
// src/app/reviews/[id]/workspace/page.tsx
export default function WorkspacePage() {
  return (
    <AuthGuard>
      <ReviewWorkspace reviewId={reviewId} />
    </AuthGuard>
  );
}
```

### Decodificación JWT

El payload del JWT se decodifica en `decodeJwtPayload()` (exportado desde `auth-context.tsx`). Extrae los claims de Microsoft identity:

| Claim | Campo |
|-------|-------|
| `nameidentifier` | `userId` |
| `emailaddress` | `email` |
| `name` | `displayName` |
| `role` | `roles[]` |

### Diagrama de flujo completo

```
                    ┌─────────────┐
                    │   Usuario   │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   Login     │
                    │  (FE form)  │
                    └──────┬──────┘
                           │ POST /api/users/login
                    ┌──────▼──────┐
                    │   Backend   │
                    │  Valida     │
                    │  credenciales│
                    └──────┬──────┘
                           │
              ┌────────────▼────────────┐
              │  Retorna:               │
              │  - accessToken          │
              │  - refreshToken         │
              │  - expiresAt            │
              └────────────┬────────────┘
                           │
              ┌────────────▼────────────┐
              │  Frontend:              │
              │  - Guarda en localStorage│
              │  - Schedule refresh     │
              │  - Redirige a /         │
              └────────────┬────────────┘
                           │
                    ┌──────▼──────┐
                    │   App       │
                    │  (auth)     │
                    └──────┬──────┘
                           │
              ┌────────────▼────────────┐
              │  Cada petición API:     │
              │  apiFetch() agrega      │
              │  Bearer token           │
              └────────────┬────────────┘
                           │
                    ┌──────▼──────┐
                    │  ¿401?      │
                    └──────┬──────┘
                     Sí    │    No
              ┌────────────┤    ├────────────┐
              │            │    │            │
     ┌────────▼────────┐   │    │   ┌────────▼────────┐
     │  Auto-refresh   │   │    │   │  Retornar datos │
     │  POST /refresh  │   │    │   └─────────────────┘
     └────────┬────────┘   │    │
              │            │    │
         ┌────▼────┐       │    │
         │ ¿Éxito? │       │    │
         └────┬────┘       │    │
          Sí  │   No       │    │
     ┌────────┤    ├───────┘    │
     │        │    │            │
┌────▼────┐   │    │            │
│Reintentar│   │    │            │
│petición  │   │    │            │
└─────────┘   │    │            │
              │    │            │
     ┌────────▼────▼───┐        │
     │  Redirect       │        │
     │  /login         │        │
     └─────────────────┘        │
              │                 │
     ┌────────▼─────────┐       │
     │  Timer:          │       │
     │  expiresAt - 5m  │       │
     │  → POST /refresh │       │
     │  (silencioso)    │       │
     └──────────────────┘       │
              │                 │
     ┌────────▼─────────┐       │
     │  Session Warning │       │
     │  (si < 5 min)    │       │
     └──────────────────┘       │
              │                 │
     ┌────────▼─────────┐       │
     │  Logout          │       │
     │  POST /logout    │       │
     │  + limpiar       │       │
     │  localStorage    │       │
     └──────────────────┘       │
```

---

## Seguridad

### Lo que se implementa

- Access token con expiración (24h)
- Refresh token con rotación (7d)
- Validación server-side al cargar la app
- Auto-refresh silencioso antes de expirar
- Revocación de refresh tokens en logout
- Token validation en backend (issuer, audience, signing key, lifetime)
- `httpOnly` no se usa (localStorage) — ver nota abajo

### Sobre localStorage vs httpOnly cookies

Este proyecto almacena los tokens en `localStorage`. Esto es aceptable cuando:
- El backend y frontend están en el mismo dominio
- No hay riesgo de CSRF significativo
- La app no maneja datos altamente sensibles (healthcare, finanzas)

Para apps con requisitos de seguridad más estrictos, se recomienda:
- Almacenar el access token en memoria (no persistido)
- Almacenar el refresh token en `httpOnly` cookie con `SameSite=Strict`
- Implementar CSRF protection

### Tokens en la URL

Los tokens **nunca** se pasan por query parameters. Siempre se envían en el header `Authorization: Bearer {token}`.

### Revocación

El sistema soporta revocación a nivel de refresh token:
- En logout: se revoca el refresh token específico
- Para logout de todos los dispositivos: se pueden revocar todos los refresh tokens de un usuario (el servicio lo soporta, el endpoint no está expuesto aún)
