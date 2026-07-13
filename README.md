# jeremylondon.com

Personal website and blog for Jeremy London. The site focuses on engineering leadership, AI platforms, security, distributed systems, reliability, homelab work, and hands-on technical notes.

![Deployment](https://github.com/jeremy-london/jeremylondon.com/actions/workflows/deploy.yml/badge.svg)

## About jeremylondon.com

jeremylondon.com is an Astro site with an MDX blog, RSS feed, interactive React examples, and static deployment.

## [Live Site](https://jeremylondon.com/)

## Features

- **Technical writing**: Notes on AI systems, model behavior, agents, MCP, reliability, and engineering quality.
- **Interactive examples**: React islands and Pyodide-backed demos for selected deep learning posts.
- **RSS**: Feed support for readers who still prefer owning their subscriptions.
- **Static site**: Astro build output designed for fast deployment.

## How to Navigate

jeremylondon.com is designed for ease of navigation, allowing you to delve into the topics that interest you the most:

### Categories

The blog is organized around:

- **Deep Learning Basics**: Neural network fundamentals and interactive examples.
- **AI Systems**: Model serving, routing, local inference, and production constraints.
- **AI Platforms**: RAG, agents, MCP, evals, governance, and guardrails.
- **Engineering Quality**: Testing, observability, queues, caching, and data quality.

Choose a category to delve deeper into the fascinating world of deep learning.

## Getting Started

To run the blog locally, you'll need Node.js and pnpm installed on your system. Follow these steps to get started:

1. Clone this repository to your local machine.
2. Install the project dependencies with `pnpm install`.
3. Start the development server with `pnpm dev`.
4. Open your browser and visit <http://localhost:4321> to see the blog in action.

## Project Structure

Inside of your Astro project, you'll find the following directories and files:

```text
/
├── public/
│   └── ...
├── src/
│   ├── components/
│   │   └── ...
│   ├── layouts/
│   │   └── ...
│   └── pages/
│       └── ...
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

Any static assets, like images, can be placed in the `public/` directory. These files will be copied into the final build.

## Markdown linting

Run `pnpm markdown:check` to lint Markdown and MDX with rumdl.
Run `pnpm markdown:fix` to apply supported fixes.

## Reporting Issues

If you come across a bug or have a suggestion, open an issue in the GitHub repository.

## Follow My Journey

Subscribe to the RSS feed at `/rss.xml` for new posts.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
