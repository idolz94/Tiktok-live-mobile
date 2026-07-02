import { useState } from "react";
import { validatePhoneVN } from "@utils/validate-phone";

export function usePhoneField(initial = "") {
  const [phone, setPhoneRaw] = useState(initial);
  const [phoneError, setPhoneError] = useState("");

  const setPhone = (v: string) => {
    setPhoneRaw(v);
    setPhoneError(validatePhoneVN(v));
  };

  const validate = () => {
    const err = validatePhoneVN(phone);
    setPhoneError(err);
    return err === "";
  };

  const reset = (v = "") => {
    setPhoneRaw(v);
    setPhoneError("");
  };

  return { phone, setPhone, phoneError, validate, reset };
}
