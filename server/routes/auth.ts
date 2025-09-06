import { RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import { AuthResponse, LoginData, CreateUserData } from '@shared/api';
import { createUser, getUserByEmail, emailExists, createTimeLog } from '../db';
import { generateToken } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

// Register new user
export const handleSignup: RequestHandler = async (req, res) => {
    try {
        console.log('Signup attempt for:', req.body?.email);
        const { email, password, name, role }: CreateUserData = req.body;

        // Validation
        if (!email || !password || !name) {
            console.log('Signup failed: Missing required fields');
            return res.status(400).json({
                success: false,
                message: 'Email, password, and name are required'
            } as AuthResponse);
        }

        // Check if user already exists
        console.log('Checking if user exists:', email);
        if (await emailExists(email)) {
            console.log('Signup failed: User already exists:', email);
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            } as AuthResponse);
        }

        // Hash password
        console.log('Hashing password for:', email);
        const password_hash = await bcrypt.hash(password, 12);

        // Create user
        console.log('Creating user:', email);
        const user = await createUser({
            email,
            password: '', // Not needed for creation, only password_hash
            password_hash,
            name,
            role: role || 'employee'
        });

        // Generate token
        console.log('Generating token for new user:', email);
        const token = generateToken({
            userId: user.id,
            email: user.email
        });

        console.log('Signup successful for:', email);
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user,
            token
        } as AuthResponse);

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        } as AuthResponse);
    }
};

// Login user
export const handleLogin: RequestHandler = async (req, res) => {
    try {
        console.log('Login attempt for:', req.body?.email);
        const { email, password }: LoginData = req.body;

        // Validation
        if (!email || !password) {
            console.log('Login failed: Missing email or password');
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            } as AuthResponse);
        }

        // Get user with password
        console.log('Looking up user:', email);
        const userWithPassword = await getUserByEmail(email);

        if (!userWithPassword) {
            console.log('Login failed: User not found:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            } as AuthResponse);
        }

        // Verify password
        console.log('Verifying password for user:', email);
        const isValidPassword = await bcrypt.compare(password, userWithPassword.password_hash);

        if (!isValidPassword) {
            console.log('Login failed: Invalid password for:', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            } as AuthResponse);
        }

        // Remove password from user object
        const { password_hash, ...user } = userWithPassword;

        // Generate token
        console.log('Generating token for user:', email);
        const token = generateToken({
            userId: user.id,
            email: user.email
        });

        // Log the successful login
        try {
            await createTimeLog({
                id: uuidv4(),
                user_id: user.id,
                ip_address: req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] as string,
                user_agent: req.headers['user-agent']
            });
            console.log('Login event logged for user:', email);
        } catch (logError) {
            console.error('Failed to log login event:', logError);
            // Don't fail the login if logging fails
        }

        console.log('Login successful for:', email);
        res.json({
            success: true,
            message: 'Login successful',
            user,
            token
        } as AuthResponse);

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        } as AuthResponse);
    }
};

// Verify token and get user info
export const handleVerify: RequestHandler = async (req, res) => {
    try {
        // User is already attached by auth middleware
        res.json({
            success: true,
            user: req.user
        });
    } catch (error) {
        console.error('Verify error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};