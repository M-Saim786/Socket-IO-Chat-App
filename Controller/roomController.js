const chatRoomSchema = require("../Model/chatRoomSchema")

exports.createRoom = async (req, res) => {
    try {
        const { name, userId } = req.body;
        if (!name)
            return res.status(400).json({
                message: "room name not found"
            })
        if (!userId)
            return res.status(400).json({
                message: "userId not found"
            })

        req.body.users = req.body.users || [];
        req.body.users.push(userId);
        const room = await chatRoomSchema(req.body).save();
        return res.status(200).json({
            data: room
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getRoom = async (req, res) => {
    try {
        const data = await chatRoomSchema.find();
        return res.status(200).json({
            data: data
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.joinRoom = async (req, res) => {
    try {
        const { roomId, userId } = req.body;
        if (!roomId) {
            return res.status(400).json({
                message: "room id is not found"
            })
        }
        const room = await chatRoomSchema.findById(roomId)
        if (!room) {
            return res.status(400).json({
                message: "room is not found"
            })
        }
        room.users.push(userId)
        await room.save();

        return res.status(200).json({
            message: "Room joined successfully"
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }

}