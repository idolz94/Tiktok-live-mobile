import { AnimatedErrorText } from "@components/animated-error-text";
import { zodResolver } from "@hookform/resolvers/zod";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { z } from "zod";

const addProductSchema = z.object({
  name: z.string().trim().min(1, "Tên sản phẩm không được bỏ trống"),
  price: z.number().min(1, "Giá phải lớn hơn 0"),
  quantity: z.number().min(1, "Số lượng phải lớn hơn 0"),
});

const editProductSchema = z.object({
  name: z.string().trim().min(1, "Tên sản phẩm không được bỏ trống"),
  price: z.number().min(1, "Giá phải lớn hơn 0"),
  quantity: z.number().min(1, "Số lượng phải lớn hơn 0"),
});

type ProductForm = z.infer<typeof addProductSchema>;

type ProductSheetProps = {
  mode: "add" | "edit";
  initialName?: string;
  initialPrice?: number;
  initialQty?: number;
  loading?: boolean;
  onClose: () => void;
  onSave: (data: { name: string; price: number; quantity: number; nameDirty: boolean; priceDirty: boolean }) => void;
};

function parsePriceDisplay(formatted: string): number {
  return parseInt(formatted.replace(/\D/g, ""), 10) || 0;
}

export function ProductSheet({
  mode,
  initialName = "",
  initialPrice = 0,
  initialQty = 1,
  loading = false,
  onClose,
  onSave,
}: ProductSheetProps) {
  const { colors } = useThemes();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid, dirtyFields },
  } = useForm<ProductForm>({
    resolver: zodResolver(
      mode === "add" ? addProductSchema : editProductSchema,
    ),
    mode: "onChange",
    defaultValues: {
      name: initialName,
      price: initialPrice,
      quantity: initialQty < 1 ? 1 : initialQty,
    },
  });

  const quantity = watch("quantity");

  const onSubmit = handleSubmit((data) => {
    onSave({
      name: data.name.trim(),
      price: data.price,
      quantity: data.quantity,
      nameDirty: dirtyFields.name === true,
      priceDirty: dirtyFields.price === true,
    });
  });

  return (
    <View style={[styles.sheet, { backgroundColor: colors.neutral100 }]}>
      <Text style={[styles.title, { color: colors.neutral900 }]}>
        {mode === "add" ? "Thêm sản phẩm" : "Sửa sản phẩm"}
      </Text>

      <View style={{ rowGap: 6 }}>
        <Text style={[styles.label, { color: colors.neutral400 }]}>
          Tên sản phẩm
        </Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value, onBlur } }) => (
            <>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.neutral900,
                    borderColor:
                      dirtyFields.name && errors.name
                        ? colors.error
                        : colors.border10,
                  },
                ]}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Nhập tên SP"
                placeholderTextColor={colors.neutral300}
              />
              <AnimatedErrorText
                message={
                  dirtyFields.name && errors.name
                    ? errors.name.message
                    : undefined
                }
              />
            </>
          )}
        />
      </View>

      <View style={{ rowGap: 6 }}>
        <Text style={[styles.label, { color: colors.neutral400 }]}>
          Đơn giá
        </Text>
        <View
          style={[
            styles.priceRow,
            {
              borderColor:
                dirtyFields.price && errors.price
                  ? colors.error
                  : colors.border10,
            },
          ]}
        >
          <Controller
            control={control}
            name="price"
            render={({ field: { onChange, value, onBlur } }) => (
              <TextInput
                style={[styles.priceInput, { color: colors.neutral900 }]}
                value={value > 0 ? Number(value).toLocaleString("vi-VN") : ""}
                onChangeText={(text) => onChange(parsePriceDisplay(text))}
                onBlur={onBlur}
                placeholder="0"
                placeholderTextColor={colors.neutral300}
                keyboardType="numeric"
              />
            )}
          />
          <View
            style={[
              styles.priceSuffix,
              {
                backgroundColor: colors.neutral50,
                borderLeftColor: colors.border10,
              },
            ]}
          >
            <Text
              style={[styles.priceSuffixText, { color: colors.neutral400 }]}
            >
              VNĐ
            </Text>
          </View>
        </View>
        <AnimatedErrorText
          message={
            dirtyFields.price && errors.price ? errors.price.message : undefined
          }
        />
      </View>

      <View style={{ rowGap: 6 }}>
        <Text style={[styles.label, { color: colors.neutral400 }]}>
          Số lượng
        </Text>
        <View style={styles.qtyRow}>
          <Pressable
            style={[
              styles.qtyBtn,
              {
                backgroundColor: colors.neutral50,
                borderColor: colors.border10,
              },
            ]}
            onPress={() =>
              setValue("quantity", Math.max(1, quantity - 1), {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          >
            <Text style={[styles.qtyBtnText, { color: colors.neutral900 }]}>
              −
            </Text>
          </Pressable>
          <Controller
            control={control}
            name="quantity"
            render={({ field: { onChange, value } }) => (
              <TextInput
                style={[
                  styles.qtyInput,
                  { color: colors.neutral900, borderColor: colors.border10 },
                ]}
                value={String(value)}
                onChangeText={(t) => {
                  const n = parseInt(t, 10);
                  if (!isNaN(n) && n > 0) onChange(n);
                }}
                keyboardType="numeric"
                textAlign="center"
              />
            )}
          />
          <Pressable
            style={[
              styles.qtyBtn,
              {
                backgroundColor: colors.neutral50,
                borderColor: colors.border10,
              },
            ]}
            onPress={() =>
              setValue("quantity", quantity + 1, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
          >
            <Text style={[styles.qtyBtnText, { color: colors.neutral900 }]}>
              +
            </Text>
          </Pressable>
        </View>
        <AnimatedErrorText
          message={
            dirtyFields.quantity && errors.quantity
              ? errors.quantity.message
              : undefined
          }
        />
      </View>

      <View style={styles.actions}>
        <Pressable
          style={[styles.cancelBtn, { borderColor: colors.border10 }]}
          onPress={() => onClose()}
          disabled={loading}
        >
          <Text style={[styles.cancelText, { color: colors.neutral500 }]}>
            Huỷ
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.saveBtn,
            {
              backgroundColor:
                isValid && !loading ? colors.primary : colors.neutral300,
            },
          ]}
          onPress={onSubmit}
          disabled={!isValid || loading}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            {loading ? (
              <ActivityIndicator size="small" color={colors.neutral100} />
            ) : null}
            <Text style={[styles.saveText, { color: colors.neutral100 }]}>
              Lưu
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = createStyles(({ colors, textPresets }) => ({
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    rowGap: 8,
  },
  title: {
    ...textPresets.fs16_600,
    marginBottom: 8,
  },
  label: {
    ...textPresets.fs12_500,
    marginTop: 4,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    ...textPresets.fs14_500,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  priceInput: {
    flex: 1,
    paddingHorizontal: 12,
    height: "100%",
    ...textPresets.fs14_500,
  },
  priceSuffix: {
    height: "100%",
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    borderLeftWidth: 1,
  },
  priceSuffixText: {
    ...textPresets.fs12_500,
  },
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 8,
  },
  qtyBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnText: {
    fontSize: 20,
    lineHeight: 24,
  },
  qtyInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    ...textPresets.fs14_500,
  },
  actions: {
    flexDirection: "row",
    columnGap: 12,
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 40,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    ...textPresets.fs14_500,
  },
  saveBtn: {
    flex: 2,
    height: 48,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: {
    ...textPresets.fs14_500,
  },
}));
