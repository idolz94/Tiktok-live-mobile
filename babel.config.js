module.exports = function (api) {
  api.cache(true);

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          root: ["./"],
          alias: {
            "@": "./src",
            "@declare": "./declare",
            "@screens": "./src/screens",
            "@stores": "./src/stores",
            "@hooks": "./src/hooks",
            "@components": "./src/components",
            "@utils": "./src/utils",
            "@types": "./src/types",
            "@themes": "./src/themes",
            "@features": "./src/features",
            "@constants": "./src/constants",
          },
        },
      ],

      "react-native-reanimated/plugin",
    ],
  };
};
