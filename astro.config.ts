import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import svelte from "@astrojs/svelte";
import image from "@astrojs/image";

export default defineConfig({
    outDir: "./target/dist",
    integrations: [
        tailwind(),
        svelte(),
        image({
            serviceEntryPoint: "@astrojs/image/sharp",
        }),
    ],
    site: "https://www.echooff.dev",
});
