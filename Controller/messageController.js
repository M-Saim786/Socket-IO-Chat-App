const messageSchema = require("../Model/messageSchema");

exports.sendMessage = async (req, res) => {
    try {

        const { chatRoom, message, sender } = req.body;
        const sendMessage = await messageSchema(req.body).save();
        return res.status(200).json({
            data: sendMessage,
            status: true
        })

    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}

exports.getMessages = async (req, res) => {
    try {
        const allMessages = await messageSchema.find();
        return res.status(200).json({
            data: allMessages
        })
    } catch (err) {
        return res.status(500).json({
            message: err.message
        })
    }
}