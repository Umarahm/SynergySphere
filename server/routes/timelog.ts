import { RequestHandler } from 'express';
import { TimeLogResponse } from '@shared/api';
import { getTimeLogsByUser, getAllTimeLogs } from '../db';

// Get time logs for current user
export const handleGetUserTimeLogs: RequestHandler = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            } as TimeLogResponse);
        }

        const limit = parseInt(req.query.limit as string) || 50;
        const logs = await getTimeLogsByUser(req.user.id, limit);

        res.json({
            success: true,
            message: 'Time logs retrieved successfully',
            logs
        } as TimeLogResponse);

    } catch (error) {
        console.error('Get user time logs error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        } as TimeLogResponse);
    }
};

// Get all time logs (project managers only)
export const handleGetAllTimeLogs: RequestHandler = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            } as TimeLogResponse);
        }

        if (req.user.role !== 'project_manager') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Project manager role required.'
            } as TimeLogResponse);
        }

        const limit = parseInt(req.query.limit as string) || 100;
        const logs = await getAllTimeLogs(limit);

        res.json({
            success: true,
            message: 'All time logs retrieved successfully',
            logs
        } as TimeLogResponse);

    } catch (error) {
        console.error('Get all time logs error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        } as TimeLogResponse);
    }
};