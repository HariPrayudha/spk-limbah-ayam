import React, { createContext, useContext } from "react";
import {
    SharedValue,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

interface TabBarContextType {
  tabBarTranslateY: SharedValue<number>;
  toggleTabBar: (visible: boolean) => void;
}

const TabBarContext = createContext<TabBarContextType | undefined>(undefined);

export const TabBarProvider = ({ children }: { children: React.ReactNode }) => {
  const tabBarTranslateY = useSharedValue(0);

  const toggleTabBar = (visible: boolean) => {
    // 0 = Muncul, 100 = Turun ke bawah (Sembunyi)
    tabBarTranslateY.value = withTiming(visible ? 0 : 100, { duration: 300 });
  };

  return (
    <TabBarContext.Provider value={{ tabBarTranslateY, toggleTabBar }}>
      {children}
    </TabBarContext.Provider>
  );
};

export const useTabBar = () => {
  const context = useContext(TabBarContext);
  if (!context) throw new Error("useTabBar must be used within TabBarProvider");
  return context;
};
