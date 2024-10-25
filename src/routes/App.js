import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AbnormalityIdentity from "../pages/categories/abnormalityIdentity";
import HomePage from "../pages/home";
import CallusFeatures from "../pages/categories/CallusFeatures";
import Chat from "../pages/chat";

const PageRoutes = () => {
  return (
    <div>
      <BrowserRouter>
        <div>
          <Routes>
            <Route path="/" element={<HomePage />} />

            <Route
              path="/categories/plants-abnormality-identify"
              element={<AbnormalityIdentity />}
            />
            <Route
              path="/categories/callus-features-analyzing"
              element={<CallusFeatures />}
            />
            <Route path="/chat" element={<Chat />} />
          </Routes>
        </div>
      </BrowserRouter>
    </div>
  );
};

export default PageRoutes;
