import React, { useEffect, useMemo, useState } from "react";
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
  Divider,
  Tooltip,
  InputAdornment,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  LinearProgress,
  Fade,
  Zoom
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ScienceIcon from "@mui/icons-material/Science";
import CalculateIcon from "@mui/icons-material/Calculate";
import MagnetIcon from "@mui/icons-material/BluetoothSearching";
import CompositionIcon from "@mui/icons-material/AccountTree";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [touched, setTouched] = useState({});
  const [isDark, setIsDark] = useState(() =>
    typeof document !== "undefined" ? document.body.classList.contains("dark-theme") : false
  );

  // Sync with body's dark-theme class used by Home
  useEffect(() => {
    const updateTheme = () => setIsDark(document.body.classList.contains("dark-theme"));
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Enhanced design tokens with better contrast
  const tokens = useMemo(() => ({
    gold: isDark ? "#ffd700" : "#d4af37",
    goldBright: isDark ? "#fff1a6" : "#ffd700",
    goldSoft: isDark ? "rgba(255, 241, 166, 0.1)" : "rgba(212, 175, 55, 0.1)",
    surface: isDark ? "rgba(30, 30, 35, 0.95)" : "rgba(255, 255, 255, 0.95)",
    surfaceSubtle: isDark ? "rgba(25, 25, 30, 0.9)" : "rgba(248, 250, 252, 0.9)",
    border: isDark ? "rgba(255, 215, 0, 0.25)" : "rgba(212, 175, 55, 0.3)",
    borderSoft: isDark ? "rgba(255, 215, 0, 0.15)" : "rgba(212, 175, 55, 0.15)",
    textPrimary: isDark ? "#f0f0f0" : "#1a1a1a",
    textMuted: isDark ? "#b0b0b0" : "#666",
    textSecondary: isDark ? "#cccccc" : "#444",
    shadow: isDark 
      ? "0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3)" 
      : "0 8px 32px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.08)",
    inputBg: isDark ? "rgba(40, 40, 45, 0.8)" : "rgba(255, 255, 255, 0.9)",
    inputBorder: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.15)",
    error: isDark ? "#ff6b6b" : "#d32f2f",
    warning: isDark ? "#ffd93d" : "#ffa000",
    success: isDark ? "#6bcf7f" : "#2e7d32",
  }), [isDark]);

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (!touched[name]) setTouched({ ...touched, [name]: true });
  };

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
    });
    if (!touched[name]) setTouched({ ...touched, [name]: true });
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const parsed = value === "" ? "" : Number(value);
    setFormData({
      ...formData,
      [name]: parsed,
    });
    if (!touched[name]) setTouched({ ...touched, [name]: true });
  };

  // Validation logic remains the same
  const orderingOptions = [
    "",
    "Ferromagnetic",
    "Antiferromagnetic",
    "Paramagnetic",
    "Ferrimagnetic",
    "Non-magnetic",
  ];

  const isInteger = (v) => Number.isInteger(typeof v === "string" ? Number(v) : v);

  const validate = useMemo(() => {
    const errors = {};
    const n = formData;
    const addErr = (key, msg) => { errors[key] = msg; };

    // Number fields
    if (n.energy_per_atom === "" || Number.isNaN(Number(n.energy_per_atom))) {
      addErr("energy_per_atom", "Must be numeric (can be negative). Reason: negative energy per atom is physically valid");
    }
    if (n.density_atomic === "" || Number(n.density_atomic) <= 0) {
      addErr("density_atomic", "Must be > 0. Reason: density cannot be zero or negative");
    }
    if (n.efermi === "" || Number.isNaN(Number(n.efermi))) {
      addErr("efermi", "Must be numeric (can be negative). Reason: Fermi energy may be above or below 0 eV");
    }
    if (n.volume === "" || Number(n.volume) <= 0) {
      addErr("volume", "Must be > 0. Reason: volume cannot be zero or negative");
    }
    if (n.density === "" || Number(n.density) <= 0) {
      addErr("density", "Must be > 0. Reason: physically meaningful density");
    }
    if (n.band_gap === "" || Number(n.band_gap) < 0) {
      addErr("band_gap", "Must be ≥ 0. Reason: negative band gap is unphysical");
    }
    if (n.total_magnetization === "" || Number(n.total_magnetization) < 0) {
      addErr("total_magnetization", "Must be ≥ 0. Reason: magnetization is zero or positive");
    }
    if (n.total_magnetization_normalized_vol === "" || Number(n.total_magnetization_normalized_vol) < 0) {
      addErr("total_magnetization_normalized_vol", "Must be ≥ 0. Reason: normalized magnetization cannot be negative");
    }
    if (n.total_magnetization_normalized_formula_units === "" || Number(n.total_magnetization_normalized_formula_units) < 0) {
      addErr("total_magnetization_normalized_formula_units", "Must be ≥ 0. Reason: normalized per formula unit cannot be negative");
    }
    if (n.num_magnetic_sites === "" || Number(n.num_magnetic_sites) < 0 || !Number.isInteger(Number(n.num_magnetic_sites))) {
      addErr("num_magnetic_sites", "Must be integer ≥ 0. Reason: negative sites are invalid");
    }
    if (n.num_unique_magnetic_sites === "" || Number(n.num_unique_magnetic_sites) < 0 || !Number.isInteger(Number(n.num_unique_magnetic_sites))) {
      addErr("num_unique_magnetic_sites", "Must be integer ≥ 0. Reason: cannot be negative");
    }
    if (n.formation_energy_per_atom === "" || Number.isNaN(Number(n.formation_energy_per_atom))) {
      addErr("formation_energy_per_atom", "Must be numeric (can be negative). Reason: negative indicates stability; positive may indicate metastability");
    }

    // Text fields
    if (!n.chemsys || String(n.chemsys).trim() === "") {
      addErr("chemsys", "Required. Reason: prediction requires chemical system");
    }
    if (n.types_of_magnetic_species && n.types_of_magnetic_species.trim() !== "") {
      const parts = n.types_of_magnetic_species.split(",").map(s => s.trim());
      const elementRegex = /^(?:[A-Z][a-z]?)$/;
      const invalid = parts.filter(p => !elementRegex.test(p));
      if (invalid.length) {
        addErr("types_of_magnetic_species", "Use comma-separated element symbols (e.g., Fe, Co, Ni)");
      }
    }

    // Select fields
    const allowedOrdering = ["", "Ferromagnetic", "Antiferromagnetic", "Paramagnetic", "Ferrimagnetic", "Non-magnetic"];
    if (n.ordering && !allowedOrdering.includes(n.ordering)) {
      addErr("ordering", "Invalid selection. Choose a valid ordering");
    }

    // JSON field
    try {
      const parsed = JSON.parse(n.elements);
      const isObj = parsed && typeof parsed === "object" && !Array.isArray(parsed);
      if (!isObj) throw new Error("Elements must be an object map of counts");
    } catch (err) {
      addErr("elements", "Must be valid JSON object. Reason: backend requires parseable element counts");
    }

    return errors;
  }, [formData]);

  const extremeWarnings = useMemo(() => {
    const warns = [];
    const addWarn = (key, msg) => warns.push({ key, msg });
    const absGt = (v, t) => Math.abs(Number(v)) > t;
    if (formData.energy_per_atom !== "" && absGt(formData.energy_per_atom, 1e3)) {
      addWarn("energy_per_atom", "Unusually large magnitude (>|1000| eV)");
    }
    if (formData.density_atomic !== "" && absGt(formData.density_atomic, 1e3)) {
      addWarn("density_atomic", "Suspiciously large atomic density");
    }
    if (formData.volume !== "" && absGt(formData.volume, 1e6)) {
      addWarn("volume", "Volume looks extremely large");
    }
    if (formData.density !== "" && absGt(formData.density, 1e3)) {
      addWarn("density", "Density seems extremely high");
    }

    return warns;
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");
    const hasErrors = Object.keys(validate).length > 0;
    if (hasErrors) {
      setTouched(Object.keys(formData).reduce((acc, k) => ({ ...acc, [k]: true }), {}));
      return;
    }
    setIsSubmitting(true);
    
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
    
    try {
      const res = await predictMaterial(payload);
      setResult(res);
    } catch (err) {
      setSubmitError("Prediction failed. Please check inputs or try again.");
    } finally {
      setIsSubmitting(false);
    }
    
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

  const cardSx = {
    borderRadius: 3,
    overflow: "hidden",
    background: tokens.surface,
    border: `1px solid ${tokens.border}`,
    backdropFilter: "blur(12px)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    '&:hover': {
      transform: "translateY(-4px)",
      boxShadow: tokens.shadow,
      borderColor: tokens.gold
    }
  };

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      background: tokens.inputBg,
      transition: 'all 0.2s ease',
      '& fieldset': { 
        borderColor: tokens.inputBorder,
        transition: 'border-color 0.2s ease'
      },
      '&:hover fieldset': { 
        borderColor: tokens.gold,
        boxShadow: `0 0 0 2px ${tokens.goldSoft}`
      },
      '&.Mui-focused fieldset': { 
        borderColor: tokens.goldBright, 
        boxShadow: `0 0 0 3px ${tokens.goldSoft}` 
      },
    },
    '& .MuiInputLabel-root': {
      color: tokens.textMuted,
    },
    '& .MuiFormHelperText-root': { 
      color: tokens.textMuted,
      fontSize: '0.75rem'
    }
  };

  const errorInputSx = {
    ...inputSx,
    '& .MuiOutlinedInput-root': {
      ...inputSx['& .MuiOutlinedInput-root'],
      '& fieldset': { borderColor: tokens.error },
      '&:hover fieldset': { borderColor: tokens.error },
    },
    '& .MuiFormHelperText-root': { color: tokens.error }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Fade in timeout={800}>
        <Box>
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              fontWeight: 800,
              letterSpacing: 0.5,
              background: isDark
                ? "linear-gradient(135deg, #ffd700 0%, #fff1a6 100%)"
                : "linear-gradient(135deg, #d4af37 0%, #ffd700 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textShadow: isDark ? "0 0 20px rgba(255, 215, 0, 0.3)" : "0 0 20px rgba(212, 175, 55, 0.3)",
              mb: 1
            }}
          >
            🔬 Material Discovery Form
          </Typography>
          <Typography sx={{ color: tokens.textMuted, mb: 3, fontSize: '1.1rem' }}>
            Provide composition and properties to predict stability and get AI guidance
          </Typography>

          <form onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              {/* General & Electronic Properties */}
              <Grid item xs={12}>
                <Zoom in timeout={600}>
                  <Card sx={cardSx}>
                    <CardHeader 
                      title={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ScienceIcon sx={{ color: tokens.gold }} />
                          <Typography variant="h6" sx={{ color: tokens.textPrimary }}>
                            General & Electronic Properties
                          </Typography>
                        </Box>
                      } 
                      subheader={
                        <Typography sx={{ color: tokens.textMuted }}>
                          Key thermodynamic and electronic inputs
                        </Typography>
                      } 
                    />
                    {isSubmitting && <LinearProgress sx={{ bgcolor: tokens.goldSoft, '& .MuiLinearProgress-bar': { bgcolor: tokens.gold } }} />}
                    <Divider sx={{ borderColor: tokens.borderSoft }} />
                    <CardContent>
                      {submitError && (
                        <Alert severity="error" sx={{ mb: 2, bgcolor: isDark ? 'rgba(211, 47, 47, 0.1)' : undefined }}>
                          {submitError}
                        </Alert>
                      )}
                      <Grid container spacing={3}>
                        {[
                          "energy_per_atom",
                          "density_atomic",
                          "efermi",
                          "volume",
                          "density",
                          "band_gap",
                          "formation_energy_per_atom"
                        ].map((key) => {
                          const field = numberFields.find(f => f.key === key);
                          const hasError = Boolean(touched[key] && validate[key]);
                          const hasWarning = extremeWarnings.find(w => w.key === key);
                          
                          return (
                            <Grid item xs={12} md={6} key={key}>
                              <TextField
                                fullWidth
                                type="number"
                                label={field?.label || key}
                                name={key}
                                value={formData[key]}
                                onChange={handleNumberChange}
                                onBlur={() => setTouched({ ...touched, [key]: true })}
                                inputProps={{ step: "any" }}
                                error={hasError}
                                helperText={touched[key] && validate[key] ? validate[key] : ""}
                                sx={hasError ? errorInputSx : inputSx}
                                InputProps={{
                                  endAdornment: hasWarning ? (
                                    <InputAdornment position="end">
                                      <Tooltip title={hasWarning.msg} placement="top">
                                        <InfoOutlinedIcon fontSize="small" sx={{ color: tokens.warning }} />
                                      </Tooltip>
                                    </InputAdornment>
                                  ) : null
                                }}
                              />
                            </Grid>
                          );
                        })}

                        <Grid item xs={12} md={6}>
                          <TextField
                            fullWidth
                            required
                            label="Chemical System (chemsys)"
                            name="chemsys"
                            value={formData.chemsys}
                            onChange={handleTextChange}
                            onBlur={() => setTouched({ ...touched, chemsys: true })}
                            placeholder="e.g. Ag-Te"
                            error={Boolean(touched.chemsys && validate.chemsys)}
                            helperText={touched.chemsys && validate.chemsys ? validate.chemsys : "Format: A-B-C (dash-separated elements)"}
                            sx={touched.chemsys && validate.chemsys ? errorInputSx : inputSx}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>

              {/* Magnetic Properties */}
              <Grid item xs={12}>
                <Zoom in timeout={800}>
                  <Card sx={cardSx}>
                    <CardHeader 
                      title={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <MagnetIcon sx={{ color: tokens.gold }} />
                          <Typography variant="h6" sx={{ color: tokens.textPrimary }}>
                            Magnetic Properties
                          </Typography>
                        </Box>
                      }
                      subheader={
                        <Typography sx={{ color: tokens.textMuted }}>
                          Ordering, magnetization and species
                        </Typography>
                      } 
                    />
                    <Divider sx={{ borderColor: tokens.borderSoft }} />
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <FormControl fullWidth sx={inputSx}>
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
                          <Tooltip title="Comma-separated element symbols (e.g., Fe, Co, Ni)">
                            <TextField
                              fullWidth
                              label="Types of Magnetic Species"
                              name="types_of_magnetic_species"
                              value={formData.types_of_magnetic_species}
                              onChange={handleTextChange}
                              onBlur={() => setTouched({ ...touched, types_of_magnetic_species: true })}
                              placeholder="e.g. Fe, Co, Ni"
                              error={Boolean(touched.types_of_magnetic_species && validate.types_of_magnetic_species)}
                              helperText={touched.types_of_magnetic_species && validate.types_of_magnetic_species ? validate.types_of_magnetic_species : "Optional"}
                              sx={touched.types_of_magnetic_species && validate.types_of_magnetic_species ? errorInputSx : inputSx}
                            />
                          </Tooltip>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <FormControlLabel
                            control={
                              <Switch 
                                checked={formData.is_magnetic} 
                                onChange={handleSwitchChange} 
                                name="is_magnetic"
                                sx={{
                                  '& .MuiSwitch-switchBase.Mui-checked': {
                                    color: tokens.gold,
                                  },
                                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                    backgroundColor: tokens.gold,
                                  },
                                }}
                              />
                            }
                            label="Is Magnetic"
                            sx={{ color: tokens.textPrimary }}
                          />
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <FormControlLabel
                            control={
                              <Switch 
                                checked={formData.is_metal} 
                                onChange={handleSwitchChange} 
                                name="is_metal"
                                sx={{
                                  '& .MuiSwitch-switchBase.Mui-checked': {
                                    color: tokens.gold,
                                  },
                                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                    backgroundColor: tokens.gold,
                                  },
                                }}
                              />
                            }
                            label="Is Metal"
                            sx={{ color: tokens.textPrimary }}
                          />
                        </Grid>

                        {[
                          "total_magnetization",
                          "total_magnetization_normalized_vol",
                          "total_magnetization_normalized_formula_units",
                          "num_magnetic_sites",
                          "num_unique_magnetic_sites",
                        ].map((key) => {
                          const field = numberFields.find(f => f.key === key);
                          const hasError = Boolean(touched[key] && validate[key]);
                          
                          return (
                            <Grid item xs={12} md={6} key={key}>
                              <TextField
                                fullWidth
                                type="number"
                                label={field?.label || key}
                                name={key}
                                value={formData[key]}
                                onChange={handleNumberChange}
                                onBlur={() => setTouched({ ...touched, [key]: true })}
                                inputProps={{ step: "any" }}
                                error={hasError}
                                helperText={touched[key] && validate[key] ? validate[key] : ""}
                                sx={hasError ? errorInputSx : inputSx}
                              />
                            </Grid>
                          );
                        })}
                      </Grid>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>

              {/* Composition */}
              <Grid item xs={12}>
                <Zoom in timeout={1000}>
                  <Card sx={cardSx}>
                    <CardHeader 
                      title={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CompositionIcon sx={{ color: tokens.gold }} />
                          <Typography variant="h6" sx={{ color: tokens.textPrimary }}>
                            Composition
                          </Typography>
                        </Box>
                      }
                      subheader={
                        <Typography sx={{ color: tokens.textMuted }}>
                          Provide element counts as JSON
                        </Typography>
                      } 
                    />
                    <Divider sx={{ borderColor: tokens.borderSoft }} />
                    <CardContent>
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Tooltip title='Provide element counts as JSON object, e.g. {"Ag":1,"Te":1}'>
                            <TextField
                              fullWidth
                              required
                              label="Elements JSON"
                              name="elements"
                              value={formData.elements}
                              onChange={handleTextChange}
                              onBlur={() => setTouched({ ...touched, elements: true })}
                              multiline
                              minRows={3}
                              maxRows={6}
                              error={Boolean(touched.elements && validate.elements)}
                              helperText={touched.elements && validate.elements ? validate.elements : 'Example: {"Ag":1,"Te":1}'}
                              sx={touched.elements && validate.elements ? errorInputSx : inputSx}
                            />
                          </Tooltip>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>

              {/* Actions */}
              <Grid item xs={12}>
                <Fade in timeout={1200}>
                  <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end", flexWrap: 'wrap' }}>
                    <Button 
                      variant="outlined"
                      onClick={() => {
                        setFormData({
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
                        setTouched({});
                        setSubmitError("");
                        setResult(null);
                        setAiSuggestion(null);
                      }}
                      sx={{
                        borderColor: tokens.border,
                        color: tokens.textPrimary,
                        '&:hover': {
                          borderColor: tokens.gold,
                          backgroundColor: tokens.goldSoft,
                          transform: "translateY(-2px)"
                        }
                      }}
                    >
                      Reset
                    </Button>
                    <Button 
                      type="submit" 
                      variant="contained"
                      sx={{
                        background: isDark 
                          ? "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)" 
                          : "linear-gradient(135deg, #d4af37 0%, #e6c550 100%)",
                        color: isDark ? "#1a1a1a" : "#fff",
                        fontWeight: 700,
                        letterSpacing: 1,
                        px: 4,
                        py: 1.2,
                        boxShadow: isDark 
                          ? "0 4px 20px rgba(255, 215, 0, 0.3)" 
                          : "0 4px 20px rgba(212, 175, 55, 0.4)",
                        '&:hover': {
                          boxShadow: isDark 
                            ? "0 8px 30px rgba(255, 215, 0, 0.5)" 
                            : "0 8px 30px rgba(212, 175, 55, 0.6)",
                          transform: "translateY(-3px)",
                          background: isDark 
                            ? "linear-gradient(135deg, #ffed4e 0%, #fff1a6 100%)" 
                            : "linear-gradient(135deg, #e6c550 0%, #f0d875 100%)",
                        },
                        '&:disabled': {
                          background: isDark ? "rgba(255, 215, 0, 0.3)" : "rgba(212, 175, 55, 0.3)",
                          color: isDark ? "rgba(26, 26, 26, 0.5)" : "rgba(255, 255, 255, 0.5)",
                        }
                      }}
                      disabled={isSubmitting}
                      endIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <CalculateIcon />}
                    >
                      {isSubmitting ? "Predicting..." : "Predict Material"}
                    </Button>
                  </Box>
                </Fade>
              </Grid>
            </Grid>
          </form>

          {/* Results */}
          {result && (
            <Fade in timeout={500}>
              <Box sx={{ mt: 4 }}>
                <Card sx={cardSx}>
                  <CardHeader
                    title={
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: '1.2rem',
                          background: "linear-gradient(135deg, #d4af37 0%, #ffd700 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        Prediction Result
                      </Typography>
                    }
                  />
                  <Divider sx={{ borderColor: tokens.borderSoft }} />
                  <CardContent>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <Typography sx={{ fontWeight: 700, mb: 1, color: tokens.textPrimary }}>Material</Typography>
                        <Chip
                          label={result.material}
                          sx={{
                            background: "linear-gradient(135deg, #d4af37 0%, #ffd700 100%)",
                            color: "#1a1a1a",
                            fontWeight: 700,
                            fontSize: '0.9rem'
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography sx={{ fontWeight: 700, mb: 1, color: tokens.textPrimary }}>Energy Above Hull</Typography>
                        <Typography sx={{ color: tokens.gold, fontWeight: 700, fontSize: '1.2rem' }}>
                          {result.predicted_energy_above_hull} eV
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography sx={{ fontWeight: 700, mb: 1, color: tokens.textPrimary }}>Stability</Typography>
                        <Typography sx={{ 
                          color: result.stability === "Stable" ? tokens.success : tokens.warning,
                          fontWeight: 600
                        }}>
                          {result.stability}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
                
                {/* AI Suggestion Card */}
                <Card 
                  sx={{ 
                    mt: 2,
                    ...cardSx,
                    borderColor: isDark ? "rgba(100, 150, 255, 0.3)" : "rgba(70, 130, 255, 0.3)",
                    background: isDark 
                      ? "linear-gradient(135deg, rgba(30, 30, 45, 0.95) 0%, rgba(40, 40, 60, 0.95) 100%)" 
                      : "linear-gradient(135deg, rgba(240, 245, 255, 0.95) 0%, rgba(230, 240, 255, 0.95) 100%)"
                  }}
                >
                  <CardHeader 
                    title={
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: '1.2rem',
                          background: "linear-gradient(135deg, #d4af37 0%, #ffd700 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        AI Suggestion
                      </Typography>
                    } 
                    subheader={
                      <Typography sx={{ color: tokens.textMuted }}>
                        Generated guidance based on your inputs
                      </Typography>
                    } 
                  />
                  {aiLoading && <LinearProgress sx={{ bgcolor: tokens.goldSoft, '& .MuiLinearProgress-bar': { bgcolor: tokens.gold } }} />}
                  <Divider sx={{ borderColor: tokens.borderSoft }} />
                  <CardContent>
                    {aiLoading ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                        <CircularProgress size={20} sx={{ color: tokens.gold }} />
                        <Typography sx={{ color: tokens.textPrimary }}>AI is analyzing your input...</Typography>
                      </Box>
                    ) : aiSuggestion ? (
                      <Box sx={{
                        position: 'relative',
                        p: 3,
                        borderRadius: 2,
                        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                        borderLeft: `4px solid ${tokens.gold}`,
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: isDark 
                            ? 'linear-gradient(135deg, rgba(255,215,0,0.03) 0%, transparent 50%)' 
                            : 'linear-gradient(135deg, rgba(212,175,55,0.05) 0%, transparent 50%)',
                          borderRadius: '8px',
                          pointerEvents: 'none'
                        }
                      }}>
                        <Typography sx={{ 
                          whiteSpace: "pre-line", 
                          lineHeight: 1.7, 
                          color: tokens.textPrimary,
                          fontSize: '0.95rem'
                        }}>
                          {aiSuggestion}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography sx={{ color: tokens.textMuted, fontStyle: 'italic' }}>
                        AI suggestion unavailable at the moment.
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Box>
            </Fade>
          )}
        </Box>
      </Fade>
    </Box>
  );
}