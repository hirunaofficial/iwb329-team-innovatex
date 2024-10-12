import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import React, { useState, useEffect } from "react";
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const sampleData = {
  serviceRequests: [
    { type: "Room Service", count: 70 },
    { type: "Maintenance", count: 30 },
  ],
};

const ServiceRequestDetails: React.FC = () => {
  const [series, setSeries] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);

  // Fetching data from the sample JSON and setting it for chart
  useEffect(() => {
    const fetchedData = sampleData.serviceRequests;
    const dataSeries = fetchedData.map((request) => request.count);
    const dataLabels = fetchedData.map((request) => request.type);

    setSeries(dataSeries);
    setLabels(dataLabels);
  }, []);

  const options: ApexOptions = {
    chart: {
      fontFamily: "Satoshi, sans-serif",
      type: "donut",
    },
    colors: ["#FF3131", "#000000"],
    labels: labels,
    legend: {
      show: false,
      position: "bottom",
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          background: "transparent",
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    responsive: [
      {
        breakpoint: 2600,
        options: {
          chart: {
            width: 380,
          },
        },
      },
      {
        breakpoint: 640,
        options: {
          chart: {
            width: 200,
          },
        },
      },
    ],
  };

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-5">
      <div className="mb-3 justify-between gap-4 sm:flex text-center">
        <div className="w-full">
          <h5 className="text-xl font-semibold text-black dark:text-white">
            Service Request Summary
          </h5>
        </div>
      </div>

      <div className="mb-2">
        <div id="chartThree" className="mx-auto flex justify-center">
          <ReactApexChart options={options} series={series} type="donut" />
        </div>
      </div>
    </div>
  );
};

export default ServiceRequestDetails;