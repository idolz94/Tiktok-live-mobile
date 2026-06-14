import { Button } from "@components/button";
import { Icon } from "@components/icon";
import { useThemes } from "@hooks/use-theme";
import { HairlineWidth } from "@themes/index";
import { createStyles } from "@utils/createStyles";
import { useCallback, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

type Props = {
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
};

export const AddChannel = ({ onClose, onSave }: Props) => {
  const { colors } = useThemes();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const onAddChannel = useCallback(
    async (inputName: string) => {
      setLoading(true);
      try {
        await onSave(inputName);
      } finally {
        setLoading(false);
      }
    },
    [onSave],
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Thêm mới kênh Tiktok</Text>
        <Pressable style={styles.btnClose} onPress={onClose}>
          <Icon name="close" size={16} tintColor={colors.neutral900} />
        </Pressable>
      </View>
      <View style={{ paddingVertical: 8, rowGap: 8 }}>
        <Text style={styles.label}>Tiktok ID</Text>
        <View style={{ rowGap: 4 }}>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Nhập Tiktok ID của bạn"
              value={name}
              onChangeText={setName}
              style={styles.input}
              autoFocus
              placeholderTextColor={colors.neutral300}
            />
          </View>
          <Text style={styles.des}>
            Tên người dùng chỉ có thể chứa chữ thường, số, dấu gạch dưới và dấu
            chấm.
          </Text>
        </View>
      </View>
      <Button
        title="Lưu và kết nối"
        loading={loading}
        loadingColor="neutral100"
        onPress={() => onAddChannel(name)}
        disabled={!name}
        gradientType="gra_primary"
        containerStyle={styles.btnSave}
      />
    </View>
  );
};

const styles = createStyles(({ colors, textPresets }) => ({
  container: {
    padding: 16,
    backgroundColor: colors.neutral100,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 20,
  },
  title: {
    flex: 1,
    textAlign: "center",
    paddingLeft: 32,
    color: colors.neutral900,
    ...textPresets.fs18_500,
  },
  btnClose: {
    width: 32,
    height: 32,
    borderRadius: 99,
    overflow: "hidden",
    backgroundColor: colors.neutral50,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    color: colors.neutral400,
    ...textPresets.fs14_400,
  },
  inputContainer: {
    borderWidth: HairlineWidth * 3,
    borderColor: colors.border10,
    borderRadius: 8,
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  input: {
    color: colors.neutral900,
    ...textPresets.fs14_400,
  },
  des: {
    color: colors.neutral400,
    ...textPresets.fs12_400,
  },
  btnSave: {
    borderRadius: 40,
    overflow: "hidden",
  },
}));
