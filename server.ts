import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import * as xlsx from "xlsx";
import fs from "fs";
import { parse } from "csv-parse/sync";
import { RandomForestClassifier } from "ml-random-forest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Machine learning initialization
const upload = multer({ storage: multer.memoryStorage() });

// --- Machine Learning Initialization ---
let rfModel: RandomForestClassifier | null = null;

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
    X: combined.map(item => item.x),
    y: combined.map(item => item.y)
  };
}

/**
 * Evaluates the model using standard metrics
 */
function evaluateModel(X_test: number[][], y_test: number[]) {
  if (!rfModel || X_test.length === 0) return;

  const predictions = rfModel.predict(X_test);

  let tp = 0; // True Positives: Predicted PCOS, Actually PCOS
  let tn = 0; // True Negatives: Predicted No PCOS, Actually No PCOS
  let fp = 0; // False Positives: Predicted PCOS, Actually No PCOS
  let fn = 0; // False Negatives: Predicted No PCOS, Actually PCOS

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
  const f1 = 2 * (precision * recall) / (precision + recall) || 0;

  console.log("\n=================================");
  console.log("     MODEL EVALUATION RESULTS     ");
  console.log("=================================");
  console.log(`Accuracy:  ${(accuracy * 100).toFixed(2)}%`);
  console.log(`Precision: ${(precision * 100).toFixed(2)}%`);
  console.log(`Recall:    ${(recall * 100).toFixed(2)}%`);
  console.log(`F1 Score:  ${(f1 * 100).toFixed(2)}%`);
  console.log("---------------------------------");
  console.log("Confusion Matrix:");
  console.log(`[[${tn}, ${fp}],  <-- [TN, FP]`);
  console.log(` [${fn}, ${tp}]]   <-- [FN, TP]`);
  console.log("=================================\n");
}

function trainModel() {
  console.log(">>> [ML] Initializing training sequence...");
  try {
    // Try multiple possible paths for the dataset (root and dist relative)
    const possiblePaths = [
      path.resolve(process.cwd(), "pcos_dataset.csv"),
      path.resolve(__dirname, "pcos_dataset.csv"),
      path.resolve(__dirname, "..", "pcos_dataset.csv")
    ];

    let csvPath = "";
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        csvPath = p;
        break;
      }
    }

    if (!csvPath) {
      console.error(`>>> [ML] CRITICAL: Dataset not found in any of: ${possiblePaths.join(", ")}`);
      return;
    }

    console.log(`>>> [ML] Found dataset at: ${csvPath}`);
    const csvData = fs.readFileSync(csvPath, "utf-8");
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    console.log(`>>> [ML] Dataset loaded. Rows: ${records.length}`);

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

      // Clean invalid data
      if (features.every(f => !isNaN(f)) && !isNaN(parseFloat(row["PCOS (Y/N)"]))) {
        allX.push(features);
        ally.push(parseInt(row["PCOS (Y/N)"]));
      }
    });

    if (allX.length === 0) {
      console.error(">>> [ML] No valid records found for training.");
      return;
    }

    // Shuffle and Split: 80% Train, 20% Test
    const shuffled = shuffleData(allX, ally);
    const splitIndex = Math.floor(shuffled.X.length * 0.8);
    
    const X_train = shuffled.X.slice(0, splitIndex);
    const y_train = shuffled.y.slice(0, splitIndex);
    const X_test = shuffled.X.slice(splitIndex);
    const y_test = shuffled.y.slice(splitIndex);

    console.log(`>>> [ML] Records split: ${X_train.length} Training, ${X_test.length} Testing.`);
    console.log(`>>> [ML] Training Random Forest model...`);
    
    rfModel = new RandomForestClassifier({
      nEstimators: 100, // Increased for better stability
      maxFeatures: 0.8,
      replacement: true
    });

    rfModel.train(X_train, y_train);
    console.log(">>> [ML] Random Forest model trained successfully.");

    // Run automatic evaluation
    evaluateModel(X_test, y_test);

  } catch (error) {
    console.error(">>> [ML] Dataset loading or training failed:", error);
  }
}

