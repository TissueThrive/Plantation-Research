import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  IconButton,
} from "@mui/material";
import GrassIcon from "@mui/icons-material/Grass";
import ImageIcon from "@mui/icons-material/Image";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import MoreVertIcon from "@mui/icons-material/MoreVert";

function StatsPanel({ statsData }) { 
  return (
    <Card
      variant="outlined"
      sx={{
        p: 1,
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
        width: { xs: "100%", sm: "70%" },
        height: 160,
        backgroundColor: "#fff",
        display: "inline-block",
        verticalAlign: "top",
        position: "relative",
      }}
    >
      <CardContent>
        <Grid
          container
          alignItems="center"
          spacing={2}
          justifyContent="flex-start"
        >
          <Grid item>
            <Box className="flex items-center">
              <GrassIcon sx={{ color: "gray" }} />
              <Typography
                variant="body2"
                sx={{ ml: 1, fontFamily: "Poppins", fontSize: "0.875rem" }}
              >
                Total Plants
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  ml: 5.5,
                  fontFamily: "Poppins",
                  fontWeight: "bold",
                  fontSize: "0.875rem",
                }}
              >
                {statsData?.totalPlants || 0}
              </Typography>
            </Box>
          </Grid>
          <Grid item>
            <Box className="flex items-center">
              <ImageIcon sx={{ color: "gray" }} />
              <Typography
                variant="body2"
                sx={{ ml: 1, fontFamily: "Poppins", fontSize: "0.875rem" }}
              >
                Total Images
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  ml: 4,
                  fontFamily: "Poppins",
                  fontWeight: "bold",
                  fontSize: "0.875rem",
                }}
              >
                {statsData?.totalImages || 0}
              </Typography>
            </Box>
          </Grid>
          <Grid item>
            <Box className="flex items-center">
              <CalendarTodayIcon sx={{ color: "gray" }} />
              <Typography
                variant="body2"
                sx={{ ml: 1, fontFamily: "Poppins", fontSize: "0.875rem" }}
              >
                Date
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  ml: 11,
                  fontFamily: "Poppins",
                  fontWeight: "bold",
                  fontSize: "0.875rem",
                }}
              >
                {statsData?.date || "N/A"}
              </Typography>
            </Box>
          </Grid>
        </Grid>
        <IconButton
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            color: "gray",
            transform: "rotate(90deg)",
          }}
        >
          <MoreVertIcon />
        </IconButton>
      </CardContent>
    </Card>
  );
}

export default StatsPanel;
