"use client";
import "jsvectormap/dist/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import "@/css/style.css";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Loader from "@/components/common/Loader";
import { getToken, isTokenExpired, clearToken } from "@/lib/tokenManager";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = getToken();

    if (pathname !== "/login") {
      if (!token || isTokenExpired()) {
        clearToken();
        router.push("/login");
      } else {
        setTimeout(() => setLoading(false), 1000);
      }
    } else {
      setLoading(false);
    }
  }, [router, pathname]);

  return (
    <html lang="en">
      <title>Hotel Sync - Seamless Booking Management</title>
      <body suppressHydrationWarning={true}>
        <div className="dark:bg-boxdark-2 dark:text-bodydark">
          {loading ? <Loader /> : children}
        </div>
      </body>
    </html>
  );
}