// Initial training
trainModel();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Basic Middleware
  app.use(cors());
  app.use(express.json());

  // Helper function for prediction logic
  const runPrediction = (data: any) => {
    if (!rfModel) {
      return {
        status: "Model Not Ready",
        likelihood: 0,
        description: "The analysis system is still initializing. Please try again later.",
        color: "text-slate-400 bg-slate-50"
      };
    }

    // Support both nested symptoms and flat data (from Excel)
    const age = data.age || data["Age (yrs)"] || 25;
    const weight = data.weight || data["Weight (Kg)"] || 60;
    const height = data.height || data["Height(Cm)"] || 160;
    const cycleRegularity = data.cycleRegularity || (data["Cycle(R/I)"] === 4 ? "irregular" : "regular");
    const cycleLength = data.cycleLength || data["Cycle length(days)"] || 5;
    
    // Normalize boolean-ish values
    const getVal = (val: any) => (val === "yes" || val === 1 || val === true || val === "1" || val === "Y" ? 1 : 0);
    
    const weightGainVal = getVal(data.weightGain || (data.symptoms && data.symptoms.weightGain) || data["Weight gain(Y/N)"]);
    const hairGrowthVal = getVal(data.hairGrowth || (data.symptoms && data.symptoms.hairGrowth) || data["hair growth(Y/N)"]);
    const hairLossVal = getVal(data.hairLoss || (data.symptoms && data.symptoms.hairLoss) || data["Hair loss(Y/N)"]);
    const pimplesVal = getVal(data.pimples || data.skinChanges || (data.symptoms && data.symptoms.skinChanges) || data["Pimples(Y/N)"]);
    const skinDarkeningVal = getVal(data.skinDarkening || data["Skin darkening(Y/N)"]);
    const fastFoodVal = getVal(data.fastFood || data["Fast food (Y/N)"]);
    const exerciseVal = getVal(data.regularExercise || data["Reg.Exercise(Y/N)"]);

    const cycleVal = cycleRegularity === "irregular" ? 4 : 2;

    const inputFeatures = [
      parseFloat(age) || 25,
      parseFloat(weight) || 60,
      parseFloat(height) || 160,
      cycleVal,
      parseFloat(cycleLength) || 5,
      weightGainVal,
      hairGrowthVal,
      hairLossVal,
      pimplesVal,
      skinDarkeningVal,
      fastFoodVal,
      exerciseVal
    ];

    console.log(">>> [ML] Inference Input Array:", JSON.stringify(inputFeatures));

    const predictionClass = rfModel.predict([inputFeatures])[0];
    
    // predictProbability(features, label) returns an array of probabilities for that label for each input
    const probArray = rfModel.predictProbability([inputFeatures], 1);
    const prob = probArray[0]; 
    
    let baseLikelihood = Math.round((prob || 0) * 100);
    
    // Heuristic boost for medical context if model is conservative
    if (predictionClass === 1 && baseLikelihood < 50) baseLikelihood = 70;
    if (predictionClass === 0 && baseLikelihood > 50) baseLikelihood = 20;

    const finalLikelihood = Math.min(Math.max(baseLikelihood, 5), 98);

    console.log(`>>> [ML] Result: Class ${predictionClass}, Probability: ${finalLikelihood}%`);

    if (predictionClass === 1) {
      return {
        pcosRisk: finalLikelihood,
        prediction: "High Risk",
        status: "Potential PCOS Detected",
        likelihood: finalLikelihood,
        description: "The AI model identified a pattern of clinical markers (cycles, physical traits) that strongly correlate with PCOS profiles in our medical dataset.",
        color: "text-amber-600 bg-amber-50"
      };
    } else {
      return {
        pcosRisk: finalLikelihood,
        prediction: "Low Risk",
        status: "Low Risk Profile",
        likelihood: finalLikelihood,
        description: "Your health metrics do not currently match the primary indicators of PCOS in our dataset. Maintain regular physical activity and a balanced diet.",
        color: "text-emerald-600 bg-emerald-50"
      };
    }
  };

  // API Status Route
  app.get("/api-status", (req, res) => {
    res.json({
      status: "running",
      modelReady: rfModel !== null,
      environment: process.env.NODE_ENV || "development"
    });
  });

  // Prediction API Endpoint (JSON)
  app.post("/predict", (req, res) => {
    try {
      console.log(">>> [BACKEND] Received Prediction Request Body:", JSON.stringify(req.body, null, 2));

      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ status: "error", message: "No data provided" });
      }

      if (!rfModel) {
        return res.status(503).json({ 
          status: "error", 
          message: "The analysis engine is still initializing. Please wait a moment and try again." 
        });
      }

      const prediction = runPrediction(req.body);
      res.json({
        ...prediction,
        result: "Prediction completed",
        serverStatus: "success"
      });
    } catch (error: any) {
      console.error(">>> [BACKEND] Prediction Error:", error);
      res.status(500).json({ status: "error", message: error.message || "Prediction failed on server" });
    }
  });

  // Prediction API Endpoint (Excel Upload)
  app.post("/predict-excel", upload.single("file"), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ status: "error", message: "No file uploaded" });
      }

      if (!rfModel) {
        return res.status(503).json({ 
          status: "error", 
          message: "The analysis engine is still initializing. Please wait a moment and try again." 
        });
      }

      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet)[0]; // Take the first row

      if (!data) {
        return res.status(400).json({ status: "error", message: "Excel file is empty" });
      }

      console.log(">>> [BACKEND] Received Excel Data:", data);

      const prediction = runPrediction(data);

      res.json({
        ...prediction,
        result: "Prediction from Excel file completed",
        dataUsed: data,
        serverStatus: "success"
      });
    } catch (error: any) {
      console.error(">>> [BACKEND] Excel processing error:", error);
      res.status(500).json({ status: "error", message: error.message || "Failed to process Excel file" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
