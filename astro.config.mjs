import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.SITE_URL || 'https://baky0905.github.io',
  base: process.env.SITE_BASE || '/cookbook',
  output: 'static',
  trailingSlash: 'always',
});
