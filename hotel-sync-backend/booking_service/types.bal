// Record type for request payload (New Type)
type EmailRequest record {|
    string email;
|};

// Record type for adding a booking
type AddBookingRequest record {| 
    int user_id;
    string room_category;
    string room_id;
    string check_in_date;
    string check_out_date;
    decimal total_price;
    string status;
|};

// Record type for booking with ID
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

// Record type for updating a booking
type BookingUpdateRequest record {| 
    int user_id;
    string room_category;
    string room_id;
    string check_in_date;
    string check_out_date;
    decimal total_price;
    string status;
|};

// Booking counts by date
type BookingCountByDate record {
    string date;
    int totalAppointments;
};

// Get bookings by date
type BookingDateRequest record {
    string date;
};

// Get bookings by date range for a room
type BookingDateRangeRequest record {
    string room_id;
    string check_in_date;
    string check_out_date;
};