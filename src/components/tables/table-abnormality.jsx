/* eslint-disable jsx-a11y/img-redundant-alt */
import CloseIcon from "@mui/icons-material/Close";
import {
	Box,
	Button,
	Chip,
	Grid,
	IconButton,
	MenuItem,
	Modal,
	Select,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
	TextField,
	Pagination,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
	collection,
	getDocs,
	deleteDoc,
	doc,
	updateDoc,
} from "firebase/firestore";
import { db } from "../../util/firebaseConfig";
import { toast } from "react-toastify";
import TableNoData from "../../components/tables/no-data-screen";

const styleModal = {
	position: "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	width: { xs: "100%", sm: "80%" },
	bgcolor: "#404040",
	border: "none",
	boxShadow: 24,
	color: "#f2c9cf",
	p: 4,
	borderRadius: 5,
};

const theme = createTheme({
	components: {
		MuiPaginationItem: {
			styleOverrides: {
				root: {
					"&.Mui-selected": {
						backgroundColor: "#dd6824",
						color: "white",
					},
					"&:hover": {
						backgroundColor: "#dd6824",
						color: "white",
					},
					borderColor: "#dd6824",
				},
			},
		},
	},
});

const ImageTable = () => {
	const [open, setOpen] = useState(false);
	const [selectedImages, setSelectedImages] = useState({
		original: "",
		output: "",
	});
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [documents, setDocuments] = useState([]);
	const isNotFound = documents.length;
	const [tableDate, setTableDate] = useState(null);
	const [date, setDate] = useState(null);

	const handleDateChange = async (newValue) => {
		if (!newValue) {
			toast.warning("Select a date to view data");
			return;
		}

		const result = getFormattedDate(newValue);
		setTableDate(newValue);
		setDate(result);

		const response = await fetchAllDocuments(result);
		setDocuments(response);
	};

	const getFormattedDate = (date) => {
		return date ? date.format("YYYY-MM-DD") : "";
	};

	const totalPages = Math.ceil(documents.length / rowsPerPage);

	const fetchAllDocuments = async (date) => {
		const collRef = collection(db, "data", "processedPlant", date);

		try {
			const snapshot = await getDocs(collRef);
			const documentsArray = [];
			snapshot.forEach((doc) => {
				documentsArray.push({ id: doc.id, ...doc.data() });
			});
			return documentsArray;
		} catch (error) {
			console.error("Error fetching documents:", error);
			return [];
		}
	};

	const handleChangePagination = (event, value) => {
		if (typeof value === "number") {
			setPage(value - 1);
		} else {
			const rows = parseInt(event.target.value, 5);
			setRowsPerPage(rows);
			setPage(0);
		}
	};

	const handleOpen = (original, output) => {
		setSelectedImages({ original, output });
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	const handleDelete = async (docId, date) => {
		try {
			const docRef = doc(db, "data", "processedPlant", date, docId);
			await deleteDoc(docRef);
			toast.success(
				`Plants identification record deleted successfully`,
			);

			const updatedDocuments = await fetchAllDocuments(date);
			setDocuments(updatedDocuments);
		} catch (error) {
			console.error("Error deleting document:", error);
		}
	};

	const updateDocument = async (docId, updatedData) => {
		try {
			const docRef = doc(db, "data", "processedPlant", date, docId);
			await updateDoc(docRef, updatedData);
			toast.success(
				`Plants identification records updated successfully`,
			);
		} catch (error) {
			console.error("Error updating document:", error);
		}
	};

	const handleChange = (docId, newStatus) => {
		setDocuments((prevDocuments) =>
			prevDocuments.map((doc) =>
				doc.id === docId
					? {
							...doc,
							updatedStatus: newStatus,
					  }
					: doc,
			),
		);
	};

	const TABLE_HEADER = [
		{ label: "Plain Number", width: "10%" },
		{ label: " ", width: "15%" },
		{ label: " ", width: "10%" },
		{ label: "Status", width: "10%" },
		{ label: "Updated Status", width: "10%" },
		{ label: "New Status Reason", width: "20%" },
		{ label: " ", width: "5%" },
		{ label: "Actions", width: "20%" },
	];

	const handleReasonChange = (docId, newReason) => {
		setDocuments((prevDocuments) =>
			prevDocuments.map((doc) =>
				doc.id === docId ? { ...doc, reason: newReason } : doc,
			),
		);
	};

	return (
		<>
			<Box p={5}>
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
						value={tableDate}
						onChange={handleDateChange}
						sx={{
							fontFamily: "Poppins",
							width: {
								xs: "100%",
								sm: "25%",
							},
							"& .MuiOutlinedInput-root": {
								"& fieldset": {
									borderColor: "gray",
								},
								"&:hover fieldset": {
									borderColor: "gray",
								},
								"&.Mui-focused fieldset": {
									borderColor: "#fb6544",
								},
							},
							"& .MuiInputLabel-root": {
								fontFamily: "Poppins",
							},
							"& .MuiInputLabel-root.Mui-focused": {
								color: "#fb6544",
							},
						}}
						InputLabelProps={{
							sx: {
								fontFamily: "Poppins",
							},
						}}
					/>
				</LocalizationProvider>
			</Box>
			<TableContainer
				sx={{
					paddingLeft: 5,
					paddingRight: 5,
					paddingBottom: 3,
					overflowX: "auto",
				}}>
				<Table aria-label="simple table">
					<TableHead>
						<TableRow>
							{TABLE_HEADER.map((header, index) => (
								<TableCell
									key={index}
									rowSpan={1}
									sx={{
										borderBottom: "1px solid #D3D3D3",
										fontWeight: 600,
										textAlign: "center",
										width: header.width,
										bgcolor: "#DBE5F1",
									}}>
									{header.label}
								</TableCell>
							))}
						</TableRow>
					</TableHead>
					{isNotFound === 0 ? (
						<TableNoData isNotFound={isNotFound} />
					) : (
						<TableBody>
							{documents
								.slice(
									page * rowsPerPage,
									page * rowsPerPage + rowsPerPage,
								)
								.map((row, index) => (
									<TableRow key={index}>
										<TableCell
											sx={{
												textAlign: "center",
												borderBottom:
													"1px solid #D3D3D3",
											}}>
											<Typography
												sx={{
													fontSize: 12,
												}}>
												{index + 1}
											</Typography>
										</TableCell>
										<TableCell
											sx={{
												textAlign: "center",
												borderBottom:
													"1px solid #D3D3D3",
											}}>
											<img
												src={row.processedUrl}
												alt="Image"
												style={{
													width: 100,
													height: 100,
													objectFit: "cover",
													cursor: "pointer",
												}}
												onClick={() =>
													handleOpen(
														row.orginalUrl,
														row.processedUrl,
													)
												}
											/>
										</TableCell>
										<TableCell
											sx={{
												textAlign: "center",
												borderBottom:
													"1px solid #D3D3D3",
											}}>
											{row.id}
										</TableCell>
										<TableCell
											sx={{
												textAlign: "center",
												borderBottom:
													"1px solid #D3D3D3",
											}}>
											<Chip
												variant="soft"
												label={row.status}
												sx={{
													bgcolor:
														row.status ===
														"Healthy"
															? "#c9f2de"
															: "#f2c9cf",
													color:
														row.status ===
														"Healthy"
															? "#228B22"
															: "#ed2323",
												}}
											/>
										</TableCell>
										<TableCell
											sx={{
												textAlign: "center",
												borderBottom:
													"1px solid #D3D3D3",
											}}>
											<Select
												value={
													row.updatedStatus
														? row.updatedStatus
														: row.status
												}
												onChange={(e) =>
													handleChange(
														row.id,
														e.target.value,
													)
												}
												displayEmpty
												fullWidth
												inputProps={{
													"aria-label":
														"Without label",
												}}
												sx={{
													backgroundColor:
														"#FFFFFF",
													borderRadius: "4px",
													boxShadow:
														"0 2px 4px rgba(0,0,0,0.1)",
													"& .MuiSelect-select":
														{
															paddingLeft:
																"8px",
															paddingRight:
																"24px",
															paddingTop:
																"8px",
															paddingBottom:
																"8px",
														},
													"& .MuiOutlinedInput-notchedOutline":
														{
															border: "none",
														},
													"&:hover .MuiOutlinedInput-notchedOutline":
														{
															border: "none",
														},
													"&.Mui-focused .MuiOutlinedInput-notchedOutline":
														{
															border: "none",
															boxShadow:
																"0 2px 4px rgba(0,0,0,0.2)",
														},
												}}>
												<MenuItem value="Healthy">
													Healthy
												</MenuItem>
												<MenuItem value="Unhealthy">
													Unhealthy
												</MenuItem>
											</Select>
										</TableCell>
										<TableCell
											sx={{
												textAlign: "center",
												borderBottom:
													"1px solid #D3D3D3",
											}}>
											<TextField
												placeholder="Your New Reason"
												value={row.reason}
												onChange={(e) =>
													handleReasonChange(
														row.id,
														e.target.value,
													)
												}
												sx={{
													width: "100%",
													"& .MuiOutlinedInput-root":
														{
															"& fieldset": {
																borderColor:
																	"gray",
															},
															"&:hover fieldset":
																{
																	borderColor:
																		"gray",
																},
															"&.Mui-focused fieldset":
																{
																	borderColor:
																		"#fb6544",
																},
														},
													"& .MuiInputLabel-root.Mui-focused":
														{
															color: "#fb6544",
														},
												}}
											/>
										</TableCell>
										<TableCell
											sx={{
												textAlign: "center",
												borderBottom:
													"1px solid #D3D3D3",
											}}>
											<Button
												variant="outlined"
												sx={{
													borderColor: "red",
													borderRadius: 5,
													color: "red",
												}}>
												Notify{" "}
											</Button>
										</TableCell>
										<TableCell
											sx={{
												textAlign: "center",
												borderBottom:
													"1px solid #D3D3D3",
												p: 1,
											}}>
											<Button
												variant="contained"
												sx={{
													backgroundColor:
														"orange",
													mr: { xs: 1, sm: 2 },
													width: {
														xs: "100%",
														sm: "auto",
													},
													mb: { xs: 1, sm: 0 },
												}}
												onClick={() =>
													updateDocument(
														row.id,
														{
															reason: row.reason,
															updatedStatus:
																row.updatedStatus,
														},
													)
												}>
												Update
											</Button>
											<Button
												variant="contained"
												sx={{
													backgroundColor: "red",
													width: {
														xs: "100%",
														sm: "auto",
													},
												}}
												onClick={() =>
													handleDelete(
														row.id,
														date,
													)
												}>
												Delete
											</Button>
										</TableCell>
									</TableRow>
								))}
						</TableBody>
					)}
				</Table>
			</TableContainer>
			<ThemeProvider theme={theme}>
				<Pagination
					sx={{
						mb: 5,
						display: "flex",
						justifyContent: "center",
					}}
					count={totalPages}
					variant="outlined"
					shape="rounded"
					rowsPerPage={rowsPerPage}
					page={page + 1}
					onChange={handleChangePagination}
				/>
			</ThemeProvider>
			<Modal
				open={open}
				onClose={handleClose}
				aria-labelledby="modal-modal-title"
				aria-describedby="modal-modal-description">
				<Box sx={styleModal}>
					<IconButton
						aria-label="close"
						onClick={handleClose}
						sx={{
							position: "absolute",
							right: 8,
							top: 8,
							color: (theme) => theme.palette.grey[500],
						}}>
						<CloseIcon />
					</IconButton>
					<Grid container spacing={2}>
						<Grid item xs={6}>
							<Typography
								id="modal-modal-title"
								variant="h6"
								component="h2"
								sx={{
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									bgcolor: "#f2c9cf",
									color: "#ed2323",
									borderRadius: 15,
									padding: 1,
									marginX: 30,
									marginBottom: 2,
									fontWeight: 700,
									textTransform: "uppercase",
									width: 200,
								}}>
								Original Image
							</Typography>
							<img
								src={selectedImages.original}
								alt="Original"
								style={{
									width: "100%",
									height: "auto",
									borderRadius: 15,
								}}
							/>
						</Grid>
						<Grid item xs={6}>
							<Typography
								id="modal-modal-description"
								variant="h6"
								component="h2"
								sx={{
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									bgcolor: "#c9f2de",
									color: "#228b22",
									borderRadius: 15,
									padding: 1,
									marginX: 30,
									marginBottom: 2,
									fontWeight: 700,
									textTransform: "uppercase",
									width: 200,
								}}>
								Output Image
							</Typography>
							<img
								src={selectedImages.output}
								alt="Output"
								style={{
									width: "100%",
									height: "auto",
									borderRadius: 15,
								}}
							/>
						</Grid>
					</Grid>
				</Box>
			</Modal>
		</>
	);
};

export default ImageTable;
