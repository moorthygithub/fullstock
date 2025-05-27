import { AppBottombar } from "@/components/app-bottombar";
import { AppSidebar } from "@/components/app-sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import useLogout from "@/hooks/useLogout";
import Logo from "@/json/logo";
import { ArrowLeft, Key, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import companyname from "../../json/company.json";
import ChangePassword from "../auth/ChangePassword";
import Profile from "../auth/Profile";

// eslint-disable-next-line react/prop-types
export default function Page({ children }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);


  const nameL = useSelector((state) => state?.auth.name);
  const emailL = useSelector((state) => state?.auth.email);
  const id = useSelector((state) => state.auth?.user_type);
  const [openprofile, setOpenProfile] = useState(false);
  const localVersion = useSelector((state) => state.auth?.version);

  const handleBackClick = (e) => {
    e.preventDefault();
    navigate(-1);
  };

  const handleLogout = useLogout();

  // Create initials from user name
  const splitUser = nameL || "";
  const initialsChar = splitUser
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();

  return (
    <SidebarProvider>
      {/* Desktop/Tablet Layout - Show sidebar normally */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      <SidebarInset>
        {/* Header that appears on all screens */}
        <header className="hidden sm:flex flex-row justify-between h-16 shrink-0   items-center gap-2 transition-[width,height] ease-linear">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 hover:bg-yellow-100" />
            <Separator
              orientation="vertical"
              className="mr-2 h-4 inline-block"
            />

            {/* Breadcrumb visible on all screens */}
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href="#"
                    onClick={handleBackClick}
                    className="flex items-center gap-2 text-muted-foreground hover:text-yellow-900"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back</span>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* Mobile header text - only shown on sm screens */}

        <div className="sm:hidden sticky top-0 flex justify-between items-center px-4 py-2  border-b z-40 bg-white  rounded-b-lg shadow-sm">
          <div className="font-semibold flex items-center space-x-2">
            <div className="flex items-center">
              <Logo />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-yellow-900 leading-tight">
                {companyname?.CompanyName}
              </span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center justify-center relative">
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></div>
                <Avatar className="h-8 w-8 border-2 border-yellow-300 rounded-lg shadow-sm">
                  <AvatarImage src="/avatars/shadcn.jpg" alt={nameL} />
                  <AvatarFallback className="rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 text-black font-bold text-xs">
                    {initialsChar}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 rounded-xl border border-yellow-200 shadow-lg"
              side="bottom"
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 p-3 text-left text-sm bg-yellow-50 rounded-t-xl">
                  <Avatar className="h-10 w-10 rounded-full border-2 border-yellow-300">
                    <AvatarImage src="/avatars/shadcn.jpg" alt={nameL} />
                    <AvatarFallback className="rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 text-black font-bold">
                      {initialsChar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-yellow-900">
                      {nameL}
                    </span>
                    <span className="truncate text-xs text-yellow-700">
                      {emailL}
                    </span>
                    <span className="text-xs text-green-600 font-medium mt-0.5 flex items-center">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                      Online
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="bg-yellow-200" />
              <DropdownMenuItem
                size="lg"
                className="hover:bg-yellow-100 focus:bg-yellow-100 rounded-md p-0 m-0"
              >
                <div className="rounded-lg bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 text-black px-4 py-2 w-full  h-10">
                  <div className="flex justify-between items-center h-full w-full text-xs leading-tight text-center">
                    <span className="flex items-center gap-1 font-semibold">
                      <span>
                        <span className="text-[10px]">V </span>
                        {localVersion}
                      </span>
                    </span>
                    <span className="flex items-center gap-1 font-semibold">
                      Updated on :27/05/2025
                    </span>
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setOpenProfile(true)}
                className="hover:bg-yellow-100 focus:bg-yellow-100 rounded-md my-0.5 mx-1"
              >
                <User className="mr-2 h-4 w-4 text-yellow-700" />

                <span className=" cursor-pointer">Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="hover:bg-yellow-100 focus:bg-yellow-100 rounded-md my-0.5 mx-1"
                onClick={() => setOpen(true)}
              >
                <Key className="mr-2 h-4 w-4 text-yellow-700" />
                <span className="cursor-pointer">Change Password</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="hover:bg-yellow-100 focus:bg-yellow-100 rounded-md my-0.5 mx-1"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4 text-yellow-700" />
                <span className="cursor-pointer">Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Main content area - adjusted for mobile bottom nav */}
        <div className="flex flex-1 flex-col gap-4 p-0 md:p-4 pt-0">
          <div className="min-h-[calc(100vh-8rem)] md:min-h-[100vh] flex-1 rounded-xl p-2 pb-16  md:pb-2">
            {children}
          </div>
        </div>

        {/* Mobile bottom navigation */}
        <div className="sm:hidden ">
          <AppBottombar />
        </div>
        <ChangePassword setOpen={setOpen} open={open} />
        <Profile setOpen={setOpenProfile} open={openprofile} />
      </SidebarInset>
    </SidebarProvider>
  );
}
