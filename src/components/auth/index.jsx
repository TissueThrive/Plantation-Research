/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import { useSpring, animated } from "@react-spring/web";
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Google,
  Person,
  Phone,
} from "@mui/icons-material";
import InputAdornment from "@mui/material/InputAdornment";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import { InputLabel } from "@mui/material";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { auth, db } from "../../util/firebaseConfig";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { useAuth } from "../../context/authContext";
import moment from "moment";

const Fade = React.forwardRef(function Fade(props, ref) {
  const {
    children,
    in: open,
    onClick,
    onEnter,
    onExited,
    ownerState,
    ...other
  } = props;
  const style = useSpring({
    from: { opacity: 0 },
    to: { opacity: open ? 1 : 0 },
    onStart: () => {
      if (open && onEnter) {
        onEnter(null, true);
      }
    },
    onRest: () => {
      if (!open && onExited) {
        onExited(null, true);
      }
    },
  });

  return (
    <animated.div ref={ref} style={style} {...other}>
      {React.cloneElement(children, { onClick })}
    </animated.div>
  );
});

Fade.propTypes = {
  children: PropTypes.element.isRequired,
  in: PropTypes.bool,
  onClick: PropTypes.any,
  onEnter: PropTypes.func,
  onExited: PropTypes.func,
  ownerState: PropTypes.any,
};

const loginFormStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: 350, sm: 400, md: 500, lg: 500 },
  bgcolor: "background.paper",
  border: "none",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

const signupFormStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: 350, sm: 500, md: 500, lg: 600 },
  bgcolor: "background.paper",
  border: "none",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

