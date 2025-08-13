// https://astro.build/config
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import partytown from "@astrojs/partytown";
import robotsTxt from "astro-robots-txt";
import icon from "astro-icon";
import lazyLoadPlugin from "rehype-plugin-image-native-lazy-loading";

import { remarkReadingTime } from "./src/utils/all";

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
