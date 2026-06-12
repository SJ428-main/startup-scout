import { seedDemoData } from "../src/lib/demo/seed";
import { runFullPipeline } from "../src/agents/orchestrator";

process.env.DEMO_MODE = "true";

async function main() {
  seedDemoData();
  console.log("=== Startup Scout — Demo Pipeline ===\n");
  const result = await runFullPipeline();
  console.log("\n=== Complete ===");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
