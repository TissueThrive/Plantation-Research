import React, { createContext, useContext, useState, useEffect } from "react";
import Loading from "../components/loading";
import { auth, db } from "../util/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    role: "",
    mobile: "",
    dob: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      setLoading(false);
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userData = await getDoc(userRef);
        if (userData.exists()) {
          setUserData(userData.data());
        } else {
          // Handle scenario where user data doesn't exist
          console.log("No user data available");
        }
      } else {
        setUserData({
          firstname: "",
          lastname: "",
          email: "",
          role: "",
          mobile: "",
          dob: "",
        });
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    return auth.signInWithEmailAndPassword(email, password);
  };

  const handleSetUserData = (data) => {
    setUserData({
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      role: data.role,
      mobile: data.mobile,
      dob: data.dob,
    });
  };

  const logout = () => {
    return auth.signOut();
  };

  const value = {
    currentUser,
    login,
    logout,
    loading,
    handleSetUserData,
    userData,
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
