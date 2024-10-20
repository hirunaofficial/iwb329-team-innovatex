// Record type for booking with ID (used when fetching bookings)
type BookingWithId record {| 
    int id;
    int user_id;
    string room_category;
    string room_id;
    string check_in_date;
    string check_out_date;
    decimal total_price;
    string status;
|};

// Record type for updating a booking (No ID, but similar to AddBookingRequest)
type BookingUpdateRequest record {| 
    int user_id;
    string room_category;
    string room_id;
    string check_in_date;
    string check_out_date;
    decimal total_price;
    string status;
|};

// Define a custom type for booking counts by date
type BookingCountByDate record {
    string date;
    int totalAppointments;
};

// Define the payload type for the POST request to get bookings by date
type BookingDateRequest record {
    string date;
};

// Define the payload type for the POST request to get bookings by date range for a room
type BookingDateRangeRequest record {
    string room_id;
    string check_in_date;
    string check_out_date;
};