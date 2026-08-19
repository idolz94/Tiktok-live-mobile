import { Avatar } from "@components/avatar";
import { Button } from "@components/button";
import { useBottomSheet } from "@components/bottom-sheet/hook";
import { Icon } from "@components/icon";
import { Skeleton } from "@components/skeleton";
import { useToast } from "@components/toast";
import { images } from "@assets/images";
import { Ionicons } from "@expo/vector-icons";
import {
  createCustomerAddressApi,
  updateCustomerAddressApi,
  type CustomerAddress,
} from "@features/orders/service/create-shipment-api";
import { useAddressPageStore } from "@features/orders/stores/address-page-store";
import type { AddrFormValues } from "@features/orders/types/shipment";
import { addressLine, formInitialValues } from "@features/orders/utils/shipment";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { openTikTokProfile } from "@utils/tiktok";
import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Image, Linking, Pressable, ScrollView, Text, View } from "react-native";
import { useCustomerDetail, type DetailTab, type OrderStatFilter } from "./use-customer-detail";
import { ActionPill } from "./components/action-pills";
import { Field, SelectField } from "./components/fields";
import { OrderCard } from "./components/order-card";
import { StatCard } from "./components/stat-card";
import { MergeConfirmSheet } from "@features/orders/components/merge/merge-confirm-sheet";
import { MergeGroupList } from "@features/orders/components/merge/merge-group-list";
import { useMergeDrafts } from "@features/orders/hooks/use-merge-drafts";
import { useMergeGroups } from "@features/orders/hooks/use-merge-groups";

const TABS: { key: DetailTab; label: string }[] = [
  { key: "info", label: "Thông tin" },
  { key: "orders", label: "Đơn hàng" },
];

type Props = { customerKey: string; initialTab?: DetailTab };

