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

service /rooms on new http:Listener(9092) {
    private final mysql:Client db;

    function init() returns error? {
        self.db = check new (host, user, password, database, port);
    }

    // Add a new room (No ID needed here)
    resource function post addRoom(@http:Payload AddRoomRequest room, http:Request req) returns http:Created|http:NoContent|http:Unauthorized|error {
        if !self.validateJWT(req) {
            return http:UNAUTHORIZED;
        }

        sql:ParameterizedQuery query = `INSERT INTO rooms (room_number, room_type, status, price, description, created_at)
                                        VALUES (${room.room_number}, ${room.room_type}, ${room.status}, ${room.price}, ${room.description}, NOW())`;
        sql:ExecutionResult result = check self.db->execute(query);

        int? count = result.affectedRowCount;
        if count is int && count > 0 {
            return http:CREATED;
        } else {
            return http:NO_CONTENT;
        }
    }

    // Fetch all rooms (Returning rooms with IDs)
    resource function get getRooms(http:Request req) returns RoomWithId[]|http:Unauthorized|error {
        if !self.validateJWT(req) {
            return http:UNAUTHORIZED;
        }

        sql:ParameterizedQuery query = `SELECT id, room_number, room_type, status, price, description FROM rooms`;
        stream<RoomWithId, sql:Error?> roomStream = self.db->query(query);
        return from RoomWithId room in roomStream select room;
    }

    // Update room information (Requires room ID)
    resource function put updateRoom(int id, @http:Payload RoomUpdateRequest room, http:Request req) returns http:Ok|http:NoContent|http:Unauthorized|error {
        if !self.validateJWT(req) {
            return http:UNAUTHORIZED;
        }

        sql:ParameterizedQuery query = `UPDATE rooms 
                                        SET room_number = ${room.room_number}, 
                                            room_type = ${room.room_type}, 
                                            status = ${room.status}, 
                                            price = ${room.price}, 
                                            description = ${room.description}
                                        WHERE id = ${id}`;
        sql:ExecutionResult result = check self.db->execute(query);

        int? count = result.affectedRowCount;
        if count is int && count > 0 {
            return http:OK;
        } else {
            return http:NO_CONTENT;
        }
    }

    // Delete a room by ID (ID required)
    resource function delete deleteRoom(int id, http:Request req) returns http:Ok|http:NoContent|http:Unauthorized|error {
        if !self.validateJWT(req) {
            return http:UNAUTHORIZED;
        }

        sql:ParameterizedQuery query = `DELETE FROM rooms WHERE id = ${id}`;
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