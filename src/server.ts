import buildApp from "./app.js";
import dns from "dns";

dns.setDefaultResultOrder("ipv4first");
async function start() {
  const app = await buildApp();

  await app.ready();

  try {
    await app.listen({ port: app.config.PORT, host: '0.0.0.0' });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
