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

  // Get initials for avatar (up to 2 characters)
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Invitation to Collaborate</title>
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
            
            body {
              font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              line-height: 1.6;
              color: #374151;
              margin: 0;
              padding: 0;
              background-color: #f9fafb;
            }
            .email-container {
              max-width: 600px;
              margin: 20px auto;
              background-color: #ffffff;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            }
            .email-body {
              padding: 0;
            }
            .email-footer {
              background-color: #f8fafc;
              padding: 24px;
              text-align: center;
              font-size: 13px;
              color: #64748b;
              border-top: 1px solid #e2e8f0;
            }
            .header-banner {
              background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
              height: 8px;
              width: 100%;
            }
            .content-section {
              padding: 32px;
            }
            .top-section {
              text-align: center;
              padding-bottom: 32px;
              border-bottom: 1px solid #e2e8f0;
            }
            .logo-section {
              margin-bottom: 24px;
            }
            .logo-circle {
              width: 64px;
              height: 64px;
              border-radius: 50%;
              background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
              display: inline-flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 16px;
            }
            h1 {
              margin: 0 0 8px 0;
              font-size: 24px;
              font-weight: 700;
              color: #1e293b;
              letter-spacing: -0.025em;
            }
            .subtitle {
              font-size: 16px;
              color: #64748b;
              margin: 0;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
              color: #fff;
              text-decoration: none;
              padding: 14px 32px;
              border-radius: 8px;
              font-weight: 600;
              margin: 24px 0;
              text-align: center;
              box-shadow: 0 4px 12px rgba(139, 92, 246, 0.2);
              transition: all 0.2s ease;
            }
            .button:hover {
              box-shadow: 0 6px 16px rgba(139, 92, 246, 0.3);
              transform: translateY(-1px);
            }
            .resource-info {
              background-color: #F5F3FF;
              border-radius: 12px;
              padding: 24px;
              margin: 28px 0;
              border-left: 4px solid #8B5CF6;
            }
            .resource-title {
              font-weight: 700;
              font-size: 18px;
              margin-bottom: 8px;
              color: #1e293b;
            }
            .resource-type {
              color: #64748b;
              font-size: 14px;
              display: flex;
              align-items: center;
            }
            .resource-type svg {
              margin-right: 6px;
            }
            .permission-badge {
              display: inline-block;
              background-color: #F5F3FF;
              color: #8B5CF6;
              padding: 4px 10px;
              border-radius: 6px;
              font-size: 13px;
              font-weight: 600;
              margin-left: 8px;
              border: 1px solid #DDD6FE;
            }
            .sender-section {
              background-color: #F8F9FA;
              border-radius: 12px;
              padding: 24px;
              display: flex;
              align-items: center;
              margin-bottom: 28px;
            }
            .avatar {
              width: 48px;
              height: 48px;
              border-radius: 12px;
              background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
              color: white;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 600;
              font-size: 18px;
              margin-right: 16px;
              box-shadow: 0 4px 10px rgba(139, 92, 246, 0.2);
            }
            .sender-name {
              font-weight: 600;
              font-size: 16px;
              color: #1e293b;
            }
            .sender-action {
              color: #64748b;
              font-size: 14px;
              margin-top: 2px;
            }
            .divider {
              height: 1px;
              background-color: #e2e8f0;
              margin: 28px 0;
            }
            .link-fallback {
              font-size: 13px;
              background-color: #F8F9FA;
              border-radius: 6px;
              padding: 12px;
              word-break: break-all;
              color: #8B5CF6;
              border: 1px solid #e2e8f0;
            }
            .link-fallback-label {
              font-size: 13px;
              color: #64748b;
              margin-bottom: 8px;
            }
            .info-section {
              display: flex;
              align-items: center;
              margin-bottom: 16px;
            }
            .info-icon {
              width: 40px;
              height: 40px;
              border-radius: 8px;
              background-color: #F5F3FF;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 16px;
              flex-shrink: 0;
            }
            .info-text {
              font-size: 15px;
              color: #4B5563;
            }
            @media only screen and (max-width: 600px) {
              .content-section {
                padding: 24px 20px;
              }
              .button {
                display: block;
                text-align: center;
              }
            }
          `}
        </style>
      </head>
      <body>
        <div className="email-container">
          <div className="email-body">
            <div className="header-banner"></div>

            <div className="content-section top-section">
              <div className="logo-section">
                <div className="logo-circle">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18 8L10 16L6 12"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
              <h1>You've Been Invited</h1>
              <p className="subtitle">
                to collaborate on a {formattedResourceType}
              </p>
            </div>

            <div className="content-section">
              <div className="sender-section">
                <div className="avatar">{getInitials(senderName)}</div>
                <div>
                  <div className="sender-name">{senderName}</div>
                  <div className="sender-action">
                    has invited you to collaborate
                  </div>
                </div>
              </div>

              <div className="info-section">
                <div className="info-icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z"
                      stroke="#8B5CF6"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="info-text">
                  You've been given{" "}
                  <span className="permission-badge">{permissionText}</span>{" "}
                  permission
                </div>
              </div>

              <div className="resource-info">
                <div className="resource-title">{resourceTitle}</div>
                <div className="resource-type">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M19.5 14.25V11.625C19.5 9.76104 17.989 8.25 16.125 8.25H14.625C14.0037 8.25 13.5 7.74632 13.5 7.125V5.625C13.5 3.76104 11.989 2.25 10.125 2.25H8.25M8.25 15H15.75M8.25 18H12M10.5 2.25H5.625C5.00368 2.25 4.5 2.75368 4.5 3.375V20.625C4.5 21.2463 5.00368 21.75 5.625 21.75H18.375C18.9963 21.75 19.5 21.2463 19.5 20.625V11.25C19.5 6.27944 15.4706 2.25 10.5 2.25Z"
                      stroke="#8B5CF6"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {formattedResourceType}
                </div>
              </div>

              <div style={{ textAlign: "center", marginTop: "32px" }}>
                <p>Click the button below to access the {resourceType}:</p>
                <a
                  href={shareLink}
                  className="button"
                  style={{ color: "white" }}
                >
                  Open {formattedResourceType}
                </a>
              </div>

              <div className="divider"></div>

              <div className="link-fallback-label">
                If the button doesn't work, copy and paste this link into your
                browser:
              </div>
              <div className="link-fallback">{shareLink}</div>
            </div>
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
