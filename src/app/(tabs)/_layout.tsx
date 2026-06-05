import {
  TikTokLiveSocketProvider,
  useTikTokLiveSocketContext,
} from "@contexts/tiktok-live-socket";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@modules/auth/hooks/use-auth";
import { Redirect, Tabs } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { SessionHeader } from "../../components/tabs/session-header";

function TabContent() {
  const liveSocket = useTikTokLiveSocketContext();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f4f7f8" }}>
      <SessionHeader
        isConnected={liveSocket.isConnected}
        status={liveSocket.status}
        tiktokUsername={liveSocket.tiktokUsername}
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
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/(auth)" />;
  }

  return (
    <TikTokLiveSocketProvider>
      <TabContent />
    </TikTokLiveSocketProvider>
  );
}
