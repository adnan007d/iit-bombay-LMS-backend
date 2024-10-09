// @ts-expect-error no declaration file
import PostgresShift from "postgres-shift";
import sql from "@/db";
import { fileURLToPath } from "url";

PostgresShift({
  sql,
  // @ts-expect-error can ignore
  path: fileURLToPath(new URL("../migrations", import.meta.url)),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  before: ({ migration_id, name }: any) => {
    console.log("Migrating", migration_id, name);
  },
})
  .then(() => {
    console.log("All good");
    sql.end({ timeout: 5 });
    process.exit(0);
  })
  .catch((err: unknown) => {
    console.error("Failed", err);
    process.exit(1);
  });
