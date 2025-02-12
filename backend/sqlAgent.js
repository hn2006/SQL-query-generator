const dotenv = require("dotenv");

dotenv.config();

const { GoogleGenerativeAI } = require("@google/generative-ai");
const apiKey = process.env.GEMINI_API_KEY
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
});
module.exports = async function generateSQL(queryRequest, metadata) {
  try {
    const prompt = `
        You are an expert in SQL and relational databases. Based on the following database schema and query request, generate an optimized SQL query.

        ### Database Schema(metadata):
        ${JSON.stringify(metadata, null, 2)}

        ### Query Request:
        "${queryRequest}"

        ### Instructions:
        1. if you think prompt is out of the context of metadata provided give response like prompt is not related.
        2. Write a sql query with taking fields and tables as specified in the metadata provided and also try to find the nearest field or table.
        3. Ensure proper \`JOIN\` conditions for foreign keys.
        4. Include filtering and ordering where necessary.
        5. just return the query in the form of string
        6. try not to use join if information is asked about only one table
        7. dont include any comments just return the query
    `;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    const match = response.match(/```sql\n([\s\S]*?)\n```/);
    const sqlQuery = match ? match[1].trim() : response.trim();
    return sqlQuery;
  } catch (error) {
    console.error("Error generating SQL:", error);
    throw new Error("Failed to generate SQL query.");
  }
}

