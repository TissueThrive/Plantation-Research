import React, { useEffect, useState } from "react";
import { Box, IconButton, Card, CardMedia } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import dummy from "../../assets/images/placeholder.png";

function ImageCarousel({ images }) {
	const [currentIndex, setCurrentIndex] = useState(0);
	const visibleImages = 4;

	const dummyImages = [
		{ imageUrl: dummy, alt: "Placeholder image 1" },
		{ imageUrl: dummy, alt: "Placeholder image 2" },
		{ imageUrl: dummy, alt: "Placeholder image 3" },
		{ imageUrl: dummy, alt: "Placeholder image 4" },
	];

	const handleBackClick = () => {
		setCurrentIndex((prevIndex) =>
			prevIndex > 0
				? prevIndex - 1
				: (images.length || dummyImages.length) - visibleImages,
		);
	};

	const handleForwardClick = () => {
		setCurrentIndex((prevIndex) =>
			prevIndex <
			(images.length || dummyImages.length) - visibleImages
				? prevIndex + 1
				: 0,
		);
	};

	const displayImages =
		images.length > 0
			? images.slice(currentIndex, currentIndex + visibleImages)
			: dummyImages;

	return (
		<Box className="flex items-center justify-between space-x-2 bg-white p-2 rounded-lg shadow-md">
			<IconButton
				onClick={handleBackClick}
				className="text-gray-500">
				<ArrowBackIosIcon />
			</IconButton>
			{displayImages.map((image, index) => (
				<Card key={index} elevation={2}>
					<CardMedia
						component="img"
						style={{
							height: "200px",
							width: "250px",
							objectFit: "cover",
						}}
						image={image.imageUrl}
						alt={image.alt}
					/>
				</Card>
			))}
			<IconButton
				onClick={handleForwardClick}
				className="text-gray-500">
				<ArrowForwardIosIcon />
			</IconButton>
		</Box>
	);
}

export default ImageCarousel;
