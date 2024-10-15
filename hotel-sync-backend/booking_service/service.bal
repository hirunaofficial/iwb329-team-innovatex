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
    resource function post addBooking(@http:Payload AddBookingRequest booking, http:Request req) returns http:Created|http:NoContent|http:Unauthorized|error {
        if !self.validateJWT(req) {
            return http:UNAUTHORIZED;
        }

        sql:ParameterizedQuery query = `INSERT INTO bookings (guest, room_category, room_id, check_in_date, check_out_date, total_price, status, created_at)
                                        VALUES (${booking.guest}, ${booking.room_category}, ${booking.room_id}, ${booking.check_in_date}, ${booking.check_out_date}, 
                                                ${booking.total_price}, ${booking.status}, NOW())`;
        sql:ExecutionResult result = check self.db->execute(query);

        int? count = result.affectedRowCount;
        if count is int && count > 0 {
            return http:CREATED;
        } else {
            return http:NO_CONTENT;
        }
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

        sql:ParameterizedQuery query = `SELECT id, guest, room_category, room_id, check_in_date, check_out_date, total_price, status 
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

    // Update booking information (Requires booking ID)
    resource function put updateBooking(int id, @http:Payload BookingUpdateRequest booking, http:Request req) returns http:Ok|http:NoContent|http:Unauthorized|error {
        if !self.validateJWT(req) {
            return http:UNAUTHORIZED;
        }

        sql:ParameterizedQuery query = `UPDATE bookings 
                                        SET guest = ${booking.guest}, 
                                            room_category = ${booking.room_category}, 
                                            room_id = ${booking.room_id}, 
                                            check_in_date = ${booking.check_in_date}, 
                                            check_out_date = ${booking.check_out_date}, 
                                            total_price = ${booking.total_price}, 
                                            status = ${booking.status}
                                        WHERE id = ${id}`;
        sql:ExecutionResult result = check self.db->execute(query);

        int? count = result.affectedRowCount;
        if count is int && count > 0 {
            return http:OK;
        } else {
            return http:NO_CONTENT;
        }
    }

    // Delete a booking by ID (ID required)
    resource function delete deleteBooking(int id, http:Request req) returns http:Ok|http:NoContent|http:Unauthorized|error {
        if !self.validateJWT(req) {
            return http:UNAUTHORIZED;
        }

        sql:ParameterizedQuery query = `DELETE FROM bookings WHERE id = ${id}`;
        sql:ExecutionResult result = check self.db->execute(query);

        int? count = result.affectedRowCount;
        if count is int && count > 0 {
            return http:OK;
        } else {
            return http:NO_CONTENT;
        }
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