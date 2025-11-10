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
 * Simple Linear Trade-Off Chart
 * Shows how predicted properties affect stability visually along a line.
 */
export default function TradeOffChart({ predictions = {}, energy = {} }) {
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
      // Simple rule for effect direction
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
    <Card elevation={3} sx={{ my: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          ⚖️ Trade-Off vs Stability Trend
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Visualizes how each predicted property aligns with stability.  
          Higher “Stability Index” → more stable.
        </Typography>

        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data} margin={{ top: 20, right: 40, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="property" />
            <YAxis domain={[0, 1]} />
            <Tooltip
              formatter={(value, name) =>
                name === "Predicted Value"
                  ? `${value.toFixed(3)}`
                  : `${(value * 100).toFixed(1)}% stability`
              }
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="Predicted Value"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="Stability Index"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>

        {energy && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Energy Above Hull:{" "}
            <strong>
              {typeof energy?.value === "number"
                ? `${energy.value.toFixed(3)} eV`
                : "N/A"}
            </strong>{" "}
            → {energy?.stable ? "Stable ✅" : "Unstable ⚠️"}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
