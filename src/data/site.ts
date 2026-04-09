export const siteConfig = {
  title: "William Pelrine",
  shortTitle: "WP",
  description:
    "Essays on software, selected open source projects, and a small photography archive from Madison and beyond.",
  author: "William Pelrine",
  email: "drawncloser@gmail.com",
  location: "Madison, WI",
  primaryTagline: "Software developer, photographer, and curious system-builder.",
  hero: {
    eyebrow: "Writing, projects, and photographs",
    headline: "A personal blog with room for code, image-making, and long-form thinking.",
    body:
      "This new home brings together technical essays, hand-picked projects, and a small gallery from the older site. The goal is simple: a space that feels alive, easy to update, and unmistakably personal.",
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
    { label: "Home", href: "/" },
    { label: "Blog", href: "/blog" },
    { label: "Projects", href: "/projects" },
    { label: "Photos", href: "/photos" },
    { label: "About", href: "/about" }
  ],
  socials: [
    { label: "GitHub", href: "https://github.com/Fuiste" },
    { label: "Instagram", href: "https://www.instagram.com/fuiste/" },
    { label: "Twitter", href: "https://twitter.com/Drawn_Closer" },
    { label: "Reddit", href: "https://www.reddit.com/user/Fuiste/" },
    { label: "Flickr", href: "https://www.flickr.com/people/154875244@N03/" },
    { label: "Medium", href: "https://medium.com/@drawn_closer" }
  ],
  footerNote:
    "Built with Astro and Markdown, deployed to GitHub Pages while the new version takes shape."
} as const;

