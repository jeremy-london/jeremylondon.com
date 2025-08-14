// https://astro.build/config

import mdx from '@astrojs/mdx'
import partytown from '@astrojs/partytown'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import icon from 'astro-icon'
import robotsTxt from 'astro-robots-txt'
import lazyLoadPlugin from 'rehype-plugin-image-native-lazy-loading'

import { remarkReadingTime } from './src/utils/all'

export default defineConfig({
  site: "https://jeremylondon.com/",

  markdown: {
    syntaxHighlight: "prism",
    remarkPlugins: [remarkReadingTime],
    rehypePlugins: [lazyLoadPlugin],
    extendDefaultPlugins: true,
  },

  integrations: [icon(), react(), mdx(), partytown(), sitemap(), robotsTxt()],

  vite: {
    plugins: [tailwindcss()],
  },
});
