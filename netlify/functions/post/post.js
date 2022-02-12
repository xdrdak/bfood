const { Client } = require("pg");

const { PG_CONNECTION_STRING, X_PASSWORD } = process.env;

const client = new Client({
  connectionString: PG_CONNECTION_STRING,
});

exports.handler = async (event) => {
  const xPassword = event["x-password"];
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  if (!xPassword || xPassword !== X_PASSWORD) {
    return { statusCode: 403, body: "Forbidden" };
  }

  const params = new URLSearchParams(event.body);
  const recipe = params.get("recipe");

  if (!recipe || typeof recipe !== "string") {
    return { statusCode: 400, body: "Bad Request. Missing recipe" };
  }

  await client.connect();
  await client.query("INSERT INTO foodlist(DATA) values($1::text)", [recipe]);
  await client.end();

  return {
    statusCode: 200,
    body: `ok`,
  };
};
