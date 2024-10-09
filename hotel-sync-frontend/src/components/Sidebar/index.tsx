"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import SidebarItem from "@/components/Sidebar/SidebarItem";
import ClickOutside from "@/components/ClickOutside";
import useLocalStorage from "@/hooks/useLocalStorage";

// Import icons from react-icons
import { FaUsers, FaDoorOpen, FaBookOpen, FaConciergeBell, FaChartBar } from 'react-icons/fa';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const menuGroups = [
  {
    name: "MENU",
    menuItems: [
      {
        icon: <FaUsers />,
        label: "Dashboard",
        route: "/",
      },
      {
        icon: <FaUsers />,
        label: "Users",
        route: "#",
        children: [
          { label: "List Users", route: "/users" },
          { label: "Add User", route: "/users/add" },
        ],
      },
      {
        icon: <FaDoorOpen />,
        label: "Rooms",
        route: "#",
        children: [
          { label: "List Rooms", route: "/rooms" },
          { label: "Add Room", route: "/rooms/add" },
        ],
      },
      {
        icon: <FaBookOpen />,
        label: "Bookings",
        route: "#",
        children: [
          { label: "List Bookings", route: "/bookings" },
          { label: "Add Booking", route: "/bookings/add" },
        ],
      },
      {
        icon: <FaConciergeBell />,
        label: "Services",
        route: "#",
        children: [
          { label: "List Services", route: "/services" },
          { label: "Add Service", route: "/services/add" },
        ],
      },
      {
        icon: <FaChartBar />,
        label: "Reports",
        route: "#",
        children: [
          { label: "Booking Reports", route: "/reports/bookings" },
          { label: "Revenue Reports", route: "/reports/revenue" },
          { label: "Service Reports", route: "/reports/services" },
        ],
      },
    ],
  },
];

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const pathname = usePathname();
  const [pageName, setPageName] = useLocalStorage("selectedMenu", "dashboard");

  return (
    <ClickOutside onClick={() => setSidebarOpen(false)}>
      <aside
        className={`fixed left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* <!-- SIDEBAR HEADER --> */}
        <div className="flex items-center justify-between gap-2 px-6 py-5.5 lg:py-6.5">
          <Link href="/">
            <Image
              width={176}
              height={32}
              src={"/images/logo/logo.svg"}
              alt="Logo"
              priority
            />
          </Link>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="sidebar"
            className="block lg:hidden"
          >
            <FaUsers />
          </button>
        </div>
        {/* <!-- SIDEBAR HEADER --> */}

        <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
          {/* <!-- Sidebar Menu --> */}
          <nav className="mt-5 px-4 py-4 lg:mt-9 lg:px-6">
            {menuGroups.map((group, groupIndex) => (
              <div key={groupIndex}>
                <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2">
                  {group.name}
                </h3>

                <ul className="mb-6 flex flex-col gap-1.5">
                  {group.menuItems.map((menuItem, menuIndex) => (
                    <SidebarItem
                      key={menuIndex}
                      item={menuItem}
                      pageName={pageName}
                      setPageName={setPageName}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </nav>
          {/* <!-- Sidebar Menu --> */}
        </div>
      </aside>
    </ClickOutside>
  );
};

export default Sidebar;
