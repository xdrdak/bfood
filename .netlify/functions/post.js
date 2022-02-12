const { Client } = require("pg");

const { PG_CONNECTION_STRING } = process.env;

const client = new Client({
  connectionString: PG_CONNECTION_STRING,
});

exports.handler = async (event, context) => {
  console.log(event, context);
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // When the method is POST, the name will no longer be in the event’s
  // queryStringParameters – it’ll be in the e vent body encoded as a query string
  const params = new URLSearchParams(event.body);
  const name = params.get("name") || "World";

  return {
    statusCode: 200,
    body: `Hello, ${name}`,
  };
};
