import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://webanise.me/',
  base: '/blog',  // Blog will be available at webanise.me/blog/
  integrations: [mdx()],
  output: 'static',
  vite: {
    server: {
      host: '0.0.0.0',
      port: 4321,
      strictPort: true,
    }
  }
});
