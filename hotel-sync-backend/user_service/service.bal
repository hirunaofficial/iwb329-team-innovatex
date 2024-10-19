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

service /users on new http:Listener(9091) {
    private final mysql:Client db;

    function init() returns error? {
        self.db = check new (host, user, password, database, port);
    }

    // Fetch all staff members
    resource function get getStaffMembers(http:Request req) returns StaffMember[]|http:Unauthorized|error {
        if !self.validateJWT(req) {
            return http:UNAUTHORIZED;
        }

        sql:ParameterizedQuery query = `SELECT id, name FROM users WHERE role = 'Staff'`;
        stream<StaffMember, sql:Error?> staffMemberStream = self.db->query(query);
        return from StaffMember staff in staffMemberStream select staff;
    }

    // Add a new user with password
    resource function post addUser(@http:Payload UserWithPassword user, http:Request req) returns http:Created|http:Unauthorized|http:NoContent|error {
        if !self.validateJWT(req) {
            return http:UNAUTHORIZED;
        }

        string hashedPassword = hashPassword(user.password_hash ?: "");

        sql:ExecutionResult result = check self.db->execute(`
            INSERT INTO users (nic, name, email, phone_number, password_hash, role, address, created_at)
            VALUES (${user.nic}, ${user.name}, ${user.email}, ${user.phone_number}, ${hashedPassword}, ${user.role}, ${user.address}, NOW());
        `);
        int? count = result.affectedRowCount;
        if count is int && count > 0 {
            return http:CREATED;
        } else {
            return http:NO_CONTENT;
        }
    }

    // Fetch all users without password_hash
    resource function get getUsers(http:Request req) returns UserWithoutPassword[]|http:Unauthorized|error {
        if !self.validateJWT(req) {
            return http:UNAUTHORIZED;
        }

        stream<UserWithoutPassword, sql:Error?> userStream = self.db->query(`SELECT id, nic, name, email, phone_number, role, address, status FROM users`);
        return from UserWithoutPassword user in userStream select user;
    }

    // Delete a user by ID
    resource function delete deleteUser(int id, http:Request req) returns http:Ok|http:Unauthorized|http:NoContent|error {
        if !self.validateJWT(req) {
            return http:UNAUTHORIZED;
        }

        sql:ExecutionResult result = check self.db->execute(`DELETE FROM users WHERE id = ${id}`);
        int? count = result.affectedRowCount;
        if count is int && count > 0 {
            return http:OK;
        } else {
            return http:NO_CONTENT;
        }
    }

    // Update user information without password
    resource function put updateUserInfo(int id, @http:Payload UserWithoutPassword updatedUser, http:Request req) returns http:Ok|http:Unauthorized|http:NoContent|error {
        if !self.validateJWT(req) {
            return http:UNAUTHORIZED;
        }

        sql:ExecutionResult result = check self.db->execute(`
            UPDATE users 
            SET nic = ${updatedUser.nic ?: ""}, 
                name = ${updatedUser.name ?: ""}, 
                email = ${updatedUser.email ?: ""}, 
                phone_number = ${updatedUser.phone_number ?: ""}, 
                role = ${updatedUser.role ?: ""}, 
                address = ${updatedUser.address ?: ""}, 
                status = ${updatedUser.status ?: ""} 
            WHERE id = ${id}
        `);

        int? count = result.affectedRowCount;
        if count is int && count > 0 {
            return http:OK;
        } else {
            return http:NO_CONTENT;
        }
    }

    // Dedicated method to update only the password
    resource function put updatePassword(int id, @http:Payload PasswordUpdate passwordUpdate, http:Request req) returns http:Ok|http:Unauthorized|http:NoContent|error {
        if !self.validateJWT(req) {
            return http:UNAUTHORIZED;
        }

        string hashedPassword = hashPassword(passwordUpdate.new_password);

        sql:ExecutionResult result = check self.db->execute(`
            UPDATE users
            SET password_hash = ${hashedPassword}
            WHERE id = ${id}
        `);

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