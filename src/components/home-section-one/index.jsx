import React from "react";
import image1 from "../../assets/images/1.JPG";
import image2 from "../../assets/images/2.JPG";
import image3 from "../../assets/images/3.jpg";
import {
	Box,
	Container,
	Typography,
	Grid,
	CardMedia,
	CardContent,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
} from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";

function HomeSectionOne() {
	return (
		<main>
			<Box
				position="relative"
				pt={16}
				pb={32}
				display="flex"
				alignItems="flex-start"
				justifyContent="flex-end"
				sx={{
					minHeight: "90vh",
					backgroundImage:
						"url('https://www.mutualia.fr/sites/default/files/inline-images/AdobeStock_413034019-min.jpeg')",
					backgroundPosition: "center",
					backgroundSize: "cover",
				}}>
				<Box
					position="absolute"
					top={0}
					right={0}
					width="100%"
					height="100%"
					sx={{ backgroundColor: "rgba(0, 0, 0, 0.75)" }}
				/>

				<Container>
					<Box
						sx={{
							ml: { xs: 2, md: 12 },
							pr: { xs: 2, md: 8 },
							position: "absolute",
							width: { xs: "100%", md: 800 },
							left: { xs: 0, md: 10 },
							top: { xs: 100, md: 150 },
						}}>
						<Typography
							variant="h1"
							sx={{
								color: "white",
								fontWeight: "bold",
								fontSize: { xs: "2rem", md: "3rem" },
								border: "5px solid #dfbee7",
								padding: "20px",
								boxSizing: "border-box",
							}}>
							Coconut Tissue Culturing &<br />
							<Box
								component="span"
								sx={{ ml: { xs: 0, md: 20 } }}>
								Subculture Monitoring
							</Box>
						</Typography>
						<Typography
							variant="body1"
							mt={4}
							sx={{
								color: "#d1d5db",
								fontSize: { xs: "1rem", md: "1.25rem" },
							}}>
							An automated system for early disease
							detection,
							<br />
							ultimately enhancing coconut crop health and
							yield,
							<br />
							and promoting sustainable agricultural
							practices using
							<br />
							<a
								href="https://en.wikipedia.org/wiki/Deep_learning"
								style={{ textDecoration: "underline" }}>
								Deep Learning
							</a>{" "}
							and{" "}
							<a
								href="https://en.wikipedia.org/wiki/Computer_vision"
								style={{ textDecoration: "underline" }}>
								Computer Vision
							</a>
							.
						</Typography>
					</Box>
				</Container>
			</Box>
			<Box py={10} backgroundColor="#ccc6c9">
				<Container>
					<Grid
						container
						spacing={4}
						alignItems="center"
						direction={{ xs: "column", md: "row" }}>
						<Grid item xs={12} md={7}>
							<Box
								position="relative"
								sx={{
									height: { xs: "150px", md: "100px" },
									width: { xs: "100%", md: "400px" },
									display: "flex",
									justifyContent: "center",
								}}>
								<CardMedia
									component="img"
									alt="Company growth"
									image={image1}
									sx={{
										borderRadius: "50%",
										borderWidth: 10,
										borderColor: "green",
										width: { xs: 100, md: 200 },
										height: { xs: 100, md: 200 },
										objectFit: "cover",
										position: "absolute",
										top: { xs: "110%", md: "120%" },
										left: { xs: "80%", md: "120%" },
										transform: "translate(-50%, -50%)",
									}}
								/>
							</Box>

							<CardMedia
								component="img"
								alt="Company growth"
								image={image2}
								sx={{
									borderRadius: "50%",
									borderWidth: 10,
									borderColor: "green",
									width: { xs: 300, md: 500 },
									height: { xs: 300, md: 500 },
									objectFit: "cover",
									mx: "auto",
									my: 2,
								}}
							/>

							<Box
								position="relative"
								sx={{
									height: { xs: "150px", md: "100px" },
									width: { xs: "100%", md: "400px" },
									display: "flex",
									justifyContent: "center",
								}}>
								<CardMedia
									component="img"
									alt="Company growth"
									image={image3}
									sx={{
										borderRadius: "50%",
										borderWidth: 10,
										borderColor: "green",
										width: { xs: 100, md: 200 },
										height: { xs: 100, md: 200 },
										objectFit: "cover",
										position: "absolute",
										top: { xs: "-20%", md: "-50%" },
										left: { xs: "17.5%", md: "30%" },
										transform: "translate(-40%, -50%)",
									}}
								/>
							</Box>
						</Grid>

						<Grid item xs={12} md={5}>
							<CardContent>
								<Typography variant="h4" fontWeight="bold">
									IoT & Computer Vision for agriculture
									future development
								</Typography>
								<Typography
									variant="body1"
									color="textSecondary"
									mt={4}
									sx={{ color: "#4a5568" }}>
									An automated system for early disease
									detection, ultimately enhancing coconut
									crop health and yield, and promoting
									sustainable agricultural practices
									using Deep Learning and Computer
									Vision.
								</Typography>
								<List sx={{ mt: 3 }}>
									<ListItem>
										<ListItemIcon>
											<CheckCircleIcon
												sx={{ color: "green" }}
											/>
										</ListItemIcon>
										<ListItemText primary="Analyzing microscopic images to find types of Callus." />
									</ListItem>
									<ListItem>
										<ListItemIcon>
											<CheckCircleIcon
												sx={{ color: "green" }}
											/>
										</ListItemIcon>
										<ListItemText primary="Automatically capture plants images using IoT devices." />
									</ListItem>
									<ListItem>
										<ListItemIcon>
											<CheckCircleIcon
												sx={{ color: "green" }}
											/>
										</ListItemIcon>
										<ListItemText primary="Identifying and Calculating the Growth Factors Using Deep Learning" />
									</ListItem>
									<ListItem>
										<ListItemIcon>
											<CheckCircleIcon
												sx={{ color: "green" }}
											/>
										</ListItemIcon>
										<ListItemText primary="Disease identification and Detect Contamination in The Culture Medium" />
									</ListItem>
									<ListItem>
										<ListItemIcon>
											<CheckCircleIcon
												sx={{ color: "green" }}
											/>
										</ListItemIcon>
										<ListItemText primary="Efficiently Scheduling System and Community chat" />
									</ListItem>
								</List>
							</CardContent>
						</Grid>
					</Grid>
				</Container>
			</Box>
		</main>
	);
}

export default HomeSectionOne;
