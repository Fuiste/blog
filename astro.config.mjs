import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

const [owner = "Fuiste", repo = "blog"] = (process.env.GITHUB_REPOSITORY ?? "Fuiste/blog").split("/");
const isProjectPagesRepo = repo.toLowerCase() !== `${owner.toLowerCase()}.github.io`;

const base =
  process.env.BASE_PATH ??
  (process.env.GITHUB_ACTIONS === "true" && isProjectPagesRepo ? `/${repo}` : "/");

const site =
  process.env.SITE_URL ??
  (process.env.GITHUB_ACTIONS === "true"
    ? `https://${owner.toLowerCase()}.github.io${base === "/" ? "/" : `${base}/`}`
    : "http://localhost:4321/");

export default defineConfig({
  site,
  base,
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      theme: "github-light"
    }
  }
});

