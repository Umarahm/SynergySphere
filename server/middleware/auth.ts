import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getUserById } from '../db';
import { User } from '@shared/api';

// Extend Request type to include user
declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}

export interface JWTPayload {
    userId: string;
    email: string;
}

export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ success: false, message: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
        const user = await getUserById(decoded.userId);

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
}

export function generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' });
}