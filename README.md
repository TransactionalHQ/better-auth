# @usetransactional/better-auth

[![npm version](https://badge.fury.io/js/%40usetransactional%2Fbetter-auth.svg)](https://www.npmjs.com/package/@usetransactional/better-auth)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Official [Better Auth](https://better-auth.com) plugin for [Transactional Auth](https://usetransactional.com/docs/auth).

## Installation

```bash
npm install @usetransactional/better-auth better-auth
```

## Quick Start

### Server Setup

```typescript
// lib/auth.ts
import { betterAuth } from "better-auth";
import { transactional } from "@usetransactional/better-auth";

export const auth = betterAuth({
  database: { /* your database config */ },
  plugins: [
    transactional({
      clientId: process.env.TRANSACTIONAL_CLIENT_ID!,
      clientSecret: process.env.TRANSACTIONAL_CLIENT_SECRET!,
      authDomain: "your-app.auth.usetransactional.com",
    })
  ]
});
```

### Client Setup

```typescript
// lib/auth-client.ts
import { createAuthClient } from "better-auth/react";
import { transactionalClient } from "@usetransactional/better-auth/client";

export const authClient = createAuthClient({
  plugins: [transactionalClient()]
});

export const { signIn, signOut, useSession } = authClient;
```

### Login

```typescript
// Sign in with Transactional Auth
signIn.oauth2({
  providerId: "transactional",
  callbackURL: "/dashboard"
});
```

Or use the helper function:

```typescript
import { createTransactionalSignInOptions } from "@usetransactional/better-auth/client";

// Creates { providerId: "transactional", callbackURL: "/dashboard" }
signIn.oauth2(createTransactionalSignInOptions({
  callbackURL: "/dashboard"
}));
```

## Configuration

### Required Options

| Option | Type | Description |
|--------|------|-------------|
| `clientId` | string | OAuth client ID from Transactional dashboard |
| `clientSecret` | string | OAuth client secret from Transactional dashboard |
| `authDomain` | string | Your app's auth domain (e.g., `your-app.auth.usetransactional.com`) |

### Optional Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `providerId` | string | `"transactional"` | Unique provider identifier |
| `scopes` | string[] | `["openid", "profile", "email"]` | OAuth scopes to request |
| `pkce` | boolean | `true` | Enable PKCE (required by Transactional) |
| `mapProfileToUser` | function | (see below) | Custom profile mapping |
| `disableSignUp` | boolean | `false` | Disable automatic sign-up |
| `prompt` | string | - | OAuth prompt behavior |
| `accessType` | string | - | Use `"offline"` for refresh tokens |

## Redirect URI

Add this redirect URI in your Transactional dashboard:

```
https://yourapp.com/api/auth/callback/transactional
```

## Examples

### Basic Usage

```typescript
transactional({
  clientId: process.env.TRANSACTIONAL_CLIENT_ID!,
  clientSecret: process.env.TRANSACTIONAL_CLIENT_SECRET!,
  authDomain: "your-app.auth.usetransactional.com",
})
```

### Custom Scopes

```typescript
transactional({
  clientId: "...",
  clientSecret: "...",
  authDomain: "...",
  scopes: ["openid", "profile", "email", "offline_access"],
})
```

### Custom Profile Mapping

```typescript
transactional({
  clientId: "...",
  clientSecret: "...",
  authDomain: "...",
  mapProfileToUser: (profile) => ({
    id: profile.sub as string,
    name: profile.name as string,
    email: profile.email as string,
    companyId: profile.org_id,
    role: profile.org_role,
    avatarUrl: profile.picture,
  }),
})
```

### Disable Auto Sign-Up

```typescript
transactional({
  clientId: "...",
  clientSecret: "...",
  authDomain: "...",
  disableSignUp: true,
})
```

### Force Re-authentication

```typescript
transactional({
  clientId: "...",
  clientSecret: "...",
  authDomain: "...",
  prompt: "login",
})
```

### Custom Authorization Parameters

```typescript
transactional({
  clientId: "...",
  clientSecret: "...",
  authDomain: "...",
  authorizationUrlParams: {
    organization: "org_123",
    login_hint: "user@company.com",
  },
})
```

### Override Discovery URLs

```typescript
transactional({
  clientId: "...",
  clientSecret: "...",
  authDomain: "...",
  authorizationUrl: "https://custom.auth.com/auth",
  tokenUrl: "https://custom.auth.com/token",
  userInfoUrl: "https://custom.auth.com/me",
})
```

### Custom Provider ID

```typescript
// Server
transactional({
  clientId: "...",
  clientSecret: "...",
  authDomain: "...",
  providerId: "my-transactional",
})

// Client - must match!
transactionalClient({
  providerId: "my-transactional",
})

// Sign in with custom provider ID
signIn.oauth2({
  providerId: "my-transactional",
  callbackURL: "/dashboard"
});
```

## Default Profile Mapping

By default, the plugin maps Transactional OIDC claims to Better Auth user fields:

```typescript
{
  id: profile.sub,
  name: profile.name,
  email: profile.email,
  image: profile.picture,
  emailVerified: profile.email_verified,
  // Organization info (if present)
  organizationId: profile.org_id,
  organizationName: profile.org_name,
  organizationRole: profile.org_role,
}
```

## API Reference

### Server Plugin

```typescript
import { transactional } from "@usetransactional/better-auth";

const plugin = transactional(options: TransactionalOptions);
```

### Client Plugin

```typescript
import { transactionalClient, createTransactionalSignInOptions } from "@usetransactional/better-auth/client";

// Add the plugin
const authClient = createAuthClient({
  plugins: [transactionalClient()]
});

// Sign in using oauth2 method
authClient.signIn.oauth2({
  providerId: "transactional",
  callbackURL: "/dashboard",
  errorCallbackURL: "/login?error=true",
  newUserCallbackURL: "/welcome",
  disableRedirect: false,
  scopes: ["custom:scope"],
  requestSignUp: true,
});

// Or use the helper function
authClient.signIn.oauth2(createTransactionalSignInOptions({
  callbackURL: "/dashboard"
}));
```

## How It Works

This plugin wraps Better Auth's `genericOAuth` plugin with Transactional-specific defaults:

1. **Auto-discovers endpoints** from `https://{authDomain}/.well-known/openid-configuration`
2. **Maps user profile** from Transactional's OIDC claims to Better Auth's user model
3. **Configures PKCE** (required by Transactional Auth)
4. **Provides type-safe client** with `signIn.oauth2()` using the "transactional" provider
5. **Handles organization claims** - extracts `org_id` from ID token

## License

MIT
