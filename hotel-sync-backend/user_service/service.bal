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

service /users on new http:Listener(8081) {
    private final mysql:Client db;

    function init() returns error? {
        self.db = check new (host, user, password, database, port);
    }

    resource function post add(@http:Payload User user, http:Request req) returns http:Created|http:Unauthorized|error {
        if !self.validateJWT(req) {
            return http:UNAUTHORIZED;
        }

        string hashedPassword = hashPassword(user.password_hash);

        _ = check self.db->execute(`
            INSERT INTO users (nic, name, email, phone_number, password_hash, role, address, status, created_at)
            VALUES (${user.nic}, ${user.name}, ${user.email}, ${user.phone_number}, ${hashedPassword}, ${user.role}, ${user.address}, ${user.status}, NOW());
        `);
        return http:CREATED;
    }

    resource function get all(http:Request req) returns User[]|http:Unauthorized|error {
        if !self.validateJWT(req) {
            return http:UNAUTHORIZED;
        }

        stream<User, sql:Error?> userStream = self.db->query(`SELECT * FROM users`);
        return from User user in userStream select user;
    }

    resource function put update(int id, @http:Payload User updatedUser, http:Request req) returns http:Ok|http:Unauthorized|error {
        if !self.validateJWT(req) {
            return http:UNAUTHORIZED;
        }

        string hashedPassword = hashPassword(updatedUser.password_hash);

        _ = check self.db->execute(`
            UPDATE users SET nic = ${updatedUser.nic}, name = ${updatedUser.name}, email = ${updatedUser.email}, 
            phone_number = ${updatedUser.phone_number}, password_hash = ${hashedPassword}, 
            role = ${updatedUser.role}, address = ${updatedUser.address}, status = ${updatedUser.status}
            WHERE id = ${id};
        `);
        return http:OK;
    }

    resource function delete remove(int id, http:Request req) returns http:Ok|http:Unauthorized|error {
        if !self.validateJWT(req) {
            return http:UNAUTHORIZED;
        }

        _ = check self.db->execute(`DELETE FROM users WHERE id = ${id}`);
        return http:OK;
    }

    function validateJWT(http:Request req) returns boolean {
        var authHeaderResult = req.getHeader("Authorization");
        
        if authHeaderResult is string {
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