import postgres from "postgres";
import env from "@/env";

const { PGHOST, PGDATABASE, PGUSER, ENDPOINT_ID } = env;
const PGPASSWORD = decodeURIComponent(env.PGPASSWORD);

const sql = postgres({
  host: PGHOST,
  database: PGDATABASE,
  username: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: env.SSL_REQUIRE ? "require" : false,
  connection: {
    options: ENDPOINT_ID ? `project=${ENDPOINT_ID}` : undefined,
  },
});

export default sql;
