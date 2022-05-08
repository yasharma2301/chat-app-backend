import asyncHandler from 'express-async-handler'
import User from '../models/userModel.js'
import Chat from '../models/chatModel.js'

export const accessChat = asyncHandler(
    async (req, res) => {
        const { userId } = req.body;

        if (!userId) {
            console.log('UserId parameter is necessary for request to be successful');
            return res.sendStatus(400);
        }

        let isChat = await Chat.find({
            isGroupChat: false,
            $and: [
                { uers: { $elemtMatch: { $eq: req.user._id } } },
                { uers: { $elemtMatch: { $eq: userId } } },
            ],
        }).populate('users', '-password').populate('latestMessage');

        isChat = await User.populate(isChat, {
            path: 'latestMessage.sender',
            select: 'name pic email'
        });

        if (isChat?.length > 0) {
            res.send(isChat[0]);
        } else {
            let chatData = {
                chatName: 'sender',
                isGroupChat: false,
                users: [req.user._id, userId],
            };

            try {
                const createdChat = await Chat.create(chatData);
                const fullChat = await Chat.findOne({ _id: createdChat._id }).populate('users', '-password');
                res.status(200).send(fullChat);
            } catch (error) {
                res.status(400);
                throw new Error(error.message);
            }
        }
    }
)

export const fetchChats = asyncHandler(
    async (req, res) => {
        try {
            Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
                .populate('users', '-password')
                .populate('groupAdmin', '-password')
                .populate('latestMessage')
                .sort({ updatedAt: -1 })
                .then(async (results) => {
                    results = await User.populate(results, {
                        path: 'latestMessage.sender',
                        select: 'name pic email',
                    });

                    res.status(200).send(results)
                });

        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }
    }
)


export const createGroupChat = asyncHandler(
    async (req, res) => {
        if (!req.body.users || !req.body.name) {
            return res.status(400).send({ message: "Please fill all the details" });
        }

        const users = JSON.parse(req.body.users);

        if (users.length < 2) {
            return res.status(400).send('More than 2 users are required to form a group chat');
        }

        users.push(req.user);

        try {
            const groupChat = await Chat.create({
                chatName: req.body.name,
                users: users,
                isGroupChat: true,
                groupAdmin: req.user
            });

            const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
                .populate('users', '-password')
                .populate('groupAdmin', '-password');

            res.status(200).json(fullGroupChat);
        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }
    }
)


export const renameGroup = asyncHandler(
    async (req, res) => {
        const { chatId, chatName } = req.body;

        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            {
                chatName: chatName
            },
            {
                new: true
            }
        ).populate('users', '-password')
            .populate('groupAdmin', '-password');

        if (!updatedChat) {
            res.status(404);
            throw new Error('Chat not found');
        } else {
            res.json(updatedChat);
        }
    }
)


export const removeFromGroup = asyncHandler(
    async (req, res) => {
        const { chatId, userId } = req.body;

        const removed = await Chat.findByIdAndUpdate(
            chatId,
            {
                $pull: { users: userId },
            },
            {
                new: true
            }).populate('users', '-password')
            .populate('groupAdmin', '-password');

        if (!removed) {
            res.status(404);
            throw new Error('Chat not found');
        } else {
            res.json(removed);
        }
    }
)


export const addToGroup = asyncHandler(
    async (req, res) => {
        const { chatId, userId } = req.body;

        const added = await Chat.findByIdAndUpdate(
            chatId,
            {
                $addToSet: { users: userId },
            },
            {
                new: true
            }).populate('users', '-password')
            .populate('groupAdmin', '-password');

        if (!added) {
            res.status(404);
            throw new Error('Chat not found');
        } else {
            res.json(added);
        }
    }
)
