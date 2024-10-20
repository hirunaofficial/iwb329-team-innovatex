'use client';
import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSave } from 'react-icons/fa';
import { useParams, useRouter } from 'next/navigation';
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { getToken } from '@/lib/tokenManager';
import Alert from "@/components/Alert";
import EmailTemplate from "@/components/EmailTemplate";

// Define the Booking interface
interface Booking {
  id: number;
  user_id: number;
  room_category: string;
  room_id: string;
  check_in_date: string;
  check_out_date: string;
  total_price: number;
  status: string;
}

// Define the User interface
interface User {
  id: number;
  name: string;
  email: string;
}

// Define the Room interface
interface Room {
  room_number: string;
  room_type: string;
  price: number;
}

// Define the type for the alert state
type AlertType = {
  type: 'success' | 'danger' | 'warning';
  message: string;
} | null;

const BookingsForDate: React.FC = () => {
  const { date } = useParams();
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [editBookingId, setEditBookingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Booking>>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [alert, setAlert] = useState<AlertType>(null);

  // Fetch users for mapping user_id to user names
  const fetchUsers = async () => {
    const token = getToken();
    if (!token) {
      setAlert({ type: "danger", message: "Authorization token not available." });
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

      const data: User[] = await response.json();
      setUsers(data);
    } catch (err) {
      setAlert({ type: "danger", message: err instanceof Error ? err.message : "An error occurred while fetching users." });
    }
  };

  // Fetch room details for calculating the total price
  const fetchRooms = async () => {
    const token = getToken();
    if (!token) {
      setAlert({ type: "danger", message: "Authorization token not available." });
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

      const data: Room[] = await response.json();
      setRooms(data);
    } catch (err) {
      setAlert({ type: "danger", message: err instanceof Error ? err.message : "An error occurred while fetching rooms." });
    }
  };

  // Fetch bookings for the selected date
  useEffect(() => {
    const fetchBookings = async () => {
      const token = getToken();
      if (!token) {
        setAlert({ type: "danger", message: "Authorization token not available." });
        return;
      }

      try {
        const response = await fetch("http://localhost:9093/bookings/getBookingsByDate", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ date }),
        });

        if (!response.ok) {
          throw new Error("Failed to fetch bookings");
        }

        const data: Booking[] = await response.json();
        setBookings(data);
      } catch (err) {
        setAlert({ type: "danger", message: err instanceof Error ? err.message : "An error occurred while fetching bookings." });
      }
    };

    fetchUsers(); // Fetch users on load
    fetchRooms(); // Fetch room details on load
    fetchBookings(); // Fetch bookings for the selected date
  }, [date]);

  // Handle form input changes for editing
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'check_in_date' || name === 'check_out_date') {
      updateTotalPrice(value, name);
    }
  };

  // Automatically update the total price based on the room rate and date difference
  const updateTotalPrice = (newDateValue: string, fieldName: string) => {
    const checkInDate = fieldName === 'check_in_date' ? new Date(newDateValue) : new Date(editFormData.check_in_date!);
    const checkOutDate = fieldName === 'check_out_date' ? new Date(newDateValue) : new Date(editFormData.check_out_date!);
    const selectedRoom = rooms.find(room => room.room_number === editFormData.room_id);

    if (checkInDate && checkOutDate && selectedRoom) {
      const daysDifference = Math.floor((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDifference > 0) {
        const updatedTotalPrice = daysDifference * selectedRoom.price;
        setEditFormData((prev) => ({
          ...prev,
          total_price: updatedTotalPrice,
        }));
      }
    }
  };

  // Handle the edit action
  const handleEdit = (id: number) => {
    setEditBookingId(id);
    const bookingToEdit = bookings.find((booking) => booking.id === id);
    setEditFormData(bookingToEdit ? { ...bookingToEdit } : {});
  };

  // Redirect after update
  const redirectAfterUpdate = (newCheckInDate: string) => {
    router.push(`/bookings/${newCheckInDate}`);
  };

  // Handle deleting a booking
  const handleDelete = async (id: number) => {
    const confirmDelete = confirm("Are you sure you want to delete this booking?");
    if (!confirmDelete) return;

    const token = getToken();
    if (!token) {
      setAlert({ type: "danger", message: "Authorization token not available." });
      return;
    }

    try {
      const response = await fetch(`http://localhost:9093/bookings/deleteBooking?id=${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete booking");
      }

      setBookings((prevBookings) => prevBookings.filter((booking) => booking.id !== id));
      setAlert({ type: "success", message: "Booking deleted successfully!" });
    } catch (err) {
      setAlert({ type: "danger", message: err instanceof Error ? err.message : "An error occurred while deleting the booking." });
    }
  };

  // Send Email to the user after updating booking
  const sendEmail = async (user: User, booking: Booking) => {
    const emailBody = EmailTemplate({
      children: `
        <p>Dear <strong>${user.name}</strong>,</p>
        <p>Your booking details have been successfully updated:</p>
        <p><strong>Room:</strong> ${booking.room_category}, Room ID: ${booking.room_id}</p>
        <p><strong>Check-in Date:</strong> ${booking.check_in_date}</p>
        <p><strong>Check-out Date:</strong> ${booking.check_out_date}</p>
        <p><strong>Total Price:</strong> ${booking.total_price}</p>
        <p><strong>Status:</strong> ${booking.status}</p>
      `,
    });

    const emailData = {
      to: user.email,
      subject: "Booking Update Confirmation",
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
        console.log("Failed to send email.");
      } else {
        console.log("Email sent successfully!");
      }
    } catch (error) {
      console.log("Error sending email:", error);
    }
  };

  // Save the edited booking
  const handleSave = async (id: number) => {
    const token = getToken();
    if (!token) {
      setAlert({ type: "danger", message: "Authorization token not available." });
      return;
    }

    try {
      const { id: _, ...updateData } = editFormData as Booking; // Exclude the id

      const response = await fetch(`http://localhost:9093/bookings/updateBooking?id=${id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error("Failed to update booking");
      }

      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === id ? { ...booking, ...updateData } : booking
        )
      );
      setEditBookingId(null);
      setAlert({ type: "success", message: "Booking updated successfully!" });

      // Send email after booking update
      const updatedBooking = bookings.find(b => b.id === id);
      const user = users.find(u => u.id === updatedBooking?.user_id);
      if (user && updatedBooking) {
        await sendEmail(user, updatedBooking);
      }

      // Redirect to new check-in date after update
      if (editFormData.check_in_date) {
        redirectAfterUpdate(editFormData.check_in_date);
      }
    } catch (err) {
      setAlert({ type: "danger", message: err instanceof Error ? err.message : "An error occurred while updating the booking." });
    }
  };

  // Map user_id to user name
  const getUserName = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : "Unknown User";
  };

  // Function to filter bookings based on the search term
  const filteredBookings = bookings.filter((booking) =>
    getUserName(booking.user_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.room_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.room_id.includes(searchTerm) ||
    booking.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-7xl">
        <Breadcrumb pageName={date ? `Bookings for ${date}` : "All Bookings"} />
        {alert && <Alert type={alert.type} message={alert.message} />}
        <div className="flex flex-col gap-10">
          <div className="flex justify-between items-center mb-4">
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded-lg p-2 w-full"
            />
          </div>
          <div className="w-full max-w-full rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                  <th className="px-4 py-4 font-medium text-black dark:text-white">Guest</th>
                  <th className="px-4 py-4 font-medium text-black dark:text-white">Room Category</th>
                  <th className="px-4 py-4 font-medium text-black dark:text-white">Room ID</th>
                  <th className="px-4 py-4 font-medium text-black dark:text-white">Check-In Date</th>
                  <th className="px-4 py-4 font-medium text-black dark:text-white">Check-Out Date</th>
                  <th className="px-4 py-4 font-medium text-black dark:text-white">Total Price</th>
                  <th className="px-4 py-4 font-medium text-black dark:text-white">Status</th>
                  <th className="px-4 py-4 font-medium text-black dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length > 0 ? (
                  filteredBookings.map((booking) => (
                    <tr key={booking.id}>
                      {editBookingId === booking.id ? (
                        <>
                          <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                            {getUserName(booking.user_id)}
                          </td>
                          <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                            {booking.room_category}
                          </td>
                          <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                            {booking.room_id}
                          </td>
                          <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                            <input
                              type="date"
                              name="check_in_date"
                              value={editFormData.check_in_date || ''}
                              onChange={handleEditFormChange}
                              className="w-full border px-2 py-1"
                            />
                          </td>
                          <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                            <input
                              type="date"
                              name="check_out_date"
                              value={editFormData.check_out_date || ''}
                              onChange={handleEditFormChange}
                              className="w-full border px-2 py-1"
                            />
                          </td>
                          <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                            {editFormData.total_price || booking.total_price}
                          </td>
                          <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                            <select
                              name="status"
                              value={editFormData.status || ''}
                              onChange={handleEditFormChange}
                              className="w-full border px-2 py-1"
                            >
                              <option value="pending">Pending</option>
                              <option value="approved">Approved</option>
                              <option value="canceled">Canceled</option>
                            </select>
                          </td>
                          <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                            <button
                              onClick={() => handleSave(booking.id)}
                              aria-label="Save booking"
                            >
                              <FaSave />
                            </button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                            {getUserName(booking.user_id)}
                          </td>
                          <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                            {booking.room_category}
                          </td>
                          <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                            {booking.room_id}
                          </td>
                          <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                            {booking.check_in_date}
                          </td>
                          <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                            {booking.check_out_date}
                          </td>
                          <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                            {booking.total_price}
                          </td>
                          <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                            {booking.status}
                          </td>
                          <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                            <div className="flex items-center space-x-3.5">
                              <button
                                onClick={() => handleEdit(booking.id)}
                                aria-label="Edit booking"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleDelete(booking.id)}
                                aria-label="Delete booking"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-4">
                      {date ? "No bookings for this day." : "No bookings available."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default BookingsForDate;