/* eslint-disable jsx-a11y/img-redundant-alt */
// // src/pages/chat.jsx

// import React, { useState, useEffect } from 'react';
// import {
//   Paper, Grid, Divider, TextField, Typography, List,
//   ListItem, ListItemIcon, Avatar, Fab
// } from '@mui/material';
// import { Send as SendIcon } from '@mui/icons-material';

// // Mock participants data
// const participants = [
//   { id: 1, name: 'John Wick', avatar: 'https://mui.com/static/images/avatar/1.jpg' },
//   { id: 2, name: 'Remy Sharp', avatar: 'https://mui.com/static/images/avatar/1.jpg' },
//   { id: 3, name: 'Alice', avatar: 'https://mui.com/static/images/avatar/3.jpg' },
//   { id: 4, name: 'Cindy Baker', avatar: 'https://mui.com/static/images/avatar/2.jpg' },
// ];

// // Your profile (Peter Parker)
// const currentUser = { id: 99, name: 'Peter Parker', avatar: 'https://mui.com/static/images/avatar/5.jpg' };

// // Helper function to retrieve messages from local storage
// const getMessagesFromStorage = () => {
//   const storedMessages = localStorage.getItem('chatMessages');
//   return storedMessages ? JSON.parse(storedMessages) : [];
// };

// const Chat = () => {
//   const [messages, setMessages] = useState(getMessagesFromStorage); // Load messages from storage
//   const [inputMessage, setInputMessage] = useState(''); // Input message state

//   // Save messages to local storage whenever messages state changes
//   useEffect(() => {
//     localStorage.setItem('chatMessages', JSON.stringify(messages));
//   }, [messages]);

//   const handleSendMessage = (sender) => {
//     if (inputMessage.trim()) {
//       const newMessage = {
//         text: inputMessage,
//         sender, // Include the sender's identity (can be Peter Parker or others)
//         time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//       };

//       setMessages([...messages, newMessage]); // Add new message to chat
//       setInputMessage(''); // Clear input field
//     }
//   };

//   return (
//     <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
//       {/* Header */}
//       <Grid
//         container
//         alignItems="center"
//         sx={{ padding: '10px', backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd' }}
//       >
//         <Grid item>
//           <Avatar
//             alt={currentUser.name}
//             src={currentUser.avatar}
//             sx={{ width: 40, height: 40, marginRight: '10px' }}
//           />
//         </Grid>
//         <Grid item>
//           <Typography variant="h6">Chat as {currentUser.name}</Typography>
//         </Grid>
//       </Grid>

//       {/* Main Chat Section */}
//       <Grid container component={Paper} sx={{ flexGrow: 1, overflow: 'hidden' }}>
//         {/* Chat Area */}
//         <Grid item xs={12} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
//           <List sx={{ flexGrow: 1, overflowY: 'auto', padding: '10px', backgroundColor: '#fafafa' }}>
//             {messages.map((msg, index) => (
//               <ListItem
//                 key={index}
//                 sx={{
//                   justifyContent: msg.sender.email === currentUser.email ? 'flex-end' : 'flex-start',
//                   alignItems: 'flex-start',
//                   marginBottom: '10px',
//                 }}
//               >
//                 {msg.sender.id !== currentUser.id && (
//                   <ListItemIcon>
//                     <Avatar alt={msg.sender.name} src={msg.sender.avatar} />
//                   </ListItemIcon>
//                 )}
//                 <div
//                   style={{
//                     maxWidth: '60%',
//                     padding: '10px 15px',
//                     backgroundColor: msg.sender.email === currentUser.email ? '#FCF55F' : '#e0e0e0',
//                     color: 'black',
//                     borderRadius: '15px',
//                     wordWrap: 'break-word',
//                     display: 'inline-block',
//                     textAlign: msg.sender.email === currentUser.email ? 'right' : 'left',
//                     boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
//                   }}
//                 >
//                   {msg.sender.id !== currentUser.id && (
//                     <Typography variant="body1" sx={{ fontWeight: 'bold', marginBottom: '5px' }}>
//                       {msg.sender.name}
//                     </Typography>
//                   )}
//                   <Typography variant="body2" sx={{ marginBottom: '5px' }}>
//                     {msg.text}
//                   </Typography>
//                   <Typography variant="caption" sx={{ float: msg.sender.email === currentUser.email ? 'left' : 'right' }}>
//                     {msg.time}
//                   </Typography>
//                 </div>
//               </ListItem>
//             ))}
//           </List>

