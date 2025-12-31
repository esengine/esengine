---
title: "HTTP Routing"
description: "HTTP REST API routing with WebSocket port sharing support"
---

`@esengine/server` includes a lightweight HTTP routing feature that can share the same port with WebSocket services, making it easy to implement REST APIs.

## Quick Start

### Inline Route Definition

The simplest way is to define HTTP routes directly when creating the server:

```typescript
import { createServer } from '@esengine/server'

const server = await createServer({
    port: 3000,
    http: {
        '/api/health': (req, res) => {
            res.json({ status: 'ok', time: Date.now() })
        },
        '/api/users': {
            GET: (req, res) => {
                res.json({ users: [] })
            },
            POST: async (req, res) => {
                const body = req.body as { name: string }
                res.status(201).json({ id: '1', name: body.name })
            }
        }
    },
    cors: true  // Enable CORS
})

await server.start()
```

### File-based Routing

For larger projects, file-based routing is recommended. Create a `src/http` directory where each file corresponds to a route:

```typescript
// src/http/login.ts
import { defineHttp } from '@esengine/server'

interface LoginBody {
    username: string
    password: string
}

export default defineHttp<LoginBody>({
    method: 'POST',
    handler(req, res) {
        const { username, password } = req.body as LoginBody

        // Validate user...
        if (username === 'admin' && password === '123456') {
            res.json({ token: 'jwt-token-here', userId: 'user-1' })
        } else {
            res.error(401, 'Invalid username or password')
        }
    }
})
```

```typescript
// server.ts
import { createServer } from '@esengine/server'

const server = await createServer({
    port: 3000,
    httpDir: './src/http',   // HTTP routes directory
    httpPrefix: '/api',       // Route prefix
    cors: true
})

await server.start()
// Route: POST /api/login
```

## defineHttp Definition

`defineHttp` is used to define type-safe HTTP handlers:

```typescript
import { defineHttp } from '@esengine/server'

interface CreateUserBody {
    username: string
    email: string
    password: string
}

export default defineHttp<CreateUserBody>({
    // HTTP method (default POST)
    method: 'POST',

    // Handler function
    handler(req, res) {
        const body = req.body as CreateUserBody
        // Handle request...
        res.status(201).json({ id: 'new-user-id' })
    }
})
```

### Supported HTTP Methods

```typescript
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS'
```

## HttpRequest Object

The HTTP request object contains the following properties:

```typescript
interface HttpRequest {
    /** Raw Node.js IncomingMessage */
    raw: IncomingMessage

    /** HTTP method */
    method: string

    /** Request path */
    path: string

    /** Query parameters */
    query: Record<string, string>

    /** Request headers */
    headers: Record<string, string | string[] | undefined>

    /** Parsed request body */
    body: unknown

    /** Client IP */
    ip: string
}
```

### Usage Examples

```typescript
export default defineHttp({
    method: 'GET',
    handler(req, res) {
        // Get query parameters
        const page = parseInt(req.query.page ?? '1')
        const limit = parseInt(req.query.limit ?? '10')

        // Get request headers
        const authHeader = req.headers.authorization

        // Get client IP
        console.log('Request from:', req.ip)

        res.json({ page, limit })
    }
})
```

### Body Parsing

The request body is automatically parsed based on `Content-Type`:

- `application/json` - Parsed as JSON object
- `application/x-www-form-urlencoded` - Parsed as key-value object
- Others - Kept as raw string

```typescript
export default defineHttp<{ name: string; age: number }>({
    method: 'POST',
    handler(req, res) {
        // body is already parsed
        const { name, age } = req.body as { name: string; age: number }
        res.json({ received: { name, age } })
    }
})
```

## HttpResponse Object

The HTTP response object provides a chainable API:

```typescript
interface HttpResponse {
    /** Raw Node.js ServerResponse */
    raw: ServerResponse

    /** Set status code */
    status(code: number): HttpResponse

    /** Set response header */
    header(name: string, value: string): HttpResponse

    /** Send JSON response */
    json(data: unknown): void

    /** Send text response */
    text(data: string): void

    /** Send error response */
    error(code: number, message: string): void
}
```

### Usage Examples

```typescript
export default defineHttp({
    method: 'POST',
    handler(req, res) {
        // Set status code and custom headers
        res
            .status(201)
            .header('X-Custom-Header', 'value')
            .json({ created: true })
    }
})
```

```typescript
export default defineHttp({
    method: 'GET',
    handler(req, res) {
        // Send error response
        res.error(404, 'Resource not found')
        // Equivalent to: res.status(404).json({ error: 'Resource not found' })
    }
})
```

```typescript
export default defineHttp({
    method: 'GET',
    handler(req, res) {
        // Send plain text
        res.text('Hello, World!')
    }
})
```

## File Routing Conventions

### Name Conversion

File names are automatically converted to route paths:

| File Path | Route Path (prefix=/api) |
|-----------|-------------------------|
| `login.ts` | `/api/login` |
| `users/profile.ts` | `/api/users/profile` |
| `users/[id].ts` | `/api/users/:id` |
| `game/room/[roomId].ts` | `/api/game/room/:roomId` |

