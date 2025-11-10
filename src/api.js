import Groq from "groq-sdk";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
export async function getMaterialAISuggestions(formData, predictions = {}) {
  const basicAnalysis = analyzeMaterialDescriptors(formData);

  const prompt = `
You are a scientific material AI model expert.

Analyze the following material's *descriptor inputs* and *predicted properties*, 
then determine whether it is stable. If unstable, suggest improvements.

### Material Descriptors
${Object.entries(formData)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join("\n")}

### Predicted Numerical Properties
${Object.entries(predictions)
  .map(([k, v]) => `- ${k}: ${v}`)
  .join("\n")}

### Your Tasks
1️⃣ Start with "Material likely stable" or "Material likely unstable".
2️⃣ Give **reasons** based on both descriptors and numeric properties (like band gap, efermi, density, formation energy).
3️⃣ If unstable:
   - Suggest **which element(s)** could replace existing ones in the chemical system (e.g., replace Fe with Ni, or O with S).
   - Suggest **what to increase/decrease** (like increase band gap, lower efermi, reduce brittleness, increase density).
4️⃣ Keep the answer concise (≤ 8 lines), scientific but readable.
`;

  // === Groq AI Call ===
  const GROQ_KEY =
    process.env.REACT_APP_GROQ_API_KEY ||
    (typeof window !== "undefined" && window.__GROQ_KEY__) ||
    "";

  if (GROQ_KEY) {
    try {
      const groq = new Groq({ apiKey: GROQ_KEY, dangerouslyAllowBrowser: true, });
      const chat = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "openai/gpt-oss-20b",
        temperature: 0.8,
        max_completion_tokens: 512,
        reasoning_effort: "medium",
      });

      const aiText = chat?.choices?.[0]?.message?.content?.trim();
      if (aiText) return aiText;
    } catch (err) {
      console.warn("Groq AI failed → fallback to rule-based:", err.message);
    }
  }

  return basicAnalysis;
}

/**
 * 🧩 Local rule-based fallback
 */
function analyzeMaterialDescriptors(data) {
  const issues = [];
  const fixes = [];

  if (data["Brittleness"] === "High") {
    issues.push("High brittleness decreases mechanical stability.");
    fixes.push("Reduce brittleness by alloying with a ductile phase.");
  }
  if (data["Reactivity"] === "High") {
    issues.push("High reactivity indicates chemical instability.");
    fixes.push("Lower reactivity by substituting a less reactive element (e.g., replace Fe with Ni).");
  }
  if (data["Corrosion Resistance"] === "Low") {
    issues.push("Low corrosion resistance reduces durability.");
    fixes.push("Add Cr, Al, or Si to form a protective oxide layer.");
  }

  if (issues.length === 0) return "✅ Material likely stable.\nAll descriptors appear balanced.";

  let result = "⚠️ Material likely unstable.\n";
  result += "Issues:\n" + issues.map((x) => `• ${x}`).join("\n");
  result += "\nImprovements:\n" + fixes.map((x) => `• ${x}`).join("\n");
  return result;
}

export async function predictMaterial(data) {
  const response = await fetch(`${API_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function predictUnified({ mode, user_input }) {
  const response = await fetch(`${API_URL}/predict/unified`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mode, user_input }),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed ${response.status}`);
  }
  return response.json();
}

/**
 * 🔮 getAISuggestions()
 * Uses Groq LLM first → then HuggingFace fallback → finally rule-based analysis.
 */
