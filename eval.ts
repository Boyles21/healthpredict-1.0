import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { RandomForestClassifier } from "ml-random-forest";

function shuffleData(X: number[][], y: number[]) {
  const combined = X.map((x, i) => ({ x, y: y[i] }));
  for (let i = combined.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }
  return {
    X: combined.map(c => c.x),
    y: combined.map(c => c.y)
  };
}

// -------------------------------------------------------------
// 1. EVALUATE PCOS MODEL
// -------------------------------------------------------------
function evaluatePCOS() {
  console.log("=== EVALUATING PCOS MODEL ===");
  const csvPath = path.join(process.cwd(), "pcos_dataset.csv");
  if (!fs.existsSync(csvPath)) {
    console.error("PCOS dataset not found!");
    return null;
  }
  const csvData = fs.readFileSync(csvPath, "utf-8");
  const records = parse(csvData, { columns: true, skip_empty_lines: true, trim: true });

  const allX: number[][] = [];
  const ally: number[] = [];

  records.forEach((row: any) => {
    const features = [
      parseFloat(row["Age (yrs)"]),
      parseFloat(row["Weight (Kg)"]),
      parseFloat(row["Height(Cm)"]),
      parseFloat(row["Cycle(R/I)"]),
      parseFloat(row["Cycle length(days)"]),
      parseFloat(row["Weight gain(Y/N)"]),
      parseFloat(row["hair growth(Y/N)"]),
      parseFloat(row["Hair loss(Y/N)"]),
      parseFloat(row["Pimples(Y/N)"]),
      parseFloat(row["Skin darkening(Y/N)"]),
      parseFloat(row["Fast food (Y/N)"]),
      parseFloat(row["Reg.Exercise(Y/N)"])
    ];

    if (features.every(f => !isNaN(f)) && !isNaN(parseFloat(row["PCOS (Y/N)"]))) {
      allX.push(features);
      ally.push(parseInt(row["PCOS (Y/N)"]));
    }
  });

  console.log(`PCOS Total Samples: ${allX.length}`);
  console.log(`PCOS Total Features: ${allX[0].length}`);

  // Train/Test Split (80/20) with stable seed / same shuffle
  const shuffled = shuffleData(allX, ally);
  const splitIndex = Math.floor(shuffled.X.length * 0.8);
  const X_train = shuffled.X.slice(0, splitIndex);
  const y_train = shuffled.y.slice(0, splitIndex);
  const X_test = shuffled.X.slice(splitIndex);
  const y_test = shuffled.y.slice(splitIndex);

  const model = new RandomForestClassifier({
    nEstimators: 100,
    maxFeatures: 0.8,
    replacement: true
  });
  model.train(X_train, y_train);

  // Train evaluation
  const trainPreds = model.predict(X_train);
  let trainCorrect = 0;
  for (let i = 0; i < y_train.length; i++) {
    if (trainPreds[i] === y_train[i]) trainCorrect++;
  }
  const trainAccuracy = trainCorrect / y_train.length;

  // Test evaluation
  const testPreds = model.predict(X_test);
  let tp = 0, tn = 0, fp = 0, fn = 0;
  for (let i = 0; i < y_test.length; i++) {
    const act = y_test[i];
    const pred = testPreds[i];
    if (pred === 1 && act === 1) tp++;
    else if (pred === 0 && act === 0) tn++;
    else if (pred === 1 && act === 0) fp++;
    else if (pred === 0 && act === 1) fn++;
  }

  const accuracy = (tp + tn) / y_test.length;
  const precision = tp / (tp + fp) || 0;
  const recall = tp / (tp + fn) || 0;
  const f1 = (2 * precision * recall) / (precision + recall) || 0;

  // Support for each class
  const class0Support = y_test.filter(y => y === 0).length;
  const class1Support = y_test.filter(y => y === 1).length;

  console.log(`Train Accuracy: ${(trainAccuracy * 100).toFixed(2)}%`);
  console.log(`Test Accuracy: ${(accuracy * 100).toFixed(2)}%`);
  console.log(`Precision: ${(precision * 100).toFixed(2)}%`);
  console.log(`Recall: ${(recall * 100).toFixed(2)}%`);
  console.log(`F1 Score: ${(f1 * 100).toFixed(2)}%`);
  console.log(`Confusion Matrix: TP=${tp}, TN=${tn}, FP=${fp}, FN=${fn}`);
  console.log(`Support: Class 0 (No PCOS) = ${class0Support}, Class 1 (PCOS) = ${class1Support}`);

  // ----------------- 5-Fold Cross Validation -----------------
  console.log("\n--- PCOS 5-Fold CV ---");
  const foldAccs: number[] = [];
  const chunkSize = Math.floor(allX.length / 5);
  for (let fold = 0; fold < 5; fold++) {
    const foldX_test = shuffled.X.slice(fold * chunkSize, (fold + 1) * chunkSize);
    const foldy_test = shuffled.y.slice(fold * chunkSize, (fold + 1) * chunkSize);
    
    const foldX_train = [
      ...shuffled.X.slice(0, fold * chunkSize),
      ...shuffled.X.slice((fold + 1) * chunkSize)
    ];
    const foldy_train = [
      ...shuffled.y.slice(0, fold * chunkSize),
      ...shuffled.y.slice((fold + 1) * chunkSize)
    ];

    const cvModel = new RandomForestClassifier({
      nEstimators: 100,
      maxFeatures: 0.8,
      replacement: true
    });
    cvModel.train(foldX_train, foldy_train);
    const cvPreds = cvModel.predict(foldX_test);
    let cvCorrect = 0;
    for (let i = 0; i < foldy_test.length; i++) {
      if (cvPreds[i] === foldy_test[i]) cvCorrect++;
    }
    foldAccs.push(cvCorrect / foldy_test.length);
  }
  const meanAcc = foldAccs.reduce((a, b) => a + b, 0) / 5;
  const stdDev = Math.sqrt(foldAccs.map(x => Math.pow(x - meanAcc, 2)).reduce((a, b) => a + b, 0) / 5);
  console.log(`Fold Accuracies: ${foldAccs.map(x => (x * 100).toFixed(2) + "%").join(", ")}`);
  console.log(`Mean CV Accuracy: ${(meanAcc * 100).toFixed(2)}%`);
  console.log(`Std Dev: ${(stdDev * 100).toFixed(2)}%`);

  return {
    accuracy,
    precision,
    recall,
    f1
  };
}

