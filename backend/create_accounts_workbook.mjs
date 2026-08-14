import fs from "node:fs/promises";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputPath = new URL("./data/farmer_accounts.xlsx", import.meta.url).pathname;
await fs.mkdir(new URL("./data/", import.meta.url), { recursive: true });
const workbook = Workbook.create();
const sheet = workbook.worksheets.add("Accounts");
sheet.showGridLines = false;
sheet.getRange("A1:I1").values = [["User ID", "Full Name", "Phone", "Email", "Password Hash", "Password Salt", "Provider", "Created At", "Last Login"]];
sheet.getRange("A1:I1").format = { fill: "#1F6B3A", font: { bold: true, color: "#FFFFFF" }, horizontalAlignment: "center", borders: { preset: "outside", style: "thin", color: "#1F6B3A" } };
sheet.getRange("A1:I2").format.borders = { preset: "inside", style: "thin", color: "#D9E5DB" };
sheet.getRange("A1:I1").format.rowHeight = 24;
for (const [range, width] of [["A:A",18],["B:B",24],["C:C",18],["D:D",30],["E:E",45],["F:F",30],["G:G",14],["H:I",22]]) sheet.getRange(range).format.columnWidth = width;
sheet.freezePanes.freezeRows(1);
const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(outputPath);
