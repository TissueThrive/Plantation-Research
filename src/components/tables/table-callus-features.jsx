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
  Pagination,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { db } from "../../util/firebaseConfig";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
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

const CallusFeatureTable = () => {
  const [open, setOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState({
    original: "",
    output: "",
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [tableDate, setTableDate] = useState(null);
  const [date, setDate] = useState(null);
  const [documents, setDocuments] = useState([]);
  const isNotFound = documents.length;

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

  const handleColorChange = (docId, newColor) => {
    setDocuments((prevDocuments) =>
      prevDocuments.map((doc) =>
        doc.id === docId ? { ...doc, color: { color: newColor } } : doc
      )
    );
  };

  const handleShapeChange = (docId, newShape) => {
    setDocuments((prevDocuments) =>
      prevDocuments.map((doc) =>
        doc.id === docId ? { ...doc, shape: { shape: newShape } } : doc
      )
    );
  };

  const handleReasonChange = (docId, newReason) => {
    setDocuments((prevDocuments) =>
      prevDocuments.map((doc) =>
        doc.id === docId ? { ...doc, reason: newReason } : doc
      )
    );
  };

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

  const fetchAllDocuments = async (date) => {
    const collRef = collection(db, "data", "callus", date);

    try {
      const snapshot = await getDocs(collRef);
      const documentsArray = [];
      snapshot.forEach((doc) => {
        documentsArray.push({ id: doc.id, ...doc.data() });
      });
      setPage(0);
      return documentsArray;
    } catch (error) {
      console.error("Error fetching documents:", error);
      return [];
    }
  };

  const handleDelete = async (docId, date) => {
    try {
      const docRef = doc(db, "data", "callus", date, docId);
      await deleteDoc(docRef);
      toast.success(`Callus record deleted successfully`);

      const updatedDocuments = await fetchAllDocuments(date);
      setDocuments(updatedDocuments);
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const updateDocument = async (docId, updatedData) => {
    try {
      const docRef = doc(db, "data", "callus", date, docId);
      await updateDoc(docRef, updatedData);
      toast.success(`Callus record updated successfully`);
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  const TABLE_HEADER = [
    { label: "No", width: "5%" },
    { label: "Image", width: "7%" },
    { label: "Name", width: "5%" },
    { label: "Status", width: "10%" },
    { label: "Shape", width: "10%" },
    { label: "Color", width: "10%" },
    { label: "Area (cm)", width: "3%" },
    { label: "New Status Reason", width: "12%" },
    // { label: "Subculture Due Date", width: "8%" },
    { label: " ", width: "4%" },
    { label: "Actions", width: "20%" },
  ];

  const totalPages = Math.ceil(documents.length / rowsPerPage);

  return (
    <>
      <Box p={5}>
        <Typography
          sx={{
            fontSize: 15,
            fontWeight: 600,
            fontFamily: "Poppins",
          }}
        >
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
        }}
      >
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
                  }}
                >
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
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
                  <TableRow key={index}>
                    <TableCell
                      sx={{
                        textAlign: "center",
                        borderBottom: "1px solid #D3D3D3",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 12,
                        }}
                      >
                        {index + 1}
                      </Typography>
                    </TableCell>
                    <TableCell
                      sx={{
                        textAlign: "center",
                        borderBottom: "1px solid #D3D3D3",
                      }}
                    >
                      <img
                        src={row.original}
                        alt="Image"
                        style={{
                          width: "fixed",
                          height: "fixed",
                          objectFit: "cover",
                          cursor: "pointer",
                        }}
                        onClick={() => handleOpen(row.original, row.processed)}
                      />
                    </TableCell>
                    <TableCell
                      sx={{
                        textAlign: "center",
                        borderBottom: "1px solid #D3D3D3",
                      }}
                    >
                      {row.callusID}
                    </TableCell>
                    <TableCell
                      sx={{
                        textAlign: "center",
                        borderBottom: "1px solid #D3D3D3",
                      }}
                    >
                      <Chip
                        variant="soft"
                        label={
                          (row.shape.shape === "Frilly-shape" ||
                            row.shape.shape === "Ear-shape") &&
                          row.color.color === "Available"
                            ? "Embryogenic"
                            : row.shape.shape === "No" &&
                              row.color.color === "Available"
                            ? "No Prediction"
                            : "Non-Embryogenic"
                        }
                        sx={{
                          bgcolor:
                            (row.shape.shape === "Frilly-shape" ||
                              row.shape.shape === "Ear-shape") &&
                            row.color.color === "Available"
                              ? "#c9f2de"
                              : row.shape.shape === "No" &&
                                row.color.color === "Available"
                              ? "#e0e0e0"
                              : "#f2c9cf",
                          color:
                            (row.shape.shape === "Frilly-shape" ||
                              row.shape.shape === "Ear-shape") &&
                            row.color.color === "Available"
                              ? "#228B22"
                              : row.shape.shape === "No" &&
                                row.color.color === "Available"
                              ? "#000000"
                              : "#ed2323",
                        }}
                      />
                    </TableCell>

                    <TableCell
                      sx={{
                        textAlign: "center",
                        borderBottom: "1px solid #D3D3D3",
                      }}
                    >
                      <Select
                        value={row.shape.shape}
                        onChange={(e) =>
                          handleShapeChange(row.id, e.target.value)
                        }
                        fullWidth
                        inputProps={{
                          "aria-label": "Without label",
                        }}
                        sx={{
                          backgroundColor: "#FFFFFF",
                          borderRadius: "4px",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          "& .MuiSelect-select": {
                            paddingLeft: "8px",
                            paddingRight: "24px",
                            paddingTop: "8px",
                            paddingBottom: "8px",
                          },
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: "none",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            border: "none",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            border: "none",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                          },
                        }}
                      >
                        <MenuItem value="Frilly-shape">Frilly</MenuItem>
                        <MenuItem value="Ear-shape">Ear</MenuItem>
                        <MenuItem value="No">No</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell
                      sx={{
                        textAlign: "center",
                        borderBottom: "1px solid #D3D3D3",
                      }}
                    >
                      <Select
                        value={row.color.color}
                        onChange={(e) =>
                          handleColorChange(row.id, e.target.value)
                        }
                        displayEmpty
                        fullWidth
                        inputProps={{
                          "aria-label": "Without label",
                        }}
                        sx={{
                          backgroundColor: "#FFFFFF",
                          borderRadius: "4px",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          "& .MuiSelect-select": {
                            paddingLeft: "8px",
                            paddingRight: "24px",
                            paddingTop: "8px",
                            paddingBottom: "8px",
                          },
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: "none",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            border: "none",
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            border: "none",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                          },
                        }}
                      >
                        <MenuItem value="Available">Available</MenuItem>
                        <MenuItem value="Not Available">Not Available</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell
                      sx={{
                        textAlign: "center",
                        borderBottom: "1px solid #D3D3D3",
                      }}
                    >
                      {row.area.area}
                    </TableCell>
                    <TableCell
                      sx={{
                        textAlign: "center",
                        borderBottom: "1px solid #D3D3D3",
                      }}
                    >
                      <TextField
                        placeholder="Your New Reason"
                        value={row.reason}
                        onChange={(e) =>
                          handleReasonChange(row.id, e.target.value)
                        }
                        sx={{
                          width: "100%",
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
                          "& .MuiInputLabel-root.Mui-focused": {
                            color: "#fb6544",
                          },
                        }}
                      />
                    </TableCell>

                    <TableCell
                      sx={{
                        textAlign: "center",
                        borderBottom: "1px solid #D3D3D3",
                      }}
                    >
                      <Button
                        variant="outlined"
                        sx={{
                          borderColor: "red",
                          borderRadius: 5,
                          color: "red",
                        }}
                      >
                        Notify{" "}
                      </Button>
                    </TableCell>
                    <TableCell
                      sx={{
                        textAlign: "center",
                        borderBottom: "1px solid #D3D3D3",
                        p: 1,
                      }}
                    >
                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: "orange",
                          mr: { xs: 1, sm: 2 },
                          width: {
                            xs: "100%",
                            sm: "auto",
                          },
                          "&:hover": {
                            backgroundColor: "darkorange",
                          },
                          mb: { xs: 1, sm: 0 },
                        }}
                        onClick={() =>
                          updateDocument(row.id, {
                            reason: row.reason,
                            shape: {
                              shape: row.shape.shape,
                            },
                            color: {
                              color: row.color.color,
                            },
                          })
                        }
                      >
                        Update
                      </Button>
                      <Button
                        variant="contained"
                        sx={{
                          backgroundColor: "red",
                          width: {
                            hovercolor: "red",
                            xs: "100%",
                            sm: "auto",
                          },
                          "&:hover": {
                            backgroundColor: "darkred",
                          },
                        }}
                        onClick={() => handleDelete(row.id, date)}
                      >
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
        aria-describedby="modal-modal-description"
      >
        <Box sx={styleModal}>
          <IconButton
            aria-label="close"
            onClick={handleClose}
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
                }}
              >
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

export default CallusFeatureTable;
