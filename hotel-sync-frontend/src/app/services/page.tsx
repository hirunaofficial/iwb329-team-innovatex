'use client';
import { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaSave } from "react-icons/fa";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { getToken } from '@/lib/tokenManager';
import Alert from "@/components/Alert";

// Define the type for service requests
type ServiceRequest = {
  id: number;
  description: string;  // Updated to match API
  status: "pending" | "in_progress" | "completed";
  assigned_to_staff: number;  // Updated to match API
  created_at: string;
  updated_at: string;
};

// Define the type for the alert state
type AlertType = {
  type: 'success' | 'danger' | 'warning';
  message: string;
} | null;

const ListServiceRequests = () => {
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<ServiceRequest>>({});
  const [alert, setAlert] = useState<AlertType>(null);

  // Fetch service requests from the API
  useEffect(() => {
    const fetchServiceRequests = async () => {
      const token = getToken();
      if (!token) {
        setAlert({ type: "danger", message: "Authorization token not available." });
        return;
      }

      try {
        const response = await fetch("http://localhost:9094/serviceRequests/getServiceRequests", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch service requests");
        }

        const data = await response.json();
        setServiceRequests(data);
      } catch (err) {
        setAlert({ type: "danger", message: err instanceof Error ? err.message : "An error occurred while fetching service requests." });
      }
    };

    fetchServiceRequests();
  }, []);

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
  const handleSave = async (id: number) => {
    const token = getToken();
    if (!token) {
      setAlert({ type: "danger", message: "Authorization token not available." });
      return;
    }

    try {
      const response = await fetch(`http://localhost:9094/serviceRequests/updateServiceRequest/${id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) {
        throw new Error("Failed to update service request");
      }

      setServiceRequests((prevRequests) =>
        prevRequests.map((request) => (request.id === id ? { ...request, ...editFormData } : request))
      );
      setEditIndex(null);
      setEditFormData({});
      setAlert({ type: "success", message: "Service request updated successfully!" });
    } catch (err) {
      setAlert({ type: "danger", message: err instanceof Error ? err.message : "An error occurred while updating the service request." });
    }
  };

  // Delete request
  const handleDelete = async (id: number) => {
    const token = getToken();
    if (!token) {
      setAlert({ type: "danger", message: "Authorization token not available." });
      return;
    }

    try {
      const response = await fetch(`http://localhost:9094/serviceRequests/deleteServiceRequest/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete service request");
      }

      setServiceRequests((prevRequests) => prevRequests.filter((request) => request.id !== id));
      setAlert({ type: "success", message: "Service request deleted successfully!" });
    } catch (err) {
      setAlert({ type: "danger", message: err instanceof Error ? err.message : "An error occurred while deleting the service request." });
    }
  };

  // Function to filter service requests based on the search term
  const filteredRequests = serviceRequests.filter((request) =>
    request.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
    request.assigned_to_staff.toString().includes(searchTerm) ||
    request.status.includes(searchTerm.toLowerCase())
  );

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Service Requests" />

      {alert && <Alert type={alert.type} message={alert.message} />}

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
                    Assigned Staff ID
                  </th>
                  <th className="min-w-[300px] px-4 py-4 font-medium text-black dark:text-white">
                    Service Request
                  </th>
                  <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                    Status
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
                  <tr key={request.id}>
                    {editIndex === index ? (
                      <>
                        <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                          <input
                            type="number"
                            name="assigned_to_staff"
                            value={editFormData.assigned_to_staff || ""}
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
                            onClick={() => handleSave(request.id)}
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
                            {request.assigned_to_staff}
                          </h5>
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <p className="text-black dark:text-white">
                            {request.description}
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
                              onClick={() => handleDelete(request.id)}
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