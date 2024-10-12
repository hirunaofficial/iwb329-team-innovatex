"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import SidebarItem from "@/components/Sidebar/SidebarItem";
import ClickOutside from "@/components/ClickOutside";
import { FaUsers, FaDoorOpen, FaBookOpen, FaConciergeBell } from 'react-icons/fa';
import { getPayload } from "@/lib/tokenManager";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }: SidebarProps) => {
  const pathname = usePathname();
  const [pageName, setPageName] = useState("dashboard");
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    const payload = getPayload();
    if (payload && payload.role) {
      setRole(payload.role);
    }
  }, []);

  const adminMenu = [
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
      label: "Service Requests",
      route: "#",
      children: [
        { label: "List Service Requests", route: "/services" },
        { label: "Add Service Request", route: "/services/add" },
      ],
    },
  ];

  const staffMenu = [
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
      label: "Service Requests",
      route: "#",
      children: [
        { label: "List Service Requests", route: "/services" },
        { label: "Add Service Request", route: "/services/add" },
      ],
    },
  ];

  const userMenu = [
    {
      icon: <FaUsers />,
      label: "Dashboard",
      route: "/",
    },
    {
      icon: <FaBookOpen />,
      label: "My Bookings",
      route: "/my-bookings",
    },
  ];

  const getMenuItems = () => {
    if (role === "Admin") {
      return adminMenu;
    } else if (role === "Staff") {
      return staffMenu;
    } else {
      return userMenu;
    }
  };

  return (
    <ClickOutside onClick={() => setSidebarOpen(false)}>
      <aside
        className={`fixed left-0 top-0 z-9999 flex h-screen w-72.5 flex-col overflow-y-hidden bg-black duration-300 ease-linear dark:bg-boxdark lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
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

        <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
          <nav className="mt-5 px-4 py-4 lg:mt-9 lg:px-6">
            <ul className="mb-6 flex flex-col gap-1.5">
              {getMenuItems().map((menuItem, index) => (
                <SidebarItem
                  key={index}
                  item={menuItem}
                  pageName={pageName}
                  setPageName={setPageName}
                />
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </ClickOutside>
  );
};

export default Sidebar;