export default function LoginModal({ isOpen, onClose }) {
  const { currentUser, handleSetUserData } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [visible, setVisible] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState();
  const [dob, setDob] = useState(moment());
  const [role, setRole] = useState(-1);
  const [signupEmail, setSignupEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const isValid = await validateRegister();
      if (isValid) {
        await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
        const user = auth.currentUser;
        if (user) {
          await setDoc(doc(db, "users", user.uid), {
            firstname: firstname,
            lastname: lastname,
            dob: dayjs(dob).toISOString(),
            role: role,
            mobile: mobile,
            email: user.email,
          });
        }
        toast.success("User created successfully");
        handleSignUpClose();
        setVisible(true);
        resetRegisterForm();
      } else {
        return;
      }
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        toast.error("The email is already in use.");
      } else {
      }
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const valid = await validateLoginForm();

      if (valid) {
        await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
        toast.success("Logged in successfully!");
        handleSignInClose();
        resetLoginForm();
      }
    } catch (error) {
      if (error.code === "auth/invalid-credential") {
        toast.error("Invalid Credentials");
      } else {
      }
    }
  };

  // OAuth 2.0
  const loginWithGoogle = () => {
    if (isLoggingIn) return;

    setIsLoggingIn(true);
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then(async (res) => {
        if (res.user) {
          const user = res.user;
          await setDoc(doc(db, "users", user.uid), {
            firstname: user.displayName.split(" ")[0],
            lastname: user.displayName.split(" ")[1],
            dob: "",
            role: "Guest",
            mobile: "",
            email: user.email,
          });
          toast.success("Logged in successfully!");
          handleSignInClose();
          resetLoginForm();
        }
      })
      .catch((error) => {
        console.error("Authentication failed:", error);
      })
      .finally(() => {
        setIsLoggingIn(false);
      });
  };

  useEffect(() => {
    return () => {
      setIsLoggingIn(false);
    };
  }, []);

  const validateRegister = async () => {
    if (firstname.trim() === "") {
      toast.error("First name is required");
      return false;
    } else if (lastname.trim() === "") {
      toast.error("Last name is required");
      return false;
    } else if (signupEmail.trim() === "") {
      toast.error("Email is required");
      return false;
    } else if (!validateEmail(signupEmail)) {
      toast.error("Invalid email address");
      return false;
    } else if (signupPassword.trim() === "") {
      toast.error("Password is required");
      return false;
    } else if (confirmPassword.trim() === "") {
      toast.error("Confirm password is required");
      return false;
    } else if (signupPassword.trim() !== confirmPassword.trim()) {
      toast.error("Passwords do not match");
      return false;
    } else if (role === -1) {
      toast.error("Role selection is required");
      return false;
    } else if (mobile.trim() === "") {
      toast.error("Mobile number is required");
      return false;
    } else if (!validatePhone(mobile)) {
      toast.error("Invalid phone number");
      return false;
    } else if (dob.trim() === "") {
      toast.error("Date of birth is required");
      return false;
    } else {
      return true;
    }
  };

  const validateLoginForm = async () => {
    if (loginEmail.trim() === "") {
      toast.error("Email is required");
      return false;
    } else if (!validateEmail(loginEmail)) {
      toast.error("Invalid email address");
      return false;
    } else if (loginPassword.trim() === "") {
      toast.error("Password is required");
      return false;
    } else {
      return true;
    }
  };

  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function validatePhone(phoneNumber) {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
  }

  const resetRegisterForm = () => {
    setFirstname("");
    setLastname("");
    setDob(dayjs());
    setRole(-1);
    setSignupEmail("");
    setMobile("");
    setSignupPassword("");
    setConfirmPassword("");
  };

  const resetLoginForm = () => {
    setLoginEmail("");
    setLoginPassword("");
  };

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (currentUser) {
      const docRef = doc(db, "users", currentUser.uid);
      getDoc(docRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            handleSetUserData(data);
          } else {
            // Perhaps handle the situation where no user data exists
          }
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    }
  }, [currentUser, handleSetUserData]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSignUpClose = () => {
    setShowSignUp(false);
  };

  const handleSignInClose = () => {
    onClose();
    setVisible(false);
  };

  return (
    <div>
      <Modal
        aria-labelledby="spring-modal-title"
        aria-describedby="spring-modal-description"
        open={visible && !showSignUp}
        onClose={handleSignInClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            TransitionComponent: Fade,
          },
        }}
      >
        <Fade in={visible && !showSignUp}>
          <Box sx={loginFormStyle}>
            <h2 className="text-2xl font-bold mb-2 text-center">Sign In</h2>
            <p className="text-gray-500 mb-6 text-center">Welcome back</p>
            <form>
              <div className="mb-8">
                <div className="relative">
                  <TextField
                    className="w-full p-3 pl-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    type="text"
                    id="email"
                    label="Email"
                    variant="outlined"
                    placeholder="Enter your email address"
                    onChange={(e) => setLoginEmail(e.target.value)}
                    sx={{
                      width: "100%",
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "gray",
                        },
                        "&:hover fieldset": {
                          borderColor: "gray",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#fb6544",
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "#fb6544",
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email
                            style={{
                              color: "gray",
                            }}
                          />
                        </InputAdornment>
                      ),
                    }}
                    InputLabelProps={{
                      sx: {
                        fontFamily: "Poppins",
                      },
                    }}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="mb-8">
                <div className="relative">
                  <TextField
                    type={showPassword ? "text" : "password"}
                    id="password"
                    label="Password"
                    placeholder="Enter your password"
                    variant="outlined"
                    onChange={(e) => setLoginPassword(e.target.value)}
                    sx={{
                      width: "100%",
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "gray",
                        },
                        "&:hover fieldset": {
                          borderColor: "gray",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#fb6544",
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: "#fb6544",
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock
                            style={{
                              color: "gray",
                            }}
                          />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment
                          position="start"
                          onClick={togglePasswordVisibility}
                          className="hover:cursor-pointer"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </InputAdornment>
                      ),
                    }}
                    InputLabelProps={{
                      sx: {
                        fontFamily: "Poppins",
                      },
                    }}
                  />
                </div>
              </div>

              <button
                type="button"
                className="w-full bg-orange text-white py-3 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-lightOrange hover:bg-darkOrange"
                onClick={handleLogin}
              >
                Sign In
              </button>

              <div className="my-4 flex items-center justify-center text-gray-500">
                <hr className="flex-grow border-gray-300" />
                <span className="px-2">OR</span>
                <hr className="flex-grow border-gray-300" />
              </div>

              <button
                type="button"
                className="w-full bg-red-600 text-white py-3 rounded-lg flex items-center justify-center hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600"
                onClick={loginWithGoogle}
              >
                <span className="mr-2">
                  <Google />
                </span>
                Continue with Google
              </button>

              <div className="text-center mt-4">
                <p className="text-sm">
                  Don't have an account?{" "}
                  <a
                    className="text-orange hover:underline hover:cursor-pointer"
                    onClick={() => {
                      handleSignInClose();
                      setShowSignUp(true);
                    }}
                  >
                    Sign up
                  </a>
                </p>
              </div>
            </form>
          </Box>
        </Fade>
      </Modal>

      <Modal
        aria-labelledby="spring-modal-title"
        aria-describedby="spring-modal-description"
        open={showSignUp}
        onClose={handleSignUpClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            TransitionComponent: Fade,
          },
        }}
      >
        <Fade in={showSignUp}>
          <Box sx={signupFormStyle}>
            <h2 className="text-2xl font-bold mb-2 text-center">Sign Up</h2>
            <p className="text-gray-500 mb-6 text-center">
              Create a new account
            </p>
            <form>
              <div className="mb-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-2">
                  <div>
                    <TextField
                      className="w-full p-3 pl-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                      type="text"
                      id="firstname"
                      label="First Name"
                      variant="outlined"
                      placeholder="Enter your first name"
                      onChange={(e) => setFirstname(e.target.value)}
                      sx={{
                        width: "100%",
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "gray",
                          },
                          "&:hover fieldset": {
                            borderColor: "gray",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#fb6544",
                          },
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#fb6544",
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person
                              style={{
                                color: "gray",
                              }}
                            />
                          </InputAdornment>
                        ),
                      }}
                      InputLabelProps={{
                        sx: {
                          fontFamily: "Poppins",
                        },
                      }}
                    />
                  </div>

                  <div>
                    <TextField
                      className="w-full p-3 pl-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                      type="text"
                      id="lastname"
                      label="Last Name"
                      placeholder="Enter your last name"
                      variant="outlined"
                      onChange={(e) => setLastname(e.target.value)}
                      sx={{
                        width: "100%",
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "gray",
                          },
                          "&:hover fieldset": {
                            borderColor: "gray",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#fb6544",
                          },
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#fb6544",
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person
                              style={{
                                color: "gray",
                              }}
                            />
                          </InputAdornment>
                        ),
                      }}
                      InputLabelProps={{
                        sx: {
                          fontFamily: "Poppins",
                        },
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-2">
                  <div>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Date of Birth"
                        value={dob}
                        onChange={(newValue) => setDob(newValue)}
                        sx={{
                          fontFamily: "Poppins",
                          width: "100%",
                          "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                              borderColor: "gray",
                            },
                            "&:hover fieldset": {
                              borderColor: "gray",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#fb6544",
                            },
                          },
                          "& .MuiInputLabel-root": {
                            fontFamily: "Poppins",
                          },
                          "& .MuiInputLabel-root.Mui-focused": {
                            color: "#fb6544",
                          },
                        }}
                        InputLabelProps={{
                          sx: {
                            fontFamily: "Poppins",
                          },
                        }}
                      />
                    </LocalizationProvider>
                  </div>

                  <div>
                    <FormControl
                      sx={{
                        width: "100%",
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "gray",
                          },
                          "&:hover fieldset": {
                            borderColor: "gray",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#fb6544",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          fontFamily: "Poppins",
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#fb6544",
                        },
                      }}
                    >
                      <InputLabel
                        sx={{
                          fontFamily: "Poppins",
                        }}
                      >
                        Role
                      </InputLabel>
                      <Select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        label="Role"
                        sx={{
                          fontFamily: "Poppins",
                        }}
                      >
                        <MenuItem
                          value={-1}
                          sx={{
                            fontFamily: "Poppins",
                          }}
                        >
                          Please Select
                        </MenuItem>
                        <MenuItem
                          value={"Admin"}
                          sx={{
                            fontFamily: "Poppins",
                          }}
                        >
                          Admin
                        </MenuItem>
                        <MenuItem
                          value={"Senior Officer"}
                          sx={{
                            fontFamily: "Poppins",
                          }}
                        >
                          Senior Officer
                        </MenuItem>
                        <MenuItem
                          value={"Officer"}
                          sx={{
                            fontFamily: "Poppins",
                          }}
                        >
                          Officer
                        </MenuItem>
                        <MenuItem
                          value={"Intern"}
                          sx={{
                            fontFamily: "Poppins",
                          }}
                        >
                          Intern
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-2">
                  <div>
                    <TextField
                      className="w-full p-3 pl-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                      type="email"
                      id="email"
                      label="Email"
                      variant="outlined"
                      placeholder="Enter your email address"
                      onChange={(e) => setSignupEmail(e.target.value)}
                      sx={{
                        width: "100%",
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "gray",
                          },
                          "&:hover fieldset": {
                            borderColor: "gray",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#fb6544",
                          },
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#fb6544",
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email
                              style={{
                                color: "gray",
                              }}
                            />
                          </InputAdornment>
                        ),
                      }}
                      InputLabelProps={{
                        sx: {
                          fontFamily: "Poppins",
                        },
                      }}
                    />
                  </div>

                  <div>
                    <TextField
                      className="w-full p-3 pl-10 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                      type="number"
                      id="mobileNumber"
                      label="Mobile Number"
                      variant="outlined"
                      placeholder="Ex: +94714562379"
                      onChange={(e) => setMobile(e.target.value)}
                      sx={{
                        width: "100%",
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: "gray",
                          },
                          "&:hover fieldset": {
                            borderColor: "gray",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#fb6544",
                          },
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "#fb6544",
                        },
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone
                              style={{
                                color: "gray",
                              }}
                            />
                          </InputAdornment>
                        ),
                      }}
                      InputLabelProps={{
                        sx: {
                          fontFamily: "Poppins",
                        },
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <TextField
                  type={showPassword ? "text" : "password"}
                  id="password"
                  label="Password"
                  variant="outlined"
                  placeholder="Enter your password"
                  onChange={(e) => setSignupPassword(e.target.value)}
                  sx={{
                    width: "100%",
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "gray",
                      },
                      "&:hover fieldset": {
                        borderColor: "gray",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#fb6544",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#fb6544",
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock
                          style={{
                            color: "gray",
                          }}
                        />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment
                        position="start"
                        onClick={togglePasswordVisibility}
                        className="hover:cursor-pointer"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </InputAdornment>
                    ),
                  }}
                  InputLabelProps={{
                    sx: {
                      fontFamily: "Poppins",
                    },
                  }}
                />
              </div>
              <div className="mb-4">
                <TextField
                  type={showPassword ? "text" : "password"}
                  id="condirm-password"
                  label="Confirm Password"
                  variant="outlined"
                  placeholder="Re-enter your password"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  sx={{
                    width: "100%",
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": {
                        borderColor: "gray",
                      },
                      "&:hover fieldset": {
                        borderColor: "gray",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#fb6544",
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#fb6544",
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock
                          style={{
                            color: "gray",
                          }}
                        />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment
                        position="start"
                        onClick={togglePasswordVisibility}
                        className="hover:cursor-pointer"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </InputAdornment>
                    ),
                  }}
                  InputLabelProps={{
                    sx: {
                      fontFamily: "Poppins",
                    },
                  }}
                />
              </div>

              <button
                type="button"
                className="w-full bg-orange text-white py-3 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-lightOrange hover:bg-darkOrange"
                onClick={handleRegister}
              >
                Sign Up
              </button>

              <div className="text-center mt-4">
                <p className="text-sm">
                  Already have an account?{" "}
                  <a
                    className="text-orange hover:underline hover:cursor-pointer"
                    onClick={() => {
                      setShowSignUp(false);
                      setVisible(true);
                    }}
                  >
                    Sign in
                  </a>
                </p>
              </div>
            </form>
          </Box>
        </Fade>
      </Modal>
    </div>
  );
}
