import React, { createContext, useContext, useState } from "react";

const CategoryContext = createContext(null); 

export const useCategory = () => useContext(CategoryContext);

export const CategoryProvider = ({ children }) => {
	const [category, setCategory] = useState("");

	const handleSetCategory = (newCategory) => {
		setCategory(newCategory);
	};

	return (
		<CategoryContext.Provider value={{ category, handleSetCategory }}>
			{children}
		</CategoryContext.Provider>
	);
};
