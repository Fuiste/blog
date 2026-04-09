export const siteConfig = {
  title: "William Pelrine",
  shortTitle: "WP",
  description:
    "Essays on software, open source projects, and photographs from Madison, WI.",
  author: "William Pelrine",
  email: "drawncloser@gmail.com",
  location: "Madison, WI",
  hero: {
    headline: "Developer and photographer in Madison, WI.",
    body: "Essays on functional programming, a handful of open source projects, and a small photo archive.",
    primaryCta: {
      label: "Read the blog",
      href: "/blog"
    },
    secondaryCta: {
      label: "Browse projects",
      href: "/projects"
    }
  },
  navigation: [
    { label: "Blog", href: "/blog" },
    { label: "Projects", href: "/projects" },
    { label: "Photos", href: "/photos" },
    { label: "About", href: "/about" }
  ],
  socials: [
    { label: "GitHub", href: "https://github.com/Fuiste" },
    { label: "Instagram", href: "https://www.instagram.com/fuiste/" },
    { label: "Twitter", href: "https://twitter.com/Drawn_Closer" }
  ],
  footerNote: "Built with Astro."
} as const;
