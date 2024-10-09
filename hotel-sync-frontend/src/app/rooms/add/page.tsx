"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

const AddRoomForm = () => {
  const [formData, setFormData] = useState({
    room_number: "",
    room_type: "Single", // Default room type
    status: "available", // Default room status
    price: "",
    description: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Send the data to the backend API
    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        alert("Room added successfully!");
      } else {
        alert(result.message || "Failed to add room.");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Add Room" />

      <div className="flex justify-center">
        <div className="w-full">
          {/* Add Room Form */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">Add Room</h3>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6.5">
                {/* Room Number Field */}
                <div className="mb-4.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Room Number
                  </label>
                  <input
                    type="text"
                    name="room_number"
                    placeholder="Enter room number"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Room Type Field */}
                <div className="mb-4.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Room Type
                  </label>
                  <select
                    name="room_type"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    onChange={handleChange}
                    required
                  >
                    <option value="Single">Single</option>
                    <option value="Double">Double</option>
                    <option value="Suite">Suite</option>
                  </select>
                </div>

                {/* Status Field */}
                <div className="mb-4.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Status
                  </label>
                  <select
                    name="status"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    onChange={handleChange}
                    required
                  >
                    <option value="available">Available</option>
                    <option value="booked">Booked</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>

                {/* Price Field */}
                <div className="mb-4.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Price (per night)
                  </label>
                  <input
                    type="number"
                    name="price"
                    placeholder="Enter room price"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Description Field */}
                <div className="mb-5.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Description
                  </label>
                  <textarea
                    name="description"
                    placeholder="Enter room description"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    onChange={handleChange}
                  />
                </div>

                {/* Submit Button */}
                <button className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90">
                  Add Room
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default AddRoomForm;