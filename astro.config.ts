import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import svelte from '@astrojs/svelte';
import image from '@astrojs/image';

export default defineConfig({
    integrations: [
        tailwind(),
        svelte(),
        image({
            serviceEntryPoint: '@astrojs/image/sharp',
        }),
    ],
});
