import { Tabs } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import {
  LiveSocketProvider,
  useLiveSocket,
} from "@contexts/live-socket-context";
import { useOrderStore } from "@stores/order/order-store";
import { useAuth } from "@modules/auth/hooks/use-auth";
import { SessionHeader } from "../../components/tabs/session-header";

function TabLayoutInner() {
  const { user } = useAuth();
  const liveSocket = useLiveSocket();
  const loadOrders = useOrderStore((s) => s.loadOrders);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f4f7f8" }}>
      <SessionHeader
        isConnected={liveSocket.isConnected}
        status={liveSocket.status}
        tiktokUsername={user?.tiktokId || liveSocket.tiktokUsername}
        currentLiveSession={liveSocket.currentLiveSession}
        liveDurationSeconds={liveSocket.liveDurationSeconds}
        liveNowText={liveSocket.liveNowText}
      />
      <Tabs
        // screenListeners={{
        //   state: (e) => {
        //     console.log(
        //       "TAB ROUTES",
        //       e.data.state.routes.map((r) => r.name),
        //     );
        //   },
        // }}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Live",
            tabBarIcon: ({ color }) => (
              <Ionicons name="radio" size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="customers"
          options={{
            title: "Khách",
            tabBarIcon: ({ color }) => (
              <Ionicons name="people" size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="shipping"
          options={{
            title: "Vận đơn",
            tabBarIcon: ({ color }) => (
              <Ionicons name="cube" size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="reports"
          options={{
            title: "Báo cáo",
            tabBarIcon: ({ color }) => (
              <Ionicons name="bar-chart" size={22} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Cài đặt",
            tabBarIcon: ({ color }) => (
              <Ionicons name="settings" size={22} color={color} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}

export default function TabLayout() {
  return (
    <LiveSocketProvider>
      <TabLayoutInner />
    </LiveSocketProvider>
  );
}
