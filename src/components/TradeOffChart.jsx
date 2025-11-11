import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { Card, CardContent, Typography } from "@mui/material";

/**
 * Linear Trade-Off Chart
 * Visualizes how predicted properties affect stability.
 */
export default function TradeOffChart({ predictions = {}, energy = {}, isDark = false, tokens = {} }) {
  if (!predictions || Object.keys(predictions).length === 0) return null;

  // Key quantitative properties to visualize
  const keys = [
    "band_gap",
    "efermi_eV",
    "formation_energy_per_atom",
    "density",
    "volume",
  ];

  // Normalize numeric values for plotting on one line
  const normalize = (val, min, max) =>
    typeof val === "number" ? (val - min) / (max - min) : 0.5;

  const data = keys.map((k) => ({
    property: k,
    "Predicted Value": Number(predictions[k]) || 0,
    "Stability Index": (() => {
      switch (k) {
        case "band_gap":
          return normalize(predictions[k], 0, 5); // higher = stable
        case "efermi_eV":
          return normalize(10 - (predictions[k] || 0), 0, 10); // lower = stable
        case "formation_energy_per_atom":
          return normalize(-(predictions[k] || 0), -5, 5); // more negative = stable
        case "density":
          return normalize(predictions[k], 0, 15);
        case "volume":
          return normalize(50 - (predictions[k] || 0), 0, 100);
        default:
          return 0.5;
      }
    })(),
  }));

  return (
    <Card
      elevation={3}
      sx={{
        my: 3,
        borderRadius: 3,
        border: `1px solid ${tokens?.borderSoft || (isDark ? "rgba(255,215,0,0.15)" : "rgba(212,175,55,0.15)")}`,
        background: tokens?.surfaceSubtle || (isDark ? "rgba(25,25,35,0.9)" : "#fff"),
        boxShadow: tokens?.shadow || (isDark ? "0 4px 20px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,0,0,0.1)"),
      }}
    >
      <CardContent>
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            fontWeight: 700,
            color: tokens?.textPrimary || (isDark ? "#f5f5f5" : "#1a1a1a"),
            background: "linear-gradient(135deg, #d4af37 0%, #ffd700 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          ⚖️ Trade-Off vs Stability Trend
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: tokens?.textMuted || (isDark ? "#b0b0b0" : "#555"),
            mb: 2,
          }}
        >
          Visualizes how each predicted property aligns with stability.  
          Higher “Stability Index” → more stable.
        </Typography>

        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data} margin={{ top: 20, right: 40, left: 10, bottom: 5 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
            />
            <XAxis
              dataKey="property"
              tick={{ fill: tokens?.textMuted || (isDark ? "#ccc" : "#333") }}
              stroke={tokens?.borderSoft || (isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)")}
            />
            <YAxis
              domain={[0, 1]}
              tick={{ fill: tokens?.textMuted || (isDark ? "#ccc" : "#333") }}
              stroke={tokens?.borderSoft || (isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)")}
            />
            <Tooltip
              contentStyle={{
                background: tokens?.surface || (isDark ? "rgba(35,35,45,0.95)" : "#fff"),
                border: `1px solid ${tokens?.border || (isDark ? "rgba(255,215,0,0.3)" : "rgba(212,175,55,0.3)")}`,
                borderRadius: 8,
                color: tokens?.textPrimary || (isDark ? "#fff" : "#000"),
              }}
            />
            <Legend
              wrapperStyle={{
                color: tokens?.textSecondary || (isDark ? "#ccc" : "#333"),
              }}
            />
            <Line
              type="monotone"
              dataKey="Predicted Value"
              stroke={isDark ? tokens?.goldBright || "#ffdd55" : "#3b82f6"}
              strokeWidth={2}
              dot={{ r: 5, fill: isDark ? tokens?.goldBright || "#ffdd55" : "#3b82f6" }}
            />
            <Line
              type="monotone"
              dataKey="Stability Index"
              stroke={isDark ? tokens?.success || "#6bcf7f" : "#10b981"}
              strokeWidth={2}
              dot={{ r: 5, fill: isDark ? tokens?.success || "#6bcf7f" : "#10b981" }}
            />
          </LineChart>
        </ResponsiveContainer>

        {energy && (
          <Typography
            variant="body2"
            sx={{
              mt: 2,
              color: tokens?.textSecondary || (isDark ? "#ccc" : "#444"),
            }}
          >
            Energy Above Hull:{" "}
            <strong>
              {typeof energy?.value === "number"
                ? `${energy.value.toFixed(3)} eV`
                : "N/A"}
            </strong>{" "}
            →{" "}
            <span style={{ color: energy?.stable ? (isDark ? "#6bcf7f" : "#2e7d32") : (isDark ? "#ff6b6b" : "#d32f2f") }}>
              {energy?.stable ? "Stable ✅" : "Unstable ⚠️"}
            </span>
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
