'use client';
import { useState } from "react";
import { FaEdit, FaTrash, FaSave } from "react-icons/fa";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

// Define the type for service requests
type ServiceRequest = {
  user_id: number;
  request_text: string;
  status: "pending" | "in_progress" | "completed";
  assigned_to: number;
  created_at: string;
  updated_at: string;
};

const initialServiceRequests: ServiceRequest[] = [
  {
    user_id: 1,
    request_text: "Room cleaning required",
    status: "pending",
    assigned_to: 3,
    created_at: "2024-10-01 09:30:00",
    updated_at: "2024-10-01 09:30:00",
  },
  {
    user_id: 2,
    request_text: "Air conditioner malfunctioning",
    status: "in_progress",
    assigned_to: 4,
    created_at: "2024-10-02 12:00:00",
    updated_at: "2024-10-02 14:00:00",
  },
  {
    user_id: 3,
    request_text: "Need extra towels",
    status: "completed",
    assigned_to: 2,
    created_at: "2024-09-28 11:45:00",
    updated_at: "2024-09-28 12:00:00",
  },
];

const ListServiceRequests = () => {
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>(initialServiceRequests);
  const [searchTerm, setSearchTerm] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<ServiceRequest>>({});

  // Handle form input changes for editing
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  // Enable edit mode for a specific request
  const handleEdit = (index: number) => {
    setEditIndex(index);
    setEditFormData(serviceRequests[index]);
  };

  // Save the edited request
  const handleSave = (index: number) => {
    setServiceRequests((prevRequests) =>
      prevRequests.map((request, i) =>
        i === index ? { ...request, ...editFormData } : request
      )
    );
    setEditIndex(null); // Exit edit mode
  };

  // Delete request (dummy functionality)
  const handleDelete = (index: number) => {
    setServiceRequests((prevRequests) => prevRequests.filter((_, i) => i !== index));
  };

  // Function to filter service requests based on the search term
  const filteredRequests = serviceRequests.filter((request) =>
    request.request_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.user_id.toString().includes(searchTerm) ||
    request.assigned_to.toString().includes(searchTerm) ||
    request.status.includes(searchTerm.toLowerCase())
  );

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Service Requests" />

      <div className="flex flex-col gap-10">
        <div className="flex justify-between items-center mb-4">
          <input
            type="text"
            placeholder="Search service requests..."
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
                  <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                    User ID
                  </th>
                  <th className="min-w-[300px] px-4 py-4 font-medium text-black dark:text-white">
                    Service Request
                  </th>
                  <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                    Status
                  </th>
                  <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                    Assigned To (Staff ID)
                  </th>
                  <th className="min-w-[200px] px-4 py-4 font-medium text-black dark:text-white">
                    Created At
                  </th>
                  <th className="min-w-[200px] px-4 py-4 font-medium text-black dark:text-white">
                    Updated At
                  </th>
                  <th className="px-4 py-4 font-medium text-black dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request, index) => (
                  <tr key={index}>
                    {editIndex === index ? (
                      <>
                        <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                          <h5 className="font-medium text-black dark:text-white">
                            {request.user_id}
                          </h5>
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <input
                            type="text"
                            name="request_text"
                            value={editFormData.request_text || ""}
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
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <input
                            type="number"
                            name="assigned_to"
                            value={editFormData.assigned_to || ""}
                            onChange={handleEditFormChange}
                            className="w-full border px-2 py-1"
                          />
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <p className="text-black dark:text-white">
                            {new Date(request.created_at).toLocaleString()}
                          </p>
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <p className="text-black dark:text-white">
                            {new Date(request.updated_at).toLocaleString()}
                          </p>
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
                            {request.user_id}
                          </h5>
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <p className="text-black dark:text-white">
                            {request.request_text}
                          </p>
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <p
                            className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
                              request.status === "pending"
                                ? "bg-warning text-warning"
                                : request.status === "in_progress"
                                ? "bg-danger text-danger"
                                : "bg-success text-success"
                            }`}
                          >
                            {request.status}
                          </p>
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <p className="text-black dark:text-white">
                            {request.assigned_to}
                          </p>
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <p className="text-black dark:text-white">
                            {new Date(request.created_at).toLocaleString()}
                          </p>
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <p className="text-black dark:text-white">
                            {new Date(request.updated_at).toLocaleString()}
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

export default ListServiceRequests;