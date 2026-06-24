import fs from "fs";
import { parse } from "csv-parse/sync";

const csvData = fs.readFileSync("fibroid_dataset.csv", "utf-8");
const records = parse(csvData, { columns: true, skip_empty_lines: true, trim: true });

console.log("Analyzing high symptom count rows...\n");

for (let sc = 5; sc <= 10; sc++) {
  const matchingRows = records.filter((row: any) => {
    const computedSymptomCount = 
      (parseInt(row["Heavy_Bleeding"]) || 0) +
      (parseInt(row["Prolonged_Menstruation"]) || 0) +
      (parseInt(row["Pelvic_Pain"]) || 0) +
      (parseInt(row["Abdominal_Swelling"]) || 0) +
      (parseInt(row["Frequent_Urination"]) || 0) +
      (parseInt(row["Constipation"]) || 0) +
      (parseInt(row["Fatigue_Anemia"]) || 0) +
      (parseInt(row["Pain_During_Intercourse"]) || 0) +
      (parseInt(row["Lower_Back_Pain"]) || 0) +
      (parseInt(row["Irregular_Menstrual_Flow"]) || 0);
    return computedSymptomCount === sc;
  });

  const detected = matchingRows.filter((r: any) => parseInt(r["Fibroid_Detected"]) === 1).length;
  const notDetected = matchingRows.length - detected;

  console.log(`Computed Symptom Count = ${sc}: Total Rows = ${matchingRows.length}, Detected = ${detected}, Not Detected = ${notDetected}, % Detected = ${matchingRows.length > 0 ? ((detected / matchingRows.length) * 100).toFixed(1) + "%" : "0%"}`);
}
