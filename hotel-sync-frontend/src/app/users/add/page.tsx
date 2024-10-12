"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";

const AddUserForm = () => {
  const [formData, setFormData] = useState({
    nic: "",
    name: "",
    email: "",
    phone_number: "",
    address: "",
    password: "",
    role: "User",
  });
  
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset any previous messages
    setFormError(null);
    setFormSuccess(null);
    setPasswordError("");

    // Basic password validation example
    if (formData.password.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }

    // Prepare data for API
    const userWithPassword = {
      nic: formData.nic,
      name: formData.name,
      email: formData.email,
      phone_number: formData.phone_number,
      address: formData.address,
      password_hash: formData.password,
      role: formData.role,
    };

    // Send the data to the backend API
    try {
      const response = await fetch("http://localhost:9091/users/addUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(userWithPassword),
      });

      if (response.ok) {
        setFormSuccess("User created successfully!");
        // Clear form after success
        setFormData({
          nic: "",
          name: "",
          email: "",
          phone_number: "",
          address: "",
          password: "",
          role: "User",
        });
      } else {
        const result = await response.json();
        setFormError(result.message || "Failed to create user.");
      }
    } catch (error) {
      setFormError("An error occurred. Please try again.");
    }
  };

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Add User" />

      <div className="flex justify-center">
        <div className="w-full">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">Add User</h3>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6.5">
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
                    value={formData.nic}
                    required
                  />
                </div>

                <div className="mb-4.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your full name"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    onChange={handleChange}
                    value={formData.name}
                    required
                  />
                </div>

                <div className="mb-4.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    onChange={handleChange}
                    value={formData.email}
                    required
                  />
                </div>

                <div className="mb-4.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    placeholder="Enter your phone number"
                    pattern="[0-9]{10}"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    onChange={handleChange}
                    value={formData.phone_number}
                    required
                  />
                </div>

                <div className="mb-4.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    placeholder="Enter your address"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    onChange={handleChange}
                    value={formData.address}
                  />
                </div>

                <div className="mb-4.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    onChange={handleChange}
                    value={formData.password}
                    required
                  />
                  {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
                </div>

                <div className="mb-4.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Role
                  </label>
                  <select
                    name="role"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    onChange={handleChange}
                    value={formData.role}
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                    <option value="Staff">Staff</option>
                  </select>
                </div>

                {formError && <p className="text-red-500 text-sm mb-4.5">{formError}</p>}
                {formSuccess && <p className="text-green-500 text-sm mb-4.5">{formSuccess}</p>}

                <button className="flex w-full justify-center rounded bg-primary p-3 font-medium text-white hover:bg-opacity-90">
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