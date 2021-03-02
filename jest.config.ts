export default {
  // collectCoverage: true,
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: ["\\\\node_modules\\\\"],
  coverageProvider: "v8",
  moduleFileExtensions: ["json", "ts", "node", "js"],
  preset: "ts-jest",
  setupFilesAfterEnv: ["jest-extended", "./jest.setup.ts"],
  testEnvironment: "node",
  testPathIgnorePatterns: ["\\\\node_modules\\\\", "\\\\dist\\\\"],
  displayName: {
    name: "SERVER",
    color: "blue",
  },
  testTimeout: 30000,
};
