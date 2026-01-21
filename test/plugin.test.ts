import { describe, it, expect, vi, beforeEach } from "vitest";
import { transactional, DEFAULT_PROVIDER_ID, DEFAULT_SCOPES } from "../src";
import { transactionalClient, createTransactionalSignInOptions } from "../src/client";

// Mock better-auth/plugins
vi.mock("better-auth/plugins", () => ({
  genericOAuth: vi.fn((options) => ({
    id: "generic-oauth",
    config: options.config,
  })),
}));

// Mock better-auth/client/plugins
vi.mock("better-auth/client/plugins", () => ({
  genericOAuthClient: vi.fn(() => ({
    id: "generic-oauth-client",
    $InferServerPlugin: {},
  })),
}));

describe("transactional server plugin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create plugin with required options", () => {
    const plugin = transactional({
      clientId: "test-client-id",
      clientSecret: "test-client-secret",
      authDomain: "test.auth.usetransactional.com",
    });

    expect(plugin).toBeDefined();
    expect(plugin.config).toHaveLength(1);

    const config = plugin.config[0];
    expect(config.providerId).toBe(DEFAULT_PROVIDER_ID);
    expect(config.clientId).toBe("test-client-id");
    expect(config.clientSecret).toBe("test-client-secret");
    expect(config.discoveryUrl).toBe(
      "https://test.auth.usetransactional.com/.well-known/openid-configuration"
    );
    expect(config.scopes).toEqual(DEFAULT_SCOPES);
    expect(config.pkce).toBe(true);
  });

  it("should handle authDomain with https:// prefix", () => {
    const plugin = transactional({
      clientId: "test-client-id",
      clientSecret: "test-client-secret",
      authDomain: "https://test.auth.usetransactional.com",
    });

    const config = plugin.config[0];
    expect(config.discoveryUrl).toBe(
      "https://test.auth.usetransactional.com/.well-known/openid-configuration"
    );
  });

  it("should handle authDomain with trailing slash", () => {
    const plugin = transactional({
      clientId: "test-client-id",
      clientSecret: "test-client-secret",
      authDomain: "https://test.auth.usetransactional.com/",
    });

    const config = plugin.config[0];
    expect(config.discoveryUrl).toBe(
      "https://test.auth.usetransactional.com/.well-known/openid-configuration"
    );
  });

  it("should allow custom providerId", () => {
    const plugin = transactional({
      clientId: "test-client-id",
      clientSecret: "test-client-secret",
      authDomain: "test.auth.usetransactional.com",
      providerId: "my-custom-provider",
    });

    const config = plugin.config[0];
    expect(config.providerId).toBe("my-custom-provider");
  });

  it("should allow custom scopes", () => {
    const customScopes = ["openid", "profile", "email", "offline_access"];
    const plugin = transactional({
      clientId: "test-client-id",
      clientSecret: "test-client-secret",
      authDomain: "test.auth.usetransactional.com",
      scopes: customScopes,
    });

    const config = plugin.config[0];
    expect(config.scopes).toEqual(customScopes);
  });

  it("should allow custom discoveryUrl", () => {
    const plugin = transactional({
      clientId: "test-client-id",
      clientSecret: "test-client-secret",
      authDomain: "test.auth.usetransactional.com",
      discoveryUrl: "https://custom.example.com/.well-known/openid-configuration",
    });

    const config = plugin.config[0];
    expect(config.discoveryUrl).toBe(
      "https://custom.example.com/.well-known/openid-configuration"
    );
  });

  it("should allow disabling PKCE", () => {
    const plugin = transactional({
      clientId: "test-client-id",
      clientSecret: "test-client-secret",
      authDomain: "test.auth.usetransactional.com",
      pkce: false,
    });

    const config = plugin.config[0];
    expect(config.pkce).toBe(false);
  });

  it("should pass through additional options", () => {
    const plugin = transactional({
      clientId: "test-client-id",
      clientSecret: "test-client-secret",
      authDomain: "test.auth.usetransactional.com",
      prompt: "login",
      accessType: "offline",
      disableSignUp: true,
    });

    const config = plugin.config[0];
    expect(config.prompt).toBe("login");
    expect(config.accessType).toBe("offline");
    expect(config.disableSignUp).toBe(true);
  });

  it("should use custom mapProfileToUser", () => {
    const customMapper = vi.fn((profile) => ({
      id: profile.sub,
      email: profile.email,
      customField: "test",
    }));

    const plugin = transactional({
      clientId: "test-client-id",
      clientSecret: "test-client-secret",
      authDomain: "test.auth.usetransactional.com",
      mapProfileToUser: customMapper,
    });

    const config = plugin.config[0];
    expect(config.mapProfileToUser).toBe(customMapper);
  });

  it("should have default mapProfileToUser that handles org claims", () => {
    const plugin = transactional({
      clientId: "test-client-id",
      clientSecret: "test-client-secret",
      authDomain: "test.auth.usetransactional.com",
    });

    const config = plugin.config[0];
    const profile = {
      sub: "user-123",
      name: "Test User",
      email: "test@example.com",
      email_verified: true,
      picture: "https://example.com/avatar.png",
      org_id: "org-456",
      org_name: "Test Org",
      org_role: "admin",
    };

    const user = config.mapProfileToUser(profile);
    expect(user).toEqual({
      id: "user-123",
      name: "Test User",
      email: "test@example.com",
      image: "https://example.com/avatar.png",
      emailVerified: true,
      organizationId: "org-456",
      organizationName: "Test Org",
      organizationRole: "admin",
    });
  });

  it("should handle profile without org claims", () => {
    const plugin = transactional({
      clientId: "test-client-id",
      clientSecret: "test-client-secret",
      authDomain: "test.auth.usetransactional.com",
    });

    const config = plugin.config[0];
    const profile = {
      sub: "user-123",
      name: "Test User",
      email: "test@example.com",
    };

    const user = config.mapProfileToUser(profile);
    expect(user).toEqual({
      id: "user-123",
      name: "Test User",
      email: "test@example.com",
      image: undefined,
      emailVerified: undefined,
    });
    expect(user.organizationId).toBeUndefined();
  });
});

