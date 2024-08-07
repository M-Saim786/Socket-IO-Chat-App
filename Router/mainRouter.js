const express = require("express");
const { loginUser, signUpUser } = require("../Controller/userController");
const { createRoom, joinRoom, getRoom } = require("../Controller/roomController");
const { sendMessage, getMessages } = require("../Controller/messageController");
const router = express.Router();


router.post("/user/signUp", signUpUser)
router.post("/user/login", loginUser)
router.post("/create-room", createRoom)
router.post("/join-room", joinRoom)
router.get("/get-room", getRoom)
router.post("/send-message", sendMessage)
router.get("/get-message", getMessages)

module.exports = router