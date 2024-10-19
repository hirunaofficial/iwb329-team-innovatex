'use client';
import { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { getToken } from '@/lib/tokenManager';
import Alert from "@/components/Alert";

// Record type for service requests
type ServiceRequest = {
  id: number;
  description: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  assigned_to_staff: number;
  created_at: string;
  updated_at: string;
  staff_name: string;
};

// Record type for staff members
type StaffMember = {
  id: number;
  name: string;
};

// Define the type for the alert state
type AlertType = {
  type: 'success' | 'danger' | 'warning';
  message: string;
} | null;

const ServiceRequestList = () => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editRequestId, setEditRequestId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<ServiceRequest>>({});
  const [error, setError] = useState<string | null>(null);
  const [alert, setAlert] = useState<AlertType>(null);

  // Function to fetch staff members from the API
  const fetchStaffMembers = async () => {
    const token = getToken();
    if (!token) {
      setError("Authorization token not available.");
      return;
    }

    try {
      const response = await fetch("http://localhost:9091/users/getStaffMembers", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch staff members");
      }

      const data: StaffMember[] = await response.json();
      setStaffMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while fetching staff members.");
    }
  };

  // Function to fetch service requests from the API
  const fetchRequests = async () => {
    const token = getToken();
    if (!token) {
      setError("Authorization token not available.");
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

      const data: ServiceRequest[] = await response.json();
      const requestsWithStaffNames = data.map(request => ({
        ...request,
        staff_name: staffMembers.find(staff => staff.id === request.assigned_to_staff)?.name || "Unknown"
      }));

      setRequests(requestsWithStaffNames);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while fetching service requests.");
    }
  };

  // UseEffect to fetch staff members on component mount
  useEffect(() => {
    fetchStaffMembers();
  }, []);

  // UseEffect to fetch service requests when staff members are loaded
  useEffect(() => {
    if (staffMembers.length > 0) {
      fetchRequests();
    }
  }, [staffMembers]);

  // Handle service request edit
  const handleRequestEdit = (id: number) => {
    const requestToEdit = requests.find((request) => request.id === id);
    if (requestToEdit) {
      setEditFormData(requestToEdit);
      setEditRequestId(id);
    }
  };

  const handleCancelEdit = () => {
    setEditRequestId(null);
    setEditFormData({});
  };

  const handleSaveRequest = async (id: number) => {
    try {
      const token = getToken();
      
      const { id: _, created_at, updated_at, staff_name, ...updateData } = editFormData;
  
      // Ensure assigned_to_staff is a number
      if (updateData.assigned_to_staff && typeof updateData.assigned_to_staff === 'string') {
        updateData.assigned_to_staff = parseInt(updateData.assigned_to_staff, 10);
      }
  
      const response = await fetch(`http://localhost:9094/serviceRequests/updateServiceRequest?id=${id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });
  
      if (!response.ok) throw new Error("Failed to update service request");
  
      setRequests((prevRequests) =>
        prevRequests.map(request => (request.id === id ? { ...request, ...updateData } : request))
      );
  
      await fetchRequests();
  
      setEditRequestId(null);
      setEditFormData({});
      setAlert({ type: "success", message: "Service request updated successfully!" });
    } catch (err) {
      setAlert({ type: "danger", message: err instanceof Error ? err.message : "An error occurred while updating the service request." });
    }
  };  

  const handleDeleteRequest = async (id: number) => {
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:9094/serviceRequests/deleteServiceRequest?id=${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to delete service request");

      await fetchRequests();

      setAlert({ type: "success", message: "Service request deleted successfully!" });
    } catch (err) {
      setAlert({ type: "danger", message: err instanceof Error ? err.message : "An error occurred while deleting the service request." });
    }
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: name === "assigned_to_staff" ? parseInt(value) : value,
    });
  };

  // Function to filter requests based on the search term
  const filteredRequests = requests.filter((request) =>
    request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.assigned_to_staff.toString().includes(searchTerm)
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
                    Assigned Staff Name
                  </th>
                  <th className="min-w-[300px] px-4 py-4 font-medium text-black dark:text-white">
                    Service Request
                  </th>
                  <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                    Status
                  </th>
                  <th className="min-w-[200px] px-4 py-4 font-medium text-black dark:text-white">
                    Updated At
                  </th>
                  <th className="min-w-[200px] px-4 py-4 font-medium text-black dark:text-white">
                    Created At
                  </th>
                  <th className="px-4 py-4 font-medium text-black dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.id}>
                    {editRequestId === request.id ? (
                      <>
                        <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                          <select
                            name="assigned_to_staff"
                            value={editFormData.assigned_to_staff || ""}
                            onChange={handleEditFormChange}
                            className="w-full border px-2 py-1"
                          >
                            {staffMembers.map(staff => (
                              <option key={staff.id} value={staff.id}>
                                {staff.name}
                              </option>
                            ))}
                          </select>
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
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <p className="text-black dark:text-white">
                            {new Date(request.updated_at).toLocaleString()}
                          </p>
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <p className="text-black dark:text-white">
                            {new Date(request.created_at).toLocaleString()}
                          </p>
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <button
                            onClick={() => handleSaveRequest(request.id)}
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
                            {request.staff_name}
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
                              request.status === "Pending"
                                ? "bg-warning text-warning"
                                : request.status === "In Progress"
                                ? "bg-danger text-danger"
                                : "bg-success text-success"
                            }`}
                          >
                            {request.status}
                          </p>
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <p className="text-black dark:text-white">
                            {new Date(request.updated_at).toLocaleString()}
                          </p>
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <p className="text-black dark:text-white">
                            {new Date(request.created_at).toLocaleString()}
                          </p>
                        </td>
                        <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                          <div className="flex items-center space-x-3.5">
                            <button
                              onClick={() => handleRequestEdit(request.id)}
                              className="hover:text-primary"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteRequest(request.id)}
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

export default ServiceRequestList;