export async function getAISuggestions(data) {
  const analysis = analyzeMaterialProperties(data);

  const prompt = `
Analyze the following material properties and predict its stability:

Energy per Atom: ${data.energy_per_atom} eV
Density (Atomic): ${data.density_atomic}
Fermi Energy: ${data.efermi} eV
Volume: ${data.volume}
Density: ${data.density}
Band Gap: ${data.band_gap} eV
Chemical System: ${data.chemsys}
Is Magnetic: ${data.is_magnetic}
Ordering: ${data.ordering}
Types of Magnetic Species: ${data.types_of_magnetic_species}
Is Metal: ${data.is_metal}
Total Magnetization: ${data.total_magnetization}
Magnetization / Volume: ${data.total_magnetization_normalized_vol}
Magnetization / Formula Units: ${data.total_magnetization_normalized_formula_units}
Number of Magnetic Sites: ${data.num_magnetic_sites}
Number of Unique Magnetic Sites: ${data.num_unique_magnetic_sites}
Formation Energy per Atom: ${data.formation_energy_per_atom} eV
Elements: ${JSON.stringify(data.elements)}

Respond EXACTLY in this format:
1️⃣ First line: "Material likely stable" or "Material likely unstable"
2️⃣ Next lines (if unstable): reasons or suggestions (≤ 5 lines total)
`;

  // --- Try Groq First ---
  const GROQ_KEY =
    process.env.REACT_APP_GROQ_API_KEY ||
    (typeof window !== "undefined" && window.__GROQ_KEY__) ||
    "";

  if (GROQ_KEY) {
    try {
      const groq = new Groq({ apiKey: GROQ_KEY });
      const chat = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "openai/gpt-oss-20b",
        temperature: 0.8,
        max_completion_tokens: 512,
        reasoning_effort: "medium",
      });

      const aiText = chat?.choices?.[0]?.message?.content?.trim();
      if (aiText) return aiText;
    } catch (err) {
      console.warn("Groq API failed → fallback to HF:", err.message);
    }
  } else {
    console.warn("No Groq API key found → using fallback model.");
  }

  // --- Hugging Face Fallback ---
  const HF_TOKEN =
    process.env.REACT_APP_HF_TOKEN ||
    (typeof window !== "undefined" && window.__HF_TOKEN__) ||
    "";

  if (HF_TOKEN) {
    try {
      const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "HuggingFaceTB/SmolLM3-3B:hf-inference",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 300,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const text = result?.choices?.[0]?.message?.content?.trim();
        if (text) return text;
      }
    } catch (err) {
      console.warn("HF model request failed:", err.message);
    }
  }

  // --- Final fallback: heuristic analysis ---
  return analysis;
}
function analyzeMaterialProperties(data) {
  const issues = [];
  const suggestions = [];

  // Energy per atom
  if (data.energy_per_atom > 5 || data.energy_per_atom < -5) {
    issues.push("Energy per atom is unusually high or low");
    suggestions.push("Keep energy per atom in a reasonable range (-5 to 5 eV)");
  }

  // Atomic density
  if (data.density_atomic <= 0) {
    issues.push("Atomic density must be positive");
    suggestions.push("Set atomic density to a positive value");
  }

  // Fermi energy
  if (data.efermi < 0 || data.efermi > 20) {
    issues.push("Fermi energy is outside normal range");
    suggestions.push("Typical Fermi energy: 0 - 20 eV");
  }

  // Volume
  if (data.volume <= 0) {
    issues.push("Volume must be positive");
    suggestions.push("Provide a positive volume");
  }

  // Density
  if (data.density <= 0) {
    issues.push("Density must be positive");
    suggestions.push("Provide a positive density");
  }

  // Band gap
  if (!data.is_metal && (data.band_gap < 0 || data.band_gap > 10)) {
    issues.push("Band gap is outside typical range for non-metals");
    suggestions.push("Set band gap between 0 and 10 eV");
  }
  if (data.is_metal && data.band_gap > 0.5) {
    issues.push("Metals should have small/zero band gap");
    suggestions.push("Set band gap to 0.0-0.3 eV for metals");
  }

  // Chemical system
  if (data.chemsys && data.chemsys.includes("-")) {
    const system = data.chemsys.split("-");
    if (system[0] === system[1]) {
      issues.push("Chemical system has duplicate elements");
      suggestions.push("Choose different elements (e.g. Ag-O, Fe-Ni, Al-Mg)");
    }
  }

  // Is magnetic
  if (data.is_magnetic && data.num_magnetic_sites === 0) {
    issues.push("Magnetic sites should be > 0 for magnetic materials");
    suggestions.push("Set num_magnetic_sites to at least 1");
  }

  // Ordering
  if (data.ordering && !["Ferromagnetic","Antiferromagnetic","Paramagnetic","Ferrimagnetic","Non-magnetic",""].includes(data.ordering)) {
    issues.push("Invalid ordering type");
    suggestions.push("Choose a valid ordering: Ferromagnetic, Antiferromagnetic, Paramagnetic, Ferrimagnetic, Non-magnetic");
  }

  // Types of magnetic species
  if (data.is_magnetic && !data.types_of_magnetic_species) {
    issues.push("Magnetic species not provided for magnetic material");
    suggestions.push("Specify types of magnetic species, e.g. Fe, Co, Ni");
  }

  // Total magnetization
  if (data.total_magnetization < 0) {
    issues.push("Total magnetization cannot be negative");
    suggestions.push("Provide a non-negative value");
  }

  // Magnetization / Volume
  if (data.total_magnetization_normalized_vol < 0) {
    issues.push("Magnetization per volume cannot be negative");
    suggestions.push("Provide a non-negative value");
  }

  // Magnetization / Formula Units
  if (data.total_magnetization_normalized_formula_units < 0) {
    issues.push("Magnetization per formula unit cannot be negative");
    suggestions.push("Provide a non-negative value");
  }

  // Number of magnetic sites
  if (data.num_magnetic_sites < 0) {
    issues.push("Number of magnetic sites cannot be negative");
    suggestions.push("Provide a non-negative value");
  }

  // Number of unique magnetic sites
  if (data.num_unique_magnetic_sites < 0) {
    issues.push("Number of unique magnetic sites cannot be negative");
    suggestions.push("Provide a non-negative value");
  }

  // Formation energy per atom
  if (data.formation_energy_per_atom > 2) {
    issues.push("Formation energy too high for stability");
    suggestions.push("Try negative formation energy (-0.1 to -2 eV) for stable materials");
  }

  // Elements
  if (!data.elements || Object.keys(data.elements).length === 0) {
    issues.push("No elements provided");
    suggestions.push("Provide at least one element with its count");
  }

  let result = "Analysis:\n";
  if (issues.length === 0) {
    result += "✅ Values appear reasonable for a stable material.\n";
  } else {
    result += "⚠️ Issues found:\n";
    issues.forEach((issue) => (result += `• ${issue}\n`));
    result += "\nSuggestions:\n";
    suggestions.forEach((sugg) => (result += `• ${sugg}\n`));
  }

  return result;
}

