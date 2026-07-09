import { useRef, useState } from "react";
import {
  ScrollView,
  Text,
  View,
  Pressable,
  TextInput,
  Keyboard,
} from "react-native";
import { router } from "expo-router";
import { Screen } from "@components/screen";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { Popover, usePopover, PopoverPlacement } from "@components/popover";

export function PopoverDemoScreen() {
  const { colors, textPresets } = useThemes();
  const { showPopover } = usePopover();
  const inputRef = useRef<TextInput>(null);

  const [counter, setCounter] = useState(0);
  const [placement, setPlacement] = useState<PopoverPlacement>("auto");
  const [showArrow, setShowArrow] = useState(true);
  const [backdropMode, setBackdropMode] = useState<"visible" | "transparent" | "none">("visible");

  // Dynamic content list
  const [items, setItems] = useState<string[]>(["Apple", "Banana", "Cherry"]);

  // We need refs for imperative anchor
  const imperativeAnchorRef = useRef<View>(null);

  const handleShowImperative = () => {
    showPopover({
      anchorRef: imperativeAnchorRef,
      placement: "bottom",
      showArrow: true,
      content: (
        <View style={styles.menuContainer}>
          <Text style={styles.menuHeader}>Imperative Menu</Text>
          <Pressable style={styles.menuItem} onPress={() => Keyboard.dismiss()}>
            <Text style={styles.menuItemText}>Dismiss Keyboard</Text>
          </Pressable>
          <Pressable
            style={styles.menuItem}
            onPress={() => setItems((prev) => [...prev, `New ${prev.length + 1}`])}
          >
            <Text style={styles.menuItemText}>Add Dynamic Item</Text>
          </Pressable>
        </View>
      ),
    });
  };

  const getBackdropProps = () => {
    switch (backdropMode) {
      case "visible":
        return { showBackdrop: true, closeOnOutsidePress: true };
      case "transparent":
        return { showBackdrop: false, closeOnOutsidePress: true };
      case "none":
        return { showBackdrop: false, closeOnOutsidePress: false };
    }
  };

  return (
    <Screen backgroundColorTheme="neutral100">
      {/* Header bar */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹ Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Popover Demo</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <Text style={styles.sectionTitle}>1. Edge Collision & Shifting</Text>
        <Text style={styles.sectionDesc}>
          Test placements near screen boundaries. The popover will automatically flip or shift to prevent overflow.
        </Text>

        <View style={styles.edgeGrid}>
          {/* Top Left */}
          <Popover
            trigger={
              <Pressable style={styles.edgeButton}>
                <Text style={styles.edgeButtonText}>Top Left</Text>
              </Pressable>
            }
            placement="top"
            showArrow={showArrow}
            {...getBackdropProps()}
          >
            <View style={styles.popoverCard}>
              <Text style={styles.popoverText}>Shifted right to avoid left edge</Text>
            </View>
          </Popover>

          {/* Top Right */}
          <Popover
            trigger={
              <Pressable style={[styles.edgeButton, styles.alignRight]}>
                <Text style={styles.edgeButtonText}>Top Right</Text>
              </Pressable>
            }
            placement="top"
            showArrow={showArrow}
            {...getBackdropProps()}
          >
            <View style={styles.popoverCard}>
              <Text style={styles.popoverText}>Shifted left to avoid right edge</Text>
            </View>
          </Popover>
        </View>

        <Text style={styles.sectionTitle}>2. Interactive Configuration</Text>
        
        {/* Placement configuration */}
        <View style={styles.configGroup}>
          <Text style={styles.configLabel}>Placement: {placement.toUpperCase()}</Text>
          <View style={styles.btnRow}>
            {(["auto", "top", "bottom", "left", "right"] as PopoverPlacement[]).map((p) => (
              <Pressable
                key={p}
                onPress={() => setPlacement(p)}
                style={[styles.chipBtn, placement === p && styles.chipBtnActive]}
              >
                <Text style={[styles.chipText, placement === p && styles.chipTextActive]}>
                  {p}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Backdrop Mode configuration */}
        <View style={styles.configGroup}>
          <Text style={styles.configLabel}>Backdrop Mode: {backdropMode.toUpperCase()}</Text>
          <View style={styles.btnRow}>
            {(["visible", "transparent", "none"] as const).map((mode) => (
              <Pressable
                key={mode}
                onPress={() => setBackdropMode(mode)}
                style={[styles.chipBtn, backdropMode === mode && styles.chipBtnActive]}
              >
                <Text style={[styles.chipText, backdropMode === mode && styles.chipTextActive]}>
                  {mode}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Arrow option toggler */}
        <View style={styles.toggleRow}>
          <Text style={styles.configLabel}>Render Arrow</Text>
          <Pressable
            style={[styles.switch, showArrow && styles.switchOn]}
            onPress={() => setShowArrow(!showArrow)}
          >
            <View style={[styles.switchKnob, showArrow && styles.switchKnobOn]} />
          </Pressable>
        </View>

        <View style={styles.demoArea}>
          <Popover
            trigger={
              <Pressable style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>Open Configured Popover</Text>
              </Pressable>
            }
            placement={placement}
            showArrow={showArrow}
            {...getBackdropProps()}
          >
            <View style={styles.menuContainer}>
              <Text style={styles.menuHeader}>Configured Menu</Text>
              <Pressable style={styles.menuItem} onPress={() => setCounter((c) => c + 1)}>
                <Text style={styles.menuItemText}>Tap Counter: {counter}</Text>
              </Pressable>
              <Pressable
                style={styles.menuItem}
                onPress={() => setItems((prev) => [...prev, `Dynamic ${prev.length + 1}`])}
              >
                <Text style={styles.menuItemText}>Add Dynamic Item</Text>
              </Pressable>
            </View>
          </Popover>
        </View>

        <Text style={styles.sectionTitle}>3. Dynamic Size & Auto Adjust</Text>
        <Text style={styles.sectionDesc}>
          The popover adapts its layout on size changes. Add and remove items dynamically.
        </Text>

        <View style={styles.demoArea}>
          <Popover
            trigger={
              <Pressable style={styles.successBtn}>
                <Text style={styles.successBtnText}>Open Dynamic Size List</Text>
              </Pressable>
            }
            placement="auto"
            showArrow={showArrow}
            {...getBackdropProps()}
          >
            <View style={styles.dynamicContainer}>
              <Text style={styles.menuHeader}>Fruits List ({items.length})</Text>
              {items.map((item, idx) => (
                <View key={idx} style={styles.listItem}>
                  <Text style={styles.listItemText}>{item}</Text>
                  <Pressable
                    onPress={() => setItems((prev) => prev.filter((_, i) => i !== idx))}
                    style={styles.deleteBtn}
                  >
                    <Text style={styles.deleteBtnText}>✕</Text>
                  </Pressable>
                </View>
              ))}
              <Pressable
                style={styles.addBtn}
                onPress={() => setItems((prev) => [...prev, `Fruit ${prev.length + 1}`])}
              >
                <Text style={styles.addBtnText}>+ Add Fruit</Text>
              </Pressable>
            </View>
          </Popover>
        </View>

        <Text style={styles.sectionTitle}>4. Imperative Call & Keyboard Repositioning</Text>
        <Text style={styles.sectionDesc}>
          Open the popover imperatively via usePopover. If the keyboard opens, it will reposition above it.
        </Text>

        <TextInput
          ref={inputRef}
          placeholder="Tap here to open Keyboard"
          placeholderTextColor={colors.textLightMuted}
          style={styles.textInput}
        />

        <View style={styles.demoArea} ref={imperativeAnchorRef}>
          <Pressable style={styles.infoBtn} onPress={handleShowImperative}>
            <Text style={styles.infoBtnText}>Show Imperative Popover</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = createStyles(({ colors, textPresets, shadows }) => ({
  screen: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 54,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.neutral100,
    borderBottomWidth: 0.5,
    borderColor: colors.borderLight,
  },
  backButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backButtonText: {
    color: colors.primary,
    ...textPresets.fs16_500,
  },
  headerTitle: {
    color: colors.neutral900,
    ...textPresets.fs18_500,
  },
  headerRight: {
    width: 50,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 120,
    gap: 12,
  },
  sectionTitle: {
    color: colors.neutral900,
    marginTop: 20,
    ...textPresets.fs16_600,
  },
  sectionDesc: {
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 8,
    ...textPresets.fs14_400,
  },
  edgeGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 12,
  },
  edgeButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.neutral50,
    borderWidth: 0.5,
    borderColor: colors.border20,
  },
  alignRight: {
    alignSelf: "flex-end",
  },
  edgeButtonText: {
    color: colors.neutral900,
    ...textPresets.fs14_500,
  },
  popoverCard: {
    padding: 12,
    maxWidth: 160,
  },
  popoverText: {
    color: colors.neutral900,
    textAlign: "center",
    ...textPresets.fs12_400,
  },
  configGroup: {
    backgroundColor: colors.neutral100,
    borderRadius: 12,
    padding: 12,
    gap: 8,
    borderWidth: 0.5,
    borderColor: colors.borderLight,
  },
  configLabel: {
    color: colors.neutral900,
    ...textPresets.fs14_500,
  },
  btnRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chipBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 99,
    backgroundColor: colors.neutral50,
    borderWidth: 0.5,
    borderColor: colors.borderLight,
  },
  chipBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    color: colors.neutral400,
    ...textPresets.fs12_500,
  },
  chipTextActive: {
    color: colors.white,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.neutral100,
    borderRadius: 12,
    padding: 12,
    borderWidth: 0.5,
    borderColor: colors.borderLight,
  },
  switch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.neutral50,
    padding: 2,
    justifyContent: "center",
  },
  switchOn: {
    backgroundColor: colors.success,
  },
  switchKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.white,
    ...shadows.sd1,
  },
  switchKnobOn: {
    alignSelf: "flex-end",
  },
  demoArea: {
    alignItems: "center",
    marginVertical: 12,
  },
  primaryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 99,
    backgroundColor: colors.primary,
    ...shadows.sd2,
  },
  primaryBtnText: {
    color: colors.white,
    ...textPresets.fs14_500,
  },
  successBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 99,
    backgroundColor: colors.success,
    ...shadows.sd2,
  },
  successBtnText: {
    color: colors.white,
    ...textPresets.fs14_500,
  },
  infoBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 99,
    backgroundColor: colors.info,
    ...shadows.sd2,
  },
  infoBtnText: {
    color: colors.white,
    ...textPresets.fs14_500,
  },
  menuContainer: {
    padding: 6,
    width: 180,
  },
  menuHeader: {
    color: colors.neutral300,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderColor: colors.borderLight,
    ...textPresets.fs12_500,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  menuItemText: {
    color: colors.neutral900,
    ...textPresets.fs14_400,
  },
  dynamicContainer: {
    width: 200,
    padding: 8,
  },
  listItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderColor: colors.borderLight,
  },
  listItemText: {
    color: colors.neutral900,
    ...textPresets.fs14_400,
  },
  deleteBtn: {
    padding: 4,
  },
  deleteBtnText: {
    color: colors.error,
    ...textPresets.fs12_500,
  },
  addBtn: {
    marginTop: 8,
    paddingVertical: 8,
    alignItems: "center",
    backgroundColor: colors.neutral50,
    borderRadius: 6,
  },
  addBtnText: {
    color: colors.success,
    ...textPresets.fs12_500,
  },
  textInput: {
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 0.5,
    borderColor: colors.border20,
    color: colors.neutral900,
    ...textPresets.fs14_400,
    marginVertical: 8,
  },
}));
