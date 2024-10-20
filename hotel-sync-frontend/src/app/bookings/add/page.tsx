'use client';
import { useState, useEffect } from 'react';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '@/components/Layouts/DefaultLayout';
import { getToken } from '@/lib/tokenManager';
import Alert from "@/components/Alert";
import EmailTemplate from "@/components/EmailTemplate";

type RoomCategory = 'Single' | 'Double' | 'Suite';

interface Room {
  id: string;
  room_type: RoomCategory;
  room_number: string;
  price: number;
}

const AddBookingForm = () => {
  const [formData, setFormData] = useState({
    room_category: '' as RoomCategory | '',
    room_id: '',
    check_in_date: '',
    check_out_date: '',
    total_price: 0,
    user_id: 1, // Replace with actual user ID as needed
  });

  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger', message: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (e.target.name === 'check_in_date' || e.target.name === 'check_out_date') {
      updateTotalPrice(e.target.value, e.target.name);
    }
  };

  // Fetch available rooms
  const fetchRooms = async () => {
    const token = getToken();
    if (!token) {
      setAlert({ type: 'danger', message: "Authorization token not available." });
      return;
    }

    try {
      const response = await fetch("http://localhost:9092/rooms/getRooms", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch rooms");
      }

      const data: Room[] = await response.json();
      setAllRooms(data);
    } catch (err) {
      setAlert({ type: 'danger', message: "An error occurred while fetching rooms." });
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Effect to update available rooms based on the selected category
  useEffect(() => {
    if (formData.room_category) {
      const filteredRooms = allRooms.filter(
        room => room.room_type === formData.room_category
      );
      setAvailableRooms(filteredRooms);
    } else {
      setAvailableRooms([]);
    }
  }, [formData.room_category, allRooms]);

  // Automatically update the total price based on the room rate and date difference
  const updateTotalPrice = (newDateValue: string, fieldName: string) => {
    const checkInDate = fieldName === 'check_in_date' ? new Date(newDateValue) : new Date(formData.check_in_date);
    const checkOutDate = fieldName === 'check_out_date' ? new Date(newDateValue) : new Date(formData.check_out_date);
    const selectedRoom = allRooms.find(room => room.room_number === formData.room_id);

    if (checkInDate && checkOutDate && selectedRoom) {
      const daysDifference = Math.floor((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDifference > 0) {
        const updatedTotalPrice = daysDifference * selectedRoom.price;
        setFormData((prev) => ({
          ...prev,
          total_price: updatedTotalPrice,
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check for overlapping bookings
    const isOverlapping = await checkForOverlappingBookings();
    if (isOverlapping) {
      setAlert({ type: 'danger', message: "Selected room is already booked for the given dates." });
      return;
    }

    const token = getToken();
    if (!token) {
      setAlert({ type: 'danger', message: "Authorization token not available." });
      return;
    }

    try {
      const response = await fetch('http://localhost:9093/bookings/addBooking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          total_price: parseFloat(formData.total_price.toString()), // Convert to decimal
          status: 'approved',
        }),
      });

      if (response.status === 201) {
        setAlert({ type: 'success', message: 'Booking created successfully!' });
        setFormData({
          room_category: '',
          room_id: '',
          check_in_date: '',
          check_out_date: '',
          total_price: 0,
          user_id: 1, // Reset as needed
        });
        await sendEmailToUser();
      } else {
        const result = await response.json();
        setAlert({ type: 'danger', message: result.message || 'Failed to create booking.' });
      }
    } catch (error) {
      setAlert({ type: 'danger', message: 'An error occurred. Please try again.' });
    }
  };

  // Function to send email after booking
  const sendEmailToUser = async () => {
    const emailBody = EmailTemplate({
      children: `
        <p>Dear User,</p>
        <p>Your booking has been confirmed. Here are the details:</p>
        <p><strong>Room Category:</strong> ${formData.room_category}</p>
        <p><strong>Room ID:</strong> ${formData.room_id}</p>
        <p><strong>Check-In Date:</strong> ${formData.check_in_date}</p>
        <p><strong>Check-Out Date:</strong> ${formData.check_out_date}</p>
        <p><strong>Total Price:</strong> ${formData.total_price}</p>
      `,
    });

    const emailData = {
      to: 'user@example.com', // Replace with actual user email
      subject: "Booking Confirmation",
      body: emailBody,
    };

    try {
      const response = await fetch("http://localhost:9099/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        setAlert({ type: 'danger', message: "Failed to send booking confirmation email." });
      }
    } catch (error) {
      setAlert({ type: 'danger', message: "Error sending booking confirmation email." });
    }
  };

  // Function to check for overlapping bookings
  const checkForOverlappingBookings = async () => {
    const token = getToken();
    if (!token) {
      setAlert({ type: 'danger', message: "Authorization token not available." });
      return false;
    }

    try {
      const response = await fetch("http://localhost:9093/bookings/getBookingsByDateRange", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          room_id: formData.room_id,
          check_in_date: formData.check_in_date,
          check_out_date: formData.check_out_date,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to check overlapping bookings");
      }

      const data = await response.json();
      return data.length > 0;
    } catch (err) {
      setAlert({ type: 'danger', message: "An error occurred while checking availability." });
      return false;
    }
  };

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Add Booking" />

      {alert && <Alert type={alert.type} message={alert.message} />}

      <div className="flex justify-center">
        <div className="w-full">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">Add Booking</h3>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6.5">
                <div className="mb-4.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Room Category
                  </label>
                  <select
                    name="room_category"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    onChange={handleChange}
                    required
                    value={formData.room_category}
                  >
                    <option value="">Select Room Category</option>
                    <option value="Single">Single</option>
                    <option value="Double">Double</option>
                    <option value="Suite">Suite</option>
                  </select>
                </div>

                <div className="mb-4.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Room
                  </label>
                  <select
                    name="room_id"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    onChange={handleChange}
                    required
                    value={formData.room_id}
                    disabled={!availableRooms.length}
                  >
                    <option value="">Select Room</option>
                    {availableRooms.map((room) => (
                      <option key={room.room_number} value={room.room_number}>
                        {room.room_number}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Check-In Date
                  </label>
                  <input
                    type="date"
                    name="check_in_date"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    onChange={handleChange}
                    required
                    value={formData.check_in_date}
                  />
                </div>

                <div className="mb-4.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Check-Out Date
                  </label>
                  <input
                    type="date"
                    name="check_out_date"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    onChange={handleChange}
                    required
                    value={formData.check_out_date}
                  />
                </div>

                <div className="mb-4.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Total Price
                  </label>
                  <input
                    type="number"
                    name="total_price"
                    step="0.01"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    value={formData.total_price}
                    readOnly
                  />
                </div>

                <button className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90">
                  Add Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default AddBookingForm;