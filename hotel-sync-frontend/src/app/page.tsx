import React, { ReactNode } from "react";
import { FaClipboardList, FaDollarSign, FaBed, FaConciergeBell } from "react-icons/fa";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Chart from "@/components/Charts/page";

interface CardDataStatsProps {
  title: string;
  total: string | number;
  rate: string;
  levelUp: boolean;
  children: ReactNode;
}

// CardDataStats Component with type annotations
const CardDataStats: React.FC<CardDataStatsProps> = ({ title, total, rate, levelUp, children }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">{title}</div>
        <div className="icon">{children}</div>
      </div>
      <div className="text-3xl font-bold">{total}</div>
      <div className={`flex items-center text-sm ${levelUp ? "text-green-500" : "text-red-500"}`}>
        <span>{levelUp ? "▲" : "▼"}</span>
        <span className="ml-1">{rate}</span>
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard: React.FC = () => {
  const totalBookings = 124;
  const totalRevenue = "$65.4K";
  const occupancyRate = "78%";
  const totalServiceRequests = 32;

  return (
    <DefaultLayout>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <CardDataStats
          title="Total Bookings"
          total={totalBookings}
          rate="1.2%"
          levelUp={true}
        >
          <FaClipboardList size={22} />
        </CardDataStats>

        <CardDataStats
          title="Total Revenue"
          total={totalRevenue}
          rate="3.5%"
          levelUp={true}
        >
          <FaDollarSign size={22} />
        </CardDataStats>

        <CardDataStats
          title="Occupancy Rate"
          total={occupancyRate}
          rate="2.1%"
          levelUp={true}
        >
          <FaBed size={22} />
        </CardDataStats>

        <CardDataStats
          title="Service Requests"
          total={totalServiceRequests}
          rate="0.5%"
          levelUp={false}
        >
          <FaConciergeBell size={22} />
        </CardDataStats>
      </div>

      <Chart />
    </DefaultLayout>
  );
};

export default Dashboard;