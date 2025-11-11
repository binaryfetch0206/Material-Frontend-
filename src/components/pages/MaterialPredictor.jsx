import React, { useEffect, useMemo, useState } from "react";
import { getMaterialAISuggestions } from "../../api";
import TradeOffChart from "../../components/TradeOffChart";

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Alert,
  Fade,
  Zoom,
} from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import CalculateIcon from "@mui/icons-material/Calculate";
import ScienceIcon from "@mui/icons-material/Science";
import BoltIcon from "@mui/icons-material/Bolt";
import PrecisionManufacturingIcon from "@mui/icons-material/PrecisionManufacturing";
import { predictUnified } from "../../api";

const DEFAULT_SCALE = ["Low", "Medium", "High"];

// Organized into logical groups matching MaterialForm structure
const FEATURE_GROUPS = [
  {
    title: "Electrical Properties",
    icon: BoltIcon,
    fields: [
      { key: "Conductivity", label: "Electrical Conductivity", options: DEFAULT_SCALE },
      { key: "Resistivity", label: "Electrical Resistivity", options: DEFAULT_SCALE },
      { key: "Dielectric Constant", label: "Dielectric Constant", options: DEFAULT_SCALE },
      { key: "Semiconductor Type", label: "Semiconductor Type", options: ["n-type", "p-type"] },
      {
        key: "Electrical Breakdown Strength",
        label: "Electrical Breakdown Strength",
        options: DEFAULT_SCALE,
      },
    ],
  },
  {
    title: "Mechanical Properties",
    icon: PrecisionManufacturingIcon,
    fields: [
      { key: "Elasticity", label: "Elasticity", options: DEFAULT_SCALE },
      { key: "Plasticity", label: "Plasticity", options: DEFAULT_SCALE },
      { key: "Ductility", label: "Ductility", options: DEFAULT_SCALE },
      { key: "Toughness", label: "Toughness", options: DEFAULT_SCALE },
      { key: "Brittleness", label: "Brittleness", options: DEFAULT_SCALE },
      { key: "Hardness", label: "Hardness", options: DEFAULT_SCALE },
      { key: "Strength", label: "Strength", options: DEFAULT_SCALE },
      { key: "Flexibility", label: "Flexibility", options: DEFAULT_SCALE },
      { key: "Weight Type", label: "Weight Type", options: ["Light", "Medium", "Heavy"] },
    ],
  },
  {
    title: "Thermal Properties",
    icon: ScienceIcon,
    fields: [
      { key: "Thermal Conductivity", label: "Thermal Conductivity", options: DEFAULT_SCALE },
      { key: "Specific Heat", label: "Specific Heat", options: DEFAULT_SCALE },
      { key: "Thermal Expansion", label: "Thermal Expansion", options: DEFAULT_SCALE },
    ],
  },

  {
    title: "Chemical Properties",
    icon: ScienceIcon,
    fields: [
      { key: "Corrosion Resistance", label: "Corrosion Resistance", options: DEFAULT_SCALE },
      { key: "Reactivity", label: "Reactivity", options: DEFAULT_SCALE },
      { key: "pH Stability", label: "pH Stability", options: DEFAULT_SCALE },
      { key: "Oxidation Potential", label: "Oxidation Potential", options: DEFAULT_SCALE },
    ],
  },
  {
    title: "Magnetic Properties",
    icon: BoltIcon,
    fields: [
      {
        key: "Magnetic Type",
        label: "Magnetic Type",
        options: ["Ferromagnetic", "Paramagnetic", "Diamagnetic"],
      },
      {
        key: "Magnetization Strength",
        label: "Magnetization Strength",
        options: DEFAULT_SCALE,
      },
      {
        key: "Magnetic Susceptibility",
        label: "Magnetic Susceptibility",
        options: DEFAULT_SCALE,
      },
    ],
  },
  {
    title: "Optical Properties",
    icon: ScienceIcon,
    fields: [
      { key: "Refractive Index", label: "Refractive Index", options: DEFAULT_SCALE },
      { key: "Transparency", label: "Transparency", options: DEFAULT_SCALE },
      { key: "Absorption Coefficient", label: "Absorption Coefficient", options: DEFAULT_SCALE },
      {
        key: "Color Appearance",
        label: "Color Appearance",
        options: ["Silvery", "Gray", "Copper", "Transparent"],
      },
    ],
  },
  {
    title: "Material Classification",
    icon: PrecisionManufacturingIcon,
    fields: [
      {
        key: "Chemical System",
        label: "Chemical System",
        options: ["Fe-O", "Al-O", "Si-C", "Cu-Zn"],
      },
      { key: "Material Type", label: "Material Type", options: ["Metal", "Ceramic", "Polymer"] },
      {
        key: "Processing Type",
        label: "Processing Type",
        options: ["Forged", "Cast", "Rolled", "3D Printed"],
      },
    ],
  },
];

