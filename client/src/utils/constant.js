import { Search, Users, Bell } from "lucide-react";

export const navLinks = [
  {
    id: 1,
    label: "Home",
    path: "/",
  },
  {
    id: 2,
    label: "Events",
    path: "/events",
  },
  {
    id: 3,
    label: "Clubs",
    path: "/clubs",
  },
  {
    id: 4,
    label: "Chat",
    path: "/chat",
  },
];

export const works = [
  {
    id: 1,
    title: "Explore & Discover",
    description:
      "Students can browse upcoming campus events and follow their favorite clubs.",
    icon: Search,
  },
  {
    id: 2,
    title: "Connect & Form Teams",
    description:
      "Easily find teammates for hackathons, fests, and competitions.",
    icon: Users,
  },
  {
    id: 3,
    title: "Stay Updated",
    description:
      "Receive live notifications and announcements so you never miss an event!",
    icon: Bell,
  },
];

export const dashboardSidebarLabels = [
  {
    id: 1,
    text: "events",
  },
  {
    id: 2,
    text: "clubs",
  },
];

export const departments = ["CCT", "CEC", "CCE", "CCP", "CBSA", "CCH", "CCHM"];

export const chatButtons = [
  { id: 1, label: "admin" },
  { id: 2, label: "student" },
];
