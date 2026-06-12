export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.DEMO_MODE !== "false") {
    const { ensureDemoInitialized } = await import("@/lib/demo/init");
    await ensureDemoInitialized();
  }
}
