import { CustomTabBar } from "@components/bottom-tab";
import { tabOptions } from "@components/bottom-tab/tabs-screen-options";
import {
  TikTokLiveSocketProvider,
  useTikTokLiveSocketContext,
  useTikTokLiveTimerContext,
} from "@contexts/tiktok-live-socket";
import { useThemes } from "@hooks/use-theme";
import { useAuth } from "@modules/auth/hooks/use-auth";
import { createStyles } from "@utils/createStyles";
import { Redirect, Tabs } from "expo-router";

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
            lottie: "home",
          })}
        />
        <Tabs.Screen
          name="customers"
          options={tabOptions({
            title: "Khách hàng",
            lottie: "customer",
          })}
        />
        <Tabs.Screen
          name="shipping"
          options={tabOptions({
            title: "Vận đơn",
            lottie: "truck",
          })}
        />
        <Tabs.Screen
          name="reports"
          options={tabOptions({
            title: "Báo cáo",
            lottie: "chart",
          })}
        />
        <Tabs.Screen
          name="settings"
          options={tabOptions({
            title: "Cài đặt",
            lottie: "settings",
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
    <TikTokLiveSocketProvider hasHistory={user.hasHistory}>
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
