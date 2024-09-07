import MovingIcon from "@mui/icons-material/Moving";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Stack,
  Typography,
  IconButton,
  Modal,
} from "@mui/material";
import { doc, updateDoc } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import moment from "moment";
import React, { useState } from "react";
import { toast } from "react-toastify";
import image4 from "../../assets/images/placeholder.png";
import image1 from "../../assets/images/back.jpeg";
import { db } from "../../util/firebaseConfig";

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

function CallusResults({ downloadInputURL, callusID, file }) {
  const [predictedShape, setPredictedShape] = useState("N/A");
  const [predictedColor, setPredictedColor] = useState("N/A");
  const [predictedArea, setPredictedArea] = useState("N/A");
  const [processedAreaImageUrl, setProcessedAreaImageUrl] = useState("");
  const [processedShapeImageUrl, setProcessedShapeImageUrl] = useState("");
  const [processedColorImageUrl, setProcessedColorImageUrl] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalImages, setModalImages] = useState({
    input: "",
    output: "",
  });

  const handleImageClick = (inputUrl, outputUrl) => {
    setModalImages({ input: inputUrl, output: outputUrl });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const ImageModal = () => (
    <Modal
      open={modalOpen}
      onClose={handleCloseModal}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={styleModal}>
        <IconButton
          aria-label="close"
          onClick={handleCloseModal}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
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
              }}
            >
              Original Image
            </Typography>
            <img
              src={modalImages.input}
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
              }}
            >
              Output Image
            </Typography>
            <img
              src={modalImages.output}
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
  );

  const date = moment().format("YYYY-MM-DD");

  const handleProcessColor = async () => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      if (!file) {
        toast.warning("Please upload a file to process.");
        return;
      }

      const response = await fetch(
        "http://127.0.0.1:8000/predict/callus_identification",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Server error occurred while uploading the file.");
      }

      const imageBlob = await response.blob();

      const xPredictions = response.headers.get("X-Predictions");

      if (xPredictions) {
        const cleanedHeader = xPredictions.replace(/'/g, '"');
        const predictions = JSON.parse(cleanedHeader);

        if (predictions.length > 0 && predictions[0].label) {
          const label = predictions[0].label;

          if (label === "Callus") {
            setPredictedColor("Available");
            const { downloadInputURL, downloadProcessURL } =
              await uploadImageToFirebase(imageBlob, file, "_color");

            setProcessedColorImageUrl(downloadProcessURL);

            updateFirebaseDocument({
              color: {
                color: "Available",
                original: downloadInputURL,
                processed: downloadProcessURL,
              },
            });
          } else {
            setPredictedShape("N/A");
          }
        } else {
          setPredictedShape("N/A");
        }
      } else {
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to upload and process file.");
    }
  };

  const handleProcessShape = async () => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      if (!file) {
        toast.warning("Please upload a file to process.");
        return;
      }

      const response = await fetch(
        "http://127.0.0.1:8000/predict/callus_shape_identification",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Server error occurred while uploading the file.");
      }

      const imageBlob = await response.blob();

      const xPredictions = response.headers.get("X-Predictions");

      if (xPredictions) {
        const cleanedHeader = xPredictions.replace(/'/g, '"');
        const predictions = JSON.parse(cleanedHeader);

        if (predictions.length > 0 && predictions[0].label) {
          const label = predictions[0].label;

          if (label) {
            setPredictedShape(label);
            const { downloadInputURL, downloadProcessURL } =
              await uploadImageToFirebase(imageBlob, file, "_shape");

            setProcessedShapeImageUrl(downloadProcessURL);

            updateFirebaseDocument({
              shape: {
                shape: label,
                original: downloadInputURL,
                processed: downloadProcessURL,
              },
            });
          } else {
            setPredictedShape("N/A");
          }
        } else {
          setPredictedShape("N/A");
        }
      } else {
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to process the file.");
    }
  };

  const handleProcessArea = async () => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      if (!file) {
        toast.warning("Please upload a file to process.");
        return;
      }

      const response = await fetch(
        "http://127.0.0.1:8000/predict/callus_area_calculation",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Server error occurred while uploading the file.");
      }

      const imageBlob = await response.blob();
      // const imageObjectURL = URL.createObjectURL(imageBlob);
      const xPredictions = response.headers.get("X-Predictions");

      if (xPredictions) {
        const cleanedHeader = xPredictions.replace(/'/g, '"');
        let predictions;

        try {
          predictions = JSON.parse(cleanedHeader);
        } catch (parseError) {
          console.error("Error parsing X-Predictions header:", parseError);
          predictions = null;
        }

        if (
          predictions &&
          Array.isArray(predictions) &&
          predictions.length > 0
        ) {
          const firstPrediction = predictions[0];

          const area = firstPrediction.area_cm2;

          if (area !== undefined && area !== null) {
            const formattedArea = area.toFixed(4);
            setPredictedArea(`${formattedArea} cm²`);

            const { downloadInputURL, downloadProcessURL } =
              await uploadImageToFirebase(imageBlob, file, "_area");

            setProcessedAreaImageUrl(downloadProcessURL);

            updateFirebaseDocument({
              area: {
                area: formattedArea,
                original: downloadInputURL,
                processed: downloadProcessURL,
              },
            });
          } else {
            setPredictedArea("N/A");
          }
        } else {
          setPredictedArea("50");
        }
      } else {
        setPredictedArea("50");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to process the file.");
    }
  };

  const updateFirebaseDocument = async (data) => {
    const docRef = doc(db, "data", "callus", date, callusID);

    try {
      await updateDoc(docRef, data);
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const uploadImageToFirebase = async (
    processImageBlob,
    inputImageBlob,
    process
  ) => {
    const storage = getStorage();

    const processStorageRef = ref(
      storage,
      `Callus/${date}/Processed/${callusID}${process}.jpg`
    );
    const inputStorageRef = ref(
      storage,
      `Callus/${date}/Unprocessed/${callusID}${process}.jpg`
    );

    try {
      const processSnapshot = await uploadBytes(
        processStorageRef,
        processImageBlob
      );
      const inputSnapshot = await uploadBytes(inputStorageRef, inputImageBlob);
      const downloadProcessURL = await getDownloadURL(processSnapshot.ref);
      const downloadInputURL = await getDownloadURL(inputSnapshot.ref);

      return { downloadProcessURL, downloadInputURL };
    } catch (error) {
      console.error("Failed to upload image to Firebase:", error);
      throw new Error("Failed to upload image to Firebase");
    }
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={8} md={6} lg={5} xl={5}>
          <Card
            elevation={2}
            sx={{
              mb: 2,
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "center",
            }}
          >
            <CardMedia
              component="img"
              image={processedShapeImageUrl ? processedShapeImageUrl : image4}
              alt={`Step 01`}
              sx={{
                width: { xs: "100%", sm: 200 },
                height: { xs: "auto", sm: 200 },
                p: 2,
                order: { xs: 2, md: 1 },
                cursor: "pointer",
              }}
              onClick={() =>
                handleImageClick(downloadInputURL, processedShapeImageUrl)
              }
            />
            <CardContent
              sx={{
                flexGrow: 1,
                order: { xs: 2, md: 1 },
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  fontWeight: "bold",
                  fontFamily: "Poppins",
                }}
              >
                Step 01 (Shape)
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <PersonOutlineIcon
                  sx={{
                    color: "#808080",
                  }}
                />
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: "#808080",
                    fontFamily: "Poppins",
                  }}
                >
                  Image ID: &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;
                  <b>{callusID ? callusID : "Callus ID"}</b>
                </Typography>
              </Stack>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <MovingIcon sx={{ color: "#808080" }} />
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: "#808080",
                    fontFamily: "Poppins",
                  }}
                >
                  Predicted Shape: &nbsp;&nbsp;
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: "#33B864",
                    fontWeight: 700,
                    fontFamily: "Poppins",
                  }}
                >
                  {predictedShape}
                </Typography>
              </Stack>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  mt: 1,
                }}
              >
                <Button
                  sx={{
                    fontFamily: "Poppins",
                    backgroundColor: "#33B864",
                    "&:hover": {
                      backgroundColor: "darkgreen",
                      "@media (hover: none)": {
                        backgroundColor: "#33B864",
                      },
                    },
                  }}
                  variant="contained"
                  onClick={handleProcessShape}
                >
                  Process
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card
            elevation={2}
            sx={{
              mb: 2,
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "center",
            }}
          >
            <CardMedia
              component="img"
              image={processedColorImageUrl ? processedColorImageUrl : image4}
              alt={`Step 02`}
              sx={{
                width: { xs: "100%", sm: 200 },
                height: { xs: "auto", sm: 200 },
                p: 2,
                order: { xs: 2, md: 1 },
                cursor: "pointer",
              }}
              onClick={() =>
                handleImageClick(downloadInputURL, processedColorImageUrl)
              }
            />
            <CardContent
              sx={{
                flexGrow: 1,
                order: { xs: 2, md: 1 },
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  fontWeight: "bold",
                  fontFamily: "Poppins",
                }}
              >
                Step 02 (Color)
              </Typography>

              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <MovingIcon sx={{ color: "#808080" }} />
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: "#808080",
                    fontFamily: "Poppins",
                  }}
                >
                  Predicted Color: &nbsp;&nbsp;
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: "#33B864",
                    fontWeight: 700,
                    fontFamily: "Poppins",
                  }}
                >
                  {predictedColor}
                </Typography>
              </Stack>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  mt: 1,
                }}
              >
                <Button
                  sx={{
                    fontFamily: "Poppins",
                    backgroundColor: "#33B864",
                    "&:hover": {
                      backgroundColor: "darkgreen",
                      "@media (hover: none)": {
                        backgroundColor: "#33B864",
                      },
                    },
                  }}
                  variant="contained"
                  onClick={handleProcessColor}
                >
                  Process
                </Button>
              </Box>
            </CardContent>
          </Card>
          <Card
            elevation={2}
            sx={{
              mb: 2,
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "center",
            }}
          >
            <CardMedia
              component="img"
              image={processedAreaImageUrl ? processedAreaImageUrl : image4}
              alt={`Step 03`}
              sx={{
                width: { xs: "100%", sm: 200 },
                height: { xs: "auto", sm: 200 },
                p: 2,
                order: { xs: 2, md: 1 },
                cursor: "pointer",
              }}
              onClick={() =>
                handleImageClick(downloadInputURL, processedAreaImageUrl)
              }
            />
            <CardContent
              sx={{
                flexGrow: 1,
                order: { xs: 2, md: 1 },
              }}
            >
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  fontWeight: "bold",
                  fontFamily: "Poppins",
                }}
              >
                Step 03 (Area)
              </Typography>

              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <MovingIcon sx={{ color: "#808080" }} />

                <Typography
                  variant="subtitle1"
                  sx={{
                    color: "#808080",
                    fontFamily: "Poppins",
                  }}
                >
                  Predicted Area: &nbsp;&nbsp;
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: "#33B864",
                    fontWeight: 700,
                    fontFamily: "Poppins",
                  }}
                >
                  {predictedArea}
                </Typography>
              </Stack>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  mt: 1,
                }}
              >
                <Button
                  sx={{
                    fontFamily: "Poppins",
                    backgroundColor: "#33B864",
                    "&:hover": {
                      backgroundColor: "darkgreen",
                      "@media (hover: none)": {
                        backgroundColor: "#33B864",
                      },
                    },
                  }}
                  variant="contained"
                  onClick={handleProcessArea}
                >
                  Process
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={7} md={7} lg={8} xl={7}>
          <Card
            sx={{
              padding: 2,
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              display: "flex",
            }}
          >
            <Box
              sx={{
                flex: 1,
                textAlign: "justify", // Ensure text is aligned properly
                marginRight: { sm: 2 }, // Add some margin between text and image on larger screens
              }}
            >
              Planting trees is one of the best things we can do for the best
              things we can do for the environment. Trees absorb carbon dioxide,
              which is one of the greenhouse gases that contribute to climate
              change. They also release oxygen into the atmosphere. One tree can
              produce enough oxygen for two people to breathe. Trees absorb
              carbon dioxide, which is one of the greenhouse gases that
              contribute to climate change. They also release oxygen into the
              atmosphere. One tree can produce enough oxygen for two people to
              breathe. Trees absorb carbon dioxide, which is one of the
              greenhouse gases that contribute to climate change. They also
              release oxygen into the atmosphere. One tree can produce enough
              oxygen for two people to breathe. Trees absorb carbon dioxide,
              which is one of the greenhouse gases that contribute to climate
              change. They also release oxygen into the atmosphere. One tree can
              produce enough oxygen for two people to breathe. Trees absorb
              carbon dioxide test.
            </Box>
            <CardMedia
              component="img"
              image={image1}
              alt="Predicted"
              sx={{
                width: { xs: "100%", sm: "50%" },
                height: 290,
                maxHeight: 485,
                alignItems: "center",
                display: "flex",
                justifyContent: "center",
                borderColor: "white",
                borderWidth: 1,
                borderStyle: "solid",
                marginTop: { xs: 2, sm: 0 },
              }}
            />
          </Card>
        </Grid>
      </Grid>
      <ImageModal />
    </>
  );
}

export default CallusResults;
