import React from "react";
import ReactLoading from "react-loading";

export default function Loading() {
	return (
		<div
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				height: "100vh",
			}}>
			<ReactLoading
				type="bubbles"
				color="#fb6544"
				height={200}
				width={100}
			/>
		</div>
	);
}
