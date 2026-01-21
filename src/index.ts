/**
 * Transactional Better Auth Plugin - Server
 *
 * Official Better Auth plugin for Transactional Auth.
 * Wraps genericOAuth with Transactional-specific defaults.
 *
 * @example
 * ```typescript
 * import { betterAuth } from "better-auth";
 * import { transactional } from "transactional-better-auth";
 *
 * export const auth = betterAuth({
 *   plugins: [
 *     transactional({
 *       clientId: process.env.TRANSACTIONAL_CLIENT_ID!,
 *       clientSecret: process.env.TRANSACTIONAL_CLIENT_SECRET!,
 *       authDomain: "your-app.auth.usetransactional.com",
 *     })
 *   ]
 * });
 * ```
 */

import { genericOAuth } from "better-auth/plugins";
import type { TransactionalOptions } from "./types";
import { DEFAULT_PROVIDER_ID, DEFAULT_SCOPES, DISCOVERY_PATH } from "./constants";

/**
 * Default profile mapper for Transactional Auth
 * Maps OIDC claims to Better Auth user model
 *
 * @param profile - The profile object from the OIDC provider
 * @returns The mapped user object for Better Auth
 */
const defaultMapProfileToUser = (profile: Record<string, unknown>) => {
  const result: Record<string, unknown> = {
    id: profile.sub as string,
    name: profile.name as string | undefined,
    email: profile.email as string | undefined,
    image: profile.picture as string | undefined,
    emailVerified: profile.email_verified as boolean | undefined,
  };

  // Preserve organization info if present
  if (profile.org_id) {
    result.organizationId = profile.org_id;
  }
  if (profile.org_name) {
    result.organizationName = profile.org_name;
  }
  if (profile.org_role) {
    result.organizationRole = profile.org_role;
  }

  return result;
};

/**
 * Better Auth plugin for Transactional Auth
 *
 * Wraps genericOAuth with Transactional-specific defaults.
 * All genericOAuth options are supported and can be overridden.
 *
 * @param options - Plugin configuration options
 * @returns Better Auth plugin instance
 *
 * @example Basic usage
 * ```typescript
 * transactional({
 *   clientId: "your-client-id",
 *   clientSecret: "your-client-secret",
 *   authDomain: "your-app.auth.usetransactional.com",
 * })
 * ```
 *
 * @example With custom scopes
 * ```typescript
 * transactional({
 *   clientId: "your-client-id",
 *   clientSecret: "your-client-secret",
 *   authDomain: "your-app.auth.usetransactional.com",
 *   scopes: ["openid", "profile", "email", "offline_access"],
 * })
 * ```
 *
 * @example With custom profile mapping
 * ```typescript
 * transactional({
 *   clientId: "your-client-id",
 *   clientSecret: "your-client-secret",
 *   authDomain: "your-app.auth.usetransactional.com",
 *   mapProfileToUser: (profile) => ({
 *     id: profile.sub,
 *     name: profile.name,
 *     email: profile.email,
 *     companyId: profile.org_id,
 *   }),
 * })
 * ```
 */
export const transactional = (options: TransactionalOptions) => {
  const {
    clientId,
    clientSecret,
    authDomain,
    providerId = DEFAULT_PROVIDER_ID,
    scopes = DEFAULT_SCOPES,
    pkce = true, // Required by Transactional Auth
    mapProfileToUser = defaultMapProfileToUser,
    discoveryUrl,
    ...rest
  } = options;

  // Construct base URL (allow https:// prefix or bare domain)
  const baseUrl = authDomain.startsWith("http")
    ? authDomain.replace(/\/$/, "") // Remove trailing slash
    : `https://${authDomain}`;

  // Build the genericOAuth config
  // Use type assertion to avoid conflicts with Better Auth's internal types
  // while still allowing full passthrough of options
  const config = {
    // Required
    providerId,
    clientId,
    clientSecret,

    // Discovery URL (auto-construct if not provided)
    discoveryUrl: discoveryUrl ?? `${baseUrl}${DISCOVERY_PATH}`,

    // OAuth settings with Transactional defaults
    scopes,
    pkce,

    // Profile mapper
    mapProfileToUser,

    // Spread all user-provided options (overrides defaults)
    ...rest,
  };

  return genericOAuth({
    config: [config as Parameters<typeof genericOAuth>[0]["config"][number]],
  });
};

export default transactional;

// Re-export types
export * from "./types";
export * from "./constants";
