import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "leaflet/dist/leaflet.css";
import App from "./App";
import "./index.css";
import { registerSW } from "virtual:pwa-register";

registerSW({
  immediate: true,
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />

    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          borderRadius: "16px",
          background: "#0f172a",
          color: "#fff",
          padding: "14px 16px",
          fontSize: "14px",
        },
      }}
    />
  </BrowserRouter>,
);