describe("transactionalClient plugin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create client plugin with generic-oauth-client id", () => {
    const plugin = transactionalClient();

    expect(plugin).toBeDefined();
    // The plugin uses generic-oauth-client id for endpoint inference
    expect(plugin.id).toBe("generic-oauth-client");
  });

  it("should store providerId in $context", () => {
    const plugin = transactionalClient();

    expect(plugin).toBeDefined();
    expect((plugin as Record<string, unknown>).$context).toEqual({
      providerId: "transactional",
    });
  });

  it("should store custom providerId in $context", () => {
    const plugin = transactionalClient({ providerId: "my-custom-provider" });

    expect(plugin).toBeDefined();
    expect((plugin as Record<string, unknown>).$context).toEqual({
      providerId: "my-custom-provider",
    });
  });
});

describe("createTransactionalSignInOptions helper", () => {
  it("should create options with default providerId", () => {
    const options = createTransactionalSignInOptions();

    expect(options.providerId).toBe("transactional");
  });

  it("should create options with custom providerId", () => {
    const options = createTransactionalSignInOptions({
      providerId: "my-custom-provider",
    });

    expect(options.providerId).toBe("my-custom-provider");
  });

  it("should pass through callback URLs", () => {
    const options = createTransactionalSignInOptions({
      callbackURL: "/dashboard",
      errorCallbackURL: "/error",
      newUserCallbackURL: "/welcome",
    });

    expect(options).toEqual({
      providerId: "transactional",
      callbackURL: "/dashboard",
      errorCallbackURL: "/error",
      newUserCallbackURL: "/welcome",
    });
  });

  it("should pass through all sign-in options", () => {
    const options = createTransactionalSignInOptions({
      callbackURL: "/dashboard",
      errorCallbackURL: "/error",
      newUserCallbackURL: "/welcome",
      disableRedirect: true,
      scopes: ["custom:scope"],
      requestSignUp: true,
    });

    expect(options).toEqual({
      providerId: "transactional",
      callbackURL: "/dashboard",
      errorCallbackURL: "/error",
      newUserCallbackURL: "/welcome",
      disableRedirect: true,
      scopes: ["custom:scope"],
      requestSignUp: true,
    });
  });
});

describe("exports", () => {
  it("should export transactional function", async () => {
    const { transactional } = await import("../src");
    expect(typeof transactional).toBe("function");
  });

  it("should export transactionalClient function", async () => {
    const { transactionalClient } = await import("../src/client");
    expect(typeof transactionalClient).toBe("function");
  });

  it("should export createTransactionalSignInOptions function", async () => {
    const { createTransactionalSignInOptions } = await import("../src/client");
    expect(typeof createTransactionalSignInOptions).toBe("function");
  });

  it("should export constants", async () => {
    const { DEFAULT_PROVIDER_ID, DEFAULT_SCOPES, DISCOVERY_PATH } = await import(
      "../src"
    );
    expect(DEFAULT_PROVIDER_ID).toBe("transactional");
    expect(DEFAULT_SCOPES).toEqual(["openid", "profile", "email"]);
    expect(DISCOVERY_PATH).toBe("/.well-known/openid-configuration");
  });

  it("should export types", async () => {
    // Type exports don't have runtime values, but we can verify the module loads
    const module = await import("../src/types");
    expect(module).toBeDefined();
  });
});
