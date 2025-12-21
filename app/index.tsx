import { useRouter } from "expo-router";
import { ArrowRight, Sprout } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-[#FDFBF7] relative">
      <View className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      <View className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

      <View className="flex-1 px-6 justify-center items-center">
        <Animated.View
          entering={FadeInUp.delay(200).springify()}
          className="w-40 h-40 bg-white rounded-full items-center justify-center shadow-2xl shadow-orange-200 mb-10"
        >
          <Sprout size={80} color="#ea580c" />
        </Animated.View>

        <Animated.View
          entering={FadeInDown.delay(400).springify()}
          className="items-center"
        >
          <Text className="text-3xl font-extrabold text-dark text-center mb-2">
            Eco<Text className="text-primary">Poultry</Text> DSS
          </Text>
          <Text className="text-gray-500 text-center text-base leading-relaxed max-w-xs">
            Sistem Pendukung Keputusan Pengolahan Limbah Ayam Berkelanjutan
            dengan metode{" "}
            <Text className="font-bold text-secondary">CRITIC-MARCOS</Text>.
          </Text>
        </Animated.View>
      </View>

      <Animated.View
        entering={FadeInDown.delay(600).springify()}
        className="px-6 pb-12"
      >
        <Pressable
          onPress={() => router.replace("/(tabs)/home")}
          android_ripple={{
            color: "rgba(255, 255, 255, 0.2)",
            borderless: false,
          }}
          className="bg-dark h-16 rounded-2xl flex-row items-center justify-center shadow-lg shadow-gray-400 active:opacity-90"
        >
          <Text className="text-white font-bold text-lg mr-2">
            Mulai Analisis
          </Text>
          <ArrowRight size={20} color="white" />
        </Pressable>
      </Animated.View>
    </SafeAreaView>
  );
}
