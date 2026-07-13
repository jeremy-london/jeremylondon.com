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
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { remarkReadingTime } from "./remark-reading-time.mjs";

const siteLastmod = new Date().toISOString().slice(0, 10);

const dateOnlySitemapLastmod = () => ({
  name: "date-only-sitemap-lastmod",
  hooks: {
    "astro:build:done": ({ dir }) => {
      const outDir = fileURLToPath(dir);
      const sitemapFiles = readdirSync(outDir).filter((file) =>
        /^sitemap.*\.xml$/.test(file),
      );

      for (const file of sitemapFiles) {
        const path = `${outDir}/${file}`;
        const xml = readFileSync(path, "utf8").replace(
          /<lastmod>(\d{4}-\d{2}-\d{2})T00:00:00\.000Z<\/lastmod>/g,
          "<lastmod>$1</lastmod>",
        );
        writeFileSync(path, xml);
      }
    },
  },
});

export default defineConfig({
  site: "https://jeremylondon.com/",

  markdown: unified({
    syntaxHighlight: "prism",
    remarkPlugins: [remarkReadingTime],
  }),

  integrations: [
    icon(),
    react(),
    mdx(),
    sitemap({
      serialize(item) {
        item.changefreq = "always";
        item.lastmod = siteLastmod;
        return item;
      },
    }),
    dateOnlySitemapLastmod(),
    robotsTxt(),
    partytown(),
  ],

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
