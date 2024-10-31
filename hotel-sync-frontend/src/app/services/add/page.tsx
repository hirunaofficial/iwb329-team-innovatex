'use client';
import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { getToken } from '@/lib/tokenManager';
import Alert from "@/components/Alert";
import EmailTemplate from "@/components/EmailTemplate";

type AlertType = {
  type: 'success' | 'danger' | 'warning';
  message: string;
} | null;

type StaffMember = {
  id: number;
  name: string;
  email: string;
};

const AddServiceRequestForm = () => {
  const [formData, setFormData] = useState({
    description: "",
    status: "Pending",
    assigned_to_staff: "",
  });
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [alert, setAlert] = useState<AlertType>(null);

  // Fetch staff members from the API
  const fetchStaffMembers = async () => {
    const token = getToken();
    if (!token) {
      setAlert({ type: "danger", message: "Authorization token not available." });
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

      const data = await response.json();
      setStaffList(data);
    } catch (err) {
      setAlert({ type: "danger", message: err instanceof Error ? err.message : "An error occurred while fetching staff members." });
    }
  };

  useEffect(() => {
    fetchStaffMembers();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const token = getToken();
    if (!token) {
      setAlert({ type: "danger", message: "Authorization token not available." });
      return;
    }

    try {
      const finalData = {
        ...formData,
        assigned_to_staff: parseInt(formData.assigned_to_staff, 10),
      };

      const response = await fetch("http://localhost:9094/serviceRequests/addServiceRequest", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalData),
      });

      if (!response.ok) {
        throw new Error("Failed to create service request");
      }

      setAlert({ type: "success", message: "Service request created successfully!" });
      setFormData({ description: "", status: "Pending", assigned_to_staff: "" });

      // Automatically hide the alert after 3 seconds
      setTimeout(() => {
        setAlert(null);
      }, 3000);

      // Send email to the assigned staff member
      const assignedStaff = staffList.find(staff => staff.id === finalData.assigned_to_staff);
      if (assignedStaff) {
        await sendEmailNotification(assignedStaff, finalData.description);
      }
    } catch (err) {
      setAlert({ type: "danger", message: err instanceof Error ? err.message : "An error occurred while creating the service request." });

      // Automatically hide the alert after 3 seconds
      setTimeout(() => {
        setAlert(null);
      }, 3000);
    }
  };

  // Function to send email notification to the assigned staff member
  const sendEmailNotification = async (staff: StaffMember, description: string) => {
    const emailBody = EmailTemplate({
      children: `
        <p>Dear <strong>${staff.name}</strong>,</p>
        <p>You have been assigned a new service request. Please find the details below:</p>
        <p><strong>Service Request Description:</strong> ${description}</p>
        <p><strong>Status:</strong> Pending</p>
        <p>Please check the system for further details and take the necessary action.</p>
        <p>Thank you,<br />Service Management Team</p>
      `,
    });

    const emailData = {
      to: staff.email,
      subject: "New Service Request Assigned",
      body: emailBody,
    };

    try {
      const emailResponse = await fetch("http://localhost:9099/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailData),
      });

      if (!emailResponse.ok) {
        console.log("Failed to send email notification.");
      } else {
        console.log("Email notification sent successfully!");
      }
    } catch (error) {
      console.log("Error sending email notification:", error);
    }
  };

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Add Service Request" />

      {alert && <Alert type={alert.type} message={alert.message} />}

      <div className="flex justify-center">
        <div className="w-full">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">Add Service Request</h3>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-6.5">
                <div className="mb-4.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Service Request
                  </label>
                  <textarea
                    name="description"
                    placeholder="Enter service request description"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-4.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Assigned To (Staff)
                  </label>
                  <select
                    name="assigned_to_staff"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    value={formData.assigned_to_staff}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Staff Member</option>
                    {staffList.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-4.5">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Status
                  </label>
                  <select
                    name="status"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                >
                  Add Service Request
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default AddServiceRequestForm;