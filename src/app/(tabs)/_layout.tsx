import {
  TikTokLiveSocketProvider,
  useTikTokLiveSocketContext,
} from "@contexts/tiktok-live-socket";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@modules/auth/hooks/use-auth";
import { Redirect, Tabs } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { SessionHeader } from "../../components/tabs/session-header";
import { tabOptions } from "@components/bottom-tab/tabs-screen-options";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { CustomTabBar } from "@components/bottom-tab";

function TabContent() {
  const { colors } = useThemes();
  const liveSocket = useTikTokLiveSocketContext();

  return (
    <>
      {/* <SessionHeader
        isConnected={liveSocket.isConnected}
        status={liveSocket.status}
        tiktokUsername={liveSocket.tiktokUsername}
        currentLiveSession={liveSocket.currentLiveSession}
        liveDurationSeconds={liveSocket.liveDurationSeconds}
        liveNowText={liveSocket.liveNowText}
      /> */}
      <Tabs
        // screenListeners={{
        //   state: (e) => {
        //     console.log(
        //       "TAB ROUTES",
        //       e.data.state.routes.map((r) => r.name),
        //     );
        //   },
        // }}
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBarStyle,
        }}
      >
        <Tabs.Screen
          name="index"
          options={tabOptions({
            title: "Home",
            icon: "house",
          })}
        />
        <Tabs.Screen
          name="customers"
          options={tabOptions({
            title: "Khách hàng",
            icon: "group_user",
          })}
        />
        <Tabs.Screen
          name="shipping"
          options={tabOptions({
            title: "Vận đơn",
            icon: "truck",
          })}
        />
        <Tabs.Screen
          name="reports"
          options={tabOptions({
            title: "Báo cáo",
            icon: "chart_pie",
          })}
        />
        <Tabs.Screen
          name="settings"
          options={tabOptions({
            title: "Cài đặt",
            icon: "settings",
          })}
        />
      </Tabs>
    </>
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

const styles = createStyles(({ shadows }) => ({
  tabBarStyle: {
    paddingTop: 10,
    ...shadows.sd4,
  },
}));
