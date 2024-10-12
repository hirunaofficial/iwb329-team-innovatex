'use client';
import BookingSummary from "@/components/Charts/BookingSummary";
import RevenueDetails from "@/components/Charts/RevenueDetails";
import ServiceRequestDetails from "@/components/Charts/ServiceRequestDetails";
import React, { useEffect, useState } from "react";
import { getPayload } from "@/lib/tokenManager";

const Chart: React.FC = () => {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const payload = getPayload();
    if (payload) {
      setUserRole(payload.role);
    }
  }, []);

  const renderAdminCharts = () => (
    <>
      <div className="col-span-12">
        <BookingSummary />
      </div>
      <div className="col-span-12 xl:col-span-6">
        <RevenueDetails />
      </div>
      <div className="col-span-12 xl:col-span-6">
        <ServiceRequestDetails />
      </div>
    </>
  );

  const renderStaffCharts = () => (
    <>
      <div className="col-span-12">
        <BookingSummary />
      </div>
      <div className="col-span-12 xl:col-span-12">
        <ServiceRequestDetails />
      </div>
    </>
  );

  const renderUserCharts = () => (
    <>
      <div className="col-span-12">
        <BookingSummary />
      </div>
    </>
  );

  return (
    <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5 mt-10">
      {userRole === "Admin" && renderAdminCharts()}
      {userRole === "Staff" && renderStaffCharts()}
      {userRole === "User" && renderUserCharts()}
    </div>
  );
};

export default Chart;