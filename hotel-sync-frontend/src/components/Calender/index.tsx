'use client';
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Breadcrumb from "../Breadcrumbs/Breadcrumb";

const sampleBookings = [
  { date: "2024-12-01", guest: "John Doe", room: "101", time: "12:00 PM - 2:00 PM" },
  { date: "2024-12-01", guest: "Jane Smith", room: "102", time: "2:00 PM - 4:00 PM" },
  { date: "2024-12-25", guest: "Michael Johnson", room: "203", time: "3:00 PM - 5:00 PM" },
  { date: "2024-12-10", guest: "Sarah Brown", room: "105", time: "1:00 PM - 3:00 PM" },
];

// Get the number of days in the given month/year
const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();

// Format a date for comparison with booking dates
const formatDate = (year: number, month: number, day: number) => {
  return new Date(year, month, day).toISOString().split('T')[0]; // YYYY-MM-DD
};

const Calendar: React.FC = () => {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [daysArray, setDaysArray] = useState<(number | null)[]>([]); // Ensure `null` can be used for empty cells
  const [bookings] = useState(sampleBookings);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const getMonthName = useMemo(() => new Date(year, month).toLocaleString("default", { month: "long" }), [year, month]);

  const updateCalendarDays = () => {
    const daysInThisMonth = daysInMonth(month, year);
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysArr = Array(firstDayOfMonth).fill(null).concat(
      Array.from({ length: daysInThisMonth }, (_, i) => i + 1)
    );
    setDaysArray(daysArr);
  };

  useEffect(() => {
    updateCalendarDays();
  }, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleDayClick = (day: number | null) => {
    if (!day) return;
    const formattedDate = formatDate(year, month, day);
    router.push(`/bookings/${formattedDate}`);
  };

  // Memoized calculation of bookings count for each day
  const bookingsByDate = useMemo(() => {
    const bookingsCount: Record<string, number> = {};
    bookings.forEach(booking => {
      bookingsCount[booking.date] = (bookingsCount[booking.date] || 0) + 1;
    });
    return bookingsCount;
  }, [bookings]);

  const getBookingCountForDay = (day: number | null) => {
    if (!day) return 0;
    const formattedDate = formatDate(year, month, day);
    return bookingsByDate[formattedDate] || 0;
  };

  return (
    <div className="mx-auto max-w-7xl">
      <Breadcrumb pageName="Hotel Bookings Calendar" />

      <div className="flex justify-between items-center p-4">
        <button
          onClick={handlePrevMonth}
          className="px-4 py-2 bg-primary text-white rounded"
        >
          Prev
        </button>
        <h2 className="text-xl font-semibold">
          {getMonthName} {year}
        </h2>
        <button
          onClick={handleNextMonth}
          className="px-4 py-2 bg-primary text-white rounded"
        >
          Next
        </button>
      </div>

      <div className="w-full max-w-full rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <table className="w-full">
          <thead>
            <tr className="grid grid-cols-7 rounded-t-sm bg-primary text-white">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <th
                  key={day}
                  className="flex h-15 items-center justify-center p-1 text-xs font-semibold sm:text-base xl:p-5"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: Math.ceil(daysArray.length / 7) }).map((_, rowIndex) => (
              <tr key={rowIndex} className="grid grid-cols-7">
                {daysArray.slice(rowIndex * 7, rowIndex * 7 + 7).map((day, colIndex) => (
                  <td
                    key={colIndex}
                    className={`relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 hover:bg-gray-200 dark:border-strokedark dark:hover:bg-meta-4 md:h-25 md:p-6 xl:h-31 ${
                      day ? "" : "bg-gray-200 dark:bg-meta-4"
                    }`}
                    onClick={() => handleDayClick(day)}
                  >
                    {day && (
                      <>
                        <span className="font-medium text-black dark:text-white">{day}</span>
                        <div className="mt-2">
                          <span className="text-sm font-medium text-primary dark:text-white">
                            {getBookingCountForDay(day)} bookings
                          </span>
                        </div>
                      </>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Calendar;