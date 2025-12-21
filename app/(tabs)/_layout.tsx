import { BottomTabBar } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import { BarChart3, Database, Home } from "lucide-react-native";
import { Platform, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { TabBarProvider, useTabBar } from "../../src/context/TabBarContext";

function AnimatedTabBar(props: any) {
  const { tabBarTranslateY } = useTabBar();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: tabBarTranslateY.value }],
    };
  });

  return (
    <Animated.View style={[styles.animContainer, animatedStyle]}>
      <BottomTabBar {...props} />
    </Animated.View>
  );
}

const CustomTabIcon = ({ focused, icon: Icon, label }: any) => {
  return (
    <View style={styles.iconContainer}>
      {/* Wrapper Icon: Mengatur lingkaran dan posisi */}
      <View style={[styles.iconWrapper, focused && styles.iconWrapperFocused]}>
        <Icon size={24} color={focused ? "#ffffff" : "#9ca3af"} />
      </View>

      {/* Label: Hanya muncul saat focused */}
      {focused && <Text style={styles.label}>{label}</Text>}
    </View>
  );
};

export default function TabLayout() {
  return (
    <TabBarProvider>
      <Tabs
        tabBar={(props) => <AnimatedTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            position: "absolute",
            bottom: 25,
            left: 20,
            right: 20,
            height: 70,
            borderRadius: 35,
            backgroundColor: "#ffffff",
            borderTopWidth: 0,
            ...Platform.select({
              ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 5 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
              },
              android: {
                elevation: 5,
              },
            }),
          },
          tabBarItemStyle: {
            height: 70,
            justifyContent: "center",
            padding: 0,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarIcon: ({ focused }) => (
              <CustomTabIcon focused={focused} icon={Home} label="Home" />
            ),
          }}
        />
        <Tabs.Screen
          name="data"
          options={{
            title: "Data",
            tabBarIcon: ({ focused }) => (
              <CustomTabIcon focused={focused} icon={Database} label="Data" />
            ),
          }}
        />
        <Tabs.Screen
          name="analysis"
          options={{
            title: "Analisis",
            tabBarIcon: ({ focused }) => (
              <CustomTabIcon
                focused={focused}
                icon={BarChart3}
                label="Analisis"
              />
            ),
          }}
        />
      </Tabs>
    </TabBarProvider>
  );
}

const styles = StyleSheet.create({
  animContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: 60,
    paddingTop: 30,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  iconWrapperFocused: {
    backgroundColor: "#ea580c",
    marginBottom: 4,
    width: 50,
    height: 50,
    borderRadius: 25,
    transform: [{ translateY: -5 }],
    ...Platform.select({
      ios: {
        shadowColor: "#ea580c",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  label: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#ea580c",
    textAlign: "center",
    marginTop: 2,
  },
});
