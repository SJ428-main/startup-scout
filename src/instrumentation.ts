export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  if (process.env.DEMO_MODE === "false") {
    try {
      const { initClickHouseSchema } = await import(
        "@/lib/clickhouse/init-schema"
      );
      await initClickHouseSchema();
      console.log("[startup-scout] ClickHouse schema ready");
    } catch (err) {
      console.error("[startup-scout] ClickHouse init failed:", err);
    }
    return;
  }

  const { ensureDemoInitialized } = await import("@/lib/demo/init");
  await ensureDemoInitialized();
}
