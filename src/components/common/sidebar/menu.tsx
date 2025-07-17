import { Home, Users, UsersRound, AlertCircle, ShieldCheck } from "lucide-react";

export const menuGroups = [
  {
    label: "Asosiy",
    items: [
      {
        name: "Dashboard",
        path: "/",
        icon: Home,
      },
      {
        name: "Users",
        path: "/users",
        icon: Users,
      },
      {
        name: "Groups",
        path: "/groups",
        icon: UsersRound,
      },
      {
        name: "Emergency",
        path: "/emergency",
        icon: AlertCircle,
      },
      {
        name: "Admins",
        path: "/admins",
        icon: ShieldCheck,
      },
    ],
  },
];