import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AbnormalityIdentity from "../pages/categories/abnormalityIdentity";
import HomePage from "../pages/home";
import CallusFeatures from "../pages/categories/CallusFeatures";

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
					</Routes>
				</div>
			</BrowserRouter>
		</div>
	);
};

export default PageRoutes;
