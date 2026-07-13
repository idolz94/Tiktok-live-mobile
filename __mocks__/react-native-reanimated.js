// ponytail: minimal reanimated mock — avoids NativeWorklets init in Jest
"use strict";

const ReactNative = require("react-native");

module.exports = {
  __esModule: true,
  default: {
    View: ReactNative.View,
    Text: ReactNative.Text,
    Image: ReactNative.Image,
    ScrollView: ReactNative.ScrollView,
    FlatList: ReactNative.FlatList,
    createAnimatedComponent: (component) => component,
  },
  Easing: { linear: (t) => t, ease: (t) => t, bezier: () => (t) => t, in: (e) => e, out: (e) => e, inOut: (e) => e },
  useSharedValue: (init) => ({ value: init, get: () => init, set: jest.fn() }),
  useAnimatedStyle: (fn) => fn(),
  useAnimatedScrollHandler: jest.fn(() => jest.fn()),
  useAnimatedRef: jest.fn(() => ({ current: null })),
  useDerivedValue: (fn) => ({ value: fn() }),
  useAnimatedReaction: jest.fn(),
  withTiming: (val) => val,
  withSpring: (val) => val,
  withDelay: (_delay, val) => val,
  withRepeat: (val) => val,
  withSequence: (...vals) => vals[vals.length - 1],
  interpolate: (_val, _input, output) => output[0],
  Extrapolation: { CLAMP: "CLAMP", EXTEND: "EXTEND", IDENTITY: "IDENTITY" },
  runOnJS: (fn) => fn,
  runOnUI: (fn) => fn,
  cancelAnimation: jest.fn(),
  makeMutable: (init) => ({ value: init }),
  createAnimatedComponent: (component) => component,
  addWhitelistedUIProps: jest.fn(),
  addWhitelistedNativeProps: jest.fn(),
};
