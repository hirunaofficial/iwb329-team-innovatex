'use client';
import { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaKey, FaSave, FaTimes } from "react-icons/fa";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { getToken } from '@/lib/tokenManager';
import Alert from "@/components/Alert";

// Record type for full room data
type Room = {
  id: number;
  room_number: string;
  room_type: string;
  status: 'available' | 'booked' | 'maintenance';
  price: number;
  description: string;
};

// Define the type for the alert state
type AlertType = {
  type: 'success' | 'danger' | 'warning';
  message: string;
} | null;

const RoomList = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editRoomId, setEditRoomId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Room>>({});
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<AlertType>(null);

  // Fetch rooms from the API
  useEffect(() => {
    const fetchRooms = async () => {
      const token = getToken();
      if (!token) {
        setError("Authorization token not available.");
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

        const data = await response.json();
        setRooms(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred while fetching rooms.");
      }
    };

    fetchRooms();
  }, []);

  // Handle room field edit
  const handleRoomEdit = (id: number) => {
    const roomToEdit = rooms.find((room) => room.id === id);
    if (roomToEdit) {
      setEditFormData(roomToEdit);
      setEditRoomId(id);
    }
  };

  const handleCancelEdit = () => {
    setEditRoomId(null);
    setEditFormData({});
  };

  const handleSaveRoom = async (id: number) => {
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:9092/rooms/updateRoom?id=${id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) throw new Error("Failed to update room data");

      // Update local state after saving
      setRooms((prevRooms) =>
        prevRooms.map((room) => (room.id === id ? { ...room, ...editFormData } : room))
      );
      setEditRoomId(null);
      setEditFormData({});

      // Show success alert
      setAlert({ type: "success", message: "Room information updated successfully!" });
    } catch (err) {
      setAlert({ type: "danger", message: err instanceof Error ? err.message : "An error occurred while updating room data." });
    }
  };

  const handleDeleteRoom = async (id: number) => {
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:9092/rooms/deleteRoom?id=${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to delete room");

      // Remove the room from the local state
      setRooms((prevRooms) => prevRooms.filter((room) => room.id !== id));

      // Show success alert
      setAlert({ type: "success", message: "Room deleted successfully!" });
    } catch (err) {
      setAlert({ type: "danger", message: err instanceof Error ? err.message : "An error occurred while deleting the room." });
    }
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: name === "price" ? parseFloat(value) : value,
    });
  };

  // Function to filter rooms based on the search term
  const filteredRooms = rooms.filter((room) =>
    room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.room_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    room.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Rooms" />

      {alert && <Alert type={alert.type} message={alert.message} />}

      <div className="flex flex-col gap-10">
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Search rooms..."
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
                    Room Number
                  </th>
                  <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                    Room Type
                  </th>
                  <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                    Status
                  </th>
                  <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                    Price
                  </th>
                  <th className="min-w-[200px] px-4 py-4 font-medium text-black dark:text-white">
                    Description
                  </th>
                  <th className="px-4 py-4 font-medium text-black dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRooms.map((room) => (
                  <tr key={room.id}>
                    {editRoomId === room.id ? (
                      <>
                        <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                          <input
                            type="text"
                            name="room_number"
                            value={editFormData.room_number || ""}
                            onChange={handleEditFormChange}
                            className="w-full border px-2 py-1"
                          />
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <input
                            type="text"
                            name="room_type"
                            value={editFormData.room_type || ""}
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
                            <option value="available">Available</option>
                            <option value="booked">Booked</option>
                            <option value="maintenance">Maintenance</option>
                          </select>
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <input
                            type="number"
                            name="price"
                            value={editFormData.price || ""}
                            onChange={handleEditFormChange}
                            className="w-full border px-2 py-1"
                          />
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <input
                            type="text"
                            name="description"
                            value={editFormData.description || ""}
                            onChange={handleEditFormChange}
                            className="w-full border px-2 py-1"
                          />
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <button
                            onClick={() => handleSaveRoom(room.id)}
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
                            {room.room_number}
                          </h5>
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <p className="text-black dark:text-white">
                            {room.room_type}
                          </p>
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <p
                            className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
                              room.status === "available"
                                ? "bg-success text-success"
                                : room.status === "booked"
                                ? "bg-warning text-warning"
                                : "bg-danger text-danger"
                            }`}
                          >
                            {room.status}
                          </p>
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <p className="text-black dark:text-white">${room.price}</p>
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <p className="text-black dark:text-white">
                            {room.description}
                          </p>
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <div className="flex items-center space-x-3.5">
                            <button
                              onClick={() => handleRoomEdit(room.id)}
                              className="hover:text-primary"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteRoom(room.id)}
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

export default RoomList;