//           <Divider />

//           {/* Input Area */}
//           <Grid container sx={{ padding: '10px', backgroundColor: '#f5f5f5' }}>
//             <Grid item xs={11}>
//               <TextField
//                 variant="outlined"
//                 placeholder={`Message as ${currentUser.name}`}
//                 fullWidth
//                 value={inputMessage}
//                 onChange={(e) => setInputMessage(e.target.value)}
//                 onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(currentUser)}
//                 sx={{ backgroundColor: 'white', borderRadius: '5px' }}
//               />
//             </Grid>
//             <Grid item xs={1} sx={{ textAlign: 'right' }}>
//               <Fab color="primary" onClick={() => handleSendMessage(currentUser)}>
//                 <SendIcon />
//               </Fab>
//             </Grid>
//           </Grid>
//         </Grid>
//       </Grid>
//     </div>
//   );
// };

// export default Chat;

import React, { useState, useEffect } from "react";
import {
  Paper,
  Grid,
  Divider,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  Avatar,
  Fab,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  Send as SendIcon,
  Add as AddIcon,
  Image as ImageIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { db, storage } from "../util/firebaseConfig";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "../context/authContext";
import format from "date-fns/format";

const Chat = () => {
  const [messages, setMessages] = useState({});
  const [inputMessage, setInputMessage] = useState("");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupChats, setGroupChats] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isDeletingMessage, setIsDeletingMessage] = useState(false);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);
  const [messageID, setMessageID] = useState("");
  const [groupID, setGroupID] = useState("");

  const { userData } = useAuth();
  const currentUser = {
    role: userData.role,
    name: userData.firstname + " " + userData.lastname,
    email: userData.email,
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "groups"),
      (snapshot) => {
        const groupsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGroupChats(groupsData);
      },
      (error) => {
        console.error("Failed to fetch groups: ", error);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedGroup && selectedGroup.id) {
      const messagesQuery = query(
        collection(db, "groups", selectedGroup.id, "messages"),
        orderBy("createdAt")
      );
      const unsubscribe = onSnapshot(
        messagesQuery,
        (snapshot) => {
          const messagesData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setMessages((prevMessages) => ({
            ...prevMessages,
            [selectedGroup.id]: messagesData,
          }));
        },
        (error) => {
          console.error("Error fetching messages: ", error);
        }
      );
      return () => unsubscribe();
    }
  }, [selectedGroup]);

  const handleSendMessage = async (text, image) => {
    if ((text.trim() || image) && selectedGroup) {
      const newMessage = {
        text: text.trim(),
        sender: {
          name: currentUser.name,
          email: currentUser.email,
        },
        createdAt: new Date(),
        imageUrl: image || "",
      };

      try {
        const messagesRef = collection(
          db,
          "groups",
          selectedGroup.id,
          "messages"
        );
        await addDoc(messagesRef, newMessage);
        setInputMessage("");
      } catch (error) {
        console.error("Failed to send message: ", error);
      }
    }
  };

  const handleUploadImage = async (event) => {
    const file = event.target.files[0];
    if (file && selectedGroup) {
      setUploading(true);
      const storageRef = ref(
        storage,
        `chatImages/${selectedGroup.id}/${file.name}`
      );
      uploadBytes(storageRef, file)
        .then((snapshot) => {
          getDownloadURL(snapshot.ref).then((downloadURL) => {
            handleSendMessage("", downloadURL);
            setUploading(false);
          });
        })
        .catch((error) => {
          console.error("Failed to upload image: ", error);
          setUploading(false);
        });
    }
  };

  const handleDeleteMessage = async () => {
    if (selectedGroup) {
      try {
        const messageRef = doc(
          db,
          "groups",
          selectedGroup.id,
          "messages",
          messageID
        );
        await deleteDoc(messageRef);

        setIsDeletingMessage(false);
      } catch (error) {
        console.error("Error deleting message: ", error);
      }
    }
  };

  const handleDeleteGroup = async () => {
    try {
      // Delete all messages in the group before deleting the group itself
      const messagesQuery = collection(db, "groups", groupID, "messages");
      const messagesSnapshot = await onSnapshot(
        messagesQuery,
        async (snapshot) => {
          snapshot.forEach(async (doc) => {
            await deleteDoc(doc.ref);
          });
        }
      );

      // Delete the group
      const groupRef = doc(db, "groups", groupID);
      await deleteDoc(groupRef);

      // Reset the selected group if it was the one deleted
      if (selectedGroup?.id === groupID) {
        setSelectedGroup(null);
      }

      setIsDeletingGroup(false);
    } catch (error) {
      console.error("Error deleting group: ", error);
    }
  };

  const handleCreateGroup = async () => {
    if (newGroupName.trim()) {
      try {
        const newGroup = {
          name: newGroupName,
          avatar: "https://mui.com/static/images/avatar/8.jpg",
        };
        await addDoc(collection(db, "groups"), newGroup);
        setNewGroupName("");
        setIsDialogOpen(false);
      } catch (error) {
        console.error("Error creating new group: ", error);
      }
    }
  };

  return (
    <div style={{ height: "calc(100vh - 72px)", display: "flex" }}>
      <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <DialogTitle>Create a New Group</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter a name for your new group chat.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Group Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
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
                  borderColor: "#2AAA8A",
                },
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#2AAA8A",
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)} sx={{ color: "grey" }}>
            Cancel
          </Button>
          <Button onClick={handleCreateGroup} sx={{ color: "#2AAA8A" }}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isDeletingMessage}
        onClose={() => setIsDeletingMessage(false)}
      >
        <DialogTitle>Delete a message</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this message?
            <br />
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsDeletingMessage(false)}
            sx={{ color: "grey" }}
          >
            Cancel
          </Button>
          <Button onClick={handleDeleteMessage} sx={{ color: "red" }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isDeletingGroup} onClose={() => setIsDeletingGroup(false)}>
        <DialogTitle>Delete a message</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this group?
            <br />
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setIsDeletingGroup(false)}
            sx={{ color: "grey" }}
          >
            Cancel
          </Button>
          <Button onClick={handleDeleteGroup} sx={{ color: "red" }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Box
        sx={{
          width: "500px",
          borderRight: "1px solid #ddd",
          backgroundColor: "#f5f5f5",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Button
          variant="contained"
          size="large"
          fullWidth
          sx={{
            backgroundColor: "#2AAA8A",
            "&:hover": {
              backgroundColor: "#1E8A70",
            },
            padding: "20px 30px",
            fontWeight: "bold",
          }}
          startIcon={<AddIcon />}
          onClick={() => setIsDialogOpen(true)}
        >
          Create a new group
        </Button>
        <List sx={{ padding: 0 }}>
          {groupChats.map((group) => (
            <ListItem
              key={group.id}
              sx={{
                display: "flex",
                alignItems: "center",
                padding: "10px",
                backgroundColor:
                  selectedGroup && selectedGroup.id === group.id
                    ? "#e0e0e0"
                    : "transparent",
                "&:hover": { backgroundColor: "#e0e0e0" },
                borderBottom: "1px solid #ddd",
              }}
            >
              <ListItemIcon sx={{ minWidth: "40px" }}>
                <Avatar
                  alt={group.name}
                  src={group.avatar}
                  sx={{ width: 35, height: 35, backgroundColor: "#fb6544" }}
                />
              </ListItemIcon>
              <Typography
                variant="body1"
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  flexGrow: 1,
                }}
                onClick={() => setSelectedGroup(group)}
              >
                &nbsp;&nbsp;{group.name}
              </Typography>
              {currentUser.role === "Admin" &&
              group.id !== "VbUV5gYyRWvjnDqZSBGo" ? (
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => {
                    setGroupID(group.id);
                    setIsDeletingGroup(true);
                  }}
                >
                  <DeleteIcon sx={{ color: "grey.600" }} />
                </IconButton>
              ) : null}
            </ListItem>
          ))}
        </List>
      </Box>

      <Grid
        container
        component={Paper}
        sx={{ flexGrow: 1, overflow: "hidden" }}
      >
        {selectedGroup ? (
          <Grid
            item
            xs={12}
            sx={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            <List
              sx={{
                flexGrow: 1,
                overflowY: "auto",
                padding: "10px",
                backgroundColor: "#fafafa",
              }}
            >
              {(messages[selectedGroup.id] || []).reduce(
                (acc, msg, index, arr) => {
                  const msgDate = format(msg.createdAt.toDate(), "PP");
                  if (
                    index === 0 ||
                    msgDate !== format(arr[index - 1].createdAt.toDate(), "PP")
                  ) {
                    acc.push(
                      <ListItem key={`divider-${index}`} sx={{ width: "100%" }}>
                        <Typography
                          variant="caption"
                          sx={{
                            width: "100%",
                            textAlign: "center",
                            marginY: 1,
                          }}
                        >
                          {msgDate}
                        </Typography>
                      </ListItem>
                    );
                  }
                  acc.push(
                    <ListItem
                      key={index}
                      sx={{
                        justifyContent:
                          msg.sender.email === currentUser.email
                            ? "flex-end"
                            : "flex-start",
                        alignItems: "flex-start",
                        marginBottom: "10px",
                      }}
                    >
                      {msg.sender.email !== currentUser.email && (
                        <ListItemIcon>
                          <Avatar
                            alt={msg.sender.name}
                            src={msg.sender.avatar}
                          />
                        </ListItemIcon>
                      )}
                      <div
                        style={{
                          maxWidth: "60%",
                          padding: "10px 15px",
                          backgroundColor:
                            msg.sender.email === currentUser.email
                              ? "#1E8A70"
                              : "#e0e0e0",
                          color:
                            msg.sender.email === currentUser.email
                              ? "white"
                              : "black",
                          borderRadius: "15px",
                          wordWrap: "break-word",
                          display: "inline-block",
                          boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        {msg.sender.email !== currentUser.email && (
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: "bold", marginBottom: "5px" }}
                          >
                            {msg.sender.name}
                          </Typography>
                        )}
                        {msg.imageUrl ? (
                          <>
                            <img
                              src={msg.imageUrl}
                              alt="Sent image"
                              style={{
                                maxWidth: "250px",
                                maxHeight: "250px",
                                borderRadius: "5px",
                              }}
                            />
                            <Typography
                              variant="body2"
                              sx={{ marginBottom: "5px" }}
                            >
                              {msg.text}
                            </Typography>
                          </>
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{ marginBottom: "5px" }}
                          >
                            {msg.text}
                          </Typography>
                        )}
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            textAlign:
                              msg.sender.email === currentUser.email
                                ? "right"
                                : "left",
                          }}
                        >
                          {msg.createdAt.toDate().toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Typography>
                      </div>
                      {msg.sender.email === currentUser.email ? (
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => {
                            setMessageID(msg.id);
                            setIsDeletingMessage(true);
                          }}
                        >
                          <DeleteIcon sx={{ color: "grey.600" }} />
                        </IconButton>
                      ) : null}
                    </ListItem>
                  );
                  return acc;
                },
                []
              )}
            </List>

            <Divider />

            <Grid
              container
              sx={{ padding: "10px", backgroundColor: "#f5f5f5" }}
              alignItems="center"
            >
              <Grid item xs={10}>
                <TextField
                  variant="outlined"
                  placeholder={`Message as ${currentUser.name}`}
                  fullWidth
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" && handleSendMessage(inputMessage)
                  }
                  sx={{
                    backgroundColor: "white",
                    borderRadius: "50px",
                    "& .MuiOutlinedInput-root": {
                      paddingLeft: "15px",
                      "& fieldset": {
                        borderRadius: "50px",
                        borderColor: "grey", // Default border color
                      },
                      "&:hover fieldset": {
                        borderRadius: "50px",
                        borderColor: "grey", // Border color when hovered
                      },
                      "&.Mui-focused fieldset": {
                        borderRadius: "50px",
                        borderColor: "#2AAA8A", // Border color when focused
                      },
                    },
                  }}
                />
              </Grid>
              <Grid
                item
                xs={1}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconButton
                  component="label"
                  sx={{ fontSize: 40, color: "grey.500" }}
                >
                  <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={handleUploadImage}
                  />
                  <ImageIcon sx={{ fontSize: 40 }} />
                </IconButton>
              </Grid>
              <Grid
                item
                xs={1}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Fab
                  sx={{
                    backgroundColor: "#2AAA8A",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#1E8A70",
                    },
                  }}
                  onClick={() => handleSendMessage(inputMessage)}
                >
                  <SendIcon />
                </Fab>
              </Grid>
              {uploading && (
                <CircularProgress
                  size={24}
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                />
              )}
            </Grid>
          </Grid>
        ) : (
          <Grid
            container
            justifyContent="center"
            alignItems="center"
            sx={{
              padding: "10px",
              backgroundColor: "#f5f5f5",
              borderBottom: "1px solid #ddd",
            }}
          >
            <Typography>Select a group to start chatting</Typography>
          </Grid>
        )}
      </Grid>
    </div>
  );
};

export default Chat;
