import { tomorrowIST } from '../utils/date.js';
import { runPipeline } from './pipeline.service.js';
import { logger } from '../utils/logger.js';

function parseArgs() {
  const args = process.argv.slice(2);
  let date = tomorrowIST();
  let force = false;
  let dryRun = false;

  for (const arg of args) {
    if (arg.startsWith('--date=')) {
      date = arg.slice(7).trim();
    } else if (arg === '--force') {
      force = true;
    } else if (arg === '--dry-run') {
      dryRun = true;
    }
  }

  return { date, force, dryRun };
}

async function main() {
  const { date, force, dryRun } = parseArgs();
  try {
    await runPipeline({ date, force, dryRun });
    process.exit(0);
  } catch (err) {
    logger.fatal({ err: err.message }, 'Pipeline execution failed');
    process.exit(1);
  }
}

main();
