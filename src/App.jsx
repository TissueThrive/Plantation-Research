import { useEffect, useState } from "react";
import Footer from "./components/footer";
import NavigationBar from "./components/navigation-bar";
import PageRoutes from "./routes/App";
import { CategoryProvider } from "./context/CategoryContext";
import { AuthProvider } from "./context/authContext";

function App() {
  const [navItem, setNavItem] = useState("");

  useEffect(() => {
    const currentURL = window.location.href;
    let parts = currentURL.split("/")[3];

    if (parts === "") {
      setNavItem("home");
    } else {
      setNavItem(parts);
    }
  }, []);

  return (
    <>
      <AuthProvider>
        <CategoryProvider>
          <NavigationBar navItem={navItem} />
          <PageRoutes />
          <Footer />
        </CategoryProvider>
      </AuthProvider>
    </>
  );
}

export default App;
