// https://astro.build/config

import mdx from "@astrojs/mdx";
import { unified } from "@astrojs/markdown-remark";
import partytown from "@astrojs/partytown";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import icon from "astro-icon";
import robotsTxt from "astro-robots-txt";
import { remarkReadingTime } from "./remark-reading-time.mjs";

export default defineConfig({
  site: "https://jeremylondon.com/",

  markdown: unified({
    syntaxHighlight: "prism",
    remarkPlugins: [remarkReadingTime],
  }),

  integrations: [icon(), react(), mdx(), sitemap(), robotsTxt(), partytown()],

  vite: {
    plugins: [tailwindcss()],
    server: {
      headers: {
        "Cross-Origin-Embedder-Policy": "credentialless",
        "Cross-Origin-Opener-Policy": "same-origin",
      },
    },
    preview: {
      headers: {
        "Cross-Origin-Embedder-Policy": "credentialless",
        "Cross-Origin-Opener-Policy": "same-origin",
      },
    },
  },

  devToolbar: {
    enabled: false
  }
});
