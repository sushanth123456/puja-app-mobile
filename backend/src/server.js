const app = require('./app');
const config = require('./config');
const db = require('./db');

async function start() {
  await db.query('SELECT 1');
  app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`PujaConnect backend listening on port ${config.port}`);
  });
}

start().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start backend:', error);
  process.exit(1);
});
