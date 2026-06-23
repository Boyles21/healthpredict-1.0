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
// 0.5 is reasonable here because the training data is already balanced
// (50/50), unlike the old imbalanced 1000-row dataset. If recall/precision
// need adjusting after real-world testing, tune this value.
const DECISION_THRESHOLD = 0.5;

/**
 * Feature names matching fibroid_dataset_balanced.csv EXACTLY, in order.
 * NOTE: this schema differs from the original 1000-row dataset —
 * Weight_Kg and Height_Cm are NOT present; BMI and Symptom_Count are used
 * instead. The frontend form must compute Symptom_Count (sum of the
 * symptom booleans below) before calling the prediction endpoint.
 */
const FEATURE_NAMES = [
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
  "Pregnancy_Difficulty",
];

const TARGET_NAME = "Fibroid_Detected";

/**
 * Boolean symptom fields used to compute Symptom_Count when not supplied directly.
 */
const SYMPTOM_FIELDS = [
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
 * Oversamples the minority class in the TRAINING set only. Since the
 * balanced CSV is already ~50/50, this should be close to a no-op most of
 * the time — it's kept as a safety net in case a future data refresh
 * reintroduces imbalance.
 */
function oversampleMinorityClass(X: number[][], y: number[]) {
  const positives: number[][] = [];
  const negatives: number[][] = [];

  X.forEach((row, i) => {
    if (y[i] === 1) positives.push(row);
    else negatives.push(row);
  });

  if (positives.length === 0 || negatives.length === 0) {
    return shuffleData(X, y);
  }

  const majorityCount = Math.max(positives.length, negatives.length);
  const minority = positives.length < negatives.length ? positives : negatives;
  const minorityLabel = positives.length < negatives.length ? 1 : 0;
  const majority = positives.length < negatives.length ? negatives : positives;
  const majorityLabel = positives.length < negatives.length ? 0 : 1;

  const oversampledMinority: number[][] = [...minority];
  while (oversampledMinority.length < majorityCount) {
    const randomIdx = Math.floor(Math.random() * minority.length);
    oversampledMinority.push(minority[randomIdx]);
  }

  const X_balanced = [...majority, ...oversampledMinority];
  const y_balanced = [
    ...majority.map(() => majorityLabel),
    ...oversampledMinority.map(() => minorityLabel),
  ];

  return shuffleData(X_balanced, y_balanced);
}

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

  // ROC-AUC via rank comparison (probability that a random positive scores
  // higher than a random negative) — same definition used by sklearn etc.
  const posProbs: number[] = [];
  const negProbs: number[] = [];
  probabilities.forEach((p, i) => {
    if (y_test[i] === 1) posProbs.push(p);
    else negProbs.push(p);
  });
  let aucSum = 0;
  if (posProbs.length > 0 && negProbs.length > 0) {
    for (const pp of posProbs) {
      for (const np of negProbs) {
        if (pp > np) aucSum += 1;
        else if (pp === np) aucSum += 0.5;
      }
    }
    aucSum /= posProbs.length * negProbs.length;
  }

  console.log("=== FIBROID MODEL EVALUATION RESULTS ===");
  console.log(`Threshold: ${threshold}`);
  console.log(`Test set size: ${y_test.length}`);
  console.log(`Test positives: ${y_test.filter((v) => v === 1).length}, negatives: ${y_test.filter((v) => v === 0).length}`);
  console.log(`Accuracy:  ${(accuracy * 100).toFixed(2)}%`);
  console.log(`Precision: ${(precision * 100).toFixed(2)}%`);
  console.log(`Recall:    ${(recall * 100).toFixed(2)}%`);
  console.log(`F1 Score:  ${(f1Score * 100).toFixed(2)}%`);
  console.log(`ROC-AUC:   ${(aucSum * 100).toFixed(2)}%`);
  console.log(`TP: ${tp} | TN: ${tn} | FP: ${fp} | FN: ${fn}`);
  console.log("==========================================");

  return { accuracy, precision, recall, f1Score, rocAuc: aucSum, tp, tn, fp, fn };
}

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
      fibroidModelError =
        "No valid records found in fibroid dataset. Check that the CSV header matches FEATURE_NAMES exactly: " +
        FEATURE_NAMES.join(", ");
      console.error(">>> [FIBROID ML]", fibroidModelError);
      return;
    }

    console.log(">>> [FIBROID ML] Parsed records:", allX.length);
    const totalPositives = ally.filter((v) => v === 1).length;
    console.log(
      `>>> [FIBROID ML] Class balance: ${totalPositives} positive (${((totalPositives / ally.length) * 100).toFixed(
        1
      )}%), ${ally.length - totalPositives} negative`
    );

    const shuffled = shuffleData(allX, ally);
    const splitIndex = Math.floor(shuffled.X.length * 0.8);
    let finalX_train = shuffled.X.slice(0, splitIndex);
    let finalY_train = shuffled.y.slice(0, splitIndex);
    let finalX_test = shuffled.X.slice(splitIndex);
    let finalY_test = shuffled.y.slice(splitIndex);

    const hasBothClasses = finalY_test.includes(0) && finalY_test.includes(1);
    if (!hasBothClasses) {
      console.warn(">>> [FIBROID ML] Test split missing a class; re-shuffling...");
      let attempts = 0;
      while (attempts < 10) {
        const reshuffled = shuffleData(allX, ally);
        const reSplit = Math.floor(reshuffled.X.length * 0.8);
        const reY_test = reshuffled.y.slice(reSplit);
        if (reY_test.includes(0) && reY_test.includes(1)) {
          finalX_train = reshuffled.X.slice(0, reSplit);
          finalY_train = reshuffled.y.slice(0, reSplit);
          finalX_test = reshuffled.X.slice(reSplit);
          finalY_test = reY_test;
          break;
        }
        attempts++;
      }
    }

    // Oversample TRAINING data only. Test set stays untouched so metrics
    // reflect genuine generalization, not memorized duplicates.
    const balancedTrain = oversampleMinorityClass(finalX_train, finalY_train);
    console.log(
      `>>> [FIBROID ML] Training set after balancing: ${balancedTrain.X.length} rows (was ${finalX_train.length})`
    );
    console.log(`>>> [FIBROID ML] Test set (untouched, natural distribution): ${finalX_test.length} rows`);

    fibroidModel = new RandomForestClassifier({
      nEstimators: 200,
      maxFeatures: 0.8,
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
 *
 * IMPORTANT: this model does NOT take Weight_Kg/Height_Cm directly — it
 * expects BMI (computed client-side or here) and Symptom_Count (the sum
 * of the 12 boolean symptom fields). If the caller doesn't supply
 * Symptom_Count explicitly, it is computed automatically from whichever
 * symptom fields ARE present in `data`.
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

  // BMI: use directly if provided, otherwise compute from weight/height
  // if the frontend still happens to send those instead.
  let bmi = parseFloat(getVal("BMI") ?? data.bmi);
  if (isNaN(bmi)) {
    const weight = parseFloat(getVal("Weight_Kg") ?? data.weight ?? data["Weight (Kg)"]);
    const height = parseFloat(getVal("Height_Cm") ?? data.height ?? data["Height(Cm)"]);
    if (!isNaN(weight) && !isNaN(height) && height > 0) {
      const heightM = height / 100;
      bmi = weight / (heightM * heightM);
    } else {
      bmi = 25; // fallback default
    }
  }

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

  // Symptom_Count: use directly if explicitly supplied, otherwise sum the
  // 12 boolean symptom fields computed above.
  let symptomCount = parseFloat(getVal("Symptom_Count") ?? data.symptomCount);
  if (isNaN(symptomCount)) {
    symptomCount =
      heavyBleeding +
      prolongedMenstruation +
      pelvicPain +
      abdominalSwelling +
      frequentUrination +
      constipation +
      fatigueAnemia +
      painDuringIntercourse +
      lowerBackPain +
      irregularMenstrualFlow +
      familyHistory +
      pregnancyDifficulty;
  }

  const inputFeatures = [
    age,
    bmi,
    symptomCount,
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