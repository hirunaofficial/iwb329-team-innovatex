import React from "react";

interface AccountCreationProps {
  children: string;
}

const EmailTemplate: React.FC<AccountCreationProps> = ({ children }) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .email-container {
          font-family: Arial, sans-serif;
          color: #333;
          line-height: 1.6;
          width: 100%;
          max-width: 600px;
          margin: auto;
          border: 1px solid #ccc;
          padding: 20px;
        }
        .email-header {
          background-color: #f5f5f5;
          padding: 10px;
          text-align: center;
        }
        .email-logo img {
          max-width: 300px;
        }
        .email-body {
          padding: 20px;
        }
        .email-footer {
          text-align: center;
          padding: 10px;
          background-color: #f5f5f5;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <div class="email-logo">
            <img src="https://i.ibb.co/f1Wsg86/Hotel-Sync.png" alt="Hotel Sync Logo" />
          </div>
          <h2>Welcome to Hotel Sync</h2>
        </div>
        <div class="email-body">
          ${children}  <!-- Dynamic content goes here -->
        </div>
        <div class="email-footer">
          <p>Best Regards,</p>
          <p><strong>Hotel Sync Team</strong></p>
          <p><a href="#">Visit our website</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export default EmailTemplate;