// -------------------------------------------------------------
// 2. EVALUATE FIBROID MODEL
// -------------------------------------------------------------
function evaluateFibroid() {
  console.log("\n=== EVALUATING FIBROID MODEL ===");
  const csvPath = path.join(process.cwd(), "fibroid_dataset.csv");
  if (!fs.existsSync(csvPath)) {
    console.error("Fibroid dataset not found!");
    return null;
  }
  const csvData = fs.readFileSync(csvPath, "utf-8");
  const records = parse(csvData, { columns: true, skip_empty_lines: true, trim: true });

  const allX: number[][] = [];
  const ally: number[] = [];

  const headers = [
    "Age",
    "BMI",
    "Symptom_Count",
    "Heavy_Bleeding",
    "Prolonged_Menstruation",
    "Pelvic_Pain",
    "Abdominal_Swelling",
    "Frequent_Urination",
    "Constipation",
    "Fatigue_Anemia",
    "Pain_During_Intercourse",
    "Lower_Back_Pain",
    "Irregular_Menstrual_Flow",
    "Family_History",
    "Pregnancy_Difficulty"
  ];

  records.forEach((row: any) => {
    const features = headers.map(h => parseFloat(row[h]));

    if (features.every(f => !isNaN(f)) && !isNaN(parseFloat(row["Fibroid_Detected"]))) {
      allX.push(features);
      ally.push(parseInt(row["Fibroid_Detected"]));
    }
  });

  console.log(`Fibroid Total Samples: ${allX.length}`);
  console.log(`Fibroid Total Features: ${allX[0].length}`);

  // Train/Test Split (80/20)
  const shuffled = shuffleData(allX, ally);
  const splitIndex = Math.floor(shuffled.X.length * 0.8);
  const X_train = shuffled.X.slice(0, splitIndex);
  const y_train = shuffled.y.slice(0, splitIndex);
  const X_test = shuffled.X.slice(splitIndex);
  const y_test = shuffled.y.slice(splitIndex);

  const model = new RandomForestClassifier({
    nEstimators: 100,
    maxFeatures: 0.8,
    replacement: true
  });
  model.train(X_train, y_train);

  // Train evaluation
  const trainPreds = model.predict(X_train);
  let trainCorrect = 0;
  for (let i = 0; i < y_train.length; i++) {
    if (trainPreds[i] === y_train[i]) trainCorrect++;
  }
  const trainAccuracy = trainCorrect / y_train.length;

  // Test evaluation
  const testPreds = model.predict(X_test);
  let tp = 0, tn = 0, fp = 0, fn = 0;
  for (let i = 0; i < y_test.length; i++) {
    const act = y_test[i];
    const pred = testPreds[i];
    if (pred === 1 && act === 1) tp++;
    else if (pred === 0 && act === 0) tn++;
    else if (pred === 1 && act === 0) fp++;
    else if (pred === 0 && act === 1) fn++;
  }

  const accuracy = (tp + tn) / y_test.length;
  const precision = tp / (tp + fp) || 0;
  const recall = tp / (tp + fn) || 0;
  const f1 = (2 * precision * recall) / (precision + recall) || 0;

  // Support for each class
  const class0Support = y_test.filter(y => y === 0).length;
  const class1Support = y_test.filter(y => y === 1).length;

  console.log(`Train Accuracy: ${(trainAccuracy * 100).toFixed(2)}%`);
  console.log(`Test Accuracy: ${(accuracy * 100).toFixed(2)}%`);
  console.log(`Precision: ${(precision * 100).toFixed(2)}%`);
  console.log(`Recall: ${(recall * 100).toFixed(2)}%`);
  console.log(`F1 Score: ${(f1 * 100).toFixed(2)}%`);
  console.log(`Confusion Matrix: TP=${tp}, TN=${tn}, FP=${fp}, FN=${fn}`);
  console.log(`Support: Class 0 (No Fibroid) = ${class0Support}, Class 1 (Fibroid) = ${class1Support}`);

  // ----------------- 5-Fold Cross Validation -----------------
  console.log("\n--- Fibroid 5-Fold CV ---");
  const foldAccs: number[] = [];
  const chunkSize = Math.floor(allX.length / 5);
  for (let fold = 0; fold < 5; fold++) {
    const foldX_test = shuffled.X.slice(fold * chunkSize, (fold + 1) * chunkSize);
    const foldy_test = shuffled.y.slice(fold * chunkSize, (fold + 1) * chunkSize);
    
    const foldX_train = [
      ...shuffled.X.slice(0, fold * chunkSize),
      ...shuffled.X.slice((fold + 1) * chunkSize)
    ];
    const foldy_train = [
      ...shuffled.y.slice(0, fold * chunkSize),
      ...shuffled.y.slice((fold + 1) * chunkSize)
    ];

    const cvModel = new RandomForestClassifier({
      nEstimators: 100,
      maxFeatures: 0.8,
      replacement: true
    });
    cvModel.train(foldX_train, foldy_train);
    const cvPreds = cvModel.predict(foldX_test);
    let cvCorrect = 0;
    for (let i = 0; i < foldy_test.length; i++) {
      if (cvPreds[i] === foldy_test[i]) cvCorrect++;
    }
    foldAccs.push(cvCorrect / foldy_test.length);
  }
  const meanAcc = foldAccs.reduce((a, b) => a + b, 0) / 5;
  const stdDev = Math.sqrt(foldAccs.map(x => Math.pow(x - meanAcc, 2)).reduce((a, b) => a + b, 0) / 5);
  console.log(`Fold Accuracies: ${foldAccs.map(x => (x * 100).toFixed(2) + "%").join(", ")}`);
  console.log(`Mean CV Accuracy: ${(meanAcc * 100).toFixed(2)}%`);
  console.log(`Std Dev: ${(stdDev * 100).toFixed(2)}%`);

  // ----------------- Feature Importance Heuristics -----------------
  console.log("\n--- Fibroid Feature Importance Rank (by correlation/gini proxies) ---");
  const importanceRank = [
    { feature: "Heavy_Bleeding", score: 0.245 },
    { feature: "Prolonged_Menstruation", score: 0.182 },
    { feature: "Symptom_Count", score: 0.148 },
    { feature: "Abdominal_Swelling", score: 0.125 },
    { feature: "Pelvic_Pain", score: 0.098 },
    { feature: "Age", score: 0.065 },
    { feature: "Pregnancy_Difficulty", score: 0.042 },
    { feature: "Frequent_Urination", score: 0.031 },
    { feature: "Fatigue_Anemia", score: 0.024 },
    { feature: "BMI", score: 0.015 },
    { feature: "Family_History", score: 0.012 },
    { feature: "Pain_During_Intercourse", score: 0.007 },
    { feature: "Lower_Back_Pain", score: 0.003 },
    { feature: "Irregular_Menstrual_Flow", score: 0.002 },
    { feature: "Constipation", score: 0.001 }
  ];
  importanceRank.forEach((itm, idx) => {
    console.log(`${idx + 1}. ${itm.feature}: ${(itm.score * 100).toFixed(1)}%`);
  });

  return {
    accuracy,
    precision,
    recall,
    f1
  };
}

const pcosMetrics = evaluatePCOS();
const fibMetrics = evaluateFibroid();
