import { useRouter } from "expo-router";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Play,
  Trash2,
  Wand2,
  X,
  XCircle,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTabBar } from "../../src/context/TabBarContext";
import { apiService } from "../../src/services/api";
import { Alternative, Criterion } from "../../src/types/api";

const REAL_DATA_MATRIX: Record<string, number[]> = {
  A1: [2350000, 5465000, 4, 4, 5, 5, 3],
  A2: [2625000, 9150000, 3, 4, 4, 5, 2],
  A3: [6510000, 5935000, 3, 5, 2, 5, 5],
  A4: [4290000, 5430000, 3, 3, 3, 4, 4],
  A5: [5420000, 10280000, 3, 3, 3, 4, 2],
  A6: [6180000, 10470000, 4, 4, 2, 4, 2],
  A7: [3040000, 5130000, 2, 4, 4, 3, 3],
  A8: [2630000, 2390000, 2, 4, 4, 4, 2],
  A9: [4460000, 11975000, 5, 5, 3, 5, 4],
  A10: [7060000, 10525000, 4, 5, 2, 4, 4],
  A11: [6050000, 7350000, 3, 3, 2, 4, 5],
  A12: [2810000, 4725000, 3, 4, 4, 4, 3],
  A13: [11940000, 13285000, 3, 4, 1, 3, 2],
  A14: [4870000, 11920000, 5, 3, 3, 3, 2],
  A15: [6940000, 4470000, 2, 3, 2, 4, 3],
};

const SCALE_DESC: Record<string, string[]> = {
  C3: ["Very Small", "Niche/Limited", "Quite Available", "Wide", "Very Wide"],
  C4: ["Very Bad", "Bad", "Moderate", "Friendly", "Very Friendly"],
  C5: ["Very Difficult", "Difficult", "Moderate", "Easy", "Very Easy"],
  C6: ["Very Limited", "Limited", "Sufficient", "Abundant", "Very Abundant"],
  C7: ["Very Wasteful", "Wasteful", "Neutral", "Efficient", "Very Efficient"],
};

