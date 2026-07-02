import { router } from "expo-router";
import { useAddressPageStore } from "@features/orders/stores/address-page-store";
import { AddressFormModal } from "@features/orders/components/create-shipment/address-form-modal";

export default function AddressFormPage() {
  const session = useAddressPageStore((state) => state.form);
  const clearForm = useAddressPageStore((state) => state.clearForm);

  const close = () => {
    session?.onClose?.();
    clearForm();
    router.back();
  };

  if (!session) return null;

  return (
    <AddressFormModal
      title={session.title}
      initialValues={session.initialValues}
      disableDefaultToggle={session.disableDefaultToggle}
      onClose={close}
      onSave={async (vals) => {
        await session.onSave(vals);
        clearForm();
        router.back();
      }}
    />
  );
}
