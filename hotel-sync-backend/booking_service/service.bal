import ballerina/http;
import ballerina/sql;
import ballerinax/mysql;
import ballerinax/mysql.driver as _;
import ballerina/jwt;
import ballerina/crypto;

configurable string host = ?;
configurable int port = ?;
configurable string user = ?;
configurable string password = ?;
configurable string database = ?;
configurable string secretKey = ?;
configurable string issuer = ?;
configurable string audience = ?;

function hashPassword(string password) returns string {
    byte[] hashedPassword = crypto:hashSha256(password.toBytes());
    return hashedPassword.toBase16();
}

@http:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost", "http://localhost:3000", "http://localhost:8080"],
        allowHeaders: ["Authorization", "Content-Type"],
        allowCredentials: true,
        maxAge: 3600
    }
}

service /bookings on new http:Listener(9093) {
    private final mysql:Client db;

    function init() returns error? {
        self.db = check new (host, user, password, database, port);
    }

// Add a new booking
resource function post addBooking(@http:Payload AddBookingRequest booking, http:Request req) returns http:Created|http:Response|http:Unauthorized|error {
    if !self.validateJWT(req) {
        return http:UNAUTHORIZED;
    }

    // Check for overlapping bookings
    if self.hasOverlappingBookings(booking.room_id, booking.check_in_date, booking.check_out_date) {
        http:Response response = new;
        response.statusCode = 204;
        response.setPayload("Overlapping booking found. Please select different dates.");
        return response;
    }

    sql:ParameterizedQuery query = `INSERT INTO bookings (user_id, room_category, room_id, check_in_date, check_out_date, total_price, status, created_at)
                                    VALUES (${booking.user_id}, ${booking.room_category}, ${booking.room_id}, ${booking.check_in_date}, ${booking.check_out_date}, 
                                            ${booking.total_price}, ${booking.status}, NOW())`;
    sql:ExecutionResult result = check self.db->execute(query);

    int? count = result.affectedRowCount;
    if count is int && count > 0 {
        return http:CREATED;
    } else {
        http:Response response = new;
        response.statusCode = 204;
        response.setPayload("Failed to create booking.");
        return response;
    }
}


    // Check for overlapping bookings
    function hasOverlappingBookings(string roomId, string checkInDate, string checkOutDate) returns boolean {
        sql:ParameterizedQuery query = `SELECT COUNT(*) AS booking_count FROM bookings
                                        WHERE room_id = ${roomId}
                                        AND ((check_in_date <= ${checkOutDate} AND check_out_date >= ${checkInDate}))`;

        stream<record {| int booking_count; |}, sql:Error?> bookingStream = self.db->query(query);
        int bookingCount = 0;
        error? e = bookingStream.forEach(function(record {| int booking_count; |} bookingRecord) {
            bookingCount = bookingRecord.booking_count;
        });

        // Handle potential errors when closing the stream
        var closeResult = bookingStream.close();
        if (closeResult is error) {
            return false;
        }

        return bookingCount > 0;
    }


    // Fetch bookings within a date range for a specific room
    resource function post getBookingsByDateRange(@http:Payload BookingDateRangeRequest dateRangeRequest, http:Request req) returns BookingWithId[]|http:Unauthorized|error {
        if !self.validateJWT(req) {
            return http:UNAUTHORIZED;
        }

        sql:ParameterizedQuery query = `SELECT id, user_id, room_category, room_id, check_in_date, check_out_date, total_price, status 
                                        FROM bookings 
                                        WHERE room_id = ${dateRangeRequest.room_id} 
                                        AND ((check_in_date <= ${dateRangeRequest.check_out_date} AND check_out_date >= ${dateRangeRequest.check_in_date}))`;
        
        stream<BookingWithId, sql:Error?> bookingStream = self.db->query(query);
        BookingWithId[] bookings = [];

        error? e = bookingStream.forEach(function(BookingWithId bookingRecord) {
            bookings.push(bookingRecord);
        });

        check bookingStream.close();
        return bookings;
    }

    // Fetch total bookings count per day
    resource function get getBookingCountPerDay(http:Request req) returns BookingCountByDate[]|http:Unauthorized|error {
        if !self.validateJWT(req) {
            return http:UNAUTHORIZED;
        }

        sql:ParameterizedQuery query = `SELECT check_in_date, COUNT(*) AS total_count 
                                        FROM bookings 
                                        GROUP BY check_in_date`;
        stream<record {| string check_in_date; int total_count; |}, sql:Error?> bookingStream = self.db->query(query);
        BookingCountByDate[] bookingCounts = [];
        
        error? e = bookingStream.forEach(function(record {| string check_in_date; int total_count; |} bookingRecord) {
            bookingCounts.push({
                date: bookingRecord.check_in_date,
                totalAppointments: bookingRecord.total_count
            });
        });

        check bookingStream.close();
        return bookingCounts;
    }

    // Fetch all bookings for a specific date (POST request)
    resource function post getBookingsByDate(http:Request req, @http:Payload BookingDateRequest dateRequest) returns BookingWithId[]|http:Unauthorized|error {
        if !self.validateJWT(req) {
            return http:UNAUTHORIZED;
        }

        sql:ParameterizedQuery query = `SELECT id, user_id, room_category, room_id, check_in_date, check_out_date, total_price, status 
                                        FROM bookings 
                                        WHERE check_in_date = ${dateRequest.date}`;
        stream<BookingWithId, sql:Error?> bookingStream = self.db->query(query);
        BookingWithId[] bookings = [];

        error? e = bookingStream.forEach(function(BookingWithId bookingRecord) {
            bookings.push(bookingRecord);
        });

        check bookingStream.close();
        return bookings;
    }

    // JWT validation function
    function validateJWT(http:Request req) returns boolean {
        var authHeaderResult = req.getHeader("Authorization");

        if authHeaderResult is string && authHeaderResult.startsWith("Bearer ") {
            string token = authHeaderResult.substring(7);

            jwt:ValidatorConfig validatorConfig = {
                issuer: issuer,
                audience: audience,
                signatureConfig: {
                    secret: secretKey
                }
            };

            jwt:Payload|error jwtResult = jwt:validate(token, validatorConfig);
            if jwtResult is jwt:Payload {
                return true;
            }
        }
        return false;
    }
}

// Record type for adding a booking (No ID needed)
type AddBookingRequest record {| 
    int user_id;
    string room_category;
    string room_id;
    string check_in_date;
    string check_out_date;
    decimal total_price;
    string status;
|};