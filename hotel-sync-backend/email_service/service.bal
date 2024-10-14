import ballerina/http;
import ballerina/email;

configurable string smtpHost = ?;
configurable string smtpUser = ?;
configurable string smtpPassword = ?;
configurable int smtpPort = ?;

listener http:Listener emailListener = new(9099);

@http:ServiceConfig {
    cors: {
        allowOrigins: ["http://localhost", "http://localhost:3000", "http://localhost:8080"],
        allowHeaders: ["Authorization", "Content-Type"],
        allowCredentials: true,
        maxAge: 3600
    }
}

// HTTP service to handle incoming email requests
service /email on emailListener {

    // Endpoint to send email
    resource function post send(EmailRequest emailRequest) returns http:Created|http:InternalServerError {
        email:SmtpConfiguration smtpConfig = {
            port: smtpPort
        };

        // Create an SMTP client and handle potential errors
        email:SmtpClient|email:Error smtpClientResult = new(smtpHost, smtpUser, smtpPassword, smtpConfig);

        if smtpClientResult is email:Error {
            return http:INTERNAL_SERVER_ERROR;
        }

        email:SmtpClient smtpClient = <email:SmtpClient>smtpClientResult;

        email:Message email = {
            to: [emailRequest.to],
            subject: emailRequest.subject,
            htmlBody: emailRequest.body,
            'from: smtpUser,
            sender: smtpUser
        };

        email:Error? response = smtpClient->sendMessage(email);

        if response is email:Error {
            return http:INTERNAL_SERVER_ERROR;
        }

        return http:CREATED;
    }
}