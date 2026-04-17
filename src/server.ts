import buildApp from "./app";

async function start() {
  const app = await buildApp();

  await app.ready();

  try {
    console.log(app.printRoutes());
    await app.listen({ port: app.config.PORT });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
