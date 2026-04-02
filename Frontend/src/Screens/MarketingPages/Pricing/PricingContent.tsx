interface PricingContentItem {
  title: string;
  price: string;
  priceUnit: string;
  actionButtonText: string;
  isFeatured: boolean;
  items: string[];
}

const PricingContent: PricingContentItem[] = [
  {
    title: "Starter",
    price: "99",
    priceUnit: "/month",
    actionButtonText: "Start Free Trial",
    isFeatured: false,
    items: [
      "1,000 AI calls per month",
      "5,000 emails per month",
      "Basic CRM integration",
      "Email support",
    ],
  },
  {
    title: "Growth",
    price: "299",
    priceUnit: "/month",
    actionButtonText: "Start Free Trial",
    isFeatured: true,
    items: [
      "5,000 AI calls per month",
      "25,000 emails per month",
      "Full CRM integration",
      "A/B testing",
      "Priority support",
    ],
  },
  {
    title: "Pro",
    price: "699",
    priceUnit: "/month",
    actionButtonText: "Contact Sales",
    isFeatured: false,
    items: [
      "Unlimited AI calls",
      "Unlimited emails",
      "Custom integrations",
      "White-label options",
      "Dedicated support",
    ],
  },
];

export default PricingContent;
