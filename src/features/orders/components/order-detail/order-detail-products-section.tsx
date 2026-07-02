import { ActivityIndicator, Pressable, Text, View } from "react-native";
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
      />
      {isProductMutating ? (
        <View style={styles.productLoadingRow}>
          <ActivityIndicator size="small" color="#FF6B8A" />
          <Text style={styles.productLoadingText}>
            Đang cập nhật sản phẩm...
          </Text>
        </View>
      ) : null}
      <View style={styles.productList}>
        {displayProducts.map((product, index) => (
          <View key={product.id || index} style={styles.productItem}>
            <View style={styles.productInfo}>
              <View style={styles.productNameRow}>
                <Text style={styles.productName} numberOfLines={2}>
                  {product.name}
                </Text>
                {isEditable ? (
                  <View style={styles.productRowActions}>
                    <Pressable
                      onPress={() => onEditProduct(product)}
                      hitSlop={8}
                    >
                      <Icon name="clock" size={16} tintColor="neutral400" />
                    </Pressable>
                    <Pressable
                      onPress={() => onDeleteProduct(product)}
                      hitSlop={8}
                    >
                      <Icon name="close" size={16} tintColor="neutral400" />
                    </Pressable>
                  </View>
                ) : null}
              </View>
              <Text style={styles.productQty}>
                Số lượng: {product.quantity}
              </Text>
            </View>
            <Text style={styles.productPrice}>
              {formatMoney(
                product.totalAmount ||
                  Number(product.price || 0) * Number(product.quantity || 0),
              )}
            </Text>
          </View>
        ))}
      </View>
      {products.length > 3 ? (
        <Pressable style={styles.expandBtn} onPress={onToggleShowAll}>
          <Text style={styles.expandText}>
            {showAllProducts ? "Thu gọn" : `Xem thêm (${hiddenCount})`}
          </Text>
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
  productLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 8,
    paddingVertical: 8,
  },
  productLoadingText: { color: colors.neutral400, ...textPresets.fs12_400 },
  productItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    columnGap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border10,
  },
  productInfo: { flex: 1, rowGap: 6 },
  productNameRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    columnGap: 8,
  },
  productRowActions: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 8,
  },
  productName: { flex: 1, color: colors.neutral500, ...textPresets.fs14_500 },
  productQty: { color: colors.neutral300, ...textPresets.fs12_400 },
  productPrice: { color: colors.neutral900, ...textPresets.fs14_500 },
  expandBtn: { alignSelf: "center", paddingVertical: 4 },
  expandText: { color: colors.primary, ...textPresets.fs14_500 },
  summaryBox: { rowGap: 12 },
}));
