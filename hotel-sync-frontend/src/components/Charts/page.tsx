'use client';
import BookingSummary from "@/components/Charts/BookingSummary";
import RevenueDetails from "@/components/Charts/RevenueDetails";
import ServiceRequestDetails from "@/components/Charts/ServiceRequestDetails";
import React from "react";

const Chart: React.FC = () => {
  return (
    <>
      <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5 mt-10">
        <div className="col-span-12">
          <BookingSummary />
        </div>
        <div className="col-span-12 xl:col-span-6">
          <RevenueDetails />
        </div>
        <div className="col-span-12 xl:col-span-6">
          <ServiceRequestDetails />
        </div>
      </div>
    </>
  );
};

export default Chart;