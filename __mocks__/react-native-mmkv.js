// ponytail: MMKV native module mock for Jest (no NitroModules available in test env)
const storage = new Map();

const mockMMKV = {
  getString: (key) => storage.get(key) ?? undefined,
  set: (key, value) => storage.set(key, value),
  delete: (key) => storage.delete(key),
  contains: (key) => storage.has(key),
  getAllKeys: () => Array.from(storage.keys()),
  clearAll: () => storage.clear(),
};

module.exports = {
  MMKV: jest.fn(() => mockMMKV),
  createMMKV: jest.fn(() => mockMMKV),
};
