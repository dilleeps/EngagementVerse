interface FooterLink {
  title: string;
  link: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const BeforeLoginFooterLinks: FooterSection[] = [
  {
    title: "AceSales.ai",
    links: [
      {
        title: "About us",
        link: "/",
      },
      {
        title: "Careers",
        link: "/",
      },
      {
        title: "Demo Videos",
        link: "/",
      },
      {
        title: "Contact Us",
        link: "/",
      },
    ],
  },
  {
    title: "Product Info",
    links: [
      {
        title: "Features",
        link: "/",
      },
      {
        title: "Pricing",
        link: "/",
      },
      {
        title: "API Documentation",
        link: "/",
      },
      {
        title: "Integrations",
        link: "/",
      },
    ],
  },

  {
    title: "Important Links",
    links: [
      {
        title: "Help Center",
        link: "/",
      },
      {
        title: "Training",
        link: "/",
      },
      {
        title: "Community",
        link: "/",
      },
      {
        title: "Blogs",
        link: "/",
      },
    ],
  },
  {
    title: "Privacy Info",
    links: [
      {
        title: "Privacy Policy",
        link: "/",
      },
      {
        title: "Terms and Conditions",
        link: "/",
      },
      {
        title: "Data Security",
        link: "/",
      },
    ],
  },
];

export default BeforeLoginFooterLinks;