### Dynamic Route Parameters

Use `[param]` syntax to define dynamic parameters:

```typescript
// src/http/users/[id].ts
import { defineHttp } from '@esengine/server'

export default defineHttp({
    method: 'GET',
    handler(req, res) {
        // Get parameter from path
        // Note: current version requires manual path parsing
        const id = req.path.split('/').pop()
        res.json({ userId: id })
    }
})
```

### Skip Rules

The following files are automatically skipped:

- Files starting with `_` (e.g., `_helper.ts`)
- `index.ts` / `index.js` files
- Non `.ts` / `.js` / `.mts` / `.mjs` files

### Directory Structure Example

```
src/
└── http/
    ├── _utils.ts        # Skipped (underscore prefix)
    ├── index.ts         # Skipped (index file)
    ├── health.ts        # GET /api/health
    ├── login.ts         # POST /api/login
    ├── register.ts      # POST /api/register
    └── users/
        ├── index.ts     # Skipped
        ├── list.ts      # GET /api/users/list
        └── [id].ts      # GET /api/users/:id
```

## CORS Configuration

### Quick Enable

```typescript
const server = await createServer({
    port: 3000,
    cors: true  // Use default configuration
})
```

### Custom Configuration

```typescript
const server = await createServer({
    port: 3000,
    cors: {
        // Allowed origins
        origin: ['http://localhost:5173', 'https://myapp.com'],
        // Or use wildcard
        // origin: '*',
        // origin: true,  // Reflect request origin

        // Allowed HTTP methods
        methods: ['GET', 'POST', 'PUT', 'DELETE'],

        // Allowed request headers
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],

        // Allow credentials (cookies)
        credentials: true,

        // Preflight cache max age (seconds)
        maxAge: 86400
    }
})
```

### CorsOptions Type

```typescript
interface CorsOptions {
    /** Allowed origins: string, string array, true (reflect) or '*' */
    origin?: string | string[] | boolean

    /** Allowed HTTP methods */
    methods?: string[]

    /** Allowed request headers */
    allowedHeaders?: string[]

    /** Allow credentials */
    credentials?: boolean

    /** Preflight cache max age (seconds) */
    maxAge?: number
}
```

## Route Merging

File routes and inline routes can be used together, with inline routes having higher priority:

```typescript
const server = await createServer({
    port: 3000,
    httpDir: './src/http',
    httpPrefix: '/api',

    // Inline routes merge with file routes
    http: {
        '/health': (req, res) => res.json({ status: 'ok' }),
        '/api/special': (req, res) => res.json({ special: true })
    }
})
```

## Sharing Port with WebSocket

HTTP routes automatically share the same port with WebSocket services:

```typescript
const server = await createServer({
    port: 3000,
    // WebSocket related config
    apiDir: './src/api',
    msgDir: './src/msg',

    // HTTP related config
    httpDir: './src/http',
    httpPrefix: '/api',
    cors: true
})

await server.start()

// Same port 3000:
// - WebSocket: ws://localhost:3000
// - HTTP API:  http://localhost:3000/api/*
```

## Complete Examples

### Game Server Login API

```typescript
// src/http/auth/login.ts
import { defineHttp } from '@esengine/server'
import { createJwtAuthProvider } from '@esengine/server/auth'

interface LoginRequest {
    username: string
    password: string
}

interface LoginResponse {
    token: string
    userId: string
    expiresAt: number
}

const jwtProvider = createJwtAuthProvider({
    secret: process.env.JWT_SECRET!,
    expiresIn: 3600
})

export default defineHttp<LoginRequest>({
    method: 'POST',
    async handler(req, res) {
        const { username, password } = req.body as LoginRequest

        // Validate user
        const user = await db.users.findByUsername(username)
        if (!user || !await verifyPassword(password, user.passwordHash)) {
            res.error(401, 'Invalid username or password')
            return
        }

        // Generate JWT
        const token = jwtProvider.sign({
            sub: user.id,
            name: user.username,
            roles: user.roles
        })

        const response: LoginResponse = {
            token,
            userId: user.id,
            expiresAt: Date.now() + 3600 * 1000
        }

        res.json(response)
    }
})
```

### Game Data Query API

```typescript
// src/http/game/leaderboard.ts
import { defineHttp } from '@esengine/server'

export default defineHttp({
    method: 'GET',
    async handler(req, res) {
        const limit = parseInt(req.query.limit ?? '10')
        const offset = parseInt(req.query.offset ?? '0')

        const players = await db.players.findMany({
            sort: { score: 'desc' },
            limit,
            offset
        })

        res.json({
            data: players,
            pagination: { limit, offset }
        })
    }
})
```

## Best Practices

1. **Use defineHttp** - Get better type hints and code organization
2. **Unified Error Handling** - Use `res.error()` to return consistent error format
3. **Enable CORS** - Required for frontend-backend separation
4. **Directory Organization** - Organize HTTP route files by functional modules
5. **Validate Input** - Always validate `req.body` and `req.query` content
6. **Status Code Standards** - Follow HTTP status code conventions (200, 201, 400, 401, 404, 500, etc.)
