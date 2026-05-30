import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from "react-native";
import AuthScreen from "@/screens/AuthScreen";
import DashboardScreen from "@/screens/DashboardScreen";
import { useAuth } from "@/hooks/useAuth";

export default function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.app}>
      <StatusBar style="dark" />
      {user ? <DashboardScreen /> : <AuthScreen />}
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: "#f4f7f8"
  },
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f7f8"
  }
});
