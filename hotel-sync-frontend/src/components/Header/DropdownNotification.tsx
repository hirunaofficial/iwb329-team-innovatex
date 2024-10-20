'use client'
import { useState, useEffect } from "react";
import Link from "next/link";
import ClickOutside from "@/components/ClickOutside";
import { getToken } from "@/lib/tokenManager";
import { FaBell } from "react-icons/fa";

interface ServiceRequest {
  id: number;
  description: string;
  created_at: string;
  assigned_to_staff: number;
  status: string;
}

const DropdownNotification = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifying, setNotifying] = useState(true);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const token = getToken();
    if (!token) {
      setError("Authorization token not available.");
      return;
    }

    try {
      const response = await fetch("http://localhost:9094/serviceRequests/getServiceRequests", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch service requests");
      }

      const data: ServiceRequest[] = await response.json();
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while fetching service requests.");
    }
  };

  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <li>
        <Link
          onClick={() => {
            setNotifying(false);
            setDropdownOpen(!dropdownOpen);
          }}
          href="#"
          className="relative flex h-8.5 w-8.5 items-center justify-center rounded-full border-[0.5px] border-stroke bg-gray hover:text-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
        >
          <span
            className={`absolute -top-0.5 right-0 z-1 h-2 w-2 rounded-full bg-meta-1 ${
              notifying === false ? "hidden" : "inline"
            }`}
          >
            <span className="absolute -z-1 inline-flex h-full w-full animate-ping rounded-full bg-meta-1 opacity-75"></span>
          </span>

          <FaBell className="fill-current duration-300 ease-in-out" size={18} />
        </Link>

        {dropdownOpen && (
          <div
            className={`absolute -right-27 mt-2.5 flex h-90 w-75 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark sm:right-0 sm:w-80`}
          >
            <div className="px-4.5 py-3">
              <h5 className="text-sm font-medium text-bodydark2">
                Notifications
              </h5>
            </div>

            <ul className="flex h-auto flex-col overflow-y-auto">
              {error ? (
                <li className="p-4 text-sm text-red-500">{error}</li>
              ) : (
                requests.map((request) => (
                  <li key={request.id}>
                    <Link
                      className="flex flex-col gap-2.5 border-t border-stroke px-4.5 py-3 hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4"
                      href="#"
                    >
                      <p className="text-sm">
                        <span className="text-black dark:text-white">
                          Service Request:
                        </span> {request.description}
                      </p>
                      <p className="text-xs">{new Date(request.created_at).toLocaleDateString()}</p>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </li>
    </ClickOutside>
  );
};

export default DropdownNotification;