import {
	Box,
	Button,
	CircularProgress,
	MenuItem,
	TextField,
	Typography,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import {
	getDownloadURL,
	getStorage,
	ref,
	uploadBytes,
} from "firebase/storage";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import BreadCrumbs from "../../components/breadcrumbs";
import ImageCarousel from "../../components/imageCarousel/index";
import StatsPanel from "../../components/statsPanel/index";
import ImageTable from "../../components/tables/table-abnormality";
import { db } from "../../util/firebaseConfig";

function AbnormalityIdentity() {
	const [date, setDate] = useState(null);
	const [selectedAmount, setSelectedAmount] = useState(-1);
	const [statsData, setStatsData] = useState(null);
	const [predict, setPredict] = useState("");
	const [loading, setLoading] = useState(false);
	const [urlInfos, setUrlInfos] = useState([]);

	const handleDateChange = async (e) => {
		setDate(e);
		if (e) {
			await fetchCarouselImages(e); // Pass the new date directly
		}
	};

	const fetchCarouselImages = async (date) => {
		if (date) {
			const dateref = date.format("YYYY-MM-DD");
			const collRef = collection(db, "data", "plant", dateref);

			try {
				const snapshot = await getDocs(collRef);
				const newUrlInfos = [];
				snapshot.docs.forEach((doc) => {
					const data = doc.data().unprocessed;
					if (data.front) {
						newUrlInfos.push({
							id: doc.id + "_front",
							imageUrl: data.front,
							alt: "Front view",
						});
					}
					if (data.right) {
						newUrlInfos.push({
							id: doc.id + "_right",
							imageUrl: data.right,
							alt: "Right view",
						});
					}
				});
				setUrlInfos(newUrlInfos);
			} catch (error) {
				console.error("Error fetching documents:", error);
				setUrlInfos([]);
			}
		} else {
			console.log("No date selected");
			setUrlInfos([]);
		}
	};

	const handleAmountChange = (event) => {
		setSelectedAmount(event.target.value);
	};

	useEffect(() => {
		if (date) {
			fetchStatsData(date);
		}
	}, [date]);

	const fetchStatsData = async (selectedDate) => {
		try {
			const formattedDate = selectedDate.format("YYYY-MM-DD");
			const dateCollectionRef = collection(
				db,
				"data",
				"plant",
				formattedDate,
			);
			const dateDocs = await getDocs(dateCollectionRef);

			const totalImages = dateDocs.size * 2;
			const totalPlants = dateDocs.size;

			setStatsData({
				totalPlants,
				totalImages,
				date: formattedDate,
			});
		} catch (error) {
			console.error("Error fetching stats data:", error);
			setStatsData({
				totalPlants: 0,
				totalImages: 0,
				date: selectedDate.format("YYYY-MM-DD"),
			});
		}
	};

	const fetchAndProcessImages = async (limit) => {
		if (date) {
			const dateref = date.format("YYYY-MM-DD");
			const collRef = collection(db, "data", "plant", dateref);

			try {
				const snapshot = await getDocs(collRef);
				const urlInfos = snapshot.docs.map((doc) => ({
					id: doc.id,
					frontUrl: doc.data().unprocessed.front,
					rightUrl: doc.data().unprocessed.right,
				}));

				const limitedUrlInfos = urlInfos.slice(0, limit);

				const processedImages = await processImages(
					limitedUrlInfos,
				);
				return processedImages;
			} catch (error) {
				console.error("Error fetching documents:", error);
				return [];
			}
		}
	};

	const processImages = async (urlInfos) => {
		let results = {};
		let urlInfo = {};

		for (const { id, frontUrl, rightUrl } of urlInfos) {
			const frontBlob = await fetchAndProcess(frontUrl);
			if (frontBlob) {
				results[`${id}_f`] = frontBlob;
				urlInfo[`${id}_f`] = frontUrl;
			}

			const rightBlob = await fetchAndProcess(rightUrl);
			if (rightBlob) {
				results[`${id}_r`] = rightBlob;
				urlInfo[`${id}_r`] = rightUrl;
			}
		}

		sendResultsToModel(results, urlInfo);

		return results;
	};

	const sendResultsToModel = async (results, urlInfo) => {
		let allSuccessful = true;
		setLoading(true);

		for (const id in results) {
			const formData = new FormData();
			formData.append("file", results[id]);

			try {
				const response = await fetch(
					"http://127.0.0.1:8000/predict/plant_status_identification",
					{
						method: "POST",
						body: formData,
					},
				);
				if (!response.ok) {
					throw new Error(
						`HTTP error! Status: ${response.status}`,
					);
				}

				const xpredictions = response.headers.get("x-predictions");

				if (xpredictions) {
					const cleanedHeader = xpredictions.replace(/'/g, '"');
					const predictions = JSON.parse(cleanedHeader);

					let responseValue = "";
					if (predictions.length > 1) {
						const label = predictions[1].label;

						if (label === "Browning") {
							setPredict("Unhealthy");
							responseValue = "Unhealthy";
						}
					} else {
						const label = predictions[0].label;

						if (label === "Flask") {
							setPredict("Healthy");
							responseValue = "Healthy";
						}
					}

					const blob = await response.blob();
					const { downloadProcessURL } =
						await uploadImageToFirebase(blob, id);

					const data = {
						orginalUrl: urlInfo[id],
						processedUrl: downloadProcessURL,
						status: responseValue,
						updatedStatus: "",
						reason: "",
					};

					await storeImageDataInFirestore(id, data);
				} else {
					allSuccessful = false;
					toast.error("Failed to process images!");
				}
			} catch (error) {
				console.error("Failed to send image:", id, error);
				allSuccessful = false;
				toast.error("Failed to process images!");
			}
		}

		if (allSuccessful) {
			toast.success("Images processed successfully!");
			setLoading(false);
		}
	};

	const fetchAndProcess = async (imageUrl) => {
		try {
			const response = await fetch(imageUrl);
			if (!response.ok)
				throw new Error("Network response was not ok.");
			const blob = await response.blob();

			const img = document.createElement("img");
			img.src = URL.createObjectURL(blob);

			return new Promise((resolve, reject) => {
				img.onload = () => {
					const canvas = document.createElement("canvas");
					const ctx = canvas.getContext("2d");
					canvas.width = img.width;
					canvas.height = img.height;
					ctx.drawImage(img, 0, 0);

					canvas.toBlob((jpgBlob) => {
						resolve(jpgBlob);
					}, "image/jpeg");
				};
				img.onerror = () => reject(new Error("Image load error"));
			});
		} catch (error) {
			console.error("Failed to fetch and process image:", error);
			return null;
		}
	};

	const uploadImageToFirebase = async (processImageBlob, plantID) => {
		const storage = getStorage();

		const formattedDate = date.format("YYYY-MM-DD");

		const processStorageRef = ref(
			storage,
			`Plants/${formattedDate}/Processed/${plantID}.jpg`,
		);

		try {
			const processSnapshot = await uploadBytes(
				processStorageRef,
				processImageBlob,
			);

			const downloadProcessURL = await getDownloadURL(
				processSnapshot.ref,
			);

			return { downloadProcessURL };
		} catch (error) {
			console.error("Failed to upload image to Firebase:", error);
			throw new Error("Failed to upload image to Firebase");
		}
	};

	const storeImageDataInFirestore = async (plantID, data) => {
		const formattedDate = date.format("YYYY-MM-DD");
		try {
			await setDoc(
				doc(db, "data", "processedPlant", formattedDate, plantID),
				data,
			);
		} catch (error) {
			console.error("Error storing URL in Firestore:", error);
			throw error;
		}
	};

	return (
		<>
			<BreadCrumbs />
			<Box
				sx={{
					pb: 2,
					borderBottomColor: "gray",
					borderBottomWidth: 2,
				}}>
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
							value={date}
							onChange={(newValue) =>
								handleDateChange(newValue)
							}
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
					<Box
						mt={2}
						display="flex"
						flexDirection={{ xs: "column", sm: "row" }}
						justifyContent="space-between"
						alignItems="center">
						<Box
							flex={{ xs: 1, sm: "0 1 30%" }}
							mb={{ xs: 3, sm: 0 }}>
							<StatsPanel statsData={statsData} />
						</Box>
						<Box
							flex={{ xs: 1, sm: "0 1 70%" }}
							mt={{ xs: 1, sm: 0 }}
							mb={{ xs: 3, sm: 0 }}
							mr={{ sm: 1 }}>
							<ImageCarousel
								images={urlInfos ? urlInfos : []}
							/>
						</Box>
					</Box>

					<Typography
						mt={2}
						mb={2}
						sx={{
							fontFamily: "Poppins",
						}}>
						Select Images To Process
					</Typography>
					<TextField
						select
						value={selectedAmount}
						onChange={handleAmountChange}
						fullWidth
						sx={{
							fontFamily: "Poppins",
							width: {
								xs: "100%",
								sm: "15%",
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
						}}>
						<MenuItem
							value={-1}
							disabled
							sx={{ fontFamily: "Poppins" }}>
							Pick plant amount
						</MenuItem>
						{[1, 5, 10, 15].map((option) => (
							<MenuItem
								key={option}
								value={option}
								sx={{ fontFamily: "Poppins" }}>
								{option}
							</MenuItem>
						))}
					</TextField>
				</Box>
				<Box paddingLeft={5}>
					<Button
						variant="contained"
						sx={{
							backgroundColor: "#FF5F1F",
							width: { xs: "25%", sm: "12%" },
							"&:hover": {
    backgroundColor: "#e5533b"},
						}}
						onClick={() => {
							if (date === null) {
								toast.warning(
									"Please pick a date before processing.",
								);
							} else if (selectedAmount <= 0) {
								toast.warning(
									"Pick a plant amount before process.",
								);
							} else {
								fetchAndProcessImages(selectedAmount);
							}
						}}>
						{loading ? (
							<CircularProgress size={24} color="inherit" />
						) : (
							"Process"
						)}
					</Button>
				</Box>
			</Box>
			<ImageTable />
		</>
	);
}

export default AbnormalityIdentity;
