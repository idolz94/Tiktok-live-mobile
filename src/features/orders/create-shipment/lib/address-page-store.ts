import { create } from "zustand";
import type { CustomerAddress, ShopAddress } from "./create-shipment-api";
import type { AddrFormValues } from "./types";

type Address = ShopAddress | CustomerAddress;

type PickerSession<T extends Address = Address> = {
  title: string;
  addresses: T[];
  selectedId?: string | null;
  loading?: boolean;
  onSelect: (addr: T) => void;
  onAddPress: () => void;
  onEditPress: (addr: T) => void;
};

type FormSession = {
  title: string;
  initialValues?: Partial<AddrFormValues>;
  disableDefaultToggle?: boolean;
  onSave: (vals: AddrFormValues) => Promise<void>;
  onClose?: () => void;
};

type AddressPageState = {
  picker: PickerSession | null;
  form: FormSession | null;
  setPicker: (picker: PickerSession) => void;
  setForm: (form: FormSession) => void;
  clearPicker: () => void;
  clearForm: () => void;
};

export const useAddressPageStore = create<AddressPageState>((set) => ({
  picker: null,
  form: null,
  setPicker: (picker) => set({ picker }),
  setForm: (form) => set({ form }),
  clearPicker: () => set({ picker: null }),
  clearForm: () => set({ form: null }),
}));
