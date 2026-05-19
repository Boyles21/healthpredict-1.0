
async function test() {
  try {
    const response = await fetch("http://localhost:3000/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ age: 25, weight: 60, height: 160, symptoms: { weightGain: 1 } })
    });
    console.log("Status:", response.status);
    const text = await response.text();
    console.log("Response:", text.substring(0, 200));
  } catch (e) {
    console.error("Fetch failed:", e);
  }
}
test();