export function CustomerDetailSheet({ customerKey, initialTab }: Props) {
  const { colors, textPresets } = useThemes();
  const { show, hide } = useBottomSheet();
  const toast = useToast();
  const { setPicker, setForm } = useAddressPageStore();
  const {
    activeTab,
    setActiveTab,
    customerType,
    setCustomerType,
    phone,
    setPhone,
    phoneError,
    referenceInfo,
    setReferenceInfo,
    customerAddresses,
    selectedAddress,
    setSelectedAddress,
    addressesLoading,
    reloadCustomerAddresses,
    isSaving,
    displayName,
    avatar,
    tiktokUsername,
    customer,
    customerOrders,
    setCustomerOrders,
    reloadCustomerOrders,
    groupedOrders,
    productCount,
    confirmedCount,
    depositedCount,
    unpaidCount,
    draftCount,
    statFilter,
    setStatFilter,
    loading,
    notFound,
    handleSave,
    handleCancelShipment,
    cancellingId,
    loadDevMergeMockOrders,
  } = useCustomerDetail(customerKey, initialTab);

  const onPressStatCard = (key: OrderStatFilter) => setStatFilter((current) => (current === key ? "all" : key));

  const isDevMockActive = __DEV__ && customerOrders.some((o) => String(o.id).startsWith("dev-"));
  const mergeGroups = useMergeGroups(customerOrders as unknown as import("@app-types/index").OrderWithTikTok[]);
  const handleLoadDevMock = useCallback(() => {
    if (!__DEV__) return;
    loadDevMergeMockOrders();
    setActiveTab("orders");
  }, [loadDevMergeMockOrders, setActiveTab]);
  const mergeDrafts = useMergeDrafts({
    groups: mergeGroups,
    setOrders: setCustomerOrders as unknown as React.Dispatch<React.SetStateAction<import("@app-types/index").OrderWithTikTok[]>>,
    reloadOrders: reloadCustomerOrders,
    onSuccessMessage: useCallback((title: string) => toast.success({ title }), [toast]),
    onErrorMessage: useCallback((title: string) => toast.error({ title }), [toast]),
  });

  const [mergeMode, setMergeMode] = useState(false);
  const mergeActive = mergeGroups.mergeable.length > 0;

  const handleToggleMergeMode = useCallback(() => {
    setMergeMode((prev) => {
      const next = !prev;
      if (prev) mergeDrafts.clearAll();
      return next;
    });
  }, [mergeDrafts]);

  useEffect(() => {
    if (!mergeActive && mergeMode) {
      setMergeMode(false);
      mergeDrafts.clearAll();
    }
  }, [mergeActive, mergeDrafts, mergeMode]);

  const pendingGroupRef = useRef<string | null>(null);
  const openConfirmMerge = useCallback(
    (groupId: string) => {
      const group = mergeGroups.mergeable.find((item) => item.id === groupId) ?? null;
      if (!group) return;
      pendingGroupRef.current = groupId;
      const selectedIds = mergeDrafts.selectedIdsFor(groupId);
      const targetId = mergeDrafts.targetByGroup[groupId] ?? null;
      const merging = mergeDrafts.mergingGroupId === groupId;
      show({
        showDragIndicator: true,
        content: (
          <MergeConfirmSheet
            group={group}
            selectedIds={selectedIds}
            targetId={targetId}
            merging={merging}
            onClose={() => {
              pendingGroupRef.current = null;
              hide();
            }}
            onConfirm={async () => {
              await mergeDrafts.confirmAndMerge(groupId);
              pendingGroupRef.current = null;
              hide();
            }}
          />
        ),
      });
    },
    [hide, mergeDrafts, mergeGroups.mergeable, show],
  );

  const openAddressForm = (addr?: CustomerAddress) => {
    const cid = customer?.customerId;
    if (!cid) return;
    setForm({
      title: addr ? "Sửa địa chỉ" : "Thêm địa chỉ",
      initialValues: addr ? formInitialValues(addr) : phone ? { phone } : undefined,
      onSave: async (vals: AddrFormValues) => {
        if (addr) await updateCustomerAddressApi(cid, addr.id, vals);
        else await createCustomerAddressApi(cid, vals);
        await reloadCustomerAddresses(cid);
      },
    });
    router.push("/order-detail/create-shipment/address-form");
    requestAnimationFrame(() => hide());
  };

  const openAddressPicker = () => {
    setPicker({
      title: "Địa chỉ nhận hàng",
      addresses: customerAddresses,
      selectedId: selectedAddress?.id,
      loading: addressesLoading,
      onSelect: (addr) => setSelectedAddress(addr as CustomerAddress),
      onAddPress: () => {
        router.back();
        setTimeout(() => openAddressForm(), 100);
      },
      onEditPress: (addr) => {
        router.back();
        setTimeout(() => openAddressForm(addr as CustomerAddress), 100);
      },
    });
    router.push("/order-detail/create-shipment/address-picker");
    requestAnimationFrame(() => hide());
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar uri={avatar} username={displayName} size={40} />
        <View style={styles.headerInfo}>
          <Text numberOfLines={1} style={styles.headerName}>
            {displayName}
          </Text>
          {!!tiktokUsername && (
            <View style={styles.headerTikTokLine}>
              <Text numberOfLines={1} style={styles.headerTikTokText}>
                {tiktokUsername}
              </Text>
            </View>
          )}
        </View>
      </View>

      {loading ? (
        <>
          <View style={styles.actionsRow}>
            <Skeleton height={40} style={{ flex: 1 }} borderRadius={999} />
            <Skeleton height={40} style={{ flex: 1 }} borderRadius={999} />
            <Skeleton height={40} style={{ flex: 1 }} borderRadius={999} />
          </View>
          <View style={[styles.tabBar, { gap: 0 }]}>
            <Skeleton height={4} style={{ flex: 1 }} borderRadius={0} />
          </View>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.infoContent, { gap: 16 }]}>
              <View style={styles.fieldGroup}>
                <Skeleton height={14} width="40%" borderRadius={4} style={{ marginBottom: 8 }} />
                <Skeleton height={48} borderRadius={8} />
              </View>
              <View style={styles.fieldGroup}>
                <Skeleton height={14} width="35%" borderRadius={4} style={{ marginBottom: 8 }} />
                <Skeleton height={48} borderRadius={8} />
              </View>
              <View style={styles.fieldGroup}>
                <Skeleton height={14} width="50%" borderRadius={4} style={{ marginBottom: 8 }} />
                <Skeleton height={88} borderRadius={8} />
              </View>
              <View style={styles.fieldGroup}>
                <Skeleton height={14} width="45%" borderRadius={4} style={{ marginBottom: 8 }} />
                <Skeleton height={48} borderRadius={8} />
              </View>
              <Skeleton height={56} borderRadius={40} style={{ marginTop: 16 }} />
            </View>
          </ScrollView>
        </>
      ) : notFound ? (
        <View style={styles.stateBox}>
          <Text style={styles.stateTitle}>Không tìm thấy khách hàng</Text>
          <Text style={styles.stateText}>Khách hàng này chưa có dữ liệu trong phiên hiện tại.</Text>
        </View>
      ) : (
        <>
          <View style={styles.actionsRow}>
            <ActionPill
              label="Tiktok"
              tone="TikTok"
              onPress={() => openTikTokProfile(tiktokUsername)}
              icon={<Image source={images.logo_tiktok} style={styles.actionIcon} />}
            />
            <ActionPill
              label="Zalo"
              tone="Zalo"
              onPress={() => {
                if (phone) Linking.openURL(`zalo://chat?phone=${phone.replace(/^0/, "84")}`);
              }}
              icon={<Image source={images.logo_zalo} style={styles.actionIcon} />}
            />
            <ActionPill
              label="Điện thoại"
              tone="Phone"
              onPress={() => {
                if (phone) Linking.openURL(`tel:${phone}`);
              }}
              icon={<Image source={images.logo_phone} style={styles.actionIcon} />}
            />
          </View>

          <View style={styles.tabBar}>
            {TABS.map((tab) => {
              const active = activeTab === tab.key;
              return (
                <Pressable
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  style={[styles.tabItem, active && styles.tabItemActive]}
                >
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {__DEV__ && !isDevMockActive && (
            <View style={styles.devPreviewBar}>
              <Text style={styles.devPreviewLabel}>Xem trước gộp 3+2+1</Text>
              <Pressable style={styles.devPreviewButton} onPress={handleLoadDevMock}>
                <Text style={styles.devPreviewButtonText}>Nạp 6 đơn mẫu</Text>
              </Pressable>
            </View>
          )}
          {__DEV__ && isDevMockActive && (
            <View style={styles.devPreviewBar}>
              <View style={styles.devBadge}>
                <Text style={styles.devBadgeText}>DEV preview · 6 đơn (3A+2B+1C)</Text>
              </View>
              <Pressable style={styles.devPreviewGhost} onPress={reloadCustomerOrders}>
                <Text style={styles.devPreviewGhostText}>Tải lại thật</Text>
              </Pressable>
            </View>
          )}

          {activeTab === "info" ? (
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.infoContent}>
                <SelectField
                  label="Loại khách hàng"
                  value={customerType}
                  onChange={setCustomerType}
                  hint="Tỉ lệ đánh giá tốt từ các shop: 2/2"
                />
                <Field
                  label="Số điện thoại"
                  value={phone}
                  placeholder="Nhập số điện thoại"
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
                {!!phoneError && <Text style={styles.fieldError}>{phoneError}</Text>}
                <Field
                  label="Thông tin tham khảo"
                  value={referenceInfo}
                  placeholder="Nhập thông tin"
                  multiline
                  onChangeText={setReferenceInfo}
                />
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Địa chỉ giao hàng</Text>
                  {selectedAddress ? (
                    <View
                      style={[
                        styles.addressCard,
                        { borderColor: colors.border10, backgroundColor: colors.surface },
                      ]}
                    >
                      <View style={styles.addressTopRow}>
                        <View style={[styles.addressAvatar, { backgroundColor: colors.primaryLight }]}>
                          <Text style={[{ color: colors.primary }, textPresets.fs16_500]}>
                            {(selectedAddress.name?.trim()?.charAt(0) || "L").toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.addressInfo}>
                          <View style={styles.addressNameRow}>
                            <Text
                              style={[styles.addressName, { color: colors.neutral900 }, textPresets.fs16_500]}
                              numberOfLines={1}
                            >
                              {selectedAddress.name ?? "—"}
                            </Text>
                            {selectedAddress.isDefault && (
                              <View style={[styles.addressDefaultBadge, { backgroundColor: colors.primaryLight }]}>
                                <Text style={[{ color: colors.primary }, textPresets.fs11_400]}>Mặc định</Text>
                              </View>
                            )}
                          </View>
                          <Text style={[{ color: colors.neutral400 }, textPresets.fs12_400]}>
                            {selectedAddress.phone ?? "—"}
                          </Text>
                        </View>
                        <Pressable
                          hitSlop={8}
                          style={[styles.addressChangePill, { borderColor: colors.border10 }]}
                          onPress={openAddressPicker}
                        >
                          <Text style={[{ color: colors.primary }, textPresets.fs12_500]}>Thay đổi</Text>
                        </Pressable>
                      </View>
                      <Text
                        style={[styles.addressLineText, { color: colors.neutral400 }, textPresets.fs14_400]}
                        numberOfLines={2}
                      >
                        {addressLine(selectedAddress)}
                      </Text>
                    </View>
                  ) : (
                    <Button
                      onPress={openAddressPicker}
                      type="outline-dashed"
                      title="Thêm mới"
                      icon={<Ionicons name="add" size={18} color={"black"} />}
                    />
                  )}
                </View>
                <Button
                  onPress={handleSave}
                  disabled={isSaving || !customer?.customerId}
                  loading={isSaving}
                  type="gradient"
                  title="Lưu"
                  gradientType="gra_primary"
                  containerStyle={styles.saveButton}
                  txtBtnStyle={styles.saveButtonText}
                  loadingColor="white"
                />
              </View>
            </ScrollView>
          ) : (
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.ordersContent}>
                <View style={styles.statGrid}>
                  <StatCard
                    label="Đã chốt"
                    value={confirmedCount}
                    tone="success"
                    filterKey="confirmed"
                    active={statFilter === "confirmed"}
                    onPress={onPressStatCard}
                  />
                  <StatCard
                    label="Đã cọc"
                    value={depositedCount}
                    tone="info"
                    filterKey="deposited"
                    active={statFilter === "deposited"}
                    onPress={onPressStatCard}
                  />
                  <StatCard
                    label="Chưa cọc"
                    value={unpaidCount}
                    tone="danger"
                    filterKey="unpaid"
                    active={statFilter === "unpaid"}
                    onPress={onPressStatCard}
                  />
                  <StatCard
                    label="Đơn nháp"
                    value={draftCount}
                    tone="muted"
                    filterKey="draft"
                    active={statFilter === "draft"}
                    onPress={onPressStatCard}
                  />
                </View>
                <View style={styles.orderToolbar}>
                  <Text style={styles.productCount}>{productCount} sản phẩm</Text>
                  {mergeActive && (
                    <Pressable
                      style={[styles.mergeButton, mergeMode && styles.mergeButtonActive]}
                      onPress={handleToggleMergeMode}
                    >
                      <Icon
                        name="clipboard_check"
                        size={16}
                        tintColor={mergeMode ? "white" : "neutral900"}
                      />
                      <Text style={[styles.mergeButtonText, mergeMode && styles.mergeButtonTextActive]}>
                        {mergeMode ? "Thoát gộp" : "Gộp đơn"}
                      </Text>
                    </Pressable>
                  )}
                </View>

                {mergeMode ? (
                  <MergeGroupList groups={mergeGroups} mergeState={mergeDrafts} onConfirmMerge={openConfirmMerge} />
                ) : groupedOrders.length === 0 ? (
                  <View style={styles.emptyOrders}>
                    <Text style={styles.stateTitle}>Chưa có đơn hàng</Text>
                    <Text style={styles.stateText}>Các đơn hàng của khách sẽ hiển thị tại đây.</Text>
                  </View>
                ) : (
                  groupedOrders.map((group) => (
                    <View key={group.date} style={styles.dateGroup}>
                      <View style={styles.dateHeader}>
                        <View style={styles.dateDot} />
                        <Text style={styles.dateText}>{group.date}</Text>
                      </View>
                      {group.orders.map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          cancelling={cancellingId === order.id}
                          onCancelShipment={handleCancelShipment}
                          onViewDetail={() => {
                            hide();
                            router.push({ pathname: "/order-detail", params: { id: order.id } });
                          }}
                        />
                      ))}
                    </View>
                  ))
                )}
              </View>
            </ScrollView>
          )}
        </>
      )}
    </View>
  );
}

