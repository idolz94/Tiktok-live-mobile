/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo/ios",
  testMatch: ["<rootDir>/src/**/*.test.ts", "<rootDir>/src/**/*.test.tsx"],
  // ponytail: exclude worktree copies to prevent haste collision on package.json name
  watchPathIgnorePatterns: ["<rootDir>/\\.claude/"],
  testPathIgnorePatterns: ["/node_modules/", "<rootDir>/\\.claude/"],
  modulePathIgnorePatterns: ["<rootDir>/\\.claude/"],
  moduleNameMapper: {
    "^@contexts/(.*)$": "<rootDir>/src/contexts/$1",
    "^@declare/(.*)$": "<rootDir>/declare/$1",
    "^@declare$": "<rootDir>/declare/index",
    "^@screens/(.*)$": "<rootDir>/src/screens/$1",
    "^@stores/(.*)$": "<rootDir>/src/stores/$1",
    "^@hooks/(.*)$": "<rootDir>/src/hooks/$1",
    "^@components/(.*)$": "<rootDir>/src/components/$1",
    "^@features/(.*)$": "<rootDir>/src/features/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@app-types/(.*)$": "<rootDir>/src/types/$1",
    "^@themes$": "<rootDir>/src/themes/index",
    "^@themes/(.*)$": "<rootDir>/src/themes/$1",
    "^@modules/(.*)$": "<rootDir>/src/modules/$1",
    "^@constants/(.*)$": "<rootDir>/src/constants/$1",
    "^@assets/(.*)$": "<rootDir>/src/assets/$1",
    "^@app/(.*)$": "<rootDir>/src/app/$1",
  },
};
