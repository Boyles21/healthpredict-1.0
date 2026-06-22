import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse/sync";
import { RandomForestClassifier } from "ml-random-forest";

let _dirname = "";
try {
  const _filename = fileURLToPath(import.meta.url);
  _dirname = path.dirname(_filename);
} catch (e) {
  _dirname = process.cwd();
}

// --- Fibroid Model State ---
let fibroidModel: RandomForestClassifier | null = null;
let fibroidModelError: string | null = null;

// Decision threshold for classifying as "High Risk".
// Lower than the library default of 0.5 to favor recall, which matters
// more than precision in a health-screening context (missing a positive
// case is worse than a false alarm).
const DECISION_THRESHOLD = 0.35;

/**
 * Feature names for the fibroid dataset (16 features)
 */
const FEATURE_NAMES = [
  "Age",
  "Weight_Kg",
  "Height_Cm",
  "BMI",
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
  "Pregnancy_Difficulty",
];

const TARGET_NAME = "Fibroid_Detected";

/**
 * Utility to shuffle arrays for data splitting
 */
function shuffleData(X: number[][], y: number[]) {
  const combined = X.map((x, i) => ({ x, y: y[i] }));
  for (let i = combined.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }
  return {
    X: combined.map((item) => item.x),
    y: combined.map((item) => item.y),
  };
}

/**
 * Oversamples the minority class in the TRAINING set only, by randomly
 * duplicating minority-class rows (with replacement) until the classes
 * are balanced. This must only ever be applied to X_train/y_train —
 * never to the test set, or evaluation metrics become meaningless.
 */
function oversampleMinorityClass(X: number[][], y: number[]) {
  const positives: number[][] = [];
  const negatives: number[][] = [];

  X.forEach((row, i) => {
    if (y[i] === 1) positives.push(row);
    else negatives.push(row);
  });

  const majorityCount = Math.max(positives.length, negatives.length);
  const minority = positives.length < negatives.length ? positives : negatives;
  const minorityLabel = positives.length < negatives.length ? 1 : 0;

  const oversampledMinority: number[][] = [...minority];
  while (oversampledMinority.length < majorityCount) {
    const randomIdx = Math.floor(Math.random() * minority.length);
    oversampledMinority.push(minority[randomIdx]);
  }

  const majority = positives.length < negatives.length ? negatives : positives;
  const majorityLabel = positives.length < negatives.length ? 0 : 1;

  const X_balanced = [...majority, ...oversampledMinority];
  const y_balanced = [
    ...majority.map(() => majorityLabel),
    ...oversampledMinority.map(() => minorityLabel),
  ];

  return shuffleData(X_balanced, y_balanced);
}

/**
 * Evaluates the fibroid model using standard metrics at a given threshold.
 * Uses predictProbability + DECISION_THRESHOLD instead of the library's
 * default .predict() cutoff, so metrics reflect the actual threshold used
 * at inference time.
 */
function evaluateFibroid(X_test: number[][], y_test: number[], threshold = DECISION_THRESHOLD) {
  if (!fibroidModel || X_test.length === 0) return;

  const probabilities = fibroidModel.predictProbability(X_test, 1);
  const predictions = probabilities.map((p) => (p >= threshold ? 1 : 0));

  let tp = 0;
  let tn = 0;
  let fp = 0;
  let fn = 0;

  for (let i = 0; i < y_test.length; i++) {
    const actual = y_test[i];
    const predicted = predictions[i];

    if (predicted === 1 && actual === 1) tp++;
    else if (predicted === 0 && actual === 0) tn++;
    else if (predicted === 1 && actual === 0) fp++;
    else if (predicted === 0 && actual === 1) fn++;
  }

  const accuracy = (tp + tn) / y_test.length;
  const precision = tp / (tp + fp) || 0;
  const recall = tp / (tp + fn) || 0;
  const f1Score = (2 * (precision * recall)) / (precision + recall) || 0;

  console.log("=== FIBROID MODEL EVALUATION RESULTS ===");
  console.log(`Threshold: ${threshold}`);
  console.log(`Test set size: ${y_test.length}`);
  console.log(`Test positives: ${y_test.filter((v) => v === 1).length}, negatives: ${y_test.filter((v) => v === 0).length}`);
  console.log(`Accuracy:  ${(accuracy * 100).toFixed(2)}%`);
  console.log(`Precision: ${(precision * 100).toFixed(2)}%`);
  console.log(`Recall:    ${(recall * 100).toFixed(2)}%`);
  console.log(`F1 Score:  ${(f1Score * 100).toFixed(2)}%`);
  console.log(`TP: ${tp} | TN: ${tn} | FP: ${fp} | FN: ${fn}`);
  console.log("==========================================");

  return { accuracy, precision, recall, f1Score, tp, tn, fp, fn };
}

