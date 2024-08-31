import React from "react";
import CardComponent from "../home-section-card";
import image1 from "../../assets/images/image1.jpg";
import image2 from "../../assets/images/image2.jpg";
import image3 from "../../assets/images/image3.jpg";
import image4 from "../../assets/images/image4.jpg";
import image5 from "../../assets/images/image5.jpg";
import arrow from "../../assets/images/arrow.png";

const Arrow = () => (
	<div className="flex justify-center items-center mx-2">
		<img src={arrow} alt="arrow" className="h-4 w-6 md:h-6 md:w-10" />
	</div>
);

export default function HomeSectionTwo() {
	const cards = [
		{
			image: image1,
			description:
				"Plantations are farms specializing in cash crops, usually mainly planting a single crop, with perhaps ancillary areas for vegetables for eating and so on.",
		},
		{
			image: image2,
			description:
				"Plantations are farms specializing in cash crops, usually mainly planting a single crop, with perhaps ancillary areas for vegetables for eating and so on.",
		},
		{
			image: image3,
			description:
				"Plantations are farms specializing in cash crops, usually mainly planting a single crop, with perhaps ancillary areas for vegetables for eating and so on.",
		},
		{
			image: image4,
			description:
				"Plantations are farms specializing in cash crops, usually mainly planting a single crop, with perhaps ancillary areas for vegetables for eating and so on.",
		},
		{
			image: image5,
			description:
				"Plantations are farms specializing in cash crops, usually mainly planting a single crop, with perhaps ancillary areas for vegetables for eating and so on.",
		},
	];

	return (
		<div className="px-4 mb-7 md:px-8 lg:px-16">
			<div className="px-4 md:px-4 lg:px-6 mb-6">
				<h2 className="text-xl font-bold">
					Coconut Tissue Cultivation Steps
				</h2>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-5 gap-4">
				{cards.map((card, index) => (
					<React.Fragment key={index}>
						<div className="flex items-center">
							<CardComponent
								image={card.image}
								description={card.description}
							/>
							{index < cards.length - 1 && <Arrow />}
						</div>
					</React.Fragment>
				))}
			</div>
		</div>
	);
}
