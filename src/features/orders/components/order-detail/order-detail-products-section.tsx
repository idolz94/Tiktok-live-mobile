import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Icon } from "@components/icon";
import { OrderProduct } from "@app-types/index";
import { formatMoney } from "@features/orders/utils/order";
import { createStyles } from "@utils/createStyles";
import { MoneyRow, Section, SectionHeader } from "./order-detail-primitives";

type OrderDetailProductsSectionProps = {
  products: OrderProduct[];
  displayProducts: OrderProduct[];
  showAllProducts: boolean;
  hiddenCount: number;
  totalQuantity: number;
  productTotal: number;
  isEditable?: boolean;
  isProductMutating?: boolean;
  onAddProduct: () => void;
  onEditProduct: (product: OrderProduct) => void;
  onDeleteProduct: (product: OrderProduct) => void;
  onToggleShowAll: () => void;
};

export function OrderDetailProductsSection({
  products,
  displayProducts,
  showAllProducts,
  hiddenCount,
  totalQuantity,
  productTotal,
  isEditable = true,
  isProductMutating = false,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onToggleShowAll,
}: OrderDetailProductsSectionProps) {
  return (
    <Section>
      <SectionHeader
        title="Danh sách sản phẩm"
        actionLabel={isEditable ? "Thêm mới" : undefined}
        onAction={isEditable ? onAddProduct : undefined}
        loading={isProductMutating}
      />
      <View style={styles.productList}>
        {displayProducts.map((product, index) => (
          <View key={product.id || index} style={styles.productItem}>
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>
                {product.name || product.code || "Sản phẩm"}
              </Text>
              {(product.variantName || product.color || product.size) ? (
                <Text style={styles.productVariant} numberOfLines={1}>
                  {product.variantName || [product.color, product.size].filter(Boolean).join(" / ")}
                </Text>
              ) : null}
            </View>
            <View style={styles.productRightCol}>
              {isEditable ? (
                <View style={styles.productRowActions}>
                  <Pressable
                    onPress={() => onEditProduct(product)}
                    hitSlop={8}
                  >
                    <Ionicons name="pencil-outline" size={16} color="#9e9e9e" />
                  </Pressable>
                  <Pressable
                    onPress={() => onDeleteProduct(product)}
                    hitSlop={8}
                  >
                    <Ionicons name="trash-outline" size={16} color="#9e9e9e" />
                  </Pressable>
                </View>
              ) : null}
              <View style={styles.productQtyPriceRow}>
                <Text style={styles.productQty}>x{product.quantity}</Text>
                <Text style={styles.productPrice}>
                  {formatMoney(
                    product.totalAmount ||
                      Number(product.price || 0) * Number(product.quantity || 0),
                  )}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
      {products.length > 3 ? (
        <Pressable style={styles.expandBtn} onPress={onToggleShowAll}>
          <Text style={styles.expandText}>
            {showAllProducts ? "Thu gọn" : `Xem thêm (${hiddenCount})`}
          </Text>
          <Icon name="chevron_down" size={14} tintColor="neutral400" />
        </Pressable>
      ) : null}
      <View style={styles.summaryBox}>
        <MoneyRow label="Tổng sản phẩm" value={`${totalQuantity} sản phẩm`} />
        <MoneyRow label="Tổng tiền" value={formatMoney(productTotal)} primary />
      </View>
    </Section>
  );
}

const styles = createStyles(({ colors, textPresets }) => ({
  productList: { borderTopWidth: 1, borderTopColor: colors.border10 },

  productItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    columnGap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border10,
  },
  productInfo: { flex: 1, rowGap: 4 },
  productName: { color: colors.neutral500, ...textPresets.fs14_500 },
  productVariant: { color: colors.neutral400, ...textPresets.fs12_400 },
  productRightCol: { alignItems: "flex-end" as const, rowGap: 4 },
  productRowActions: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 8,
    marginBottom: 2,
  },
  productQtyPriceRow: { flexDirection: "row", alignItems: "center", columnGap: 6 },
  productQty: { color: colors.neutral400, ...textPresets.fs12_400 },
  productPrice: { color: colors.neutral900, ...textPresets.fs14_500 },
  expandBtn: { alignSelf: "center", paddingVertical: 4, flexDirection: "row", alignItems: "center", columnGap: 4 },
  expandText: { color: colors.neutral400, fontSize: 13, fontWeight: "600" as const },
  summaryBox: { rowGap: 12 },
}));
