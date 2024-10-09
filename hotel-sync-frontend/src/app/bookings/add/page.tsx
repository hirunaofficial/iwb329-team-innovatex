'use client';
import { useState, useEffect } from 'react';
import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb';
import DefaultLayout from '@/components/Layouts/DefaultLayout';

type RoomCategory = 'Single' | 'Double' | 'Suite';

interface Room {
  id: number;
  name: string;
}

const roomData: Record<RoomCategory, Room[]> = {
  Single: [
    { id: 1, name: 'Room 101' },
    { id: 2, name: 'Room 102' },
  ],
  Double: [
    { id: 3, name: 'Room 201' },
    { id: 4, name: 'Room 202' },
  ],
  Suite: [
    { id: 5, name: 'Room 301' },
    { id: 6, name: 'Room 302' },
  ],
};

const AddBookingForm = () => {
  const [formData, setFormData] = useState({
    room_category: '' as RoomCategory | '',
    room_id: '',
    check_in_date: '',
    check_out_date: '',
    total_price: '',
    status: 'pending', // Default status
  });

  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Effect to fetch rooms based on the selected category
  useEffect(() => {
    if (formData.room_category) {
      // Fetch rooms based on the selected category
      const rooms = roomData[formData.room_category as RoomCategory] || [];
      setAvailableRooms(rooms);
    } else {
      setAvailableRooms([]);
    }
  }, [formData.room_category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Simulating form submission to a backend API
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        alert('Booking created successfully!');
      } else {
        alert(result.message || 'Failed to create booking.');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    }
  };

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Add Booking" />

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
                  >
                    <option value="">Select Room Category</option>
                    <option value="Single">Single</option>
                    <option value="Double">Double</option>
                    <option value="Suite">Suite</option>
                  </select>
                </div>

                <div className="mb-4.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Room ID
                  </label>
                  <select
                    name="room_id"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    onChange={handleChange}
                    required
                    disabled={!availableRooms.length}
                  >
                    <option value="">Select Room</option>
                    {availableRooms.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name}
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
                  />
                </div>

                <div className="mb-4.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Total Price
                  </label>
                  <input
                    type="number"
                    name="total_price"
                    placeholder="Enter Total Price"
                    step="0.01"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-4.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Status
                  </label>
                  <select
                    name="status"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    onChange={handleChange}
                    value={formData.status}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="canceled">Canceled</option>
                  </select>
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