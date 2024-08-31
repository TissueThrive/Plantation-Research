import { Typography, Stack } from "@mui/material";
// ----------------------------------------------------------------------

function EmptyContent({ title, description, img, sx, ...other }) {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      sx={{
        height: 1,
        textAlign: "center",
        p: (theme) => theme.spacing(0, 2),
        ...sx,
      }}
      {...other}
    >
      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>

      {description && (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {description}
        </Typography>
      )}
    </Stack>
  );
}

export default EmptyContent;
