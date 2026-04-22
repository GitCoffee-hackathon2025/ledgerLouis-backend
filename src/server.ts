import buildApp from "./app";

async function start() {
  const app = await buildApp();

  await app.ready();

  try {
    await app.listen({ port: app.config.PORT });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
