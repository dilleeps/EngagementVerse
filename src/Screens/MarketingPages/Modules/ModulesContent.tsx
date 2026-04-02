interface ModuleFeature {
  icon: string;
  title: string;
  description: string;
  features: string[];
}

const ModulesContent: ModuleFeature[] = [
  {
    icon: "📊",
    title: "Dashboard & Overview",
    description:
      "Get real-time insights into your sales performance with comprehensive analytics and KPI tracking.",
    features: [
      "Leads Summary Dashboard",
      "Campaign Performance KPIs",
      "Activity Timeline",
      "Account Usage Statistics",
    ],
  },
  {
    icon: "🚀",
    title: "Campaign Management",
    description:
      "Create, manage, and optimize multi-channel campaigns with AI-powered automation.",
    features: [
      "Campaign Creation Wizard",
      "AI Voice & Email Campaigns",
      "A/B Testing Capabilities",
      "Smart Scheduling",
    ],
  },
  {
    icon: "👥",
    title: "Lead & Contact Management",
    description:
      "Organize and enrich your prospect data with intelligent segmentation and tracking.",
    features: [
      "CRM Integration (HubSpot, Salesforce)",
      "Lead Profile Enrichment",
      "Smart Segmentation Filters",
      "Activity History Tracking",
    ],
  },
  {
    icon: "🤖",
    title: "AI Call & Email Configuration",
    description:
      "Configure intelligent conversations and personalized email sequences with AI assistance.",
    features: [
      "Drag-and-Drop Script Builder",
      "Dynamic Personalization",
      "Multi-step Email Cadences",
      "Voice Tone Customization",
    ],
  },
  {
    icon: "📅",
    title: "Demo Scheduling & Integration",
    description:
      "Streamline your booking process with integrated calendar management and CRM sync.",
    features: [
      "Built-in Calendar Scheduler",
      "Google Calendar/Outlook Sync",
      "Automated Booking Confirmations",
      "CRM Integration",
    ],
  },
  {
    icon: "📈",
    title: "Reporting & Analytics",
    description:
      "Deep dive into performance metrics with advanced reporting and conversion tracking.",
    features: [
      "Campaign Metrics Dashboard",
      "Call & Email Analytics",
      "Conversion Funnel Reports",
      "Voice Sentiment Analysis",
    ],
  },
  {
    icon: "🔐",
    title: "User Management & Roles",
    description:
      "Manage team access and track performance with role-based permissions and audit logs.",
    features: [
      "Role-based Access Control",
      "Team Performance Tracking",
      "Compliance Audit Logs",
      "Multi-user Collaboration",
    ],
  },
  {
    icon: "⚙️",
    title: "Settings & Customization",
    description:
      "Configure your platform with advanced settings for compliance and integration.",
    features: [
      "Email Domain Setup (DKIM, SPF)",
      "Call Settings & Voice Options",
      "GDPR/CCPA Compliance",
      "Webhook/API Configuration",
    ],
  },
  {
    icon: "🔔",
    title: "Notifications & Alerts",
    description:
      "Stay informed with real-time notifications and automated alert systems.",
    features: [
      "Real-time Demo Notifications",
      "Daily Campaign Summaries",
      "Failure Alert System",
      "Hot Lead Notifications",
    ],
  },
];

export default ModulesContent;
