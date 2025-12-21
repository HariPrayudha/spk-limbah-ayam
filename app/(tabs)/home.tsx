import {
    Activity,
    AlertCircle,
    Database,
    Server,
    TrendingUp,
    Zap,
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
    const health = await apiService.checkHealth();
    setServerStatus(!!health);

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
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="px-6 pt-6 mb-6">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-gray-400 font-semibold text-xs uppercase tracking-wider mb-1">
                Dashboard
              </Text>
              <Text className="text-3xl font-black text-dark tracking-tight">
                Halo, Researcher
              </Text>
            </View>
            <View className="bg-white p-1 rounded-full border-2 border-orange-50 shadow-sm">
              <Image
                source={require("../../assets/images/avatar.jpg")}
                className="w-12 h-12 rounded-full"
              />
            </View>
          </View>
        </View>

        <View className="px-6 mb-8">
          <View className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View
                className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${
                  serverStatus ? "bg-emerald-50" : "bg-rose-50"
                }`}
              >
                {serverStatus ? (
                  <Server size={24} color="#10b981" />
                ) : (
                  <AlertCircle size={24} color="#f43f5e" />
                )}
              </View>
              <View>
                <Text className="font-bold text-base text-dark mb-0.5">
                  System Status
                </Text>
                <Text
                  className={`text-xs font-medium ${
                    serverStatus ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {serverStatus
                    ? "Semua layanan berjalan normal"
                    : "Koneksi ke server terputus"}
                </Text>
              </View>
            </View>
            <View
              className={`w-3 h-3 rounded-full ${
                serverStatus ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />
          </View>
        </View>

        <View className="px-6 mb-8">
          <View className="flex-row items-end justify-between mb-4">
            <Text className="text-lg font-bold text-dark">Ringkasan Data</Text>
            <Text className="text-xs text-gray-400 font-medium">
              Update Real-time
            </Text>
          </View>

          <View className="flex-row justify-between gap-4">
            <View className="flex-1 bg-white p-5 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
              <View className="absolute top-0 right-0 p-4 opacity-5">
                <Activity size={80} color="#ea580c" />
              </View>

              <View className="bg-orange-50 w-10 h-10 rounded-xl items-center justify-center mb-4">
                <Activity size={20} color="#ea580c" />
              </View>
              <Text className="text-4xl font-black text-dark mb-1">
                {stats.criteria}
              </Text>
              <Text className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                Kriteria Aktif
              </Text>
            </View>

            <View className="flex-1 bg-white p-5 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden">
              <View className="absolute top-0 right-0 p-4 opacity-5">
                <Database size={80} color="#65a30d" />
              </View>

              <View className="bg-lime-50 w-10 h-10 rounded-xl items-center justify-center mb-4">
                <Database size={20} color="#65a30d" />
              </View>
              <Text className="text-4xl font-black text-dark mb-1">
                {stats.alternatives}
              </Text>
              <Text className="text-gray-500 text-xs font-medium uppercase tracking-wide">
                Alternatif
              </Text>
            </View>
          </View>
        </View>

        <View className="px-6">
          <Text className="text-lg font-bold text-dark mb-4">
            Metode Analisis
          </Text>
          <View className="bg-[#1c1917] p-6 rounded-[32px] shadow-xl shadow-gray-300 relative overflow-hidden">
            <View className="absolute -right-6 -top-6 w-32 h-32 bg-gray-800 rounded-full opacity-40 blur-2xl" />
            <View className="absolute -left-6 -bottom-6 w-32 h-32 bg-orange-900 rounded-full opacity-20 blur-2xl" />

            <View className="flex-row items-start justify-between mb-6">
              <View>
                <View className="flex-row items-center gap-2 mb-1">
                  <TrendingUp color="#fb923c" size={20} />
                  <Text className="text-orange-400 font-bold tracking-widest text-xs uppercase">
                    Hibrid System
                  </Text>
                </View>
                <Text className="text-white font-black text-2xl">
                  CRITIC - MARCOS
                </Text>
              </View>
              <View className="bg-gray-800/50 p-2 rounded-xl">
                <Zap color="#fff" size={20} fill="#fff" />
              </View>
            </View>

            <Text className="text-gray-400 text-sm mb-6 leading-relaxed">
              Menggabungkan ketepatan pembobotan objektif dengan efisiensi
              pemeringkatan kompromi untuk hasil akurat.
            </Text>

            <View className="flex-row gap-3">
              <View className="bg-white/10 px-4 py-2 rounded-xl border border-white/5">
                <Text className="text-white text-xs font-bold">
                  Objektifitas Tinggi
                </Text>
              </View>
              <View className="bg-white/10 px-4 py-2 rounded-xl border border-white/5">
                <Text className="text-white text-xs font-bold">
                  Ranking Stabil
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
