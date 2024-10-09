'use client';
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

const Logout = () => {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push("/login");
    }, 2000);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Logout" />
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-800">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-black dark:text-white mb-4">Logging Out...</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            You are being logged out. Please wait.
          </p>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default Logout;