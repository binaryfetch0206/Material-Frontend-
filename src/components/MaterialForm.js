import React, { useState } from "react";
import { predictMaterial, getAISuggestions } from "../api";
import {
  Box,
  Grid,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider
} from "@mui/material";

export default function MaterialForm() {
  const [formData, setFormData] = useState({
    energy_per_atom: 0,
    density_atomic: 0,
    efermi: 0,
    volume: 0,
    density: 0,
    band_gap: 0,
    chemsys: "",
    is_magnetic: false,
    ordering: "",
    types_of_magnetic_species: "",
    is_metal: false,
    total_magnetization: 0,
    total_magnetization_normalized_vol: 0,
    total_magnetization_normalized_formula_units: 0,
    num_magnetic_sites: 0,
    num_unique_magnetic_sites: 0,
    formation_energy_per_atom: 0,
    elements: '{"Ag":1,"Te":1}'
  });

  const [result, setResult] = useState(null);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const parsed = value === "" ? "" : Number(value);
    setFormData({
      ...formData,
      [name]: parsed,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      energy_per_atom: parseFloat(formData.energy_per_atom),
      density_atomic: parseFloat(formData.density_atomic),
      efermi: parseFloat(formData.efermi),
      volume: parseFloat(formData.volume),
      density: parseFloat(formData.density),
      band_gap: parseFloat(formData.band_gap),
      total_magnetization: parseFloat(formData.total_magnetization),
      total_magnetization_normalized_vol: parseFloat(formData.total_magnetization_normalized_vol),
      total_magnetization_normalized_formula_units: parseFloat(formData.total_magnetization_normalized_formula_units),
      num_magnetic_sites: parseInt(formData.num_magnetic_sites),
      num_unique_magnetic_sites: parseInt(formData.num_unique_magnetic_sites),
      formation_energy_per_atom: parseFloat(formData.formation_energy_per_atom),
      elements: JSON.parse(formData.elements)
    };
    
    // Get prediction first
    const res = await predictMaterial(payload);
    setResult(res);
    
    // Get AI suggestions
    setAiLoading(true);
    setAiSuggestion(null);
    try {
      const suggestion = await getAISuggestions(payload);
      setAiSuggestion(suggestion);
    } catch (error) {
      setAiSuggestion("❌ AI suggestion unavailable at the moment.");
    }
    setAiLoading(false);
  };

  const numberFields = [
    { key: "energy_per_atom", label: "Energy per Atom (eV)" },
    { key: "density_atomic", label: "Atomic Density" },
    { key: "efermi", label: "Fermi Energy (eV)" },
    { key: "volume", label: "Volume" },
    { key: "density", label: "Density" },
    { key: "band_gap", label: "Band Gap (eV)" },
    { key: "total_magnetization", label: "Total Magnetization" },
    { key: "total_magnetization_normalized_vol", label: "Magnetization / Volume" },
    { key: "total_magnetization_normalized_formula_units", label: "Magnetization / Formula Units" },
    { key: "num_magnetic_sites", label: "Magnetic Sites" },
    { key: "num_unique_magnetic_sites", label: "Unique Magnetic Sites" },
    { key: "formation_energy_per_atom", label: "Formation Energy per Atom (eV)" },
  ];

  const orderingOptions = [
    "",
    "Ferromagnetic",
    "Antiferromagnetic",
    "Paramagnetic",
    "Ferrimagnetic",
    "Non-magnetic",
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🔬 Material Discovery Form
      </Typography>
      <Card variant="outlined">
        <CardHeader title="Material Properties" subheader="Adjust sliders and options, paste elements JSON" />
        <Divider />
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {numberFields.map(({ key, label }) => (
                <Grid item xs={12} md={6} key={key}>
                  <TextField
                    fullWidth
                    type="number"
                    label={label}
                    name={key}
                    value={formData[key]}
                    onChange={handleNumberChange}
                    inputProps={{ step: "any" }}
                  />
                </Grid>
              ))}

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Chemical System (chemsys)"
                  name="chemsys"
                  value={formData.chemsys}
                  onChange={handleTextChange}
                  placeholder="e.g. Ag-Te"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="ordering-label">Ordering</InputLabel>
                  <Select
                    labelId="ordering-label"
                    label="Ordering"
                    name="ordering"
                    value={formData.ordering}
                    onChange={handleTextChange}
                  >
                    {orderingOptions.map((opt) => (
                      <MenuItem key={opt} value={opt}>{opt === "" ? "None" : opt}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Types of Magnetic Species"
                  name="types_of_magnetic_species"
                  value={formData.types_of_magnetic_species}
                  onChange={handleTextChange}
                  placeholder="e.g. Fe, Co, Ni"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={<Switch checked={formData.is_magnetic} onChange={handleSwitchChange} name="is_magnetic" />}
                  label="Is Magnetic"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={<Switch checked={formData.is_metal} onChange={handleSwitchChange} name="is_metal" />}
                  label="Is Metal"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Elements JSON"
                  name="elements"
                  value={formData.elements}
                  onChange={handleTextChange}
                  multiline
                  minRows={3}
                  helperText='Provide element counts as JSON, e.g. {"Ag":1,"Te":1}'
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                  <Button variant="outlined" onClick={() => setFormData({
                    energy_per_atom: 0,
                    density_atomic: 0,
                    efermi: 0,
                    volume: 0,
                    density: 0,
                    band_gap: 0,
                    chemsys: "",
                    is_magnetic: false,
                    ordering: "",
                    types_of_magnetic_species: "",
                    is_metal: false,
                    total_magnetization: 0,
                    total_magnetization_normalized_vol: 0,
                    total_magnetization_normalized_formula_units: 0,
                    num_magnetic_sites: 0,
                    num_unique_magnetic_sites: 0,
                    formation_energy_per_atom: 0,
                    elements: '{"Ag":1,"Te":1}'
                  })}>Reset</Button>
                  <Button type="submit" variant="contained">Predict</Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Box sx={{ mt: 3 }}>
          <Card variant="outlined">
            <CardHeader title="Prediction Result" />
            <Divider />
            <CardContent>
              <Typography><b>Material:</b> {result.material}</Typography>
              <Typography><b>Predicted Energy Above Hull:</b> {result.predicted_energy_above_hull} eV</Typography>
              <Typography><b>Stability:</b> {result.stability}</Typography>
            </CardContent>
          </Card>
          
          {/* AI Suggestion Card */}
          <Card 
            variant="outlined" 
            sx={{ 
              mt: 2,
              backgroundColor: "#ffffff",
              borderColor: "#b3d9ff"
            }}
          >
            <CardHeader title="AI Suggestion 🤖" />
            <Divider />
            <CardContent>
              {aiLoading ? (
                <Typography>⏳ AI is analyzing your input...</Typography>
              ) : aiSuggestion ? (
                <Typography sx={{ whiteSpace: "pre-line" }}>
                  {aiSuggestion}
                </Typography>
              ) : (
                <Typography>❌ AI suggestion unavailable at the moment.</Typography>
              )}
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
}