/**
 * Trains the fibroid RandomForest model from fibroid_dataset.csv
 */
export function trainFibroidModel() {
  console.log(">>> [FIBROID ML] Loading fibroid dataset...");
  try {
    const currentDir = process.cwd();
    const possiblePaths = [
      path.join(currentDir, "src", "data", "fibroid_dataset.csv"),
      path.join(currentDir, "dist", "data", "fibroid_dataset.csv"),
      path.resolve(_dirname, "..", "data", "fibroid_dataset.csv"),
      path.resolve(_dirname, "..", "..", "src", "data", "fibroid_dataset.csv"),
      path.resolve(_dirname, "fibroid_dataset.csv"),
    ];

    let csvPath = "";
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        csvPath = p;
        break;
      }
    }

    if (!csvPath) {
      fibroidModelError = `Fibroid dataset not found. Searched: ${possiblePaths.join(", ")}`;
      console.error(`>>> [FIBROID ML] CRITICAL: ${fibroidModelError}`);
      return;
    }

    console.log(`>>> [FIBROID ML] Found dataset at: ${csvPath}`);
    const csvData = fs.readFileSync(csvPath, "utf-8");
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const allX: number[][] = [];
    const ally: number[] = [];

    for (const row of records) {
      const features = FEATURE_NAMES.map((name) => parseFloat(row[name]));
      const target = parseFloat(row[TARGET_NAME]);

      if (features.every((f) => !isNaN(f)) && !isNaN(target)) {
        allX.push(features);
        ally.push(target);
      }
    }

    if (allX.length === 0) {
      fibroidModelError = "No valid records found in fibroid dataset";
      console.error(">>> [FIBROID ML] No valid records found for training.");
      return;
    }

    console.log(">>> [FIBROID ML] Parsed records:", allX.length);
    const totalPositives = ally.filter((v) => v === 1).length;
    console.log(
      `>>> [FIBROID ML] Class balance: ${totalPositives} positive (${((totalPositives / ally.length) * 100).toFixed(1)}%), ${
        ally.length - totalPositives
      } negative`
    );

    if (allX.length < 1000) {
      console.warn(
        `>>> [FIBROID ML] WARNING: only ${allX.length} rows parsed. If the source dataset was supposed to contain more rows, re-check the CSV file for truncation before trusting these metrics.`
      );
    }

    const shuffled = shuffleData(allX, ally);
    const splitIndex = Math.floor(shuffled.X.length * 0.8);
    const X_train = shuffled.X.slice(0, splitIndex);
    const y_train = shuffled.y.slice(0, splitIndex);
    const X_test = shuffled.X.slice(splitIndex);
    const y_test = shuffled.y.slice(splitIndex);

    // Ensure test set has both classes for meaningful metrics
    let finalX_train = X_train;
    let finalY_train = y_train;
    let finalX_test = X_test;
    let finalY_test = y_test;

    const hasBothClasses = y_test.includes(0) && y_test.includes(1);
    if (!hasBothClasses) {
      console.warn(">>> [FIBROID ML] Test split was imbalanced; re-shuffling for balanced classes...");
      let attempts = 0;
      while (attempts < 10) {
        const reshuffled = shuffleData(allX, ally);
        const reSplit = Math.floor(reshuffled.X.length * 0.8);
        const reX_test = reshuffled.X.slice(reSplit);
        const reY_test = reshuffled.y.slice(reSplit);
        if (reY_test.includes(0) && reY_test.includes(1)) {
          finalX_train = reshuffled.X.slice(0, reSplit);
          finalY_train = reshuffled.y.slice(0, reSplit);
          finalX_test = reX_test;
          finalY_test = reY_test;
          break;
        }
        attempts++;
      }
    }

    // Oversample the minority class in TRAINING data only. The test set
    // (finalX_test / finalY_test) is left at its natural distribution so
    // evaluation metrics reflect real-world performance.
    const balancedTrain = oversampleMinorityClass(finalX_train, finalY_train);
    console.log(
      `>>> [FIBROID ML] Training set balanced via oversampling: ${balancedTrain.X.length} rows (was ${finalX_train.length})`
    );

    fibroidModel = new RandomForestClassifier({
      nEstimators: 200,
      maxFeatures: 0.8, // higher than before: with 16 features, 0.3 was too restrictive per-split
      replacement: true,
      seed: 42,
      treeOptions: { maxDepth: 10, minNumSamples: 3 },
    });

    fibroidModel.train(balancedTrain.X, balancedTrain.y);
    console.log(">>> [FIBROID ML] Model trained successfully.");
    evaluateFibroid(finalX_test, finalY_test);
  } catch (error: any) {
    fibroidModelError = error.message;
    console.error(">>> [FIBROID ML] Dataset loading or training failed:", error);
  }
}

