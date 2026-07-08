export async function register() {
  // Prisma and other Node-only APIs must not run in the edge instrumentation bundle.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { configureAuthUrlForRuntime } = await import("@/lib/app-url");
  configureAuthUrlForRuntime();

  if (process.env.NODE_ENV === "production" || process.env.VALIDATE_ENV === "true") {
    const { validateEnv } = await import("@/lib/security/env");
    validateEnv();
  }

  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    const { isDatabaseConfigured } = await import("@/lib/db/is-database-configured");
    if (isDatabaseConfigured()) {
      const { settingsRepository } = await import("@/repositories/settings.repository");
      try {
        await settingsRepository.syncRazorpayFromEnv();
      } catch (error) {
        console.warn("[instrumentation] Razorpay settings sync skipped:", error);
      }
    }
  }

  if (process.env.NODE_ENV === "development") {
    const { isUploadthingConfigured } = await import("@/lib/uploadthing-env");
    if (!isUploadthingConfigured()) {
      console.warn(
        "[uploadthing] UPLOADTHING_TOKEN is not set — image uploads will fail. See .env.example",
      );
    }
  }
}
