"use client"; // Ensure this component is a Client Component

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

const AddUserForm = () => {
  const [formData, setFormData] = useState({
    nic: "",
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    retypePassword: "",
    role: "User", // Default role
    address: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.retypePassword) {
      alert("Passwords do not match!");
      return;
    }

    // Send the data to the backend API
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (response.ok) {
        alert("User created successfully!");
      } else {
        alert(result.message || "Failed to create user.");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Add User" />

      <div className="flex justify-center">
        <div className="w-full">
          {/* Add User Form */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">Add User</h3>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6.5">
                {/* NIC Field */}
                <div className="mb-4.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    NIC
                  </label>
                  <input
                    type="text"
                    name="nic"
                    placeholder="Enter NIC"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Name Field */}
                <div className="mb-4.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Email Field */}
                <div className="mb-4.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Phone Number Field */}
                <div className="mb-4.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phoneNumber"
                    placeholder="Enter your phone number"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Password Field */}
                <div className="mb-4.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Re-type Password Field */}
                <div className="mb-5.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Re-type Password
                  </label>
                  <input
                    type="password"
                    name="retypePassword"
                    placeholder="Re-enter password"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Role Field */}
                <div className="mb-4.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Role
                  </label>
                  <select
                    name="role"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    onChange={handleChange}
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>

                {/* Address Field */}
                <div className="mb-4.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    placeholder="Enter your address"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    onChange={handleChange}
                  />
                </div>

                {/* Submit Button */}
                <button className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90">
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default AddUserForm;
