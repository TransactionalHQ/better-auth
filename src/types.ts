/**
 * TypeScript types for Transactional Better Auth plugin
 */

/**
 * Transactional user profile from OIDC userinfo endpoint
 * Includes standard OIDC claims plus Transactional-specific organization claims
 */
export interface TransactionalProfile {
  /** Unique user ID (OIDC subject) */
  sub: string;
  /** User's full name */
  name?: string;
  /** User's email address */
  email?: string;
  /** Whether email is verified */
  email_verified?: boolean;
  /** User's profile picture URL */
  picture?: string;
  /** Organization ID (if user belongs to an org) */
  org_id?: string;
  /** Organization name */
  org_name?: string;
  /** User's role in the organization */
  org_role?: string;
  /** Allow additional claims */
  [key: string]: unknown;
}

/**
 * Configuration options for the Transactional Better Auth plugin
 *
 * Extends genericOAuth options - anything you can pass to genericOAuth
 * can be passed here. We provide sensible defaults for Transactional.
 */
export interface TransactionalOptions {
  // === REQUIRED ===

  /** OAuth client ID from Transactional dashboard */
  clientId: string;

  /** OAuth client secret from Transactional dashboard */
  clientSecret: string;

  /**
   * Auth domain from Transactional dashboard
   * @example "your-app-abc123.auth.usetransactional.com"
   * Can include https:// prefix or just the domain
   */
  authDomain: string;

  // === OPTIONAL WITH TRANSACTIONAL DEFAULTS ===

  /**
   * Provider ID used in Better Auth
   * @default "transactional"
   */
  providerId?: string;

  /**
   * OAuth scopes to request
   * @default ["openid", "profile", "email"]
   */
  scopes?: string[];

  /**
   * Enable PKCE (Proof Key for Code Exchange)
   * @default true (required by Transactional Auth)
   */
  pkce?: boolean;

  // === DISCOVERY & ENDPOINTS (Override auto-discovery) ===

  /**
   * Discovery URL for OIDC configuration
   * @default "https://{authDomain}/.well-known/openid-configuration"
   */
  discoveryUrl?: string;

  /** Authorization URL (overrides discovery) */
  authorizationUrl?: string;

  /** Token URL (overrides discovery) */
  tokenUrl?: string;

  /** User info URL (overrides discovery) */
  userInfoUrl?: string;

  // === OAUTH FLOW ===

  /** OAuth response type */
  responseType?: string;

  /** Response mode (query, form_post) */
  responseMode?: "query" | "form_post";

  /** Custom redirect URI */
  redirectURI?: string;

  /** Access type (offline for refresh tokens) */
  accessType?: string;

  /** Prompt behavior (login, consent, none, etc.) */
  prompt?:
    | "none"
    | "login"
    | "create"
    | "consent"
    | "select_account"
    | "select_account consent"
    | "login consent";

  // === SECURITY ===

  /** Authentication method for token endpoint (basic or post) */
  authentication?: "basic" | "post";

  // === CUSTOM HANDLERS ===
  // Note: These use Better Auth's internal types when passed to genericOAuth

  /**
   * Custom function to exchange authorization code for tokens
   * See Better Auth genericOAuth documentation for expected signature
   */
  getToken?: unknown;

  /**
   * Custom function to fetch user info
   * See Better Auth genericOAuth documentation for expected signature
   */
  getUserInfo?: unknown;

  /**
   * Custom function to map provider profile to Better Auth user
   * Receives a Record<string, unknown> profile from the OIDC provider
   */
  mapProfileToUser?: (profile: Record<string, unknown>) => Record<string, unknown>;

  // === PARAMETER CUSTOMIZATION ===

  /**
   * Additional authorization URL parameters
   */
  authorizationUrlParams?:
    | Record<string, string>
    | (() => Record<string, string>);

  /**
   * Additional token URL parameters
   */
  tokenUrlParams?: Record<string, string> | (() => Record<string, string>);

  // === HEADERS ===

  /** Custom headers for discovery request */
  discoveryHeaders?: Record<string, string>;

  /** Custom headers for authorization request */
  authorizationHeaders?: Record<string, string>;

  // === SIGN-UP CONTROL ===

  /**
   * Disable sign-up entirely (only existing users can sign in)
   * @default false
   */
  disableSignUp?: boolean;

  /**
   * Disable implicit sign-up (require explicit sign-up intent)
   * @default false
   */
  disableImplicitSignUp?: boolean;

  /**
   * Override user info in database on each sign-in
   * @default false
   */
  overrideUserInfo?: boolean;
}

/**
 * Client options for Transactional Better Auth plugin
 */
export interface TransactionalClientOptions {
  /**
   * Custom provider ID (must match server config)
   * @default "transactional"
   */
  providerId?: string;
}

/**
 * Sign-in options for the Transactional client
 */
export interface TransactionalSignInOptions {
  /** URL to redirect to after successful sign-in */
  callbackURL?: string;
  /** URL to redirect to on error */
  errorCallbackURL?: string;
  /** URL to redirect to for new users */
  newUserCallbackURL?: string;
  /** Disable automatic redirect */
  disableRedirect?: boolean;
  /** Additional scopes to request */
  scopes?: string[];
  /** Explicitly request sign-up */
  requestSignUp?: boolean;
}
