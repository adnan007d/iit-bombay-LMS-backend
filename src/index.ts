import app from "./app";
import sql from "./db";
import env from "./env";

let server: ReturnType<typeof app.listen>;

async function main() {
  const port = env.PORT;
  server = app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}

main().catch((err) => {
  console.error(err);
  server?.close();
  sql.end();
  process.exit(1);
});