// Flatten for default values
const FEATURE_FIELDS = FEATURE_GROUPS.flatMap((group) => group.fields);

const DEFAULT_VALUES = FEATURE_FIELDS.reduce((acc, field) => {
  const [firstOption] = field.options;
  acc[field.key] = firstOption ?? "";
  return acc;
}, {});

const stabilityColorMap = {
  true: "success",
  false: "error",
};

function formatPredictionEntries(predictions) {
  if (!predictions) return [];
  return Object.entries(predictions).map(([key, value]) => ({
    key,
    value,
  }));
}

export default function MaterialPredictor() {
  const [mode, setMode] = useState("quick");
  const [formValues, setFormValues] = useState(DEFAULT_VALUES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [recommendation, setRecommendation] = useState("");
  const [cachedQuick, setCachedQuick] = useState(null);
  const [cachedAccurate, setCachedAccurate] = useState(null);
  const [isDark, setIsDark] = useState(() =>
    typeof document !== "undefined" ? document.body.classList.contains("dark-theme") : false
  );

  // Sync with body's dark-theme class used by Home (same as MaterialForm)
  useEffect(() => {
    const updateTheme = () => setIsDark(document.body.classList.contains("dark-theme"));
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // Enhanced design tokens matching MaterialForm exactly
  const tokens = useMemo(
    () => ({
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
    }),
    [isDark]
  );

  const handleFieldChange = (key) => (event) => {
    setFormValues((prev) => ({
      ...prev,
      [key]: event.target.value,
    }));
  };

  const handleModeChange = (_event, nextMode) => {
    if (nextMode !== null) setMode(nextMode);
  };

  const resetForm = () => {
    setFormValues(DEFAULT_VALUES);
    setResult(null);
    setRecommendation("");
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await predictUnified({ mode, user_input: formValues });
      setResult(res);

      // Cache quick/accurate runs to enable better recommendations next run
      if (mode === "quick") setCachedQuick(res.predicted_properties);
      if (mode === "accurate") setCachedAccurate(res.predicted_properties);

      // Simple recommendation logic on the client using both cached modes and energy
      const quickOut = mode === "quick" ? res.predicted_properties : cachedQuick;
      const accurateOut = mode === "accurate" ? res.predicted_properties : cachedAccurate;
      const energy = res.energy_above_hull_result || {};

      let rec = "Material appears stable and optimized.";
      if (energy.stable === false) {
        rec = "Reduce brittleness and reactivity to improve stability.";
      } else if (quickOut && accurateOut) {
        const qd = Number(quickOut.density);
        const ad = Number(accurateOut.density);
        if (!Number.isNaN(qd) && !Number.isNaN(ad) && Math.abs(qd - ad) > 0.5) {
          rec = "Match density closer to accurate mode predictions.";
        } else if (
          quickOut["Thermal Conductivity"] &&
          accurateOut["Thermal Conductivity"] &&
          quickOut["Thermal Conductivity"] !== accurateOut["Thermal Conductivity"]
        ) {
          rec = "Adjust conductivity values closer to accurate prediction.";
        }
      }
      setRecommendation(rec);
    const aiSummary = await getMaterialAISuggestions(formValues);
    setRecommendation(aiSummary);
    } catch (err) {
      setError(err.message || "Prediction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const energy = result?.energy_above_hull_result;
  const predictions = result?.predicted_properties;

  // Card styling matching MaterialForm
  const cardSx = {
    borderRadius: 3,
    overflow: "hidden",
    background: tokens.surface,
    border: `1px solid ${tokens.border}`,
    backdropFilter: "blur(12px)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: tokens.shadow,
      borderColor: tokens.gold,
    },
  };

  // Input styling matching MaterialForm
// Input styling matching MaterialForm, but larger
const inputSx = {
  "& .MuiOutlinedInput-root": {
    background: tokens.inputBg,
    transition: "all 0.2s ease",
    minHeight: "52px", // ✅ increased height
    minWidth: "165px",
    fontSize: "1rem", // ✅ larger font
    "& fieldset": {
      borderColor: tokens.inputBorder,
      transition: "border-color 0.2s ease",
    },
    "&:hover fieldset": {
      borderColor: tokens.gold,
      boxShadow: `0 0 0 2px ${tokens.goldSoft}`,
    },
    "&.Mui-focused fieldset": {
      borderColor: tokens.goldBright,
      boxShadow: `0 0 0 3px ${tokens.goldSoft}`,
    },
  },
  "& .MuiInputLabel-root": {
    color: tokens.textMuted,
    fontSize: "0.95rem", // ✅ slightly larger label
    whiteSpace: "nowrap", // prevent wrapping
    overflow: "hidden",
    textOverflow: "ellipsis", // adds "..." if label is extremely long
  },
  "& .MuiSelect-select": {
    py: 1.5, // ✅ add vertical padding
  },
};


  // Toggle button styling
  const toggleButtonSx = {
    color: tokens.textPrimary,
    borderColor: tokens.border,
    "&.Mui-selected": {
      background: isDark
        ? "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)"
        : "linear-gradient(135deg, #d4af37 0%, #e6c550 100%)",
      color: isDark ? "#1a1a1a" : "#fff",
      fontWeight: 700,
      "&:hover": {
        background: isDark
          ? "linear-gradient(135deg, #ffed4e 0%, #fff1a6 100%)"
          : "linear-gradient(135deg, #e6c550 0%, #f0d875 100%)",
      },
    },
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
              mb: 1,
            }}
          >
            🎯 Material Property Predictor
          </Typography>
          <Typography sx={{ color: tokens.textMuted, mb: 3, fontSize: "1.1rem" }}>
            Choose a mode, provide descriptors, and analyze stability
          </Typography>

          <form onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              {/* Mode Selection Card */}
              <Grid item xs={12}>
                <Zoom in timeout={600}>
                  <Card sx={cardSx}>
                    <CardHeader
                      title={
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <BoltIcon sx={{ color: tokens.gold }} />
                          <Typography variant="h6" sx={{ color: tokens.textPrimary }}>
                            Prediction Mode
                          </Typography>
                        </Box>
                      }
                      subheader={
                        <Typography sx={{ color: tokens.textMuted }}>
                          Select quick mode for fast predictions or accurate mode for detailed analysis
                        </Typography>
                      }
                    />
                    {loading && (
                      <LinearProgress
                        sx={{
                          bgcolor: tokens.goldSoft,
                          "& .MuiLinearProgress-bar": { bgcolor: tokens.gold },
                        }}
                      />
                    )}
                    <Divider sx={{ borderColor: tokens.borderSoft }} />
                    <CardContent>
                      <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={3}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", md: "center" }}
                      >
                        <ToggleButtonGroup
                          value={mode}
                          exclusive
                          onChange={handleModeChange}
                          sx={{ width: { xs: "100%", md: "auto" } }}
                        >
                          <ToggleButton value="quick" sx={toggleButtonSx}>
                            ⚡ Quick Mode
                          </ToggleButton>
                          <ToggleButton value="accurate" sx={toggleButtonSx}>
                            🎯 Accurate Mode
                          </ToggleButton>
                        </ToggleButtonGroup>
                        <Stack direction="row" spacing={2} sx={{ width: { xs: "100%", md: "auto" } }}>
                          <Button
                            variant="outlined"
                            onClick={resetForm}
                            disabled={loading}
                            startIcon={<RestartAltIcon />}
                            sx={{
                              borderColor: tokens.border,
                              color: tokens.textPrimary,
                              "&:hover": {
                                borderColor: tokens.gold,
                                backgroundColor: tokens.goldSoft,
                                transform: "translateY(-2px)",
                              },
                            }}
                          >
                            Reset
                          </Button>
                          <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            endIcon={loading ? <CircularProgress size={18} color="inherit" /> : <CalculateIcon />}
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
                              "&:hover": {
                                boxShadow: isDark
                                  ? "0 8px 30px rgba(255, 215, 0, 0.5)"
                                  : "0 8px 30px rgba(212, 175, 55, 0.6)",
                                transform: "translateY(-3px)",
                                background: isDark
                                  ? "linear-gradient(135deg, #ffed4e 0%, #fff1a6 100%)"
                                  : "linear-gradient(135deg, #e6c550 0%, #f0d875 100%)",
                              },
                              "&:disabled": {
                                background: isDark ? "rgba(255, 215, 0, 0.3)" : "rgba(212, 175, 55, 0.3)",
                                color: isDark ? "rgba(26, 26, 26, 0.5)" : "rgba(255, 255, 255, 0.5)",
                              },
                            }}
                          >
                            {loading ? "Predicting..." : "Predict"}
                          </Button>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>

              {/* Feature Fields organized by groups */}
              {FEATURE_GROUPS.map((group, groupIndex) => {
                const IconComponent = group.icon;
                return (
                  <Grid item xs={12} sm={6} md={6} lg={4} key={group.title}>
                    <Zoom in timeout={600 + groupIndex * 200}>
                      <Card sx={cardSx}>
                        <CardHeader
                          title={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <IconComponent sx={{ color: tokens.gold }} />
                              <Typography variant="h6" sx={{ color: tokens.textPrimary }}>
                                {group.title}
                              </Typography>
                            </Box>
                          }
                          subheader={
                            <Typography sx={{ color: tokens.textMuted }}>
                              Configure {group.title.toLowerCase()} parameters
                            </Typography>
                          }
                        />
                        <Divider sx={{ borderColor: tokens.borderSoft }} />
                        <CardContent>
                          <Grid container spacing={3}>
                            {group.fields.map((field) => {
                              const selectId = `select-${field.key.replace(/\s+/g, "-").toLowerCase()}`;
                              return (
                                <Grid item xs={12} sm={6} md={4} key={field.key}>
                                  <FormControl fullWidth sx={inputSx}>
                                    <InputLabel id={`${selectId}-label`}>{field.label}</InputLabel>
                                    <Select
                                      labelId={`${selectId}-label`}
                                      id={selectId}
                                      value={formValues[field.key]}
                                      label={field.label}
                                      onChange={handleFieldChange(field.key)}
                                    >
                                      {field.options.map((option) => (
                                        <MenuItem key={option} value={option}>
                                          {option}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                </Grid>
                              );
                            })}
                          </Grid>
                        </CardContent>
                      </Card>
                    </Zoom>
                  </Grid>
                );
              })}
            </Grid>
          </form>

          {/* Error Display */}
          {error && (
            <Fade in timeout={500}>
              <Box sx={{ mt: 4 }}>
                <Alert
                  severity="error"
                  sx={{
                    mb: 2,
                    bgcolor: isDark ? "rgba(211, 47, 47, 0.1)" : undefined,
                    borderLeft: `4px solid ${tokens.error}`,
                  }}
                >
                  {error}
                </Alert>
              </Box>
            </Fade>
          )}

          {/* Results */}
          {result && (
            <Fade in timeout={500}>
              <Box sx={{ mt: 4 }}>
                {/* Prediction Results Card */}
                <Card sx={cardSx}>
                  <CardHeader
                    title={
                      <Typography
                        sx={{
                          fontWeight: 700,
                          fontSize: "1.2rem",
                          background: "linear-gradient(135deg, #d4af37 0%, #ffd700 100%)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        {result.mode === "quick" ? "⚡ Quick Mode Insights" : "🎯 Accurate Mode Insights"}
                      </Typography>
                    }
                    subheader={
                      <Typography sx={{ color: tokens.textMuted }}>
                        Predicted property values from the selected model
                      </Typography>
                    }
                  />
                  <Divider sx={{ borderColor: tokens.borderSoft }} />
                  <CardContent>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={2}
                      alignItems={{ xs: "flex-start", sm: "center" }}
                      mb={3}
                      flexWrap="wrap"
                    >
                      <Box>
                        <Typography sx={{ fontWeight: 700, mb: 1, color: tokens.textPrimary, fontSize: "0.9rem" }}>
                          Energy Above Hull
                        </Typography>
                        <Chip
                          label={typeof energy?.value === "number" ? `${energy.value.toFixed(3)} eV` : "N/A"}
                          sx={{
                            background: "linear-gradient(135deg, #d4af37 0%, #ffd700 100%)",
                            color: "#1a1a1a",
                            fontWeight: 700,
                            fontSize: "0.9rem",
                          }}
                        />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 700, mb: 1, color: tokens.textPrimary, fontSize: "0.9rem" }}>
                          Stability
                        </Typography>
                        <Chip
                          label={energy?.stable ? "Stable" : "Not Stable"}
                          sx={{
                            background: energy?.stable
                              ? `linear-gradient(135deg, ${tokens.success} 0%, ${tokens.success}dd 100%)`
                              : `linear-gradient(135deg, ${tokens.error} 0%, ${tokens.error}dd 100%)`,
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: "0.9rem",
                          }}
                        />
                      </Box>
                    </Stack>
                    <Grid container spacing={2}>
                      {formatPredictionEntries(predictions).map(({ key, value }) => (
                        <Grid item xs={12} sm={6} md={4} key={key}>
                          <Box
                            sx={{
                              borderRadius: 2,
                              border: `1px solid ${tokens.borderSoft}`,
                              p: 2,
                              height: "100%",
                              background: tokens.surfaceSubtle,
                              transition: "all 0.2s ease",
                              "&:hover": {
                                borderColor: tokens.gold,
                                transform: "translateY(-2px)",
                                boxShadow: `0 4px 12px ${tokens.goldSoft}`,
                              },
                            }}
                          >
                            <Typography variant="subtitle2" sx={{ color: tokens.textMuted, mb: 0.5 }}>
                              {key}
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: tokens.textPrimary }}>
                              {typeof value === "number" ? Number(value).toFixed(3) : String(value)}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>

                {/* AI Recommendation Card */}
                {recommendation && (
                  <Card
                    sx={{
                      mt: 2,
                      ...cardSx,
                      borderColor: isDark ? "rgba(100, 150, 255, 0.3)" : "rgba(70, 130, 255, 0.3)",
                      background: isDark
                        ? "linear-gradient(135deg, rgba(30, 30, 45, 0.95) 0%, rgba(40, 40, 60, 0.95) 100%)"
                        : "linear-gradient(135deg, rgba(240, 245, 255, 0.95) 0%, rgba(230, 240, 255, 0.95) 100%)",
                    }}
                  >
                    <CardHeader
                      title={
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: "1.2rem",
                            background: "linear-gradient(135deg, #d4af37 0%, #ffd700 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                          }}
                        >
                          Intelligent Recommendation
                        </Typography>
                      }
                      subheader={
                        <Typography sx={{ color: tokens.textMuted }}>
                          AI-generated guidance based on your inputs
                        </Typography>
                      }
                    />
                    <Divider sx={{ borderColor: tokens.borderSoft }} />
                    <CardContent>
                      <Box
                        sx={{
                          position: "relative",
                          p: 3,
                          borderRadius: 2,
                          background: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                          borderLeft: `4px solid ${tokens.gold}`,
                          "&::before": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: isDark
                              ? "linear-gradient(135deg, rgba(255,215,0,0.03) 0%, transparent 50%)"
                              : "linear-gradient(135deg, rgba(212,175,55,0.05) 0%, transparent 50%)",
                            borderRadius: "8px",
                            pointerEvents: "none",
                          },
                        }}
                      >
                        <Typography
                          sx={{
                            whiteSpace: "pre-line",
                            lineHeight: 1.7,
                            color: tokens.textPrimary,
                            fontSize: "0.95rem",
                          }}
                        >
                          {recommendation}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                )}

                {/* Trade-off Chart */}
                {result && (
                  <Box sx={{ mt: 2 }}>
                    <TradeOffChart
                      predictions={result?.predicted_properties}
                      energy={result?.energy_above_hull_result}
                      isDark={isDark}
                      tokens={tokens}
                    />
                  </Box>
                )}
              </Box>
            </Fade>
          )}
        </Box>
      </Fade>
    </Box>
  );
}

