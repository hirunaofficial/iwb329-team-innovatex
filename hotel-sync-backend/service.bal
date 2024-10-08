import ballerina/http;
import ballerina/sql;
import ballerinax/mysql;
import ballerinax/mysql.driver as _;

configurable string host = ?;
configurable int port = ?;
configurable string user = ?;
configurable string password = ?;
configurable string database = ?;

service / on new http:Listener(8080) {
    private final mysql:Client db;

    function init() returns error? {
        self.db = check new (host, user, password, database, port);
    }

    // User login (authentication)
    resource function post login(@http:Payload Login credentials) returns User|http:Unauthorized|error {
        string email = credentials.email;
        string password = credentials.password;

        User|sql:Error result = self.db->queryRow(`SELECT * FROM users WHERE email = ${email}`);

        if result is User {
            if result.password_hash == password {
                return result;
            } else {
                return http:UNAUTHORIZED;
            }
        } else {
            return http:UNAUTHORIZED;
        }
    }

    // User registration (create a new user)
    resource function post users(@http:Payload User user) returns User|error {
        _ = check self.db->execute(`
            INSERT INTO users (nic, name, email, phone_number, password_hash, role, address, status)
            VALUES (${user.nic}, ${user.name}, ${user.email}, ${user.phone_number}, ${user.password_hash}, ${user.role}, ${user.address}, ${user.status});
        `);
        return user;
    }

    // Get all users
    resource function get users() returns User[]|error {
        stream<User, sql:Error?> userStream = self.db->query(`SELECT * FROM users`);
        return from User user in userStream select user;
    }

    // Delete user by ID
    resource function delete users/[int id]() returns string|error {
        _ = check self.db->execute(`DELETE FROM users WHERE id = ${id}`);
        return "User deleted successfully.";
    }

    // Update user by ID
    resource function put users/[int id](@http:Payload User updatedUser) returns string|error {
        _ = check self.db->execute(`
            UPDATE users SET nic = ${updatedUser.nic}, name = ${updatedUser.name}, email = ${updatedUser.email}, 
            phone_number = ${updatedUser.phone_number}, password_hash = ${updatedUser.password_hash}, 
            role = ${updatedUser.role}, address = ${updatedUser.address}, status = ${updatedUser.status} 
            WHERE id = ${id};
        `);
        return "User updated successfully.";
    }
}