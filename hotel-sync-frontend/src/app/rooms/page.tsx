'use client';
import { useState } from "react";
import { FaEdit, FaTrash, FaSave } from "react-icons/fa";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

type Room = {
  room_number: string;
  room_type: string;
  status: string;
  price: number;
  description: string;
};

const initialRoomData: Room[] = [
  {
    room_number: "101",
    room_type: "Single",
    status: "available",
    price: 75.0,
    description: "A cozy single room with sea view.",
  },
  {
    room_number: "102",
    room_type: "Double",
    status: "booked",
    price: 120.0,
    description: "Spacious double room with garden view.",
  },
  {
    room_number: "103",
    room_type: "Suite",
    status: "maintenance",
    price: 250.0,
    description: "Luxurious suite with a private balcony.",
  },
];

const ListRooms = () => {
  const [rooms, setRooms] = useState<Room[]>(initialRoomData);
  const [editRoomIndex, setEditRoomIndex] = useState<number | null>(null); // Track which room is being edited
  const [editFormData, setEditFormData] = useState<Partial<Room>>({}); // Store the edited form data

  // Handle form input changes for editing
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: name === "price" ? parseFloat(value) : value, // Parse price to number
    });
  };

  // Handle the edit action
  const handleEdit = (index: number) => {
    setEditRoomIndex(index); // Set the current room in edit mode
    setEditFormData(rooms[index]); // Pre-fill the edit form with current room data
  };

  // Save the edited room
  const handleSave = (index: number) => {
    setRooms((prevRooms) =>
      prevRooms.map((room, i) => (i === index ? { ...room, ...editFormData } : room))
    );
    setEditRoomIndex(null); // Exit edit mode
    setEditFormData({}); // Clear the edit form data
  };

  // Delete a room (dummy functionality)
  const handleDelete = (index: number) => {
    setRooms((prevRooms) => prevRooms.filter((_, i) => i !== index));
  };

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Rooms" />

      <div className="flex flex-col gap-10">
        <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                  <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
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
                {rooms.map((room, index) => (
                  <tr key={index}>
                    {/* Editable Row */}
                    {editRoomIndex === index ? (
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
                            onClick={() => handleSave(index)}
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
                              onClick={() => handleEdit(index)}
                              className="hover:text-primary"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(index)}
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

export default ListRooms;
