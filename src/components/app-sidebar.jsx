import {
  ArrowDown,
  ArrowUp,
  Box,
  DollarSign,
  File,
  Frame,
  Package,
  ReceiptText,
  Settings2,
  ShoppingBag,
} from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useSelector } from "react-redux";
import companyname from "../json/company.json";
import { NavMainUser } from "./nav-main-user";
export function AppSidebar({ ...props }) {
  const nameL = useSelector((state) => state.auth.name);
  const emailL = useSelector((state) => state.auth.email);
  const id = useSelector((state) => state.auth.user_type);
  const initialData = {
    user: {
      name: `${nameL}`,
      email: `${emailL}`,
      avatar: "/avatars/shadcn.jpg",
    },
    teams: [
      {
        name: `${companyname?.CompanyName}`,
      },
      // {
      //   name: `${companyname?.CompanyName}`,
      //   logo: GalleryVerticalEnd,
      //   plan: "",
      // },
    ],
    navMain: [
      {
        title: "Dashboard",
        url: "/home",
        icon: Frame,
        isActive: false,
      },
      ...(id != 1
        ? [
            {
              title: "Master",
              url: "#",
              isActive: false,
              icon: Settings2,
              items: [
                {
                  title: "Category",
                  url: "/master/category",
                },
                {
                  title: "Item",
                  url: "/master/item",
                },
                {
                  title: "Buyer",
                  url: "/master/buyer",
                },
                {
                  title: "Godown",
                  url: "/master/go-down",
                },
                ...(id == 3
                  ? [
                      {
                        title: "Branch",
                        url: "/master/branch",
                      },
                    ]
                  : []),
                ...(id == 3
                  ? [
                      {
                        title: "Team",
                        url: "/master/team",
                      },
                    ]
                  : []),
              ],
            },
          ]
        : []),

      {
        title: "Inward",
        url: "#",
        isActive: false,
        icon: ArrowDown,
        items: [
          {
            title: "Purchase",
            url: "/purchase",
          },
          {
            title: "Purchase Return",
            url: "/purchase-return",
          },
        ],
      },
      {
        title: "Outward",
        url: "#",
        isActive: false,
        icon: ArrowUp,
        items: [
          {
            title: "Quotation",
            url: "/quotation",
          },

          {
            title: "PreBooking",
            url: "/pre-booking",
          },
          {
            title: "Dispatch",
            url: "/dispatch",
          },
          {
            title: "Dispatch Return",
            url: "/dispatch-return",
          },
          ...(id != 1
            ? [
                {
                  title: "Dispatch Summary",
                  url: "/report/dispatch",
                },
              ]
            : []),
        ],
      },
      {
        title: "Billing",
        url: "#",
        isActive: false,
        icon: ReceiptText,
        items: [
          {
            title: "Invoice",
            url: "/invoice",
          },
          {
            title: "Payment",
            url: "/payment",
          },
          {
            title: "Payment Summary",
            url: "/report/payment-summary",
          },
          {
            title: "Ledger",
            url: "/report/payment-ledger",
          },
        ],
      },

      {
        title: "Stock",
        url: "#",
        isActive: false,
        icon: Package,

        items: [
          {
            title: "Stock View",
            url: "/stock-view",
          },
          {
            title: "Category Stock",
            url: "/report/category-stock",
          },
          {
            title: "Stock Summary",
            url: "/report/stock",
          },
          {
            title: "Godown Stock",
            url: "/report/godown-stock",
          },

          {
            title: "Single Item Stock",
            url: "/report/single-item-stock",
          },
          ...(id != 1
            ? [
                {
                  title: "Buyer",
                  url: "/report/buyer",
                },
              ]
            : []),
        ],
      },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={initialData.teams} />
      </SidebarHeader>
      <SidebarContent className="sidebar-content">
        {/* <NavProjects projects={data.projects} /> */}
        <NavMain items={initialData.navMain} />
        <NavMainUser projects={initialData.userManagement} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={initialData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
