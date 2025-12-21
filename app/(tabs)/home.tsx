import {
    Activity,
    AlertCircle,
    Database,
    Server,
    TrendingUp,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import { Image, RefreshControl, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiService } from "../../src/services/api";

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [serverStatus, setServerStatus] = useState<boolean | null>(null);
  const [stats, setStats] = useState({ criteria: 0, alternatives: 0 });

  const fetchData = async () => {
    // 1. Cek Server
    const health = await apiService.checkHealth();
    setServerStatus(!!health); // true jika health ada isinya

    // 2. Jika server hidup, ambil jumlah data (simulasi count dlu)
    if (health) {
      const criteria = await apiService.getCriteria();
      const alts = await apiService.getAlternatives();
      setStats({
        criteria: criteria?.length || 0,
        alternatives: alts?.length || 0,
      });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#FDFBF7]">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="px-6 pt-6 mb-8">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-gray-500 font-medium text-sm">
                Selamat Datang,
              </Text>
              <Text className="text-2xl font-bold text-dark">
                Researcher 👋
              </Text>
            </View>
            <View className="bg-white p-2 rounded-full border border-gray-100">
              <Image
                source={{
                  uri: "https://ui-avatars.com/api/?name=Admin&background=ea580c&color=fff",
                }}
                className="w-10 h-10 rounded-full"
              />
            </View>
          </View>
        </View>

        {/* Server Status Card */}
        <View className="px-6 mb-6">
          <View
            className={`p-4 rounded-2xl flex-row items-center space-x-4 ${
              serverStatus ? "bg-emerald-100" : "bg-rose-100"
            }`}
          >
            <View
              className={`p-3 rounded-full ${
                serverStatus ? "bg-emerald-200" : "bg-rose-200"
              }`}
            >
              {serverStatus ? (
                <Server size={24} color="#059669" />
              ) : (
                <AlertCircle size={24} color="#e11d48" />
              )}
            </View>
            <View className="flex-1">
              <Text className="font-bold text-base text-dark">
                Backend Server
              </Text>
              <Text className="text-gray-600 text-xs">
                {serverStatus
                  ? "Terhubung & Siap Analisis"
                  : "Terputus. Cek koneksi API."}
              </Text>
            </View>
            {serverStatus && (
              <View className="bg-emerald-500 px-3 py-1 rounded-full">
                <Text className="text-white text-xs font-bold">ONLINE</Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats Grid */}
        <View className="px-6 mb-8">
          <Text className="text-lg font-bold text-dark mb-4">
            Ringkasan Data
          </Text>
          <View className="flex-row justify-between gap-4">
            {/* Card Kriteria */}
            <View className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <View className="bg-orange-100 w-10 h-10 rounded-full items-center justify-center mb-3">
                <Activity size={20} color="#ea580c" />
              </View>
              <Text className="text-3xl font-black text-dark">
                {stats.criteria}
              </Text>
              <Text className="text-gray-500 text-xs">Kriteria Penilaian</Text>
            </View>

            {/* Card Alternatif */}
            <View className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              <View className="bg-lime-100 w-10 h-10 rounded-full items-center justify-center mb-3">
                <Database size={20} color="#65a30d" />
              </View>
              <Text className="text-3xl font-black text-dark">
                {stats.alternatives}
              </Text>
              <Text className="text-gray-500 text-xs">Produk Limbah</Text>
            </View>
          </View>
        </View>

        {/* Quick Action */}
        <View className="px-6">
          <Text className="text-lg font-bold text-dark mb-4">
            Metode Hibrid
          </Text>
          <View className="bg-dark p-6 rounded-3xl shadow-lg relative overflow-hidden">
            {/* Decor */}
            <View className="absolute -right-10 -top-10 w-40 h-40 bg-gray-800 rounded-full opacity-50" />

            <View className="flex-row items-center gap-2 mb-2">
              <TrendingUp color="#ea580c" size={24} />
              <Text className="text-white font-bold text-xl">
                CRITIC - MARCOS
              </Text>
            </View>
            <Text className="text-gray-400 text-sm mb-4 leading-relaxed">
              Kombinasi pembobotan objektif (CRITIC) dan pemeringkatan kompromi
              (MARCOS) untuk hasil yang akurat.
            </Text>

            <View className="flex-row gap-2">
              <View className="bg-gray-800 px-3 py-1 rounded-lg border border-gray-700">
                <Text className="text-orange-400 text-xs font-bold">
                  Objektif
                </Text>
              </View>
              <View className="bg-gray-800 px-3 py-1 rounded-lg border border-gray-700">
                <Text className="text-lime-400 text-xs font-bold">
                  Efisiensi
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
