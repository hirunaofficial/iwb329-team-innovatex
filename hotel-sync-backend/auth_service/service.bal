import ballerina/http;
import ballerina/sql;
import ballerinax/mysql;
import ballerinax/mysql.driver as _;
import ballerina/jwt;
import ballerina/uuid;
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

service /auth on new http:Listener(9090) {
    private final mysql:Client db;

    function init() returns error? {
        self.db = check new (host, user, password, database, port);
    }

    resource function post login(@http:Payload Login credentials) returns http:Response|http:Unauthorized|error {
        string email = credentials.email;
        string password = credentials.password;

        User|sql:Error result = self.db->queryRow(`SELECT email, password_hash FROM users WHERE email = ${email}`);

        if result is User {
            string hashedPassword = hashPassword(password);

            if result.password_hash == hashedPassword {
                string jwtToken = self.generateJWT(email);

                http:Response res = new;
                res.setPayload({"message": "Login successful", "token": jwtToken});
                return res;
            } else {
                return http:UNAUTHORIZED;
            }
        } else {
            return http:UNAUTHORIZED;
        }
    }

    function generateJWT(string email) returns string {
        string jwtId = uuid:createRandomUuid();

        jwt:IssuerConfig issuerConfig = {
            issuer: issuer,
            username: email,
            audience: audience,
            jwtId: jwtId,
            expTime: 3600,
            customClaims: {
                "role": "user"
            },
            signatureConfig: {
                algorithm: jwt:HS256,
                config: secretKey
            }
        };

        string jwtToken = checkpanic jwt:issue(issuerConfig);
        return jwtToken;
    }
}