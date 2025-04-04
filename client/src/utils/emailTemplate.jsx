import React from "react";
import ReactDOMServer from "react-dom/server";

const EmailTemplate = ({
  resourceType,
  resourceTitle,
  shareLink,
  permission,
  senderName,
}) => {
  // Format the resource type for display
  const formattedResourceType =
    resourceType.charAt(0).toUpperCase() + resourceType.slice(1);

  // Get the permission text
  const permissionText = permission === "edit" ? "Edit" : "View";

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Invitation to Collaborate</title>
        <style>
          {`
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f9f9f9;
            }
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            }
            .email-header {
              background-color: #0D9488;
              color: white;
              padding: 24px;
              text-align: center;
            }
            .email-header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 600;
            }
            .email-body {
              padding: 32px 24px;
            }
            .email-footer {
              background-color: #f5f5f5;
              padding: 16px 24px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            .button {
              display: inline-block;
              background-color: #0D9488;
              color: #fff;
              text-decoration: none;
              padding: 12px 24px;
              border-radius: 4px;
              font-weight: 500;
              margin: 24px 0;
            }
            .resource-info {
              background-color: #f5f5f5;
              border-radius: 4px;
              padding: 16px;
              margin: 24px 0;
            }
            .resource-title {
              font-weight: 600;
              font-size: 18px;
              margin-bottom: 8px;
            }
            .permission-badge {
              display: inline-block;
              background-color: #e0f2f1;
              color: #0D9488;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 500;
              margin-left: 4px;
            }
            .avatar {
              width: 48px;
              height: 48px;
              border-radius: 50%;
              background-color: #0D9488;
              color: white;
              display: flex;justify-content: center;
    align-items: center;  
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-size: 18px;
              margin-right: 12px;
            }
            .sender-info {
              display: flex;
              align-items: center;
              margin-bottom: 24px;
            }
            .sender-name {
              font-weight: 600;
            }
            .divider {
              height: 1px;
              background-color: #eaeaea;
              margin: 24px 0;
            }
          `}
        </style>
      </head>
      <body>
        <div className="email-container">
          <div className="email-header">
            <h1>You've Been Invited to Collaborate</h1>
          </div>
          <div className="email-body">
            <div className="sender-info">
              <div className="avatar">{senderName.charAt(0).toUpperCase()}</div>
              <div>
                <div className="sender-name">{senderName}</div>
                <div>has invited you to collaborate</div>
              </div>
            </div>

            <p>Hello,</p>
            <p>
              You've been invited to collaborate on a {formattedResourceType}{" "}
              with permission to{" "}
              <span className="permission-badge">{permissionText}</span>.
            </p>

            <div className="resource-info">
              <div className="resource-title">{resourceTitle}</div>
              <div>{formattedResourceType}</div>
            </div>

            <p>Click the button below to access the {resourceType}:</p>

            <div style={{ textAlign: "center" }}>
              <a href={shareLink} className="button" style={{ color: "white" }}>
                View {formattedResourceType}
              </a>
            </div>

            <div className="divider"></div>

            <p style={{ fontSize: "12px", color: "#666" }}>
              If the button doesn't work, copy and paste this link into your
              browser:
            </p>
            <p
              style={{
                fontSize: "12px",
                wordBreak: "break-all",
                color: "#0D9488",
              }}
            >
              {shareLink}
            </p>
          </div>
          <div className="email-footer">
            <p>This invitation was sent to you by {senderName}.</p>
            <p>
              &copy; {new Date().getFullYear()} Your Company. All rights
              reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
};

export const generateEmailTemplate = (props) => {
  return `<!DOCTYPE html>${ReactDOMServer.renderToStaticMarkup(
    <EmailTemplate {...props} />
  )}`;
};

export default generateEmailTemplate;
