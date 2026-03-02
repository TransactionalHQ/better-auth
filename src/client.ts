/**
 * Transactional Better Auth Plugin - Client
 *
 * Client-side plugin for Transactional Auth.
 * Re-exports genericOAuthClient for OAuth2 functionality.
 *
 * @example
 * ```typescript
 * import { createAuthClient } from "better-auth/react";
 * import { transactionalClient } from "@usetransactional/better-auth/client";
 *
 * export const authClient = createAuthClient({
 *   plugins: [transactionalClient()]
 * });
 *
 * // Sign in with Transactional using the genericOAuth method
 * authClient.signIn.oauth2({
 *   providerId: "transactional",
 *   callbackURL: "/dashboard"
 * });
 * ```
 */

import { genericOAuthClient } from "better-auth/client/plugins";
import type { BetterAuthClientPlugin } from "better-auth/client";
import type { TransactionalClientOptions } from "./types";
import { DEFAULT_PROVIDER_ID } from "./constants";

// Re-export genericOAuthClient for convenience
export { genericOAuthClient };

/**
 * Better Auth client plugin for Transactional Auth
 *
 * This plugin re-exports genericOAuthClient functionality and provides
 * type inference for the Transactional server plugin.
 *
 * @param options - Client plugin options (optional)
 * @returns Better Auth client plugin instance
 *
 * @example
 * ```typescript
 * import { createAuthClient } from "better-auth/react";
 * import { transactionalClient } from "@usetransactional/better-auth/client";
 *
 * const authClient = createAuthClient({
 *   plugins: [transactionalClient()]
 * });
 *
 * // Sign in with Transactional
 * authClient.signIn.oauth2({
 *   providerId: "transactional",
 *   callbackURL: "/dashboard"
 * });
 * ```
 *
 * @example With custom provider ID (must match server config)
 * ```typescript
 * const authClient = createAuthClient({
 *   plugins: [transactionalClient({ providerId: "my-transactional" })]
 * });
 *
 * authClient.signIn.oauth2({
 *   providerId: "my-transactional",
 *   callbackURL: "/dashboard"
 * });
 * ```
 */
export const transactionalClient = (
  options?: TransactionalClientOptions
): BetterAuthClientPlugin => {
  const providerId = options?.providerId ?? DEFAULT_PROVIDER_ID;

  // Get the base genericOAuthClient
  const oauthClient = genericOAuthClient();

  // Spread oauthClient properties but ensure our id takes precedence
  const { id: _id, ...oauthClientRest } = oauthClient;

  return {
    // Spread the rest of oauthClient properties
    ...oauthClientRest,

    // Use generic-oauth-client id to get endpoint inference
    id: "generic-oauth-client",

    // Store the provider ID for convenience helper functions
    $context: {
      providerId,
    },
  } as BetterAuthClientPlugin;
};

/**
 * Helper function to create sign-in options for Transactional
 *
 * Use this to generate the correct options for signIn.oauth2()
 *
 * @param providerId - The provider ID (default: "transactional")
 * @param options - Additional sign-in options
 * @returns The options object for signIn.oauth2()
 *
 * @example
 * ```typescript
 * import { createTransactionalSignInOptions } from "@usetransactional/better-auth/client";
 *
 * authClient.signIn.oauth2(createTransactionalSignInOptions({
 *   callbackURL: "/dashboard"
 * }));
 * ```
 */
export const createTransactionalSignInOptions = (
  options?: {
    providerId?: string;
    callbackURL?: string;
    errorCallbackURL?: string;
    newUserCallbackURL?: string;
    disableRedirect?: boolean;
    scopes?: string[];
    requestSignUp?: boolean;
  }
) => ({
  providerId: options?.providerId ?? DEFAULT_PROVIDER_ID,
  ...options,
});

export default transactionalClient;

// Re-export types
export type { TransactionalClientOptions, TransactionalSignInOptions } from "./types";
