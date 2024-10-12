'use client';
import { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaKey, FaSave, FaTimes } from "react-icons/fa";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { getToken } from '@/lib/tokenManager';
import Alert from "@/components/Alert";

// Record type for full user data (used for adding users with password)
type Users = {
  id: number;
  nic: string;
  name: string;
  email: string;
  phone_number: string;
  address: string;
  role: 'Admin' | 'Staff' | 'User';
  status: 'active' | 'inactive';
};

// Define the type for the alert state
type AlertType = {
  type: 'success' | 'danger' | 'warning';
  message: string;
} | null;

const UserList = () => {
  const [users, setUsers] = useState<Users[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editPasswordId, setEditPasswordId] = useState<number | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Users>>({});
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<AlertType>(null);

  // Fetch users from the API
  useEffect(() => {
    const fetchUsers = async () => {
      const token = getToken();
      if (!token) {
        setError("Authorization token not available.");
        return;
      }

      try {
        const response = await fetch("http://localhost:9091/users/getUsers", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred while fetching users.");
      }
    };

    fetchUsers();
  }, []);

  // Handle password edit
  const handlePasswordEdit = (id: number) => {
    setEditPasswordId(id);
  };

  const handleSavePassword = async (id: number) => {
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:9091/users/updatePassword?id=${id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ new_password: passwordInput }), // Send new password only
      });

      if (!response.ok) throw new Error("Failed to update password");

      setEditPasswordId(null);
      setPasswordInput("");

      // Show success alert
      setAlert({ type: "success", message: "Password updated successfully!" });
    } catch (err) {
      setAlert({ type: "danger", message: err instanceof Error ? err.message : "An error occurred while updating password." });
    }
  };

  // Cancel password edit
  const handleCancelPasswordEdit = () => {
    setEditPasswordId(null);
    setPasswordInput("");
  };

  // Handle user field edit
  const handleUserEdit = (id: number) => {
    const userToEdit = users.find((user) => user.id === id);
    if (userToEdit) {
      setEditFormData(userToEdit);
      setEditUserId(id);
    }
  };

  const handleCancelEdit = () => {
    setEditUserId(null);
    setEditFormData({});
  };

  const handleSaveUser = async (id: number) => {
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:9091/users/updateUserInfo?id=${id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editFormData), // Send updated user data (excluding password)
      });

      if (!response.ok) throw new Error("Failed to update user data");

      // Update local state after saving
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === id ? { ...user, ...editFormData } : user))
      );
      setEditUserId(null);
      setEditFormData({});

      // Show success alert
      setAlert({ type: "success", message: "User information updated successfully!" });
    } catch (err) {
      setAlert({ type: "danger", message: err instanceof Error ? err.message : "An error occurred while updating user data." });
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:9091/users/deleteUser?id=${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to delete user");

      // Remove the user from the local state
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));

      // Show success alert
      setAlert({ type: "success", message: "User deleted successfully!" });
    } catch (err) {
      setAlert({ type: "danger", message: err instanceof Error ? err.message : "An error occurred while deleting the user." });
    }
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

      {alert && <Alert type={alert.type} message={alert.message} />}

      <div className="flex flex-col gap-10">
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded-lg p-2 w-full"
            autoComplete="off"
            name=""
          />
        </div>

        {error && <p className="text-red-500">{error}</p>}

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
                  <tr key={user.id}>
                    {editUserId === user.id ? (
                      <>

                        <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                          <input
                            type="text"
                            name="name"
                            value={editFormData.name || ""}
                            onChange={handleEditFormChange}
                            className="w-full border px-2 py-1"
                          />
                          <p className="text-sm">
                            <input
                              type="text"
                              name="nic"
                              value={editFormData.nic || ""}
                              onChange={handleEditFormChange}
                              className="w-full border px-2 py-1"
                            />
                          </p>
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
                          <select
                            name="role"
                            value={editFormData.role || user.role}
                            onChange={handleEditFormChange}
                            className="w-full border px-2 py-1"
                          >
                            <option value="Admin">Admin</option>
                            <option value="Staff">Staff</option>
                            <option value="User">User</option>
                          </select>
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <select
                            name="status"
                            value={editFormData.status || user.status}
                            onChange={handleEditFormChange}
                            className="w-full border px-2 py-1"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <button
                            onClick={() => handleSaveUser(user.id)}
                            className="hover:text-primary"
                          >
                            <FaSave />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="hover:text-red-500 ml-3"
                          >
                            <FaTimes />
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
                            {editPasswordId === user.id ? (
                              <>
                                <input
                                  type="password"
                                  value={passwordInput}
                                  onChange={(e) => setPasswordInput(e.target.value)}
                                  placeholder="New Password"
                                  className="rounded border px-2 py-1"
                                  autoComplete="new-password"
                                />
                                <button
                                  onClick={() => handleSavePassword(user.id)}
                                  className="hover:text-primary"
                                >
                                  <FaSave />
                                </button>
                                <button
                                  onClick={handleCancelPasswordEdit}
                                  className="hover:text-red-500 ml-3"
                                >
                                  <FaTimes />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handlePasswordEdit(user.id)}
                                className="hover:text-primary"
                              >
                                <FaKey />
                              </button>
                            )}
                            <button
                              onClick={() => handleUserEdit(user.id)}
                              className="hover:text-primary"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="hover:text-primary"
                            >
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