import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import store from "./store/redux-store.js";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./components/ui/ThemeProvider";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Render the app
createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID}>
    <BrowserRouter>
      <ThemeProvider>
        <Provider store={store}>
          <App />
        </Provider>
      </ThemeProvider>
    </BrowserRouter>{" "}
  </GoogleOAuthProvider>
);
