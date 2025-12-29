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
  StyleSheet,
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FDFBF7" }}>
      <View
        style={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 24 }}
      >
        <Text
          style={{
            fontSize: 30,
            fontWeight: "900",
            color: "#1c1917",
            marginBottom: 4,
          }}
        >
          Master Data
        </Text>
        <Text style={{ color: "#6b7280", fontSize: 14 }}>
          Manage decision parameters.
        </Text>
      </View>

      <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
        <View style={styles.tabContainer}>
          <TabButton
            isActive={activeTab === "criteria"}
            onPress={() => setActiveTab("criteria")}
            label="Criteria"
            icon={Tag}
          />
          <TabButton
            isActive={activeTab === "alternatives"}
            onPress={() => setActiveTab("alternatives")}
            label="Alternatives"
            icon={Layers}
          />
        </View>
      </View>

      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="#ea580c" />
          <Text style={{ color: "#9ca3af", marginTop: 16, fontWeight: "500" }}>
            Fetching data...
          </Text>
        </View>
      ) : (
        <View style={{ flex: 1, paddingHorizontal: 24 }}>
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
                <EmptyState message="No criteria data available." />
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
                <EmptyState message="No alternative data available." />
              }
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const TabButton = ({ isActive, onPress, label, icon: Icon }: any) => {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.tabButton,
        isActive ? styles.tabButtonActive : styles.tabButtonInactive,
      ]}
    >
      <Icon
        size={16}
        color={isActive ? "#ffffff" : "#9ca3af"}
        strokeWidth={2.5}
      />
      <Text
        style={[
          styles.tabText,
          isActive ? styles.tabTextActive : styles.tabTextInactive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const CriterionCard = ({ item }: { item: Criterion }) => {
  const isBenefit = item.type.toLowerCase() === "benefit";
  return (
    <View style={styles.card}>
      <View
        style={[styles.iconBox, isBenefit ? styles.bgEmerald : styles.bgRose]}
      >
        <Text
          style={[
            styles.codeText,
            isBenefit ? { color: "#059669" } : { color: "#e11d48" },
          ]}
        >
          {item.code}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <Text style={styles.itemName} numberOfLines={1}>
            {item.name}
          </Text>
          <View
            style={[
              styles.badge,
              isBenefit ? styles.bgEmeraldLight : styles.bgRoseLight,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                isBenefit ? { color: "#047857" } : { color: "#be123c" },
              ]}
            >
              {item.type}
            </Text>
          </View>
        </View>
        <Text style={styles.descText} numberOfLines={2}>
          {item.description || "No description available."}
        </Text>
        <View style={styles.trendBadge}>
          {isBenefit ? (
            <TrendingUp size={12} color="#059669" />
          ) : (
            <TrendingDown size={12} color="#e11d48" />
          )}
          <Text
            style={{
              fontSize: 10,
              color: "#9ca3af",
              marginLeft: 6,
              fontWeight: "500",
            }}
          >
            {isBenefit ? "Higher value is better" : "Lower value is better"}
          </Text>
        </View>
      </View>
    </View>
  );
};

const AlternativeCard = ({ item }: { item: Alternative }) => (
  <View style={styles.card}>
    <View
      style={[
        styles.iconBox,
        { backgroundColor: "#fff7ed", borderColor: "#ffedd5" },
      ]}
    >
      <Text style={{ fontWeight: "bold", color: "#ea580c", fontSize: 12 }}>
        {item.code}
      </Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.itemName}>{item.name}</Text>
      {item.description && (
        <Text style={styles.descText} numberOfLines={1}>
          {item.description}
        </Text>
      )}
    </View>
  </View>
);

const EmptyState = ({ message }: { message: string }) => (
  <View
    style={{
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 80,
      opacity: 0.5,
    }}
  >
    <Info size={40} color="#9ca3af" />
    <Text style={{ color: "#9ca3af", fontWeight: "500", marginTop: 16 }}>
      {message}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    padding: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
  },
  tabButtonActive: {
    backgroundColor: "#1c1917",
  },
  tabButtonInactive: {
    backgroundColor: "transparent",
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "bold",
  },
  tabTextActive: {
    color: "#ffffff",
  },
  tabTextInactive: {
    color: "#9ca3af",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: 20,
    marginBottom: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    borderWidth: 1,
    borderColor: "transparent",
  },
  bgEmerald: { backgroundColor: "#ecfdf5", borderColor: "#d1fae5" },
  bgRose: { backgroundColor: "#fff1f2", borderColor: "#ffe4e6" },
  bgEmeraldLight: { backgroundColor: "#d1fae5" },
  bgRoseLight: { backgroundColor: "#ffe4e6" },
  codeText: { fontWeight: "900", fontSize: 16 },
  itemName: {
    fontWeight: "bold",
    color: "#1c1917",
    fontSize: 16,
    flex: 1,
    marginRight: 8,
  },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 10, fontWeight: "bold", textTransform: "uppercase" },
  descText: {
    color: "#6b7280",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
});
