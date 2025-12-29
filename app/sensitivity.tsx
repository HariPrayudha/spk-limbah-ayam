import { useRouter } from "expo-router";
import { AlertCircle, ArrowLeft, TrendingUp } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiService } from "../src/services/api";

const { width } = Dimensions.get("window");

export default function SensitivityScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    loadSensitivityData();
  }, []);

  const loadSensitivityData = async () => {
    try {
      const res = await apiService.runSensitivity();
      processChartData(res);
    } catch (error) {
      console.error("Failed to load sensitivity data", error);
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (res: any) => {
    if (
      !res ||
      !res.sensitivity_analysis ||
      res.sensitivity_analysis.length === 0
    )
      return;

    const results = res.sensitivity_analysis;
    const firstScenario = results[0];
    const firstRanking = firstScenario.ranking;

    const top3Items = [...firstRanking]
      .sort((a: any, b: any) => a.rank - b.rank)
      .slice(0, 3);

    const colors = ["#ea580c", "#84cc16", "#3b82f6"];

    const lines = top3Items.map((targetItem: any, index: number) => {
      return {
        code: targetItem.alternative_code,
        name: targetItem.alternative_name,
        color: colors[index],
        thickness: 3,
        dataPointColor: colors[index],
        data: results.map((scenario: any) => {
          const altData = scenario.ranking.find(
            (r: any) => r.alternative_code === targetItem.alternative_code
          );
          const rankValue = altData ? altData.rank : 0;

          return {
            value: rankValue,
            label: scenario.alpha.toFixed(1),
            dataPointText: rankValue.toString(),
            textShiftY: -20,
            textColor: colors[index],
            fontSize: 10,
          };
        }),
      };
    });

    setChartData(lines);
  };

  if (loading)
    return (
      <View className="flex-1 justify-center items-center bg-[#1c1917]">
        <ActivityIndicator size="large" color="#ea580c" />
        <Text className="text-gray-400 mt-4 font-bold">
          Calculating Ranking Stability...
        </Text>
      </View>
    );

  return (
    <SafeAreaView className="flex-1 bg-[#FDFBF7]">
      <ScrollView>
        <View className="p-6">
          <TouchableOpacity
            onPress={() => router.back()}
            className="flex-row items-center mb-4"
          >
            <ArrowLeft color="#1c1917" size={24} />
            <Text className="text-dark font-bold ml-2">Back</Text>
          </TouchableOpacity>
          <Text className="text-2xl font-black text-dark">
            Sensitivity Analysis
          </Text>
          <Text className="text-gray-500">
            Testing ranking changes against parameter variations (Alpha).
          </Text>
        </View>

        <View className="px-6 flex-row flex-wrap gap-2 mb-6">
          {chartData.map((line: any, idx) => (
            <View
              key={idx}
              className="flex-row items-center bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm"
            >
              <View
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: line.color }}
              />
              <Text className="font-bold text-xs text-dark">{line.code}</Text>
            </View>
          ))}
        </View>

        <View className="bg-white mx-4 p-4 rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {chartData.length > 0 ? (
            <LineChart
              data={chartData[0]?.data || []}
              data2={chartData[1]?.data || []}
              data3={chartData[2]?.data || []}
              color1={chartData[0]?.color}
              color2={chartData[1]?.color}
              color3={chartData[2]?.color}
              height={250}
              width={width - 60}
              initialSpacing={20}
              spacing={50}
              yAxisLabelWidth={30}
              hideRules
              yAxisThickness={0}
              xAxisThickness={1}
              xAxisColor="lightgray"
              textFontSize={10}
              hideDataPoints={false}
              isAnimated
              curved
            />
          ) : (
            <View className="h-40 justify-center items-center">
              <AlertCircle color="gray" size={24} />
              <Text className="text-gray-400 mt-2">
                Chart data not available
              </Text>
            </View>
          )}
          <Text className="text-center text-xs text-gray-400 mt-6 font-bold">
            Alpha Parameter (0.0 - 1.0)
          </Text>
        </View>

        <View className="p-6">
          <View className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex-row">
            <TrendingUp color="#ea580c" size={24} />
            <View className="ml-3 flex-1">
              <Text className="font-bold text-orange-800 mb-1">
                Stability Analysis
              </Text>
              <Text className="text-orange-700/70 text-xs leading-relaxed">
                The chart above tracks the ranking movement of the top 3
                alternatives (based on initial results).
                {"\n\n"}• X Axis: Alpha Value (Weight Combination)
                {"\n"}• Y Axis: Ranking Position
                {"\n\n"}
                If the line is flat, the ranking is stable. If crossing occurs,
                the ranking is sensitive to weighting method changes.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
