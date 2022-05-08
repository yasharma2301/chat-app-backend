import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'
import asyncHandler from 'express-async-handler'

export const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decodedToken.id).select('-password'); // select everything but password
            next();
        } catch (error) {
            res.status(401);
            throw new Error('Not authorised, token failed');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorised, No token');
    }
})