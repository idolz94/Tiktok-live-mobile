import { memo, useCallback, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Avatar } from "@components/avatar";
import { Button } from "@components/button";
import { Icon } from "@components/icon";
import { Separator } from "@components/separator";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { formatMoneyFull } from "@features/orders/utils/order";
import type { MergeGroup } from "../../utils/merge-groups";
import { MergeGroupCard } from "./merge-group-card";
import type { useMergeDrafts } from "../../hooks/use-merge-drafts";

type MergeGroupListProps = {
  groups: import("../../utils/merge-groups").MergeGroupsResult;
  mergeState: ReturnType<typeof useMergeDrafts>;
  onConfirmMerge: (groupId: string) => void;
};

export const MergeGroupList = memo(
  ({ groups, mergeState, onConfirmMerge }: MergeGroupListProps) => {
    const [showUnmergeable, setShowUnmergeable] = useState(false);
    const { colors } = useThemes();

    const toggleUnmergeable = useCallback(() => {
      setShowUnmergeable((prev) => !prev);
    }, []);

    if (groups.mergeable.length === 0 && groups.unmergeable.length === 0) {
      return (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Không có đơn nháp để gộp</Text>
          <Text style={styles.emptySub}>
            Chỉ đơn nháp của cùng một khách mới gộp được với nhau
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.root}>
        {groups.mergeable.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Có thể gộp · {groups.mergeable.length} nhóm
            </Text>
            <Text style={styles.sectionSub}>
              Chọn ít nhất 2 đơn trong cùng nhóm, nhấn giữ để chọn đơn được giữ lại
            </Text>
            <View style={styles.cards}>
              {groups.mergeable.map((group) => (
                <MergeGroupCard
                  key={group.id}
                  group={group}
                  selectedIds={mergeState.selectedIdsFor(group.id)}
                  targetId={mergeState.targetByGroup[group.id] ?? null}
                  activeGroupId={mergeState.activeGroupId}
                  merging={
                    mergeState.mergingGroupId === group.id
                  }
                  onToggleSelect={mergeState.toggleSelect}
                  onSetTarget={mergeState.setTarget}
                  onMerge={onConfirmMerge}
                  onClearSelection={mergeState.clearSelection}
                  canMerge={mergeState.canMergeGroup(group.id)}
                />
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chưa có nhóm gộp được</Text>
            <Text style={styles.sectionSub}>
              Cần ít nhất 2 đơn nháp cùng khách và chưa có vận đơn
            </Text>
          </View>
        )}

        {groups.unmergeable.length > 0 && (
          <View style={styles.section}>
            <Pressable
              style={styles.unmergeableHeader}
              onPress={toggleUnmergeable}
            >
              <Text style={styles.unmergeableTitle}>
                Đơn lẻ / Không thể gộp · {groups.unmergeable.length}
              </Text>
              <Icon
                name="chevron_down"
                size={16}
                tintColor="neutral500"
              />
            </Pressable>

            {showUnmergeable && (
              <View style={styles.cards}>
                {groups.unmergeable.map((group) => (
                  <View key={group.id} style={styles.unmergeableCard}>
                    <View style={styles.unmergeableTop}>
                      <Avatar
                        uri={group.avatar}
                        username={group.customerName}
                        size={36}
                      />
                      <View style={styles.unmergeableMeta}>
                        <Text style={styles.unmergeableName} numberOfLines={1}>
                          {group.customerName}
                        </Text>
                        <Text style={styles.unmergeableReason} numberOfLines={1}>
                          {group.reason}
                        </Text>
                      </View>
                      <View style={styles.unmergeableCount}>
                        <Text style={styles.unmergeableCountText}>
                          {group.orders.length} đơn
                        </Text>
                      </View>
                    </View>
                    <Separator type="horizontal" style={{ marginVertical: 8 }} />
                    {group.orders.map((order) => (
                      <View key={order.id} style={styles.unmergeableOrderRow}>
                        <Text style={styles.unmergeableOrderCode} numberOfLines={1}>
                          #{order.orderCode ? order.orderCode.slice(-6).padStart(6, "0") : order.id.slice(-6)}
                        </Text>
                        <Text style={styles.unmergeableOrderMeta} numberOfLines={1}>
                          {order.products.length} SP · {formatMoneyFull(
                            Number(order.totalAmount || order.subtotalAmount || 0),
                          )}
                        </Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    );
  },
);

const styles = createStyles(({ colors, textPresets, shadows }) => ({
  root: {
    rowGap: 16,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
    rowGap: 8,
  },
  emptyText: {
    color: colors.neutral500,
    ...textPresets.fs14_500,
    textAlign: "center",
  },
  emptySub: {
    color: colors.neutral300,
    ...textPresets.fs12_400,
    textAlign: "center",
  },
  section: {
    rowGap: 8,
  },
  sectionTitle: {
    color: colors.neutral900,
    ...textPresets.fs14_500,
  },
  sectionSub: {
    color: colors.neutral500,
    ...textPresets.fs12_400,
  },
  cards: {
    rowGap: 12,
  },
  unmergeableHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: colors.neutral50,
  },
  unmergeableTitle: {
    color: colors.neutral500,
    ...textPresets.fs12_500,
  },
  unmergeableCard: {
    borderRadius: 16,
    backgroundColor: colors.white,
    padding: 16,
    opacity: 0.9,
    ...shadows.sd2,
  },
  unmergeableTop: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 12,
  },
  unmergeableMeta: {
    flex: 1,
  },
  unmergeableName: {
    color: colors.neutral900,
    ...textPresets.fs14_500,
  },
  unmergeableReason: {
    marginTop: 2,
    color: colors.warning,
    ...textPresets.fs12_400,
  },
  unmergeableCount: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 99,
    backgroundColor: colors.neutral50,
  },
  unmergeableCountText: {
    color: colors.neutral500,
    ...textPresets.fs12_500,
  },
  unmergeableOrderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  unmergeableOrderCode: {
    flex: 1,
    color: colors.neutral500,
    ...textPresets.fs12_500,
  },
  unmergeableOrderMeta: {
    color: colors.neutral300,
    ...textPresets.fs12_400,
  },
}));
