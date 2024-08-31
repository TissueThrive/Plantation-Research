/* eslint-disable jsx-a11y/img-redundant-alt */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect, useRef } from "react";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import Logo from "../../assets/images/Logo.png";
import AuthModal from "../auth";
import { useCategory } from "../../context/CategoryContext";
import { useAuth } from "../../context/authContext";

export default function NavigationBar({ navItem }) {
	const { currentUser, logout, userData, handleSetUserData } = useAuth();
	const { handleSetCategory } = useCategory();

	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
	const [selectedMenuItem, setSelectedMenuItem] = useState("");
	const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
	const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

	const menuRef = useRef(null);
	const userMenuRef = useRef(null);
	const categoriesRef = useRef(null);

	const handleMenuItemClick = (category) => {
		setSelectedMenuItem(navItem);
		setIsCategoriesOpen(false);
		handleSetCategory(category);
	};

	const handleClickOutside = (event) => {
		if (
			menuRef.current &&
			categoriesRef.current &&
			!menuRef.current.contains(event.target) &&
			!categoriesRef.current.contains(event.target)
		) {
			setIsMenuOpen(false);
		}
		if (
			userMenuRef.current &&
			!userMenuRef.current.contains(event.target)
		) {
			setIsUserMenuOpen(false);
		}
		if (
			categoriesRef.current &&
			!categoriesRef.current.contains(event.target)
		) {
			setIsCategoriesOpen(false);
		}
	};

	useEffect(() => {
		document.addEventListener("mousedown", handleClickOutside);
		setSelectedMenuItem(navItem);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [navItem]);

	const handleLogout = async () => {
		try {
			await logout();
			setIsUserMenuOpen(false);
			handleSetUserData({
				firstname: "",
				lastname: "",
				email: "",
				role: "",
				mobile: "",
				dob: "",
			});
			window.location.href = "/";
		} catch (error) {
			console.error("Logout Failed:", error.message);
		}
	};

	return (
		<>
			<nav className="bg-white border-gray-200">
				<div className="max-w-screen flex flex-wrap items-center justify-between mx-auto px-8 py-4">
					<a
						href="#"
						className="flex items-center space-x-3 rtl:space-x-reverse">
						<img
							src={Logo}
							className="h-8"
							alt="Tissue Thrive Logo"
						/>
						<span className="self-center text-xl font-semibold whitespace-nowrap text-black">
							Tissue
							<span className="text-orange">Thrive</span>
						</span>
					</a>
					{currentUser ? (
						<div className="flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
							{/* Bell Icon */}
							<button
								type="button"
								className="text-gray-600 hover:text-gray-800 focus:ring-none focus:ring-gray-300 px-5"
								aria-label="Notifications">
								<NotificationsNoneIcon />
							</button>
							{/* User Icon */}
							<button
								ref={userMenuRef}
								type="button"
								className="flex justify-center items-center text-sm rounded-full md:me-0 focus:ring-4 focus:ring-gray-300"
								id="user-menu-button"
								aria-expanded={
									isUserMenuOpen ? "true" : "false"
								}
								onClick={() =>
									setIsUserMenuOpen(!isUserMenuOpen)
								}>
								<span className="sr-only">
									Open user menu
								</span>
								<img
									className="w-8 h-8 rounded-full"
									src="https://www.w3schools.com/w3images/avatar6.png"
									alt="user photo"
								/>
							</button>
							<button
								ref={menuRef}
								data-collapse-toggle="navbar-user"
								type="button"
								className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
								aria-controls="navbar-user"
								aria-expanded={
									isMenuOpen ? "true" : "false"
								}
								onClick={() =>
									setIsMenuOpen(!isUserMenuOpen)
								}>
								<span className="sr-only">
									Open main menu
								</span>
								<svg
									className="w-5 h-5"
									aria-hidden="true"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 17 14">
									<path
										stroke="currentColor"
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M1 1h15M1 7h15M1 13h15"
									/>
								</svg>
							</button>
						</div>
					) : (
						<div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
							<button
								type="button"
								onClick={() => setIsLoginModalOpen(true)}
								className="text-white bg-orange hover:bg-darkOrange focus:ring-4 focus:outline-none focus:ring-lightOrange font-medium rounded-lg text-sm px-4 py-2 text-center">
								Login
							</button>
							<button
								ref={menuRef}
								data-collapse-toggle="navbar-user"
								type="button"
								className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
								aria-controls="navbar-user"
								aria-expanded={
									isMenuOpen ? "true" : "false"
								}
								onClick={() => setIsMenuOpen(!isMenuOpen)}>
								<span className="sr-only">
									Open main menu
								</span>
								<svg
									className="w-5 h-5"
									aria-hidden="true"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 17 14">
									<path
										stroke="currentColor"
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M1 1h15M1 7h15M1 13h15"
									/>
								</svg>
							</button>
						</div>
					)}

					<div
						ref={menuRef}
						className={`items-center justify-between w-full md:flex md:w-auto md:order-1 ${
							isMenuOpen ? "block" : "hidden"
						}`}
						id="navbar-user">
						<ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white">
							<li>
								<a
									href="/"
									onClick={() =>
										handleMenuItemClick("home")
									}
									className={`block py-2 px-3 md:p-0 ${
										selectedMenuItem === "home"
											? "text-orange border-b-2 border-orange"
											: "text-gray-900 hover:text-orange"
									}`}
									aria-current="page">
									Home
								</a>
							</li>
							<li>
								<a
									href="#"
									onClick={() =>
										handleMenuItemClick("about")
									}
									className={`block py-2 px-3 md:p-0 ${
										selectedMenuItem === "about"
											? "text-orange border-b-2 border-orange"
											: "text-gray-900 hover:text-orange"
									}`}>
									About Us
								</a>
							</li>
							<li className="relative">
								<button
									ref={categoriesRef}
									onClick={() =>
										setIsCategoriesOpen(
											!isCategoriesOpen,
										)
									}
									className={`block py-2 px-3 md:p-0 ${
										selectedMenuItem === "categories"
											? "text-orange border-b-2 border-orange"
											: "text-gray-900 hover:text-orange"
									}`}>
									Categories
								</button>
								{isCategoriesOpen && (
									<ul
										className="absolute left-0 mt-2 w-48 bg-white border border-gray-100 rounded-lg shadow-lg z-50"
										ref={categoriesRef}>
										<li>
											<a
												href={
													currentUser
														? "/categories/callus-features-analyzing"
														: "#"
												}
												onClick={() =>
													handleMenuItemClick(
														"Callus Features Analyzing",
													)
												}
												className="block px-4 py-2 text-sm text-gray-700 hover:bg-lightOrange">
												Callus Features Analyzing
											</a>
										</li>
										<li>
											<a
												href={
													currentUser
														? "/categories/plants-abnormality-identify"
														: "#"
												}
												onClick={() =>
													handleMenuItemClick(
														"Plants Abnormality Identify",
													)
												}
												className="block px-4 py-2 text-sm text-gray-700 hover:bg-lightOrange">
												Plants Abnormality Identify
											</a>
										</li>
										<li>
											<a
												href="#"
												onClick={() =>
													handleMenuItemClick(
														"Growth of Plants",
													)
												}
												className="block px-4 py-2 text-sm text-gray-700 hover:bg-lightOrange">
												Growth of Plants
											</a>
										</li>
										<li>
											<a
												href="#"
												onClick={() =>
													handleMenuItemClick(
														"Disease Identifies",
													)
												}
												className="block px-4 py-2 text-sm text-gray-700 hover:bg-lightOrange">
												Disease Identifies
											</a>
										</li>
										<li>
											<a
												href="#"
												onClick={() =>
													handleMenuItemClick(
														"Scheduling System",
													)
												}
												className="block px-4 py-2 text-sm text-gray-700 hover:bg-lightOrange">
												Scheduling System
											</a>
										</li>
									</ul>
								)}
							</li>
							{currentUser ? (
								<li>
									<a
										href="#"
										onClick={() =>
											handleMenuItemClick("Chat")
										}
										className={`block py-2 px-3 md:p-0 ${
											selectedMenuItem === "Chat"
												? "text-orange border-b-2 border-orange"
												: "text-gray-900 hover:text-orange"
										}`}>
										Chat
									</a>
								</li>
							) : (
								<li>
									<a
										href="#"
										onClick={() =>
											handleMenuItemClick("Support")
										}
										className={`block py-2 px-3 md:p-0 ${
											selectedMenuItem === "Support"
												? "text-orange border-b-2 border-orange"
												: "text-gray-900 hover:text-orange"
										}`}>
										Support
									</a>
								</li>
							)}
						</ul>
					</div>
				</div>
			</nav>
			{isUserMenuOpen && (
				<div
					ref={userMenuRef}
					className="absolute right-4 mt-2 w-60 bg-white divide-y divide-gray-100 rounded-lg shadow-lg z-50"
					id="user-dropdown">
					<div className="px-4 py-3">
						<span className="block text-sm text-gray-900">
							{userData ? userData.firstname : "Bonnie"}{" "}
							{userData ? userData.lastname : "Green"}
						</span>
						<span className="block text-[13px] text-gray-500 truncate">
							{userData
								? userData.email
								: "name@flowbite.com"}
						</span>
					</div>
					<ul
						className="py-2"
						aria-labelledby="user-menu-button">
						<li>
							<a
								className="block px-4 py-2 text-sm text-gray-700 hover:bg-lightOrange hover:cursor-pointer"
								onClick={handleLogout}>
								Sign out
							</a>
						</li>
					</ul>
				</div>
			)}
			<AuthModal
				isOpen={isLoginModalOpen}
				onClose={() => setIsLoginModalOpen(false)}
			/>
		</>
	);
}
