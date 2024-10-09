'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

const sampleBookings = [
  { date: '2024-12-01', bookingsCount: 2 },
  { date: '2024-12-25', bookingsCount: 5 },
  { date: '2024-12-10', bookingsCount: 3 },
];

const daysInMonth = (month: number, year: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const ListBookings = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [daysArray, setDaysArray] = useState<number[]>([]);

  const getMonthName = (month: number) => {
    return new Date(currentDate.getFullYear(), month).toLocaleString('default', {
      month: 'long',
    });
  };

  const updateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = daysInMonth(month, year);
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysArr = Array(firstDayOfMonth).fill(null).concat(
      Array.from({ length: days }, (_, i) => i + 1)
    );
    setDaysArray(daysArr);
  };

  useEffect(() => {
    updateCalendarDays();
  }, [currentDate]);

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const formatDate = (day: number) => {
    return `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getBookingsForDay = (day: number) => {
    const formattedDate = formatDate(day);
    const bookingForDay = sampleBookings.find(
      (booking) => booking.date === formattedDate
    );
    return bookingForDay ? bookingForDay.bookingsCount : 0;
  };

  return (
    <DefaultLayout>
    <div className="mx-auto max-w-7xl">
      <Breadcrumb pageName="Bookings" />

      <div className="flex justify-between items-center p-4">
        <button
          onClick={handlePrevMonth}
          className="px-4 py-2 bg-primary text-white rounded"
        >
          Prev
        </button>
        <h2 className="text-xl font-semibold">
          {getMonthName(currentDate.getMonth())} {currentDate.getFullYear()}
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
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <th
                  key={day}
                  className="flex h-15 items-center justify-center p-1 text-xs font-semibold sm:text-base xl:p-5"
                >
                  <span className="block">{day}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array(Math.ceil(daysArray.length / 7))
              .fill(null)
              .map((_, rowIndex) => (
                <tr key={rowIndex} className="grid grid-cols-7">
                  {daysArray
                    .slice(rowIndex * 7, rowIndex * 7 + 7)
                    .map((day, colIndex) => (
                      <td
                        key={colIndex}
                        className={`ease relative h-20 cursor-pointer border border-stroke p-2 transition duration-500 hover:bg-gray dark:border-strokedark dark:hover:bg-meta-4 md:h-25 md:p-6 xl:h-31 ${
                          day ? '' : 'bg-gray-200 dark:bg-meta-4'
                        }`}
                      >
                        {day && (
                          <>
                          <Link href={`/bookings/${formatDate(day)}`}>
                            <span className="font-medium text-black dark:text-white">
                              {day}
                            </span>
                            <div className="group h-16 w-full flex-grow cursor-pointer py-1 md:h-30">
                              <span className="text-xs">
                                {getBookingsForDay(day)} bookings
                              </span>
                            </div>
                            </Link>
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
    </DefaultLayout>
  );
};

export default ListBookings;