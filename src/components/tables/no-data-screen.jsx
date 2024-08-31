import { TableRow, TableCell, TableBody } from "@mui/material";
import EmptyContent from "./empty-content";

// ----------------------------------------------------------------------

function TableNoData({ isNotFound }) {
  return (
    <TableBody>
      <TableRow>
        {isNotFound === 0 ? (
          <TableCell colSpan={12}>
            <EmptyContent
              title="No Data"
              sx={{
                "& span.MuiBox-root": { height: 160 },
                color: "grey.500",
              }}
            />
          </TableCell>
        ) : (
          <TableCell colSpan={12} sx={{ p: 0 }} />
        )}
      </TableRow>
    </TableBody>
  );
}

export default TableNoData;
