import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Assuming you're using react-router for navigation
import { Stack, Typography, Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import Abnormality from "../../assets/images/Abnormality.jpg";
import HouseIcon from "@mui/icons-material/House";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

const StyledLink = styled(Link)(({ theme }) => ({
	textDecoration: "none",
	margin: theme.spacing(1),
}));

const BreadCrumbs = () => {
	const [category, setCategory] = useState("");

	useEffect(() => {
		const currentURL = window.location.href;
		let parts = currentURL.split("/")[4];

		if (parts === "") {
			setCategory("home");
		} else {
			setCategory(
				parts
					.split("-")
					.map(
						(part) =>
							part.charAt(0).toUpperCase() + part.slice(1),
					)
					.join(" "),
			);
		}
	}, []);

	return (
		<Box
			sx={{
				"& .header": {
					position: "relative",
					backgroundImage: `url(${Abnormality})`,
					backgroundSize: "cover",
					backgroundPosition: "center",
					padding: (theme) => theme.spacing(8, 0),
					textAlign: "center",
					color: "white",
					"&::before": {
						content: '""',
						position: "absolute",
						top: 0,
						left: 0,
						width: "100%",
						height: "100%",
						backgroundColor: "rgba(0, 0, 0, 0.5)",
						zIndex: 1,
					},
					"& > *": {
						position: "relative",
						zIndex: 2,
					},
				},
			}}>
			<Box className="header">
				<Typography
					variant="h3"
					component="h1"
					sx={{
						fontWeight: 800,
						mt: 10,
						fontFamily: "Poppins",
					}}>
					Tissue Thrive
				</Typography>
				<Box>
					<Stack
						direction="row"
						justifyContent="center"
						alignItems="center"
						spacing={2}
						mt={3}>
						<a href="/">
							<HouseIcon
								sx={{
									color: "white",
									width: 35,
									height: 35,
								}}
							/>{" "}
						</a>
						<StyledLink to="#" color="inherit">
							<Typography
								color="inherit"
								sx={{
									fontWeight: "bold",
									fontSize: 25,
									fontFamily: "Poppins",
								}}>
								Categories
							</Typography>
						</StyledLink>
						<StyledLink to="/" color="inherit">
							<ArrowForwardIosIcon
								sx={{
									color: "white",
									width: 24,
									height: 24,
									fontFamily: "Poppins",
								}}
							/>
						</StyledLink>
						<Typography
							color="inherit"
							sx={{
								fontWeight: "bold",
								color: "yellow",
								fontSize: 25,
								fontFamily: "Poppins",
							}}>
							{category}
						</Typography>
					</Stack>
				</Box>
			</Box>
		</Box>
	);
};

export default BreadCrumbs;
