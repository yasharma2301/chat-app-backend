import asyncHandler from 'express-async-handler'
import Message from '../models/messageModel.js'
import User from '../models/userModel.js';
import Chat from '../models/chatModel.js';

export const sendMessage = asyncHandler(async (req, res) => {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
        return res.status(400).send({ message: "Malformed request. Message and chatId are necessary" });
    }

    let newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId
    }

    try {
        let message = await Message.create(newMessage);

        message = await message.populate({ path: "sender", select: "name pic", strictPopulate: false });
        message = await message.populate({ path: "chat", strictPopulate: false });
        message = await User.populate(message, {
            path: "chat.users",
            select: "name pic email",
            strictPopulate: false
        });

        await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message });

        res.json(message)

    } catch (error) {
        res.status(400);
        throw new Error(error.message)
    }
});

export const allMessages = asyncHandler(async (req, res) => {
    try {
        const messages = await Message.find({ chat: req.params.chatId })
            .populate("sender", "name pic email")
            .populate("chat");
        res.json(messages);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});
