const fs = require("fs");
const { Parser } = require("node-sql-parser");

function parseSQLFile(filePath) {
  try {
    const sql = fs.readFileSync(`uploads/${filePath}`, "utf8");
    const parser = new Parser();
    const ast = parser.astify(sql, { database: "mysql" });
    const schemaMetadata = extractMetadata(Array.isArray(ast) ? ast : [ast]);
    return schemaMetadata;
  } catch (error) {
    console.error("Error parsing SQL:", error);
    throw new Error("Failed to parse SQL file.");
  }
}

function extractMetadata(statements) {
  const tables = {};
  const relationships = [];
  statements.forEach(statement => {
    if (
      statement.type === "create" &&
      statement.keyword &&
      statement.keyword.toLowerCase() === "table" &&
      statement.table &&
      Array.isArray(statement.table) &&
      statement.table.length > 0
    ) {
      processCreateTable(statement, tables, relationships);
    } else if (
      statement.type === "alter" &&
      statement.table &&
      Array.isArray(statement.table) &&
      statement.table.length > 0
    ) {
      processAlterTable(statement, tables, relationships);
    }
  });
  return { tables, relationships };
}

function processCreateTable(statement, tables, relationships) {
  const tableName = statement.table[0].table;
  const tableObj = { columns: [], primaryKeys: [], foreignKeys: [], indexes: [] };
  if (statement.create_definitions && Array.isArray(statement.create_definitions)) {
    statement.create_definitions.forEach(def => {
      if (def.resource === "column") {
        const colName = def.column.column;
        const colType = def.definition.dataType || "";
        let constraints = [];
        if (def.primary_key) {
          constraints.push("primary key");
          tableObj.primaryKeys.push(colName);
        }
        if (def.unique) {
          constraints.push("unique");
        }
        tableObj.columns.push({ name: colName, type: colType, constraints });
      } else if (def.resource === "constraint") {
        const constraintType = def.constraint_type ? def.constraint_type.toLowerCase() : "";
        if (constraintType === "primary key") {
          const pkColumns = def.definition.map(col => col.column);
          tableObj.primaryKeys.push(...pkColumns);
        } else if (constraintType === "foreign key") {
          const fkColumn = def.definition[0].column;
          const refTable =
            def.reference_definition &&
            def.reference_definition.table &&
            def.reference_definition.table[0]
              ? def.reference_definition.table[0].table
              : "";
          const refColumn =
            def.reference_definition &&
            def.reference_definition.definition &&
            def.reference_definition.definition[0]
              ? def.reference_definition.definition[0].column
              : "";
          tableObj.foreignKeys.push({ column: fkColumn, references: { table: refTable, column: refColumn } });
          relationships.push({ table: tableName, column: fkColumn, references_table: refTable, references_column: refColumn });
        }
      } else if (def.resource === "index") {
        const indexName = def.index;
        const indexColumns = def.definition.map(col => col.column);
        tableObj.indexes.push({ name: indexName, columns: indexColumns });
      }
    });
  }
  tables[tableName] = tableObj;
}

function processAlterTable(statement, tables, relationships) {
  const tableName = statement.table[0].table;
  if (!tables[tableName]) {
    tables[tableName] = { columns: [], primaryKeys: [], foreignKeys: [], indexes: [] };
  }
  const tableObj = tables[tableName];
  const alterations = statement.alter_definitions || statement.expr;
  if (alterations && Array.isArray(alterations)) {
    alterations.forEach(def => {
      const action = def.action ? def.action.toLowerCase() : "";
      if (action === "add") {
        if (def.resource === "column") {
          const colName = def.column.column;
          const colType = def.definition ? def.definition.dataType : def.dataType || "";
          tableObj.columns.push({ name: colName, type: colType, constraints: [] });
        } else if (def.resource === "constraint") {
          if (def.create_definitions) {
            const constraint = def.create_definitions;
            const constraintType = constraint.constraint_type ? constraint.constraint_type.toLowerCase() : "";
            if (constraintType === "foreign key") {
              const fkColumn = constraint.definition[0].column;
              const refTable =
                constraint.reference_definition &&
                constraint.reference_definition.table &&
                constraint.reference_definition.table[0]
                  ? constraint.reference_definition.table[0].table
                  : "";
              const refColumn =
                constraint.reference_definition &&
                constraint.reference_definition.definition &&
                constraint.reference_definition.definition[0]
                  ? constraint.reference_definition.definition[0].column
                  : "";
              tableObj.foreignKeys.push({ column: fkColumn, references: { table: refTable, column: refColumn } });
              relationships.push({ table: tableName, column: fkColumn, references_table: refTable, references_column: refColumn });
            }
          }
        }
      } else if (action === "drop") {
        if (def.resource === "column") {
          const colName = def.column.column;
          tableObj.columns = tableObj.columns.filter(col => col.name !== colName);
        }
      } else if (action === "modify") {
        if (def.resource === "column") {
          const colName = def.column.column;
          const colType = def.definition ? def.definition.dataType : def.dataType || "";
          const col = tableObj.columns.find(c => c.name === colName);
          if (col) {
            col.type = colType;
          }
        }
      }
    });
  }
}

module.exports = parseSQLFile;
