import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        coverage: {
            provider: "c8",
            all: true,
            extension: [".ts"],
            include: ["src/**/*"],
            reporter: ["lcov", "text-summary", "clover"],
            reportsDirectory: "./target/coverage",
        },
    },
});
