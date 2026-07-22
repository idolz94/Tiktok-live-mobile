import { View, Text } from "react-native";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import type { ChartPoint } from "../types";

type Props = {
  data: ChartPoint[];
  color: string;
  height?: number;
  formatValue?: (v: number) => string;
};

const CHART_HEIGHT = 168;
const Y_LABEL_W = 22;
const X_LABEL_H = 20;
const BAR_W = 24;

export function BarChart({ data, color, height = CHART_HEIGHT, formatValue = String }: Props) {
  const { colors } = useThemes();
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const plotH = height - X_LABEL_H;

  const labelStep = data.length > 7 ? Math.ceil(data.length / 6) : 1;

  const gridLines = [0, 1 / 3, 2 / 3, 1];

  return (
    <View style={{ flexDirection: "row" }}>
      {/* Y-axis labels */}
      <View style={{ width: Y_LABEL_W, paddingRight: 4 }}>
        <View style={{ height: plotH, justifyContent: "space-between", alignItems: "flex-end" }}>
          {[maxVal, Math.round((maxVal * 2) / 3), Math.round(maxVal / 3), 0].map((v, i) => (
            <Text key={i} style={[styles.label, { color: "#acacac", fontSize: 10 }]}>
              {formatValue(v)}
            </Text>
          ))}
        </View>
        <View style={{ height: X_LABEL_H }} />
      </View>

      {/* Chart area */}
      <View style={{ flex: 1 }}>
        <View style={{ height: plotH, position: "relative" }}>
          {/* Grid lines at 0%, 33%, 67%, 100% */}
          {gridLines.map((p, i) => (
            <View
              key={i}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: (1 - p) * (plotH - 8) + 4,
                height: 0.5,
                backgroundColor: colors.neutral50,
              }}
            />
          ))}

          {/* Bars */}
          <View style={{ flex: 1, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", paddingHorizontal: 4 }}>
            {data.map((d, i) => (
              <View key={i} style={{ width: BAR_W, alignItems: "center" }}>
                <View
                  style={{
                    width: BAR_W,
                    height: Math.max((d.value / maxVal) * (plotH - 12), d.value > 0 ? 4 : 0),
                    backgroundColor: color,
                    borderRadius: 2,
                  }}
                />
              </View>
            ))}
          </View>
        </View>

        {/* X-axis labels */}
        <View style={{ height: X_LABEL_H, flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 4 }}>
          {data.map((d, i) => (
            <View key={i} style={{ width: BAR_W, alignItems: "center" }}>
              <Text style={[styles.label, { color: colors.textMuted, fontSize: 10 }]}>
                {i % labelStep === 0 ? d.label : ""}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

// Chuyển StyleSheet.create -> createStyles theo quy tắc styling mục 6.
const styles = createStyles(() => ({
  label: {
    fontFamily: "Inter",
  },
}));
