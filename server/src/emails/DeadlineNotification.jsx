import ReactDOMServer from "react-dom/server";

const DeadlineNotificationEmail = ({
  taskTitle,
  deadline,
  daysRemaining,
  taskLink,
  senderName = "Task Manager",
}) => {
  const formattedDeadline = new Date(deadline).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Urgency styling
  const urgencyColor = daysRemaining <= 1 ? "#DC2626" : "#D97706"; // Red for <1 day, amber otherwise
  const urgencyText = daysRemaining <= 1 ? "URGENT" : "UPCOMING";

  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          {`
            /* Base styles with email client compatibility */
            body, html {
              margin: 0;
              padding: 0;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              line-height: 1.5;
              color: #333333;
              -webkit-font-smoothing: antialiased;
            }
            
            * {
              box-sizing: border-box;
            }
            
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
            }
            
            .email-header {
              background-color: #f9fafb;
              padding: 24px;
              text-align: center;
              border-bottom: 1px solid #e5e7eb;
            }
            
            .email-header h1 {
              margin: 0;
              color: #111827;
              font-size: 24px;
              font-weight: 700;
            }
            
            .email-body {
              padding: 32px 24px;
            }
            
            .sender-info {
              display: flex;
              align-items: center;
              margin-bottom: 24px;
            }
            
            .avatar {
              width: 40px;
              height: 40px;
              border-radius: 50%;
              background-color: #f3f4f6;
              display: flex;
              align-items: center;
              justify-content: center;
              margin-right: 12px;
              font-weight: bold;
              color: #4b5563;
              border: 1px solid #e5e7eb;
            }
            
            .sender-name {
              font-weight: 600;
              font-size: 16px;
              color: #111827;
            }
            
            .urgency-badge {
              background-color: ${urgencyColor};
              color: white;
              padding: 4px 10px;
              border-radius: 16px;
              font-size: 12px;
              font-weight: bold;
              display: inline-block;
              margin-left: 8px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .deadline-bar {
              background-color: #FEF3C7;
              border-left: 4px solid ${urgencyColor};
              padding: 16px;
              margin: 20px 0;
              border-radius: 4px;
            }
            
            .button {
              display: inline-block;
              background-color: ${urgencyColor};
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 6px;
              font-weight: 600;
              margin: 8px 0;
              text-align: center;
              transition: background-color 0.2s;
            }
            
            .divider {
              height: 1px;
              background-color: #e5e7eb;
              margin: 32px 0 24px 0;
            }
            
            .email-footer {
              background-color: #f9fafb;
              padding: 24px;
              text-align: center;
              font-size: 12px;
              color: #6b7280;
              border-top: 1px solid #e5e7eb;
            }
            
            .email-footer p {
              margin: 8px 0;
            }
            
            /* Responsive adjustments */
            @media only screen and (max-width: 480px) {
              .email-body {
                padding: 24px 16px;
              }
              
              .button {
                display: block;
                width: 100%;
              }
            }
          `}
        </style>
      </head>
      <body>
        <div className="email-container">
          <div className="email-header">
            <h1>Task Deadline Notification</h1>
          </div>

          <div className="email-body">
            <div className="sender-info">
              <div className="avatar">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <div>
                <div className="sender-name">Task Alert</div>
                <div style={{ color: "#6b7280", fontSize: "14px" }}>
                  Action required on pending task
                </div>
              </div>
            </div>

            <p style={{ fontSize: "16px" }}>Hello,</p>

            <div className="deadline-bar">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <strong style={{ fontSize: "18px", color: "#111827" }}>
                  {taskTitle}
                </strong>
                <span className="urgency-badge">{urgencyText}</span>
              </div>
              <div
                style={{
                  marginTop: "12px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span style={{ marginRight: "8px" }}>⏰</span>
                <span>
                  Due: <strong>{formattedDeadline}</strong>
                  {daysRemaining > 0 && (
                    <span style={{ color: "#4b5563" }}>
                      {" "}
                      ({daysRemaining} day{daysRemaining !== 1 ? "s" : ""}{" "}
                      remaining)
                    </span>
                  )}
                </span>
              </div>
            </div>

            <p
              style={{
                marginBottom: "28px",
                fontSize: "16px",
                color: "#4b5563",
              }}
            >
              {daysRemaining <= 1
                ? "This task requires immediate attention to meet the deadline. Please prioritize this task to ensure timely completion."
                : "Please complete this task before the deadline approaches. Planning ahead will help ensure quality work and timely delivery."}
            </p>

            <div style={{ textAlign: "center", margin: "32px 0" }}>
              <a href={taskLink} className="button">
                {daysRemaining <= 1 ? "Complete Task Now" : "View Task Details"}
              </a>
            </div>

            <div className="divider"></div>

            <p
              style={{
                fontSize: "14px",
                color: "#6b7280",
                fontStyle: "italic",
              }}
            >
              Need more time? Reply to this email to request an extension or
              discuss the timeline with your team.
            </p>
          </div>

          <div className="email-footer">
            <p>You received this email because you're assigned to this task.</p>
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

// Render function for your email service
export const renderDeadlineEmail = (props) => {
  return `<!DOCTYPE html>${ReactDOMServer.renderToStaticMarkup(
    <DeadlineNotificationEmail {...props} />
  )}`;
};
