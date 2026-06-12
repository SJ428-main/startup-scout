import { isDemoMode } from "@/lib/config";
import { seedDemoData } from "./seed";

let initialized = false;

export async function ensureDemoInitialized(): Promise<void> {
  if (!isDemoMode() || initialized) return;
  seedDemoData();
  initialized = true;
}
