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

service /serviceRequests on new http:Listener(9094) {
    private final mysql:Client db;

    function init() returns error? {
        self.db = check new (host, user, password, database, port);
    }

    // Add a new service request
    resource function post addServiceRequest(@http:Payload AddServiceRequest request, http:Request req) returns http:Created|http:NoContent|http:Unauthorized|error {
        if !self.validateJWT(req) {
            return http:UNAUTHORIZED;
        }

        sql:ParameterizedQuery query = `INSERT INTO service_requests (description, assigned_to_staff, status, created_at)
                                        VALUES (${request.description}, ${request.assigned_to_staff}, ${request.status}, NOW())`;
        sql:ExecutionResult result = check self.db->execute(query);

        int? count = result.affectedRowCount;
        if count is int && count > 0 {
            return http:CREATED;
        } else {
            return http:NO_CONTENT;
        }
    }

    // Fetch all service requests
    resource function get getServiceRequests(http:Request req) returns ServiceRequestWithId[]|http:Unauthorized|error {
        if !self.validateJWT(req) {
            return http:UNAUTHORIZED;
        }

        sql:ParameterizedQuery query = `SELECT id, description, assigned_to_staff, status, created_at, updated_at FROM service_requests`;
        stream<ServiceRequestWithId, sql:Error?> serviceRequestStream = self.db->query(query);
        return from ServiceRequestWithId request in serviceRequestStream select request;
    }

    // Update a service request (Requires service request ID)
    resource function put updateServiceRequest(int id, @http:Payload ServiceRequestUpdate request, http:Request req) returns http:Ok|http:NoContent|http:Unauthorized|error {
        if !self.validateJWT(req) {
            return http:UNAUTHORIZED;
        }

        sql:ParameterizedQuery query = `UPDATE service_requests 
                                        SET description = ${request.description}, 
                                            assigned_to_staff = ${request.assigned_to_staff}, 
                                            status = ${request.status},
                                            updated_at = NOW() 
                                        WHERE id = ${id}`;
        sql:ExecutionResult result = check self.db->execute(query);

        int? count = result.affectedRowCount;
        if count is int && count > 0 {
            return http:OK;
        } else {
            return http:NO_CONTENT;
        }
    }

    // Delete a service request by ID
    resource function delete deleteServiceRequest(int id, http:Request req) returns http:Ok|http:NoContent|http:Unauthorized|error {
        if !self.validateJWT(req) {
            return http:UNAUTHORIZED;
        }

        sql:ParameterizedQuery query = `DELETE FROM service_requests WHERE id = ${id}`;
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

        if (authHeaderResult is string && authHeaderResult.startsWith("Bearer ")) {
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