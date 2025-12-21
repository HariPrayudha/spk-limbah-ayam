import { Tabs } from "expo-router";
import { BarChart3, Database, Home } from "lucide-react-native";
import { View } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Hilangkan Header bawaan
        tabBarShowLabel: false, // Hilangkan teks label (hanya icon)
        tabBarStyle: {
          position: "absolute",
          bottom: 25,
          left: 20,
          right: 20,
          elevation: 5, // Shadow Android
          backgroundColor: "#ffffff",
          borderRadius: 20,
          height: 70,
          shadowColor: "#000", // Shadow iOS
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          borderTopWidth: 0,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={Home} label="Home" />
          ),
        }}
      />
      <Tabs.Screen
        name="data"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={Database} label="Data" />
          ),
        }}
      />
      <Tabs.Screen
        name="analysis"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={BarChart3} label="Analisis" />
          ),
        }}
      />
    </Tabs>
  );
}

// Komponen Kecil untuk Icon Tab yang Aktif/Tidak
const TabIcon = ({ focused, icon: Icon, label }: any) => {
  return (
    <View
      className={`items-center justify-center top-4 ${
        focused ? "bg-orange-50 w-12 h-12 rounded-full" : ""
      }`}
    >
      <Icon
        size={24}
        color={focused ? "#ea580c" : "#9ca3af"}
        strokeWidth={focused ? 3 : 2}
      />
    </View>
  );
};
