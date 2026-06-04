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
            "@contexts": "./src/contexts",
            "@declare": "./declare",
            "@screens": "./src/screens",
            "@stores": "./src/stores",
            "@hooks": "./src/hooks",
            "@components": "./src/components",
            "@utils": "./src/utils",
            "@app-types": "./src/types",
            "@themes": "./src/themes",
            "@modules": "./src/modules",
            "@constants": "./src/constants",
            "@assets": "./src/assets",
            "@app": "./src/app",
          },
        },
      ],

      "react-native-reanimated/plugin",
    ],
  };
};
