import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://webanise.me/', // <-- Correct GitHub Pages URL
  integrations: [mdx()],
  output: 'static',
  vite: {
    server: {
      host: '0.0.0.0',
      port: 4321,
      strictPort: true,
      hmr: {
        host: '4321-withastro-astro-gwynjeb5him.ws-eu120.gitpod.io',
        protocol: 'wss',
        clientPort: 443,
      }
    }
  }
});
