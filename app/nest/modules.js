export const nestModules = [
  {
    slug: "online-portal",
    title: "Online Portal",
    description: "Member updates, announcements, and digital forms.",
    access: "Members only",
    highlights: [
      "Official announcements and circulars",
      "Digital forms for requests and reports",
      "Member profile updates and status",
    ],
  },
  {
    slug: "agila-business-exchange",
    title: "Agila Business Exchange",
    description: "Find suppliers, partners, and exclusive Eagle deals.",
    access: "Verified Eagles",
    highlights: [
      "Verified member businesses and partners",
      "Trade opportunities and collaborations",
      "Special rates and exclusive Eagle offers",
    ],
  },
  {
    slug: "regional-directory",
    title: "Regional Directory",
    description: "Search chapters and officers across the region.",
    access: "Always available",
    highlights: [
      "Complete chapter listings",
      "Officer contacts and roles",
      "Directory filters by province",
    ],
  },
  {
    slug: "club-directory",
    title: "Club Directory",
    description: "Connect with Eagle clubs and coordinate activities.",
    access: "Updated monthly",
    highlights: [
      "Club profiles and contact channels",
      "Joint activity coordination",
      "Calendar references for regional events",
    ],
  },
  {
    slug: "membership-committee",
    title: "Membership Committee",
    description: "Track onboarding, sponsorships, and member status.",
    access: "Committee access",
    highlights: [
      "Applicant tracking and approvals",
      "Sponsor verification workflow",
      "Member status and compliance checks",
    ],
  },
  {
    slug: "national-treasury",
    title: "National Treasury",
    description: "Secure payment records and dues status updates.",
    access: "Finance access",
    highlights: [
      "Dues collection and remittance logs",
      "Financial reporting summaries",
      "Secure document vault",
    ],
  },
  {
    slug: "upcoming-projects",
    title: "Upcoming Projects",
    description: "See community drives, missions, and volunteer needs.",
    access: "Open collaboration",
    highlights: [
      "Active project pipeline",
      "Volunteer roles and schedules",
      "Impact tracking and updates",
    ],
  },
];

export const getNestModule = (slug) =>
  nestModules.find((module) => module.slug === slug);
