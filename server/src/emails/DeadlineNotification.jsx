import React from "react";
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
        <style>
          {`
            .urgency-badge {
              background-color: ${urgencyColor};
              color: white;
              padding: 3px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: bold;
              display: inline-block;
              margin-left: 8px;
            }
            .deadline-bar {
              background-color: #FEF3C7;
              border-left: 4px solid ${urgencyColor};
              padding: 12px;
              margin: 16px 0;
            }
          `}
        </style>
      </head>
      <body>
        <div className="email-container">
          <div className="email-header">
            <h1>Deadline Notification</h1>
          </div>

          <div className="email-body">
            <div className="sender-info">
              <div className="avatar">!</div>
              <div>
                <div className="sender-name">Task Alert</div>
                <div>Action required on pending task</div>
              </div>
            </div>

            <p>Hello,</p>

            <div className="deadline-bar">
              <div style={{ display: "flex", alignItems: "center" }}>
                <strong>{taskTitle}</strong>
                <span className="urgency-badge">{urgencyText}</span>
              </div>
              <div style={{ marginTop: "8px" }}>
                ⏰ Due: <strong>{formattedDeadline}</strong>
                {daysRemaining > 0 && (
                  <span>
                    {" "}
                    ({daysRemaining} day{daysRemaining !== 1 ? "s" : ""}{" "}
                    remaining)
                  </span>
                )}
              </div>
            </div>

            <p style={{ marginBottom: "24px" }}>
              {daysRemaining <= 1
                ? "This task requires immediate attention to meet the deadline."
                : "Please complete this task before the deadline approaches."}
            </p>

            <div style={{ textAlign: "center" }}>
              <a href={taskLink} className="button">
                {daysRemaining <= 1 ? "Complete Task Now" : "View Task Details"}
              </a>
            </div>

            <div className="divider"></div>

            <p style={{ fontSize: "12px", color: "#666" }}>
              Need more time? Reply to this email to request an extension.
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
