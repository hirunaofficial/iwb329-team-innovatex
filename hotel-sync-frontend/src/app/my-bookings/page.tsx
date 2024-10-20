'use client';
import { useState, useEffect } from 'react';
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { getToken, getPayload } from '@/lib/tokenManager';
import Alert from "@/components/Alert";

// Define the Booking interface
interface Booking {
  id: number;
  room_category: string;
  room_id: string;
  check_in_date: string;
  check_out_date: string;
  total_price: number;
  status: string;
}

// Define the type for the alert state
type AlertType = {
  type: 'success' | 'danger' | 'warning';
  message: string;
} | null;

const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [alert, setAlert] = useState<AlertType>(null);

  // Fetch bookings for the user based on user email
  const fetchMyBookings = async () => {
    const token = getToken();
    
    if (!token) {
      setAlert({ type: "danger", message: "Authorization token not available." });
      return;
    }

    // Extract email from the JWT payload
    const payload = getPayload();
    const email = payload?.sub;

    if (!email) {
      setAlert({ type: "danger", message: "Failed to extract email from token." });
      return;
    }

    try {
      const response = await fetch(`http://localhost:9093/bookings/getMyBookings`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch bookings");
      }

      const data: Booking[] = await response.json();
      setBookings(data);
    } catch (err) {
      setAlert({ type: "danger", message: err instanceof Error ? err.message : "An error occurred while fetching bookings." });
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-7xl">
        <Breadcrumb pageName="My Bookings" />
        {alert && <Alert type={alert.type} message={alert.message} />}
        <div className="w-full max-w-full rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="px-4 py-4 font-medium text-black dark:text-white">Room Category</th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">Room ID</th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">Check-In Date</th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">Check-Out Date</th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">Total Price</th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length > 0 ? (
                bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      {booking.room_category}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      {booking.room_id}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      {booking.check_in_date}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      {booking.check_out_date}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      {booking.total_price}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      {booking.status}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    No bookings available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default MyBookings;