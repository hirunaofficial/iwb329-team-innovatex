'use client';
import { FaEdit, FaTrash, FaKey, FaSave } from "react-icons/fa";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { useState } from "react";

type User = {
  nic: string;
  name: string;
  email: string;
  phone_number: string;
  address: string;
  role: string;
  status: string;
  password?: string;
};

const userData: User[] = [
  {
    nic: "200317700110",
    name: "Hiruna Gallage",
    email: "hello@hiruna.dev",
    phone_number: "0777123456",
    address: "123 Beach Road, Colombo",
    role: "Admin",
    status: "active",
    password: "",
  },
  {
    nic: "987654321V",
    name: "Jane Doe",
    email: "jane@example.com",
    phone_number: "0767123456",
    address: "45 Main Street, Colombo",
    role: "User",
    status: "inactive",
    password: "",
  },
  {
    nic: "951234567V",
    name: "Tom Smith",
    email: "tom@example.com",
    phone_number: "0717123456",
    address: "78 High Street, Kandy",
    role: "Staff",
    status: "active",
    password: "",
  },
];

const UserList = () => {
  const [users, setUsers] = useState<User[]>(userData);
  const [searchTerm, setSearchTerm] = useState(""); // New state for search term
  const [editPasswordId, setEditPasswordId] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [editUserId, setEditUserId] = useState<string | null>(null); // For editing entire row
  const [editFormData, setEditFormData] = useState<Partial<User>>({});

  const handlePasswordEdit = (nic: string) => {
    setEditPasswordId(nic);
  };

  const handleSavePassword = (nic: string) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.nic === nic ? { ...user, password: passwordInput } : user
      )
    );
    setEditPasswordId(null);
    setPasswordInput(""); // Clear input after saving
  };

  const handleUserEdit = (nic: string) => {
    setEditUserId(nic);
    const userToEdit = users.find((user) => user.nic === nic);
    setEditFormData(userToEdit || {}); // Pre-fill the form
  };

  const handleSaveUser = (nic: string) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.nic === nic ? { ...user, ...editFormData } : user))
    );
    setEditUserId(null);
    setEditFormData({}); // Clear form data
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  // Function to filter users based on the search term
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.nic.includes(searchTerm) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone_number.includes(searchTerm) ||
    user.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Users" />

      <div className="flex flex-col gap-10">
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-lg p-2 w-full"
          />
        </div>

        <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                  <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                    User
                  </th>
                  <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                    Email
                  </th>
                  <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                    Phone Number
                  </th>
                  <th className="min-w-[200px] px-4 py-4 font-medium text-black dark:text-white">
                    Address
                  </th>
                  <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                    Role
                  </th>
                  <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                    Status
                  </th>
                  <th className="px-4 py-4 font-medium text-black dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.nic}>
                    {/* Editable Row */}
                    {editUserId === user.nic ? (
                      <>
                        <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                          <input
                            type="text"
                            name="name"
                            value={editFormData.name || ""}
                            onChange={handleEditFormChange}
                            className="w-full border px-2 py-1"
                          />
                          <p className="text-sm">{user.nic}</p>
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <input
                            type="email"
                            name="email"
                            value={editFormData.email || ""}
                            onChange={handleEditFormChange}
                            className="w-full border px-2 py-1"
                          />
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <input
                            type="text"
                            name="phone_number"
                            value={editFormData.phone_number || ""}
                            onChange={handleEditFormChange}
                            className="w-full border px-2 py-1"
                          />
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <input
                            type="text"
                            name="address"
                            value={editFormData.address || ""}
                            onChange={handleEditFormChange}
                            className="w-full border px-2 py-1"
                          />
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <input
                            type="text"
                            name="role"
                            value={editFormData.role || ""}
                            onChange={handleEditFormChange}
                            className="w-full border px-2 py-1"
                          />
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <select
                            name="status"
                            value={editFormData.status || ""}
                            onChange={handleEditFormChange}
                            className="w-full border px-2 py-1"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <button
                            onClick={() => handleSaveUser(user.nic)}
                            className="hover:text-primary"
                          >
                            <FaSave />
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                          <h5 className="font-medium text-black dark:text-white">
                            {user.name}
                          </h5>
                          <p className="text-sm">{user.nic}</p>
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <p className="text-black dark:text-white">
                            {user.email}
                          </p>
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <p className="text-black dark:text-white">
                            {user.phone_number}
                          </p>
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <p className="text-black dark:text-white">
                            {user.address}
                          </p>
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <p className="text-black dark:text-white">
                            {user.role}
                          </p>
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <p
                            className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
                              user.status === "active"
                                ? "bg-success text-success"
                                : "bg-danger text-danger"
                            }`}
                          >
                            {user.status}
                          </p>
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <div className="flex items-center space-x-3.5">
                            {/* Change Password Icon */}
                            {editPasswordId === user.nic ? (
                              <>
                                <input
                                  type="password"
                                  value={passwordInput}
                                  onChange={(e) => setPasswordInput(e.target.value)}
                                  placeholder="New Password"
                                  className="rounded border px-2 py-1"
                                />
                                <button
                                  onClick={() => handleSavePassword(user.nic)}
                                  className="hover:text-primary"
                                >
                                  <FaSave />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handlePasswordEdit(user.nic)}
                                className="hover:text-primary"
                              >
                                <FaKey />
                              </button>
                            )}
                            <button
                              onClick={() => handleUserEdit(user.nic)}
                              className="hover:text-primary"
                            >
                              <FaEdit />
                            </button>
                            <button className="hover:text-primary">
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default UserList;