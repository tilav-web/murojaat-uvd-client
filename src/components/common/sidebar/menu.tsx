import { Home, Users, UsersRound, AlertCircle, ShieldCheck } from "lucide-react";

export const menuGroups = [
  {
    label: "Asosiy",
    items: [
      {
        name: "Boshqaruv paneli",
        path: "/",
        icon: Home,
      },
      {
        name: "Foydalanuvchilar",
        path: "/users",
        icon: Users,
      },
      {
        name: "Guruhlar",
        path: "/groups",
        icon: UsersRound,
      },
      {
        name: "Favqulotda holatlar",
        path: "/emergency",
        icon: AlertCircle,
      },
      {
        name: "Adminstratorlar",
        path: "/admins",
        icon: ShieldCheck,
      },
    ],
  },
];