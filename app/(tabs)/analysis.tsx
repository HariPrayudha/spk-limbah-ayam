import { useRouter } from "expo-router";
import {
    CheckCircle2,
    Edit3,
    Play,
    Trash2,
    Wand2,
    X,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiService } from "../../src/services/api";
import { Alternative, Criterion } from "../../src/types/api";

// --- DATA REAL DARI TABEL GAMBAR ---
const REAL_DATA_MATRIX: Record<string, number[]> = {
  // Urutan Value: [C1, C2, C3, C4, C5, C6, C7]
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

// --- DATA SKALA DESKRIPSI (C3-C7) ---
const SCALE_DESC: Record<string, string[]> = {
  C3: [
    "Sangat Kecil",
    "Niche/Terbatas",
    "Cukup Ada",
    "Luas & Stabil",
    "Sangat Luas",
  ],
  C4: [
    "Sangat Buruk (Polusi)",
    "Buruk",
    "Sedang",
    "Ramah Lingkungan",
    "Sangat Ramah",
  ],
  C5: [
    "Sangat Sulit/Kompleks",
    "Cukup Sulit",
    "Sedang",
    "Mudah",
    "Sangat Mudah",
  ],
  C6: [
    "Sangat Terbatas",
    "Terbatas",
    "Cukup Tersedia",
    "Melimpah",
    "Sangat Melimpah",
  ],
  C7: ["Sangat Boros", "Boros", "Netral", "Cukup Efisien", "Sangat Efisien"],
};

type MatrixState = Record<string, Record<string, number>>;

export default function AnalysisScreen() {
  const router = useRouter();

  const [alternatives, setAlternatives] = useState<Alternative[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [matrix, setMatrix] = useState<MatrixState>({});

  // Modal State
  const [selectedAlt, setSelectedAlt] = useState<Alternative | null>(null);
  const [inputValues, setInputValues] = useState<Record<string, number>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadMasterData = async () => {
      const [resAlt, resCrit] = await Promise.all([
        apiService.getAlternatives(),
        apiService.getCriteria(),
      ]);

      // FIX SORTING NATURAL (Agar A10 muncul setelah A9, bukan setelah A1)
      if (resAlt)
        setAlternatives(
          resAlt.sort((a, b) =>
            a.code.localeCompare(b.code, undefined, { numeric: true })
          )
        );
      if (resCrit)
        setCriteria(
          resCrit.sort((a, b) =>
            a.code.localeCompare(b.code, undefined, { numeric: true })
          )
        );
    };
    loadMasterData();
  }, []);

  // --- LOGIC INPUT ---
  const openInputModal = (alt: Alternative) => {
    setSelectedAlt(alt);
    // Ambil nilai yg sudah ada atau default 0
    const currentVals: Record<string, number> = {};
    criteria.forEach((c) => {
      currentVals[c.code] = matrix[alt.code]?.[c.code] || 0;
    });
    setInputValues(currentVals);
  };

  const handleInputChange = (critCode: string, val: string | number) => {
    // Jika input text (string), parse ke number. Jika select (number), langsung set.
    const numVal = typeof val === "string" ? parseFloat(val) || 0 : val;
    setInputValues((prev) => ({ ...prev, [critCode]: numVal }));
  };

  const saveModalInput = () => {
    if (!selectedAlt) return;
    setMatrix((prev) => ({
      ...prev,
      [selectedAlt.code]: inputValues,
    }));
    setSelectedAlt(null);
  };

  // --- MAGIC BUTTON: ISI SESUAI DATA REAL ---
  const fillRealData = () => {
    const newMatrix: MatrixState = {};

    alternatives.forEach((alt) => {
      const dataValues = REAL_DATA_MATRIX[alt.code];
      if (dataValues) {
        newMatrix[alt.code] = {};
        // Mapping array value ke kriteria C1..C7
        // Asumsi urutan kriteria di state sudah ter-sort C1..C7
        criteria.forEach((crit, index) => {
          // Fallback jika index out of bound
          newMatrix[alt.code][crit.code] = dataValues[index] || 0;
        });
      }
    });

    setMatrix(newMatrix);
    Alert.alert("Sukses", "Data Tabel Asli berhasil di-load!");
  };

  const handleReset = () => {
    setMatrix({});
    Alert.alert("Reset", "Data input dikosongkan.");
  };

  // --- PROSES ANALISIS (PERBAIKAN UTAMA ERROR 422) ---
  // --- GANTI FUNGSI handleRunAnalysis DENGAN INI ---
  const handleRunAnalysis = async () => {
    // 1. Validasi Kelengkapan
    const isComplete = alternatives.every((a) =>
      criteria.every((c) => matrix[a.code]?.[c.code] !== undefined)
    );

    if (!isComplete && Object.keys(matrix).length === 0) {
      Alert.alert(
        "Data Kosong",
        "Mohon isi penilaian atau gunakan tombol Isi Data Asli Otomatis."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // 2. Prepare Payload (KEMBALI KE KODE, TAPI PAKSA NUMBER)
      const bulkPayload: any[] = [];
      Object.entries(matrix).forEach(([altCode, scores]) => {
        Object.entries(scores).forEach(([critCode, val]) => {
          bulkPayload.push({
            alternative_code: altCode,
            criteria_code: critCode, // <--- UBAH JADI 'criteria_code'
            value: Number(val),
          });
        });
      });

      console.log("Payload Sample (Final):", JSON.stringify(bulkPayload[0]));

      // 3. API Calls
      await apiService.resetMatrix();
      console.log("Reset Matrix Success");

      await apiService.submitMatrixBulk(bulkPayload);
      console.log("Bulk Submit Success");

      const result = await apiService.runAnalysis();
      console.log("Analysis Success");

      router.push({
        pathname: "/result",
        params: { data: JSON.stringify(result) },
      });
    } catch (error: any) {
      // Error akan dicetak detail oleh Interceptor di api.ts
      const msg = error.response?.data?.detail
        ? JSON.stringify(error.response.data.detail)
        : "Gagal menjalankan analisis.";

      Alert.alert("Gagal (Cek Console)", msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProgress = (altCode: string) => {
    if (!matrix[altCode]) return 0;
    return Object.keys(matrix[altCode]).length;
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FDFBF7]">
      {/* Header */}
      <View className="px-6 pt-4 pb-4 bg-white border-b border-gray-100">
        <Text className="text-2xl font-black text-dark mb-4">
          Input Penilaian
        </Text>
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={fillRealData}
            className="flex-1 bg-orange-100 p-3 rounded-xl flex-row justify-center items-center"
          >
            <Wand2 size={18} color="#ea580c" />
            <Text className="text-primary font-bold ml-2 text-xs">
              Isi Data Asli Otomatis
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleReset}
            className="bg-rose-100 p-3 rounded-xl w-12 items-center"
          >
            <Trash2 size={18} color="#e11d48" />
          </TouchableOpacity>
        </View>
      </View>

      {/* List Alternatives */}
      <FlatList
        data={alternatives}
        keyExtractor={(item) => item.code}
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        renderItem={({ item }) => {
          const filled = getProgress(item.code);
          const isFull = filled >= criteria.length;
          return (
            <TouchableOpacity
              onPress={() => openInputModal(item)}
              className={`p-4 mb-3 rounded-2xl border flex-row items-center justify-between ${
                isFull
                  ? "bg-emerald-50 border-emerald-100"
                  : "bg-white border-gray-100"
              }`}
            >
              <View className="flex-row items-center flex-1">
                <View
                  className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                    isFull ? "bg-emerald-200" : "bg-gray-100"
                  }`}
                >
                  <Text
                    className={`font-bold ${
                      isFull ? "text-emerald-800" : "text-gray-500"
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
                    className={`text-xs ${
                      isFull ? "text-emerald-600" : "text-gray-400"
                    }`}
                  >
                    {isFull
                      ? "Data Lengkap"
                      : `Belum lengkap (${filled}/${criteria.length})`}
                  </Text>
                </View>
              </View>
              {isFull ? (
                <CheckCircle2 size={20} color="#059669" />
              ) : (
                <Edit3 size={20} color="#9ca3af" />
              )}
            </TouchableOpacity>
          );
        }}
      />

      {/* Floating Action Button */}
      <View className="absolute bottom-24 left-6 right-6">
        <TouchableOpacity
          onPress={handleRunAnalysis}
          disabled={isSubmitting}
          className={`h-16 rounded-2xl flex-row items-center justify-center shadow-lg shadow-orange-200 ${
            isSubmitting ? "bg-gray-400" : "bg-dark"
          }`}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text className="text-white font-bold text-lg mr-2">
                Jalankan Analisis
              </Text>
              <Play size={20} color="white" fill="white" />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* MODAL INPUT HYBRID (Text & Select) */}
      <Modal
        visible={!!selectedAlt}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View className="flex-1 bg-[#FDFBF7]">
          <View className="px-6 py-4 bg-white border-b border-gray-100 flex-row justify-between items-center">
            <View>
              <Text className="text-gray-400 text-xs font-bold uppercase">
                Input Data
              </Text>
              <Text className="text-xl font-black text-dark">
                {selectedAlt?.name}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setSelectedAlt(null)}
              className="p-2 bg-gray-100 rounded-full"
            >
              <X size={20} color="black" />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="flex-1 p-6"
            keyboardShouldPersistTaps="handled"
          >
            {criteria.map((crit) => {
              // LOGIC: C1 & C2 pakai Text Input (Angka besar), C3-C7 pakai Pilihan 1-5
              const isNumericInput = crit.code === "C1" || crit.code === "C2";

              return (
                <View
                  key={crit.code}
                  className="mb-6 border-b border-gray-100 pb-6 last:border-0"
                >
                  <View className="flex-row justify-between mb-3">
                    <Text className="font-bold text-dark text-lg">
                      {crit.code} - {crit.name}
                    </Text>
                    <View
                      className={`px-2 py-0.5 rounded ${
                        crit.type.toLowerCase() === "benefit"
                          ? "bg-lime-100"
                          : "bg-rose-100"
                      }`}
                    >
                      <Text
                        className={`text-[10px] font-bold uppercase ${
                          crit.type.toLowerCase() === "benefit"
                            ? "text-lime-700"
                            : "text-rose-700"
                        }`}
                      >
                        {crit.type}
                      </Text>
                    </View>
                  </View>

                  {isNumericInput ? (
                    <View>
                      <Text className="text-xs text-gray-400 mb-1">
                        Masukkan nominal (Rupiah):
                      </Text>
                      <TextInput
                        keyboardType="numeric"
                        value={
                          inputValues[crit.code]
                            ? inputValues[crit.code].toString()
                            : ""
                        }
                        onChangeText={(text) =>
                          handleInputChange(crit.code, text)
                        }
                        placeholder="0"
                        className="bg-white border border-gray-200 p-4 rounded-xl text-xl font-bold text-dark focus:border-primary"
                      />
                    </View>
                  ) : (
                    <View>
                      <Text className="text-xs text-gray-400 mb-2">
                        Pilih Skala Penilaian:
                      </Text>
                      <View className="flex-col gap-2">
                        {[1, 2, 3, 4, 5].map((val) => {
                          const isSelected = inputValues[crit.code] === val;
                          const desc =
                            SCALE_DESC[crit.code]?.[val - 1] || `Skala ${val}`;

                          return (
                            <TouchableOpacity
                              key={val}
                              onPress={() => handleInputChange(crit.code, val)}
                              className={`flex-row items-center p-3 rounded-xl border ${
                                isSelected
                                  ? "bg-orange-50 border-primary"
                                  : "bg-white border-gray-100"
                              }`}
                            >
                              <View
                                className={`w-6 h-6 rounded-full border items-center justify-center mr-3 ${
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
                                  className={`font-bold ${
                                    isSelected
                                      ? "text-primary"
                                      : "text-gray-600"
                                  }`}
                                >
                                  Nilai {val}
                                </Text>
                                <Text className="text-xs text-gray-400">
                                  {desc}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
            <View className="h-20" />
          </ScrollView>

          <View className="p-6 bg-white border-t border-gray-100">
            <TouchableOpacity
              onPress={saveModalInput}
              className="bg-primary h-14 rounded-xl items-center justify-center shadow-lg shadow-orange-200"
            >
              <Text className="text-white font-bold text-lg">
                Simpan Penilaian
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
