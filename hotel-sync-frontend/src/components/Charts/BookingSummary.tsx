"use client";

import { ApexOptions } from "apexcharts";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Dynamic import of the chart component to prevent SSR issues
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

// Sample JSON data
const sampleData = {
  bookingSummary: {
    Approved: [30, 25, 36, 30, 45, 35, 64, 52, 59, 36, 39, 51],
    Canceled: [100, 120, 80, 90, 110, 95, 135, 100, 115, 90, 105, 130],
    categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  },
};

const BookingSummary: React.FC = () => {
  // Define state for the active range (Approved or Canceled)
  const [activeRange, setActiveRange] = useState<"Approved" | "Canceled">("Approved");
  const [series, setSeries] = useState<{ name: string; data: number[] }[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // Fetch and update data based on the selected range
  useEffect(() => {
    const fetchedData = sampleData.bookingSummary;
    setCategories(fetchedData.categories);
    setSeries([{ name: "Total Bookings", data: fetchedData[activeRange] }]);
  }, [activeRange]);

  // Handle range change for switching between Approved and Canceled
  const handleRangeChange = (range: "Approved" | "Canceled") => {
    setActiveRange(range);
  };

  // ApexCharts configuration options
  const options: ApexOptions = {
    legend: {
      show: false,
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#FF3131", "#000000"],
    chart: {
      fontFamily: "Satoshi, sans-serif",
      height: 335,
      type: "area",
      dropShadow: {
        enabled: true,
        color: "#623CEA14",
        top: 10,
        blur: 4,
        left: 0,
        opacity: 0.1,
      },
      toolbar: {
        show: false,
      },
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: {
            height: 300,
          },
        },
      },
      {
        breakpoint: 1366,
        options: {
          chart: {
            height: 350,
          },
        },
      },
    ],
    stroke: {
      width: [2, 2],
      curve: "straight",
    },
    grid: {
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 4,
      colors: "#fff",
      strokeColors: ["#FF3131", "#000000"],
      strokeWidth: 3,
      strokeOpacity: 0.9,
      strokeDashArray: 0,
      fillOpacity: 1,
      hover: {
        size: undefined,
        sizeOffset: 5,
      },
    },
    xaxis: {
      type: "category",
      categories: categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        style: {
          fontSize: "0px",
        },
      },
      min: 0,
    },
  };

  // Get current date and 12 months ago date for display
  const currentDate = new Date();
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(currentDate.getMonth() - 11);

  const formatDate = (date: Date) => {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}.${day}.${year}`;
  };

  const formattedStartDate = formatDate(twelveMonthsAgo);
  const formattedEndDate = formatDate(currentDate);

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
      <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
        <div className="flex w-full flex-wrap gap-3 sm:gap-5">
          <div className="flex min-w-47.5">
            <span className="mr-2 mt-1 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-primary">
              <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-primary"></span>
            </span>
            <div className="w-full">
              <p className="font-semibold text-primary">Booking Summary</p>
              <p className="text-sm font-medium">
                {formattedStartDate} - {formattedEndDate}
              </p>
            </div>
          </div>
        </div>
        <div className="flex w-full max-w-45 justify-end">
          <div className="inline-flex items-center rounded-md bg-whiter p-1.5 dark:bg-meta-4">
            <button
              className={`rounded px-3 py-1 text-xs font-medium ${activeRange === "Approved" ? "bg-white" : ""}`}
              onClick={() => handleRangeChange("Approved")}
            >
              Approved
            </button>
            <button
              className={`rounded px-3 py-1 text-xs font-medium ${activeRange === "Canceled" ? "bg-white" : ""}`}
              onClick={() => handleRangeChange("Canceled")}
            >
              Canceled
            </button>
          </div>
        </div>
      </div>

      <div>
        <div id="chartOne" className="-ml-5">
          <ReactApexChart options={options} series={series} type="area" height={350} width={"100%"} />
        </div>
      </div>
    </div>
  );
};

export default BookingSummary;