import asyncHandler from 'express-async-handler'
import User from '../models/userModel.js'
import { generateToken } from '../config/generateToken.js';

export const registerUser = asyncHandler(
    async (req, res) => {
        const { name, email, password, pic } = req.body;
        if (!name || !email || !password) {
            res.status(400);
            throw new Error('Please Enter all fields');
        }

        const userExsits = await User.findOne({ email })

        if (userExsits) {
            res.status(404);
            throw new Error("User already exists, try signing in.")
        }

        const user = await User.create({
            name,
            email,
            password,
            pic
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: name,
                email: email,
                pic: user.pic,
                token: generateToken(user._id)
            });
        } else {
            res.status(400);
            throw new Error('Failed to create user');
        }
    }
)

export const loginUser = asyncHandler(
    async (req, res) => {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: email,
                pic: user.pic,
                token: generateToken(user._id)
            })
        } else {
            res.status(401);
            throw new Error('Invalid ID or password supplied')
        }
    }
)

export const allUsers = asyncHandler(
    async (req, res) => {
        const keyword = req.query.search ? {
            $or: [
                { name: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } },
            ],
        } : {};
        const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
        res.send(users);
    }
)