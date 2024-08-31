import LockIcon from "@mui/icons-material/Lock";
import SyncIcon from "@mui/icons-material/Sync";
import UploadIcon from "@mui/icons-material/Upload";
import { Box, Button, TextField, Typography } from "@mui/material";
import {
	collection,
	doc,
	getDocs,
	limit,
	orderBy,
	query,
	setDoc,
} from "firebase/firestore";
import {
	getDownloadURL,
	getStorage,
	ref,
	uploadBytes,
} from "firebase/storage";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../context/authContext";
import { db } from "../../util/firebaseConfig";
import moment from "moment/moment";

const CallusUploadComponent = ({
	callusID,
	setCallusID,
	setDownloadInputURL,
	setDownloadProcessURL,
	setFile,
}) => {
	const [date, setDate] = useState(moment().format("YYYY-MM-DD"));
	const [selectedFile, setSelectedFile] = useState(null);
	const [fileExtention, setFileExtention] = useState("");
	const { userData } = useAuth();

	const handleFileChange = (event) => {
		if (!event.target.files.length) {
			return;
		}

		if (!event.target.files[0].type.startsWith("image/")) {
			toast.warning("Please select an image file!");
			return;
		}

		setSelectedFile(event.target.files[0]);
		setFileExtention(event.target.files[0].type.split("/")[1]);
	};

	useEffect(() => {
		const fetchCurrentHighestID = async () => {
			const q = query(
				collection(db, "data", "callus", date),
				orderBy("callusID", "desc"),
				limit(1),
			);
			const querySnapshot = await getDocs(q);
			let highestID = 0;
			querySnapshot.forEach((doc) => {
				const currentID = parseInt(
					doc.data().callusID.substring(1),
				);
				if (currentID > highestID) {
					highestID = currentID;
				}
			});
			const newID = `C${String(highestID + 1).padStart(4, "0")}`;
			setCallusID(newID);
		};

		fetchCurrentHighestID();
	}, [date, callusID]);

	const handleCallusImageUpload = async () => {
		if (!selectedFile) {
			toast.warning("Please upload a file to process.");
			return;
		}

		const formData = new FormData();
		formData.append("file", selectedFile);

		try {
			const response = await fetch(
				"http://127.0.0.1:8000/predict/callus_identification",
				{
					method: "POST",
					body: formData,
				},
			);

			if (!response.ok) {
				throw new Error(
					"Server error occurred while uploading the file.",
				);
			}

			const imageBlob = await response.blob();

			const xPredictions = response.headers.get("X-Predictions");

			if (xPredictions) {
				const cleanedHeader = xPredictions.replace(/'/g, '"');
				const predictions = JSON.parse(cleanedHeader);

				if (predictions.length > 0 && predictions[0].label) {
					const label = predictions[0].label;

					if (label === "Callus") {
						toast.success("Valid Callus");
						const { downloadInputURL, downloadProcessURL } =
							await uploadImageToFirebase(
								imageBlob,
								selectedFile,
							);

						setDownloadInputURL(downloadInputURL);
						setDownloadProcessURL(downloadProcessURL);
						setFile(selectedFile);

						await storeImageDataInFirestore(
							downloadInputURL,
							downloadProcessURL,
						);
					} else {
						toast.error("Invalid Callus");
					}
				} else {
					toast.error("Invalid Callus");
				}
			} else {
			}
		} catch (error) {
			console.error("Error:", error);
			toast.error("Failed to upload and process file.");
		}
	};

	// Function to upload image to Firebase Storage
	const uploadImageToFirebase = async (
		processImageBlob,
		inputImageBlob,
	) => {
		const storage = getStorage();

		const processStorageRef = ref(
			storage,
			`Callus/${date}/Processed/${callusID}.${fileExtention}`,
		);
		const inputStorageRef = ref(
			storage,
			`Callus/${date}/Unprocessed/${callusID}.${fileExtention}`,
		);

		try {
			const processSnapshot = await uploadBytes(
				processStorageRef,
				processImageBlob,
			);
			const inputSnapshot = await uploadBytes(
				inputStorageRef,
				inputImageBlob,
			);
			const downloadProcessURL = await getDownloadURL(
				processSnapshot.ref,
			);
			const downloadInputURL = await getDownloadURL(
				inputSnapshot.ref,
			);

			return { downloadProcessURL, downloadInputURL };
		} catch (error) {
			console.error("Failed to upload image to Firebase:", error);
			throw new Error("Failed to upload image to Firebase");
		}
	};

	const storeImageDataInFirestore = async (
		downloadInputURL,
		downloadProcessURL,
	) => {
		try {
			await setDoc(doc(db, "data", "callus", date, callusID), {
				username: userData.email,
				role: userData.role,
				date: date,
				callusID: callusID,
				original: downloadInputURL,
				processed: downloadProcessURL,
				shape: {
					shape: "",
					original: "",
					processed: "",
				},
				color: {
					color: "",
					original: "",
					processed: "",
				},
				area: {
					area: "",
					original: "",
					processed: "",
				},
				reason: "",
			});
		} catch (error) {
			console.error("Error storing URL in Firestore:", error);
			throw error;
		}
	};

	return (
		<>
			<Box
				className="rounded-lg shadow-md p-4 bg-white"
				sx={{
					fontFamily: "Poppins",
					border: "2px solid #e5e5e5",
					width: "100%",
					maxWidth: 400,
					padding: "20px",
				}}>
				<Typography
					variant="h6"
					component="h2"
					gutterBottom
					sx={{ fontWeight: "bold", fontFamily: "Poppins" }}>
					Upload Callus
				</Typography>
				<Typography
					sx={{
						fontFamily: "Poppins",
						color: "#000",
						mb: 2,
					}}>
					{userData ? userData.firstname : "Bonnie"}{" "}
					{userData ? userData.lastname : "Green"}
				</Typography>

				<Typography
					sx={{
						fontFamily: "Poppins",
						color: "#000",
						fontSize: 14,
						fontWeight: 700,
						mb: 1,
					}}>
					Role
				</Typography>
				<TextField
					variant="outlined"
					value={
						userData && userData.role && userData.role.trim()
							? userData.role
							: "User"
					}
					disabled
					InputProps={{
						endAdornment: (
							<LockIcon sx={{ color: "#B0B0B0" }} />
						),
					}}
					sx={{
						width: "100%",
						fontFamily: "Poppins",
						mb: 2,
						backgroundColor: "#f5f5f5",
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
						"& .MuiInputBase-input": {
							color: "#000",
							fontWeight: 600,
						},
					}}
				/>

				<Typography
					sx={{
						fontFamily: "Poppins",
						color: "#000",
						fontSize: 14,
						fontWeight: 700,
						mb: 1,
					}}>
					Callus ID
				</Typography>
				<TextField
					variant="outlined"
					value={callusID ? callusID : "Callus ID"}
					disabled
					InputProps={{
						endAdornment: (
							<LockIcon sx={{ color: "#B0B0B0" }} />
						),
					}}
					sx={{
						width: "100%",
						mb: 2,
						fontFamily: "Poppins",
						backgroundColor: "#f5f5f5",
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
						"& .MuiInputBase-input": {
							color: "#000",
							fontWeight: 600,
						},
					}}
				/>

				<Typography
					sx={{
						fontFamily: "Poppins",
						color: "#000",
						fontSize: 14,
						fontWeight: 700,
						mb: 1,
					}}>
					Date
				</Typography>

				<TextField
					variant="outlined"
					value={date}
					disabled
					InputProps={{
						endAdornment: (
							<LockIcon sx={{ color: "#B0B0B0" }} />
						),
					}}
					sx={{
						width: "100%",
						fontFamily: "Poppins",
						mb: 2,
						backgroundColor: "#f5f5f5",
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
						"& .MuiInputBase-input": {
							color: "#000",
							fontWeight: 600,
						},
					}}
				/>

				<input
					type="file"
					id="file-upload"
					style={{ display: "none" }}
					onChange={handleFileChange}
				/>
				<label htmlFor="file-upload">
					<Button
						variant="contained"
						color="primary"
						startIcon={<UploadIcon />}
						component="span"
						sx={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							margin: "20px auto 0 auto",
							backgroundColor: "#fb6544",
							"&:hover": {
								backgroundColor: "#e5533b",
							},
							fontFamily: "Poppins",
							textTransform: "uppercase",
							width: "150px",
							height: "40px",
						}}>
						Upload
					</Button>
				</label>

				{selectedFile && (
					<Typography
						sx={{
							mt: 2,
							fontFamily: "Poppins",
							color: "#808080",
							fontSize: 12,
							textAlign: "center",
							overflow: "hidden",
							whiteSpace: "nowrap",
							textOverflow: "ellipsis",
							width: "90%",
							mx: "auto",
						}}>
						{selectedFile.name}
					</Typography>
				)}
			</Box>
			<Box
				mt={2}
				sx={{
					width: "100%",
					maxWidth: 400,
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
				}}>
				<Button
					variant="contained"
					onClick={handleCallusImageUpload}
					startIcon={<SyncIcon />}
					sx={{
						backgroundColor: "#FF5F1F",
						width: { xs: "50%", sm: "150px" },
						display: "flex",
						fontWeight: 700,
						justifyContent: "center",
						alignItems: "center",
						fontFamily: "Poppins",
						marginRight: { xs: 0, sm: 0 },
					}}>
					Process
				</Button>
			</Box>
		</>
	);
};

export default CallusUploadComponent;
