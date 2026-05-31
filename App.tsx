import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useAuth } from "@hooks/use-auth";
import { SafeAreaView } from "react-native-safe-area-context";
import { AuthScreen } from "@screens/auth";
import { DashboardScreen } from "@screens/dashboard";

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
    backgroundColor: "#f4f7f8",
  },
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f7f8",
  },
});