/**
 * Normalizes boolean-ish input values to 0 or 1
 */
function normalizeBool(val: any): number {
  if (val === undefined || val === null) return 0;
  if (typeof val === "boolean") return val ? 1 : 0;
  if (typeof val === "number") return val >= 0.5 ? 1 : 0;
  if (typeof val === "string") {
    const lower = val.trim().toLowerCase();
    if (lower === "yes" || lower === "true" || lower === "1" || lower === "y") return 1;
    return 0;
  }
  return 0;
}

/**
 * Runs inference on a single patient record for fibroid detection.
 * Expects `data` keys matching the FEATURE_NAMES (case-insensitive, snake/space tolerant).
 */
export function predictFibroid(data: Record<string, any>) {
  if (!fibroidModel) {
    return {
      status: "Model Not Ready",
      likelihood: 0,
      description: "The fibroid analysis system is still initializing. Please try again later.",
      color: "text-slate-400 bg-slate-50",
    };
  }

  const getVal = (key: string) => {
    const candidates = [
      key,
      key.toLowerCase(),
      key.replace(/_/g, "").toLowerCase(),
      key.replace(/_/g, " ").toLowerCase(),
    ];
    for (const c of candidates) {
      for (const k of Object.keys(data)) {
        const normalizedK = k.replace(/\s+/g, "").toLowerCase();
        if (normalizedK === c.replace(/\s+/g, "").toLowerCase()) {
          return data[k];
        }
      }
    }
    return undefined;
  };

  const age = parseFloat(getVal("Age") ?? data.age ?? 35) || 35;
  const weight = parseFloat(getVal("Weight_Kg") ?? data.weight ?? data["Weight (Kg)"] ?? 65) || 65;
  const height = parseFloat(getVal("Height_Cm") ?? data.height ?? data["Height(Cm)"] ?? 160) || 160;
  const bmi = parseFloat(getVal("BMI") ?? data.bmi ?? 25) || 25;

  const heavyBleeding = normalizeBool(getVal("Heavy_Bleeding") ?? data.heavyBleeding ?? data["Heavy Bleeding"]);
  const prolongedMenstruation = normalizeBool(getVal("Prolonged_Menstruation") ?? data.prolongedMenstruation ?? data["Prolonged Menstruation"]);
  const pelvicPain = normalizeBool(getVal("Pelvic_Pain") ?? data.pelvicPain ?? data["Pelvic Pain"]);
  const abdominalSwelling = normalizeBool(getVal("Abdominal_Swelling") ?? data.abdominalSwelling ?? data["Abdominal Swelling"]);
  const frequentUrination = normalizeBool(getVal("Frequent_Urination") ?? data.frequentUrination ?? data["Frequent Urination"]);
  const constipation = normalizeBool(getVal("Constipation") ?? data.constipation);
  const fatigueAnemia = normalizeBool(getVal("Fatigue_Anemia") ?? data.fatigueAnemia ?? data["Fatigue Anemia"]);
  const painDuringIntercourse = normalizeBool(getVal("Pain_During_Intercourse") ?? data.painDuringIntercourse ?? data["Pain During Intercourse"]);
  const lowerBackPain = normalizeBool(getVal("Lower_Back_Pain") ?? data.lowerBackPain ?? data["Lower Back Pain"]);
  const irregularMenstrualFlow = normalizeBool(getVal("Irregular_Menstrual_Flow") ?? data.irregularMenstrualFlow ?? data["Irregular Menstrual Flow"]);
  const familyHistory = normalizeBool(getVal("Family_History") ?? data.familyHistory ?? data["Family History"]);
  const pregnancyDifficulty = normalizeBool(getVal("Pregnancy_Difficulty") ?? data.pregnancyDifficulty ?? data["Pregnancy Difficulty"]);

  const inputFeatures = [
    age,
    weight,
    height,
    bmi,
    heavyBleeding,
    prolongedMenstruation,
    pelvicPain,
    abdominalSwelling,
    frequentUrination,
    constipation,
    fatigueAnemia,
    painDuringIntercourse,
    lowerBackPain,
    irregularMenstrualFlow,
    familyHistory,
    pregnancyDifficulty,
  ];

  console.log(">>> [FIBROID ML] Inference Input Array:", JSON.stringify(inputFeatures));

  // Use the real model probability and the tuned decision threshold.
  // No artificial "boost" — the displayed number IS the model's output.
  const probArray = fibroidModel.predictProbability([inputFeatures], 1);
  const prob = probArray[0] || 0;
  const predictionClass = prob >= DECISION_THRESHOLD ? 1 : 0;
  const finalLikelihood = Math.round(prob * 100);

  console.log(`>>> [FIBROID ML] Result: Class ${predictionClass}, Probability: ${finalLikelihood}% (threshold ${DECISION_THRESHOLD})`);

  if (predictionClass === 1) {
    return {
      fibroidRisk: finalLikelihood,
      prediction: "High Risk",
      status: "Potential Fibroids Detected",
      likelihood: finalLikelihood,
      description:
        "The AI model identified a pattern of clinical markers (bleeding, pain, swelling) that correlate with uterine fibroid profiles in our medical dataset. This is a screening signal, not a diagnosis — please consult a healthcare provider.",
      color: "text-amber-600 bg-amber-50",
    };
  } else {
    return {
      fibroidRisk: finalLikelihood,
      prediction: "Low Risk",
      status: "Low Risk Profile",
      likelihood: finalLikelihood,
      description:
        "Your health metrics do not currently match the primary indicators of uterine fibroids in our dataset. Maintain regular check-ups and a healthy lifestyle.",
      color: "text-emerald-600 bg-emerald-50",
    };
  }
}

export function isFibroidModelReady(): boolean {
  return fibroidModel !== null;
}

export function getFibroidModelError(): string | null {
  return fibroidModelError;
}

// Auto-train on module load
trainFibroidModel();
