import "dotenv/config";
import * as fs from "fs";
import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});
const databaseId = process.env.NOTION_DATABASE;

async function read() {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
    });
    const recipes = [];

    if (response && response.results) {
      for (const r of response.results) {
        recipes.push({
          url: r.url,
          title: r.properties.Name.title[0].plain_text,
          ingredients: r.properties.Ingredients.multi_select.map(
            ({ name }) => name
          ),
        });
      }
    }

    fs.writeFileSync("src/recipes.json", JSON.stringify(recipes), "utf-8");
    console.log("Success! Entry added.");
  } catch (error) {
    console.error(error.body);
  }
}

read();
