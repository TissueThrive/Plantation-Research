import { Box } from "@mui/material";
import React, { useState } from "react";
import BreadCrumbs from "../../components/breadcrumbs";
import CallusUploadComponent from "../../components/callusFeatures/index";
import CallusImages from "../../components/callusimages/index";
import CallusResults from "../../components/callusResults";
import CallusFeatureTable from "../../components/tables/table-callus-features";

function CallusFeatures() {
	const [callusID, setCallusID] = useState("");
	const [downloadInputURL, setDownloadInputURL] = useState("");
	const [downloadProcessURL, setDownloadProcessURL] = useState("");
	const [file, setFile] = useState(null);

	return (
		<>
			<BreadCrumbs />
			<Box>
				<Box p={5}>
					<Box
						mt={2}
						display="flex"
						flexDirection={{ xs: "column", sm: "row" }}
						justifyContent="space-between"
						alignItems="center">
						<Box
							flex={{ xs: 1, sm: "0 1 30%" }}
							mb={{ xs: 3, sm: 0 }}>
							<CallusUploadComponent
								setCallusID={setCallusID}
								callusID={callusID}
								setDownloadInputURL={setDownloadInputURL}
								setDownloadProcessURL={setDownloadProcessURL}
								setFile={setFile}
							/>
						</Box>
						<Box
							flex={{ xs: 1, sm: "0 1 70%" }}
							mt={{ xs: 1, sm: 0 }}
							mb={{ xs: 3, sm: 0 }}
							mr={{ sm: 1 }}>
							<CallusImages />
						</Box>
					</Box>
				</Box>
			</Box>
			<Box
				p={5}
				sx={{
					pb: 2,
					borderBottomColor: "#D3D3D3",
					borderBottomWidth: 2,
				}}>
				<CallusResults
					downloadProcessURL={downloadProcessURL}
					callusID={callusID}
					file={file}
				/>
			</Box>
			<CallusFeatureTable />
		</>
	);
}

export default CallusFeatures;
