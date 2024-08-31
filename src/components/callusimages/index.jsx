import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ImageIcon from "@mui/icons-material/Image";
import InfoIcon from "@mui/icons-material/Info";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
	Box,
	Card,
	IconButton,
	InputAdornment,
	Menu,
	MenuItem,
	TextField,
	Typography,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { collection, getDocs } from "firebase/firestore";
import React, { useState } from "react";
import { db } from "../../util/firebaseConfig";
import ImageCarousel from "../imageCarousel";

function CallusImages() {
	const [date, setDate] = useState(null);
	const [selectedDate, setSelectedDate] = useState(null);
	const [error, setError] = useState(false);
	const [menuAnchorEl, setMenuAnchorEl] = useState(null);
	const [urlInfos, setUrlInfos] = useState([]);

	const handleDateChange = async (e) => {
		setDate(e);
		if (e) {
			await fetchCarouselImages(e);
		}
	};

	const fetchCarouselImages = async (date) => {
		if (date) {
			const dateref = date.format("YYYY-MM-DD");
			const collRef = collection(db, "data", "callus", dateref);

			try {
				const snapshot = await getDocs(collRef);
				const documentsArray = [];
				snapshot.forEach((doc) => {
					const data = doc.data();
					documentsArray.push({
						id: doc.id,
						imageUrl: data.original,
						...data,
					});
				});
				setUrlInfos(documentsArray);
				return documentsArray;
			} catch (error) {
				console.error("Error fetching documents:", error);
				setUrlInfos([]);
			}
		} else {
			setUrlInfos([]);
		}
	};

	const handleBlur = () => {
		if (!selectedDate) {
			setError(true);
		}
	};

	const handleMenuClick = (event) => {
		setMenuAnchorEl(event.currentTarget);
	};

	const handleMenuClose = () => {
		setMenuAnchorEl(null);
	};

	return (
		<Card elevation={2} className="p-4">
			<Typography
				variant="h6"
				component="h2"
				gutterBottom
				sx={{ fontWeight: "bold", fontFamily: "Poppins" }}>
				Callus Images
			</Typography>

			<Box className="flex items-center justify-between space-x-4 mb-4">
				<Box className="flex items-center space-x-2 flex-grow">
					<Box p={2}>
						<Typography
							sx={{
								fontSize: 15,
								fontWeight: 600,
								fontFamily: "Poppins",
							}}>
							Pick a date
						</Typography>
						<LocalizationProvider dateAdapter={AdapterDayjs}>
							<DatePicker
								value={date}
								onChange={(newValue) =>
									handleDateChange(newValue)
								}
								onBlur={handleBlur}
								renderInput={(params) => (
									<TextField
										{...params}
										error={error}
										helperText={
											error
												? "This field is required"
												: ""
										}
										sx={{
											fontFamily: "Poppins",
											width: "100%",
											maxWidth: "300px",
											"& .MuiOutlinedInput-root": {
												"& fieldset": {
													borderColor: error
														? "#d32f2f"
														: "gray",
												},
												"&:hover fieldset": {
													borderColor: error
														? "#d32f2f"
														: "gray",
												},
												"&.Mui-focused fieldset": {
													borderColor: error
														? "#d32f2f"
														: "#fb6544",
												},
											},
											"& .MuiInputLabel-root": {
												fontFamily: "Poppins",
												color: error
													? "#d32f2f"
													: "inherit",
											},
											"& .MuiInputLabel-root.Mui-focused":
												{
													color: error
														? "#d32f2f"
														: "#fb6544",
												},
										}}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<CalendarTodayIcon />
												</InputAdornment>
											),
											endAdornment: (
												<InputAdornment position="end">
													<InfoIcon
														color={
															error
																? "error"
																: "inherit"
														}
													/>
												</InputAdornment>
											),
										}}
									/>
								)}
							/>
						</LocalizationProvider>
					</Box>
				</Box>

				<Card
					elevation={1}
					className="p-2"
					sx={{
						width: 250,
						height: 70,
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						padding: "0 8px",
						position: "relative",
					}}>
					<Box display="flex" alignItems="center">
						<ImageIcon
							color="action"
							sx={{ marginRight: "22px" }}
						/>{" "}
						<Typography
							variant="body2"
							color="gray"
							fontSize={17}
							sx={{
								fontWeight: "bold",
								marginRight: "32px",
							}}>
							Total Images
						</Typography>
						<Typography
							variant="body1"
							sx={{
								fontWeight: "bold",
								marginRight: "32px",
							}}>
							{urlInfos ? urlInfos.length : 0}
						</Typography>
					</Box>
					<IconButton
						onClick={handleMenuClick}
						sx={{
							padding: "4px",
							position: "absolute",
							top: "5px",
							right: "5px",
						}}>
						<MoreVertIcon fontSize="small" />
					</IconButton>
					<Menu
						anchorEl={menuAnchorEl}
						open={Boolean(menuAnchorEl)}
						onClose={handleMenuClose}>
						{/* <MenuItem onClick={handleMenuClose}>
							Option 1
						</MenuItem>
						<MenuItem onClick={handleMenuClose}>
							Option 2
						</MenuItem> */}
					</Menu>
				</Card>
			</Box>

			<Box
				flex={{ xs: 1, sm: "0 1 70%" }}
				mt={{ xs: 1, sm: 0 }}
				mb={{ xs: 3, sm: 0 }}
				mr={{ sm: 1 }}>
				<ImageCarousel images={urlInfos ? urlInfos : []} />
			</Box>
		</Card>
	);
}

export default CallusImages;
