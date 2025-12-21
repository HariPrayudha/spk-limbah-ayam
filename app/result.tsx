import { useLocalSearchParams, useRouter } from "expo-router";
import {
    Activity,
    ArrowLeft,
    Award,
    BarChart3,
    List,
    PieChart,
    Trophy
} from "lucide-react-native";
import {
    Dimensions,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { SafeAreaView } from "react-native-safe-area-context";
import { AnalysisResponse } from "../src/types/api";

const { width } = Dimensions.get("window");

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parse data
  const resultData: AnalysisResponse | null = params.data
    ? JSON.parse(params.data as string)
    : null;

  if (!resultData)
    return (
      <View className="flex-1 justify-center items-center bg-[#FDFBF7]">
        <Text className="text-gray-500">Data tidak ditemukan</Text>
      </View>
    );

  const topWinner = resultData.final_ranking[0];

  // DATA UNTUK CHART (Ambil Top 5 Saja biar rapi)
  const chartData = resultData.final_ranking.slice(0, 5).map((item) => ({
    value: item.score,
    label: item.alternative_code,
    frontColor: item.rank === 1 ? "#ea580c" : "#fdba74", // Juara 1 warnanya beda
    topLabelComponent: () => (
      <Text className="text-[10px] text-gray-500 mb-1 font-bold">
        {item.score.toFixed(3)}
      </Text>
    ),
  }));

  // DATA BOBOT (Sorted by Value)
  const weightsArray = Object.entries(resultData.weights_used).sort(
    ([, a], [, b]) => b - a
  ); // Urutkan dari bobot terbesar

  return (
    <SafeAreaView className="flex-1 bg-[#1c1917]">
      {/* Background Dark biar elegan untuk hasil */}

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View className="p-6 pb-2">
          <TouchableOpacity
            onPress={() => router.back()}
            className="mb-6 flex-row items-center"
          >
            <View className="bg-white/10 p-2 rounded-full mr-3">
              <ArrowLeft color="white" size={20} />
            </View>
            <Text className="text-white font-bold text-base">
              Kembali ke Input
            </Text>
          </TouchableOpacity>

          <Text className="text-orange-500 font-bold uppercase tracking-widest text-xs mb-1">
            Hasil Keputusan
          </Text>
          <Text className="text-3xl font-black text-white leading-tight">
            Rekomendasi{"\n"}Produk Terbaik
          </Text>
        </View>

        {/* 🏆 WINNER CARD */}
        <View className="mx-6 mt-4 mb-8">
          <View className="bg-orange-600 rounded-[32px] p-6 border-t border-white/20 shadow-2xl shadow-orange-500/50 relative overflow-hidden">
            {/* Background Pattern */}
            <View className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full" />
            <View className="absolute -left-10 -top-10 w-32 h-32 bg-black/10 rounded-full" />

            <View className="items-center">
              <View className="bg-white p-4 rounded-full mb-3 shadow-lg">
                <Trophy size={40} color="#ea580c" fill="#ea580c" />
              </View>
              <Text className="text-white/80 font-bold text-sm uppercase tracking-widest mb-1">
                Peringkat #1
              </Text>
              <Text className="text-white font-black text-3xl text-center mb-2">
                {topWinner.alternative_name}
              </Text>
              <View className="bg-black/20 px-4 py-1.5 rounded-full border border-white/10">
                <Text className="text-white font-bold font-mono">
                  Utility Score: {topWinner.score.toFixed(4)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 📊 CHART SECTION */}
        <View className="bg-[#FDFBF7] rounded-t-[40px] px-6 pt-8 pb-10 min-h-screen">
          <View className="flex-row items-center mb-6">
            <BarChart3 size={24} color="#ea580c" />
            <Text className="text-xl font-black text-dark ml-2">
              Grafik 5 Besar
            </Text>
          </View>

          <View className="items-center mb-10 -ml-4">
            {/* Chart Component */}
            <BarChart
              data={chartData}
              barWidth={32}
              noOfSections={4}
              barBorderRadius={8}
              frontColor="#fdba74"
              yAxisThickness={0}
              xAxisThickness={0}
              yAxisTextStyle={{ color: "gray", fontSize: 10 }}
              xAxisLabelTextStyle={{ color: "#1c1917", fontWeight: "bold" }}
              hideRules
              height={180}
              width={width - 80}
              isAnimated
            />
          </View>

          {/* ⚖️ WEIGHTS SECTION */}
          <View className="mb-10">
            <View className="flex-row items-center mb-4">
              <PieChart size={24} color="#ea580c" />
              <Text className="text-xl font-black text-dark ml-2">
                Bobot Kriteria (CRITIC)
              </Text>
            </View>
            <Text className="text-gray-400 text-xs mb-4">
              Metode CRITIC menghitung bobot secara objektif berdasarkan
              simpangan baku data.
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="pl-1"
            >
              {weightsArray.map(([code, weight], index) => (
                <View
                  key={code}
                  className="mr-3 bg-white p-3 rounded-2xl border border-gray-100 w-28 items-center shadow-sm"
                >
                  <Text className="font-bold text-gray-400 text-xs mb-1">
                    {code}
                  </Text>
                  <Text className="font-black text-dark text-lg">
                    {(weight * 100).toFixed(1)}%
                  </Text>
                  <View className="w-full h-1 bg-gray-100 rounded-full mt-2 overflow-hidden">
                    <View
                      className="h-full bg-orange-500"
                      style={{ width: `${weight * 100 * 3}%` }} // Skala visual aja biar kelihatan
                    />
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* 📋 FULL RANKING LIST */}
          <View>
            <View className="flex-row items-center mb-4">
              <List size={24} color="#ea580c" />
              <Text className="text-xl font-black text-dark ml-2">
                Ranking Lengkap
              </Text>
            </View>

            {resultData.final_ranking.map((item, index) => {
              const isTop3 = index < 3;
              return (
                <View
                  key={item.alternative_code}
                  className={`flex-row items-center mb-3 p-4 rounded-2xl border ${
                    isTop3
                      ? "bg-white border-orange-100 shadow-sm"
                      : "bg-gray-50 border-transparent"
                  }`}
                >
                  <View
                    className={`w-10 h-10 rounded-full items-center justify-center mr-4 ${
                      index === 0
                        ? "bg-orange-500"
                        : index === 1
                        ? "bg-gray-400"
                        : index === 2
                        ? "bg-orange-800"
                        : "bg-white border border-gray-200"
                    }`}
                  >
                    <Text
                      className={`font-black ${
                        index < 3 ? "text-white" : "text-gray-500"
                      }`}
                    >
                      #{item.rank}
                    </Text>
                  </View>

                  <View className="flex-1">
                    <Text
                      className={`font-bold text-base ${
                        isTop3 ? "text-dark" : "text-gray-600"
                      }`}
                    >
                      {item.alternative_name}
                    </Text>
                    <Text className="text-gray-400 text-xs">
                      {item.alternative_code}
                    </Text>
                  </View>

                  <View className="items-end">
                    {isTop3 && (
                      <Award size={16} color="#ea580c" className="mb-1" />
                    )}
                    <Text className="font-bold font-mono text-dark">
                      {item.score.toFixed(4)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
          <View className="mt-8 mb-4">
            <TouchableOpacity
              onPress={() => router.push("/sensitivity")}
              className="bg-white border-2 border-dark p-4 rounded-2xl flex-row items-center justify-center"
            >
              <Activity size={20} color="#1c1917" />
              <Text className="font-black text-dark ml-2 text-base">
                Cek Stabilitas Ranking
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
