import {
    Info,
    Layers,
    Tag,
    TrendingDown,
    TrendingUp,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiService } from "../../src/services/api";
import { Alternative, Criterion } from "../../src/types/api";

export default function DataScreen() {
  const [activeTab, setActiveTab] = useState<"criteria" | "alternatives">(
    "criteria"
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);

  // Fungsi ambil data
  const fetchData = async () => {
    try {
      const [resCriteria, resAlternatives] = await Promise.all([
        apiService.getCriteria(),
        apiService.getAlternatives(),
      ]);

      // LOGIC SORTING NATURAL (Agar A10 tidak muncul sebelum A2)
      if (resCriteria) {
        setCriteria(
          resCriteria.sort((a, b) =>
            a.code.localeCompare(b.code, undefined, {
              numeric: true,
              sensitivity: "base",
            })
          )
        );
      }

      if (resAlternatives) {
        setAlternatives(
          resAlternatives.sort((a, b) =>
            a.code.localeCompare(b.code, undefined, {
              numeric: true,
              sensitivity: "base",
            })
          )
        );
      }
    } catch (error) {
      console.error("Gagal ambil data", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FDFBF7]">
      {/* Header */}
      <View className="px-6 pt-4 pb-6">
        <Text className="text-3xl font-black text-dark mb-1">Data Master</Text>
        <Text className="text-gray-500 text-sm">
          Kelola parameter keputusan SPK.
        </Text>
      </View>

      {/* Custom Tab Switcher */}
      <View className="px-6 mb-6">
        <View className="flex-row bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
          <TabButton
            isActive={activeTab === "criteria"}
            onPress={() => setActiveTab("criteria")}
            label="Kriteria"
            icon={Tag}
          />
          <TabButton
            isActive={activeTab === "alternatives"}
            onPress={() => setActiveTab("alternatives")}
            label="Alternatif"
            icon={Layers}
          />
        </View>
      </View>

      {/* Content List */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ea580c" />
          <Text className="text-gray-400 mt-4 text-xs font-medium">
            Mengambil data dari server...
          </Text>
        </View>
      ) : (
        <View className="flex-1 px-6">
          {activeTab === "criteria" ? (
            <FlatList
              data={criteria}
              keyExtractor={(item) => item.code}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100 }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              renderItem={({ item }) => <CriterionCard item={item} />}
              ListEmptyComponent={
                <EmptyState message="Tidak ada data kriteria." />
              }
            />
          ) : (
            <FlatList
              data={alternatives}
              keyExtractor={(item) => item.code}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 100 }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
              }
              renderItem={({ item }) => <AlternativeCard item={item} />}
              ListEmptyComponent={
                <EmptyState message="Tidak ada data alternatif." />
              }
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

// --- COMPONENTS ---

// 1. Tombol Tab Switcher
// Ganti komponen TabButton di bagian bawah file data.tsx

const TabButton = ({ isActive, onPress, label, icon: Icon }: any) => (
  <View className="flex-1">
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: isActive ? "#1c1917" : "transparent", // #1c1917 adalah warna 'dark'
        // Kita gunakan style manual dlu untuk memastikan bukan classname yg bikin crash
      }}
    >
      <Icon size={16} color={isActive ? "#fff" : "#9ca3af"} strokeWidth={2.5} />
      <Text
        className={`ml-2 font-bold text-sm ${
          isActive ? "text-white" : "text-gray-400"
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  </View>
);

// 2. Card Kriteria
const CriterionCard = ({ item }: { item: Criterion }) => {
  const isBenefit = item.type.toLowerCase() === "benefit";

  return (
    <View className="bg-white p-4 mb-4 rounded-2xl border border-gray-100 shadow-sm flex-row items-start">
      <View
        className={`w-12 h-12 rounded-xl items-center justify-center mr-4 ${
          isBenefit ? "bg-lime-100" : "bg-rose-100"
        }`}
      >
        <Text
          className={`font-black text-lg ${
            isBenefit ? "text-lime-700" : "text-rose-700"
          }`}
        >
          {item.code}
        </Text>
      </View>

      <View className="flex-1">
        <View className="flex-row justify-between items-center mb-1">
          <Text
            className="font-bold text-dark text-base flex-1 mr-2"
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <View
            className={`px-2 py-0.5 rounded-md ${
              isBenefit ? "bg-lime-50" : "bg-rose-50"
            }`}
          >
            <Text
              className={`text-[10px] font-bold uppercase ${
                isBenefit ? "text-lime-700" : "text-rose-700"
              }`}
            >
              {item.type}
            </Text>
          </View>
        </View>

        <Text
          className="text-gray-500 text-xs leading-relaxed"
          numberOfLines={2}
        >
          {item.description ||
            "Tidak ada deskripsi tersedia untuk kriteria ini."}
        </Text>

        <View className="mt-2 flex-row items-center">
          {isBenefit ? (
            <TrendingUp size={12} color="#65a30d" />
          ) : (
            <TrendingDown size={12} color="#be123c" />
          )}
          <Text className="text-xs text-gray-400 ml-1">
            {isBenefit
              ? "Semakin tinggi semakin baik"
              : "Semakin rendah semakin baik"}
          </Text>
        </View>
      </View>
    </View>
  );
};

// 3. Card Alternatif
const AlternativeCard = ({ item }: { item: Alternative }) => (
  <View className="bg-white p-4 mb-3 rounded-2xl border border-gray-100 shadow-sm flex-row items-center">
    <View className="w-10 h-10 bg-orange-50 rounded-full items-center justify-center mr-4 border border-orange-100">
      <Text className="font-bold text-primary text-xs">{item.code}</Text>
    </View>
    <View className="flex-1">
      <Text className="font-bold text-dark text-base">{item.name}</Text>
      {/* Jika ada deskripsi, tampilkan. Jika tidak, hide */}
      {item.description && (
        <Text className="text-gray-400 text-xs mt-0.5" numberOfLines={1}>
          {item.description}
        </Text>
      )}
    </View>
  </View>
);

// 4. Empty State
const EmptyState = ({ message }: { message: string }) => (
  <View className="items-center justify-center py-20 opacity-50">
    <Info size={40} color="#9ca3af" />
    <Text className="text-gray-400 font-medium mt-4">{message}</Text>
  </View>
);
