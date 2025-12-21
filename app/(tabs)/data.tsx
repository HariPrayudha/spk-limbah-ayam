import {
  Info,
  Layers,
  Tag,
  TrendingDown,
  TrendingUp,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTabBar } from "../../src/context/TabBarContext";
import { apiService } from "../../src/services/api";
import { Alternative, Criterion } from "../../src/types/api";

export default function DataScreen() {
  const { toggleTabBar } = useTabBar();
  const lastContentOffset = useRef(0);

  const [activeTab, setActiveTab] = useState<"criteria" | "alternatives">(
    "criteria"
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [alternatives, setAlternatives] = useState<Alternative[]>([]);

  const fetchData = async () => {
    try {
      const [resCriteria, resAlternatives] = await Promise.all([
        apiService.getCriteria(),
        apiService.getAlternatives(),
      ]);

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
      console.error(error);
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

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const currentOffset = event.nativeEvent.contentOffset.y;

    if (currentOffset > lastContentOffset.current && currentOffset > 20) {
      toggleTabBar(false);
    } else if (currentOffset < lastContentOffset.current) {
      toggleTabBar(true);
    }

    lastContentOffset.current = currentOffset;
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FDFBF7]">
      <View className="px-6 pt-6 pb-6">
        <Text className="text-3xl font-black text-dark mb-1">Data Master</Text>
        <Text className="text-gray-500 text-sm">
          Kelola parameter keputusan SPK.
        </Text>
      </View>

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

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ea580c" />
          <Text className="text-gray-400 mt-4 text-xs font-medium">
            Mengambil data...
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
              onScroll={handleScroll}
              scrollEventThrottle={16}
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
              onScroll={handleScroll}
              scrollEventThrottle={16}
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

const TabButton = ({ isActive, onPress, label, icon: Icon }: any) => (
  <View className="flex-1 overflow-hidden rounded-xl">
    <Pressable
      onPress={onPress}
      android_ripple={{ color: "rgba(160, 160, 160, 0.1)" }}
      className={`flex-row items-center justify-center py-3 ${
        isActive ? "bg-[#1c1917]" : "bg-transparent"
      }`}
    >
      <Icon size={16} color={isActive ? "#fff" : "#9ca3af"} strokeWidth={2.5} />
      <Text
        className={`ml-2 font-bold text-sm ${
          isActive ? "text-white" : "text-gray-400"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  </View>
);

const CriterionCard = ({ item }: { item: Criterion }) => {
  const isBenefit = item.type.toLowerCase() === "benefit";

  return (
    <View className="bg-white p-5 mb-4 rounded-3xl border border-gray-100 shadow-sm flex-row items-start">
      <View
        className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${
          isBenefit ? "bg-emerald-50" : "bg-rose-50"
        }`}
      >
        <Text
          className={`font-black text-lg ${
            isBenefit ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {item.code}
        </Text>
      </View>

      <View className="flex-1">
        <View className="flex-row justify-between items-center mb-2">
          <Text
            className="font-bold text-dark text-base flex-1 mr-2"
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <View
            className={`px-2.5 py-1 rounded-lg ${
              isBenefit ? "bg-emerald-100" : "bg-rose-100"
            }`}
          >
            <Text
              className={`text-[10px] font-bold uppercase ${
                isBenefit ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {item.type}
            </Text>
          </View>
        </View>

        <Text
          className="text-gray-500 text-xs leading-relaxed mb-3"
          numberOfLines={2}
        >
          {item.description || "Tidak ada deskripsi tersedia."}
        </Text>

        <View className="flex-row items-center bg-gray-50 self-start px-2 py-1 rounded-lg">
          {isBenefit ? (
            <TrendingUp size={12} color="#059669" />
          ) : (
            <TrendingDown size={12} color="#e11d48" />
          )}
          <Text className="text-[10px] text-gray-400 ml-1.5 font-medium">
            {isBenefit ? "Nilai tinggi lebih baik" : "Nilai rendah lebih baik"}
          </Text>
        </View>
      </View>
    </View>
  );
};

const AlternativeCard = ({ item }: { item: Alternative }) => (
  <View className="bg-white p-4 mb-3 rounded-2xl border border-gray-100 shadow-sm flex-row items-center">
    <View className="w-10 h-10 bg-orange-50 rounded-full items-center justify-center mr-4 border border-orange-100">
      <Text className="font-bold text-orange-600 text-xs">{item.code}</Text>
    </View>
    <View className="flex-1">
      <Text className="font-bold text-dark text-base">{item.name}</Text>
      {item.description && (
        <Text className="text-gray-400 text-xs mt-0.5" numberOfLines={1}>
          {item.description}
        </Text>
      )}
    </View>
  </View>
);

const EmptyState = ({ message }: { message: string }) => (
  <View className="items-center justify-center py-20 opacity-50">
    <Info size={40} color="#9ca3af" />
    <Text className="text-gray-400 font-medium mt-4">{message}</Text>
  </View>
);
