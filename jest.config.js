/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  coverageReporters: ["json-summary", "text", "lcov"],
  modulePathIgnorePatterns: ["./dist"],
};
