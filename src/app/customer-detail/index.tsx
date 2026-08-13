import { CustomerDetailScreen } from "@features/customers/screens/customer-detail";
import { useLocalSearchParams } from "expo-router";

export default function CustomerDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <CustomerDetailScreen id={id ?? ""} />;
}