const styles = createStyles(({ colors, textPresets }) => ({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
  },
  headerInfo: { flex: 1, marginLeft: 10, minWidth: 0 },
  headerName: { color: colors.neutral900, ...textPresets.fs16_600 },
  headerTikTokLine: { marginTop: 4, flexDirection: "row", alignItems: "center" },
  headerTikTokText: { flex: 1, color: colors.neutral400, ...textPresets.fs12_400 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 32 },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 12,
    marginHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border10,
  },
  actionIcon: { width: 16, height: 16 },
  tabBar: {
    height: 48,
    flexDirection: "row",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabItemActive: { borderBottomColor: colors.primary },
  tabText: { color: colors.neutral300, fontSize: 15, fontWeight: "600" },
  tabTextActive: { color: colors.primary },
  devPreviewBar: { marginHorizontal: 16, marginTop: 10, padding: 10, borderRadius: 12, borderWidth: 1, borderStyle: "dashed", borderColor: colors.primary, backgroundColor: colors.primaryLight, flexDirection: "row", alignItems: "center", justifyContent: "space-between", columnGap: 10 },
  devPreviewLabel: { flex: 1, color: colors.primary, ...textPresets.fs12_500 },
  devPreviewButton: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, backgroundColor: colors.primary },
  devPreviewButtonText: { color: colors.white, ...textPresets.fs12_500 },
  devBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.white },
  devBadgeText: { color: colors.neutral500, ...textPresets.fs11_400 },
  devPreviewGhost: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: colors.border10, backgroundColor: colors.white },
  devPreviewGhostText: { color: colors.neutral900, ...textPresets.fs12_500 },
  infoContent: { paddingTop: 18 },
  fieldGroup: { marginBottom: 16 },
  fieldLabel: { marginBottom: 8, color: colors.neutral400, fontSize: 14, fontWeight: "600" },
  fieldError: { marginTop: 4, color: colors.error, fontSize: 12 },
  ordersContent: { paddingTop: 16 },
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  orderToolbar: {
    marginTop: 18,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  productCount: { color: colors.neutral900, ...textPresets.fs16_600 },
  mergeButton: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.neutral50,
    borderWidth: 1,
    borderColor: colors.border10,
  },
  mergeButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  mergeButtonText: { color: colors.neutral900, ...textPresets.fs12_500 },
  mergeButtonTextActive: { color: colors.white },
  dateGroup: { marginBottom: 18 },
  dateHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  dateDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginRight: 8 },
  dateText: { color: colors.neutral500, fontSize: 14, fontWeight: "600" },
  emptyOrders: { alignItems: "center", paddingVertical: 42 },
  stateBox: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 28 },
  stateTitle: { color: colors.neutral900, textAlign: "center", ...textPresets.fs16_600 },
  stateText: { marginTop: 8, color: colors.textMuted, textAlign: "center", ...textPresets.fs14_400 },
  saveButton: { height: 56, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  saveButtonText: { color: colors.white, fontSize: 14, fontWeight: "700", letterSpacing: 0.7 },
  addressCard: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 10 },
  addressTopRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  addressAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  addressInfo: { flex: 1, gap: 3 },
  addressNameRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  addressName: { flexShrink: 1 },
  addressDefaultBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  addressChangePill: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 15,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  addressLineText: { lineHeight: 20 },
}));
