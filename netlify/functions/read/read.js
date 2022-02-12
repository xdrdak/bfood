const { Client } = require("pg");

const { PG_CONNECTION_STRING } = process.env;
const client = new Client({
  connectionString: PG_CONNECTION_STRING,
});

exports.handler = async () => {
  let res;
  try {
    await client.connect();
    res = await client.query(`SELECT * FROM "public"."foodlist" LIMIT 20`);
  } catch (e) {
    throw new Error(e);
  } finally {
    await client.end();
  }

  return {
    statusCode: 200,
    body: JSON.stringify(res),
  };
};