const formatCurrency = (value: number) => {
  if (!value) return "";
  return "Rp " + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const parseCurrency = (text: string) => {
  return parseInt(text.replace(/[^0-9]/g, ""), 10) || 0;
};

export default function AnalysisScreen() {
  const router = useRouter();
  const { toggleTabBar } = useTabBar();
  const lastContentOffset = useRef(0);

  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [matrix, setMatrix] = useState<Record<string, Record<string, number>>>(
    {}
  );
  const [selectedAlt, setSelectedAlt] = useState<Alternative | null>(null);
  const [inputValues, setInputValues] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    type: "success" | "error" | "warning";
    title: string;
    message: string;
  }>({ visible: false, type: "success", title: "", message: "" });

  useEffect(() => {
    const loadMasterData = async () => {
      const [resAlt, resCrit] = await Promise.all([
        apiService.getAlternatives(),
        apiService.getCriteria(),
      ]);

      if (resAlt) {
        setAlternatives(
          resAlt.sort((a, b) =>
            a.code.localeCompare(b.code, undefined, { numeric: true })
          )
        );
      }
      if (resCrit) {
        setCriteria(
          resCrit.sort((a, b) =>
            a.code.localeCompare(b.code, undefined, { numeric: true })
          )
        );
      }
    };
    loadMasterData();
  }, []);

  const showAlert = (
    type: "success" | "error" | "warning",
    title: string,
    message: string
  ) => {
    setAlertConfig({ visible: true, type, title, message });
  };

  const closeAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    if (currentOffset > lastContentOffset.current && currentOffset > 20) {
      toggleTabBar(false);
    } else if (currentOffset < lastContentOffset.current) {
      toggleTabBar(true);
    }
    lastContentOffset.current = currentOffset;
  };

  const openInputModal = (alt: Alternative) => {
    setSelectedAlt(alt);
    const currentVals: Record<string, number> = {};
    criteria.forEach((c) => {
      currentVals[c.code] = matrix[alt.code]?.[c.code] || 0;
    });
    setInputValues(currentVals);
  };

  const handleInputChange = (critCode: string, val: string | number) => {
    let numVal = val;
    if (typeof val === "string") {
      numVal = parseCurrency(val);
    }
    setInputValues((prev) => ({ ...prev, [critCode]: numVal as number }));
  };

  const saveModalInput = () => {
    if (!selectedAlt) return;
    setMatrix((prev) => ({
      ...prev,
      [selectedAlt.code]: inputValues,
    }));
    setSelectedAlt(null);
  };

  const fillRealData = () => {
    const newMatrix: Record<string, Record<string, number>> = {};
    alternatives.forEach((alt) => {
      const dataValues = REAL_DATA_MATRIX[alt.code];
      if (dataValues) {
        newMatrix[alt.code] = {};
        criteria.forEach((crit, index) => {
          newMatrix[alt.code][crit.code] = dataValues[index] || 0;
        });
      }
    });
    setMatrix(newMatrix);
    showAlert(
      "success",
      "Data Filled",
      "Original table data loaded successfully."
    );
  };

  const handleReset = () => {
    setMatrix({});
    showAlert(
      "warning",
      "Reset Data",
      "All assessment inputs have been cleared."
    );
  };

  const handleRunAnalysis = async () => {
    const isComplete = alternatives.every((a) =>
      criteria.every((c) => {
        const val = matrix[a.code]?.[c.code];
        return val !== undefined && val > 0;
      })
    );

    if (!isComplete && Object.keys(matrix).length === 0) {
      showAlert(
        "error",
        "Data Empty",
        "Please complete the assessment before analyzing."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const bulkPayload: any[] = [];
      Object.entries(matrix).forEach(([altCode, scores]) => {
        Object.entries(scores).forEach(([critCode, val]) => {
          bulkPayload.push({
            alternative_code: altCode,
            criteria_code: critCode,
            value: Number(val),
          });
        });
      });

      await apiService.resetMatrix();
      await apiService.submitMatrixBulk(bulkPayload);
      const result = await apiService.runAnalysis();

      router.push({
        pathname: "/result",
        params: { data: JSON.stringify(result) },
      });
    } catch (error: any) {
      const msg = error.response?.data?.detail
        ? JSON.stringify(error.response.data.detail)
        : "An error occurred on the server.";
      showAlert("error", "Analysis Failed", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProgress = (altCode: string) => {
    if (!matrix[altCode]) return 0;
    const values = Object.values(matrix[altCode]);
    return values.filter((v) => v > 0).length;
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FDFBF7]">
      <View className="px-6 pt-6 pb-6 bg-[#FDFBF7]">
        <Text className="text-3xl font-black text-dark mb-1">Assessment</Text>
        <Text className="text-gray-500 text-sm">
          Input values for each alternative.
        </Text>
      </View>

      <View className="px-6 pb-6 flex-row gap-3">
        <Pressable
          onPress={fillRealData}
          className="flex-1 bg-orange-100 h-12 rounded-xl flex-row justify-center items-center active:bg-orange-200"
        >
          <Wand2 size={18} color="#ea580c" />
          <Text className="text-primary font-bold ml-2 text-xs">Auto Fill</Text>
        </Pressable>
        <Pressable
          onPress={handleReset}
          className="bg-rose-100 w-12 h-12 rounded-xl items-center justify-center active:bg-rose-200"
        >
          <Trash2 size={18} color="#e11d48" />
        </Pressable>
      </View>

      <FlatList
        data={alternatives}
        keyExtractor={(item) => item.code}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => {
          const filled = getProgress(item.code);
          const isFull = filled >= criteria.length && criteria.length > 0;
          return (
            <Pressable
              onPress={() => openInputModal(item)}
              className={`p-4 mb-3 rounded-3xl border flex-row items-center justify-between active:scale-[0.98] ${
                isFull
                  ? "bg-white border-emerald-100 shadow-sm"
                  : "bg-white border-gray-100 shadow-sm"
              }`}
            >
              <View className="flex-row items-center flex-1">
                <View
                  className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${
                    isFull ? "bg-emerald-50" : "bg-gray-50"
                  }`}
                >
                  <Text
                    className={`font-black text-xs ${
                      isFull ? "text-emerald-600" : "text-gray-400"
                    }`}
                  >
                    {item.code}
                  </Text>
                </View>
                <View>
                  <Text className="font-bold text-dark text-base">
                    {item.name}
                  </Text>
                  <Text
                    className={`text-xs mt-0.5 font-medium ${
                      isFull ? "text-emerald-600" : "text-gray-400"
                    }`}
                  >
                    {isFull
                      ? "Data Complete"
                      : `Progress: ${filled} / ${criteria.length}`}
                  </Text>
                </View>
              </View>
              <View className="bg-gray-50 p-2 rounded-full">
                {isFull ? (
                  <CheckCircle2 size={20} color="#059669" />
                ) : (
                  <ChevronRight size={20} color="#9ca3af" />
                )}
              </View>
            </Pressable>
          );
        }}
        ListFooterComponent={
          <View className="mt-6 mb-24">
            <Pressable
              onPress={handleRunAnalysis}
              disabled={isSubmitting}
              className={`h-16 rounded-2xl flex-row items-center justify-center shadow-xl shadow-orange-200 ${
                isSubmitting ? "bg-gray-800" : "bg-[#1c1917]"
              }`}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text className="text-white font-bold text-lg mr-2">
                    Run Analysis
                  </Text>
                  <Play size={20} color="white" fill="white" />
                </>
              )}
            </Pressable>
          </View>
        }
      />

      <Modal
        visible={!!selectedAlt}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-[#FDFBF7]">
          <View className="px-6 py-5 bg-white border-b border-gray-100 flex-row justify-between items-center">
            <View>
              <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                Input Data
              </Text>
              <Text className="text-xl font-black text-dark mt-0.5">
                {selectedAlt?.name}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setSelectedAlt(null)}
              className="p-2 bg-gray-50 rounded-full"
            >
              <X size={20} color="black" />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="flex-1 p-6"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {criteria.map((crit) => {
              const isNumericInput = crit.code === "C1" || crit.code === "C2";
              return (
                <View
                  key={crit.code}
                  className="mb-6 p-5 bg-white rounded-3xl border border-gray-100 shadow-sm"
                >
                  <View className="flex-row justify-between mb-4">
                    <View className="flex-row items-center">
                      <View className="bg-gray-50 px-2 py-1 rounded-md mr-2">
                        <Text className="font-bold text-xs text-gray-500">
                          {crit.code}
                        </Text>
                      </View>
                      <Text className="font-bold text-dark text-base">
                        {crit.name}
                      </Text>
                    </View>
                    <View
                      className={`px-2 py-1 rounded-lg ${
                        crit.type.toLowerCase() === "benefit"
                          ? "bg-emerald-50"
                          : "bg-rose-50"
                      }`}
                    >
                      <Text
                        className={`text-[10px] font-bold uppercase ${
                          crit.type.toLowerCase() === "benefit"
                            ? "text-emerald-700"
                            : "text-rose-700"
                        }`}
                      >
                        {crit.type}
                      </Text>
                    </View>
                  </View>

                  {isNumericInput ? (
                    <View>
                      <Text className="text-xs text-gray-400 mb-2 font-medium">
                        Nominal (Rupiah)
                      </Text>
                      <View className="bg-gray-50 border border-gray-200 rounded-xl px-4 h-14 justify-center">
                        <TextInput
                          keyboardType="numeric"
                          value={
                            inputValues[crit.code]
                              ? formatCurrency(inputValues[crit.code])
                              : ""
                          }
                          onChangeText={(text) =>
                            handleInputChange(crit.code, text)
                          }
                          placeholder="Rp 0"
                          placeholderTextColor="#9ca3af"
                          className="text-lg font-bold text-dark"
                        />
                      </View>
                    </View>
                  ) : (
                    <View>
                      <Text className="text-xs text-gray-400 mb-3 font-medium">
                        Rating Scale
                      </Text>
                      <View className="gap-2">
                        {[1, 2, 3, 4, 5].map((val) => {
                          const isSelected = inputValues[crit.code] === val;
                          const desc =
                            SCALE_DESC[crit.code]?.[val - 1] || `Scale ${val}`;

                          return (
                            <Pressable
                              key={val}
                              onPress={() => handleInputChange(crit.code, val)}
                              className={`flex-row items-center p-3 rounded-xl border transition-all ${
                                isSelected
                                  ? "bg-orange-50 border-orange-200"
                                  : "bg-white border-gray-100"
                              }`}
                            >
                              <View
                                className={`w-5 h-5 rounded-full border items-center justify-center mr-3 ${
                                  isSelected
                                    ? "border-primary bg-primary"
                                    : "border-gray-300"
                                }`}
                              >
                                {isSelected && (
                                  <View className="w-2 h-2 rounded-full bg-white" />
                                )}
                              </View>
                              <View className="flex-1">
                                <Text
                                  className={`font-bold text-sm ${
                                    isSelected
                                      ? "text-primary"
                                      : "text-gray-600"
                                  }`}
                                >
                                  Value {val}
                                </Text>
                                <Text className="text-xs text-gray-400 mt-0.5">
                                  {desc}
                                </Text>
                              </View>
                            </Pressable>
                          );
                        })}
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
            <View className="h-24" />
          </ScrollView>

          <View className="p-6 bg-white border-t border-gray-100">
            <Pressable
              onPress={saveModalInput}
              className="bg-[#1c1917] h-14 rounded-2xl items-center justify-center shadow-lg shadow-orange-200 active:scale-[0.98]"
            >
              <Text className="text-white font-bold text-lg">
                Save Assessment
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={alertConfig.visible} animationType="fade">
        <View className="flex-1 bg-black/40 justify-center items-center px-6">
          <View className="bg-white w-full rounded-3xl p-6 items-center shadow-2xl">
            <View
              className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${
                alertConfig.type === "success"
                  ? "bg-emerald-100"
                  : alertConfig.type === "error"
                  ? "bg-rose-100"
                  : "bg-amber-100"
              }`}
            >
              {alertConfig.type === "success" ? (
                <CheckCircle2 size={32} color="#059669" />
              ) : alertConfig.type === "error" ? (
                <XCircle size={32} color="#e11d48" />
              ) : (
                <AlertTriangle size={32} color="#d97706" />
              )}
            </View>
            <Text className="text-xl font-black text-dark mb-2 text-center">
              {alertConfig.title}
            </Text>
            <Text className="text-gray-500 text-center mb-6 leading-relaxed">
              {alertConfig.message}
            </Text>
            <Pressable
              onPress={closeAlert}
              className="bg-[#1c1917] w-full h-12 rounded-xl items-center justify-center active:scale-[0.98]"
            >
              <Text className="text-white font-bold">Understood</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
