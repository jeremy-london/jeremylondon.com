// https://astro.build/config
import { defineConfig, squooshImageService } from "astro/config";
import tailwind from "@astrojs/tailwind";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import partytown from "@astrojs/partytown";
import robotsTxt from "astro-robots-txt";
import icon from "astro-icon";

import { remarkReadingTime } from "./src/utils/all";

export default defineConfig({
  site: "https://jeremylondon.com/",
  image: {
    service: squooshImageService(),
  },
  markdown: {
    remarkPlugins: [remarkReadingTime],
    rehypePlugins: ["rehype-plugin-image-native-lazy-loading"],
    extendDefaultPlugins: true,
  },
  integrations: [
    tailwind(),
    icon(),
    mdx(),
    partytown(),
    sitemap(),
    robotsTxt(),
  ],
});
