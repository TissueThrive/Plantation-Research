import React from "react";
import { Card, CardContent, CardMedia, Typography } from "@mui/material";

const CardComponent = ({ image, description }) => {
  return (
    <Card className="w-56 h-80 mx-auto shadow-lg rounded-lg overflow-hidden">
      <CardMedia
        component="img"
        image={image}
        alt="card image"
        className="h-32 w-full object-cover"
      />
      <CardContent className="h-48 flex items-center justify-center">
        <Typography
          variant="body2"
          className="text-gray-600 text-center px-2 py-1"
          style={{
            overflow: "hidden",
            whiteSpace: "normal",
            wordWrap: "break-word",
          }}
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default CardComponent;
