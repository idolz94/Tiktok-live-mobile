import { TOKEN_TO_UNICODE } from "@utils/emoji";
import React, { memo } from "react";
import { Text, TextProps } from "react-native";

type TikTokEmojiTextProps = TextProps & {
  text?: string | null;
};

const TOKEN_REGEX = /\[([a-zA-Z0-9_]+)\]/g;

export const renderTikTokEmojiTokens = (text?: string | null): string => {
  if (!text) {
    return "";
  }

  return text.replace(TOKEN_REGEX, (match, token) => {
    return TOKEN_TO_UNICODE[token.toLowerCase()] ?? match;
  });
};

export const TikTokEmojiText = memo(
  ({ text, ...props }: TikTokEmojiTextProps) => {
    const value = renderTikTokEmojiTokens(text);

    if (!value) {
      return null;
    }

    return <Text {...props}>{value}</Text>;
  },
);

TikTokEmojiText.displayName = "TikTokEmojiText";
