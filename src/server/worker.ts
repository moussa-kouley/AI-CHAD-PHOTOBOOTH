import { processDueJobs } from "../lib/jobs";
import { logger } from "../lib/logger";

const intervalMs = Number(process.env.WORKER_INTERVAL_MS || 1000);
let busy = false;

async function tick() {
  if (busy) return;
  busy = true;
  try {
    await processDueJobs(6);
  } catch (error) {
    logger.error({ error }, "Worker tick failed");
  } finally {
    busy = false;
  }
}

logger.info({ intervalMs }, "Studio IA worker started");
void tick();
setInterval(() => {
  void tick();
}, intervalMs);
