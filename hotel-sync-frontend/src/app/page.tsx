'use client'
import React from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

const Dashboard: React.FC = () => {
  return (
    <DefaultLayout>
      <div className="relative w-full h-screen flex justify-center items-center">
        <img
          src="/images/logo/logo-icon.svg"
          alt="Hotel Sync Logo"
          className="absolute w-1/2 opacity-10"
        />
      </div>
    </DefaultLayout>
  );
};

export default Dashboard;