import { Router } from 'express';
import { RequestHandler } from 'express';
import { createChatMessage, getChatMessages, getChatMessageById, createChatFileAttachment, getChatFileAttachmentsByMessage } from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { ChatMessageResponse, ChatMessagesResponse, CreateChatMessageData, ChatFileAttachmentResponse, CreateChatFileAttachmentData } from '@shared/api';

const router = Router();

// Get all chat messages
export const handleGetChatMessages: RequestHandler = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit as string) || 100;
        const messages = await getChatMessages(limit);

        const response: ChatMessagesResponse = {
            success: true,
            message: 'Chat messages retrieved successfully',
            messages
        };

        res.json(response);
    } catch (error) {
        console.error('Error getting chat messages:', error);

        // Check if it's a database connection error
        if (error instanceof Error && error.message.includes('connecting to database')) {
            // Return mock data for demo purposes when database is unavailable
            const mockMessages = [
                {
                    id: 'mock_1',
                    content: 'Welcome to the chat! (Demo mode - database temporarily unavailable)',
                    sender_id: 'system',
                    sender_name: 'System',
                    sender_role: 'project_manager' as const,
                    created_at: new Date(),
                    updated_at: new Date()
                }
            ];

            res.json({
                success: true,
                message: 'Demo messages (database unavailable)',
                messages: mockMessages
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to get chat messages',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
};

// Create a new chat message
export const handleCreateChatMessage: RequestHandler = async (req, res) => {
    try {
        const user = (req as any).user;
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const messageData: CreateChatMessageData = req.body;

        if (!messageData.content || messageData.content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Message content is required'
            });
        }

        // Generate a unique ID for the message
        const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const newMessage = await createChatMessage({
            id: messageId,
            content: messageData.content.trim(),
            sender_id: user.id
        });

        // Get the full message with sender details
        const fullMessage = await getChatMessageById(messageId);

        const response: ChatMessageResponse = {
            success: true,
            message: 'Chat message created successfully',
            chat_message: fullMessage!
        };

        res.status(201).json(response);
    } catch (error) {
        console.error('Error creating chat message:', error);

        // Check if it's a database connection error
        if (error instanceof Error && error.message.includes('connecting to database')) {
            res.status(503).json({
                success: false,
                message: 'Database temporarily unavailable. Please try again later.',
                error: 'DATABASE_CONNECTION_ERROR'
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Failed to create chat message',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
};

// Upload file attachment to chat message
export const handleCreateChatFileAttachment: RequestHandler = async (req, res) => {
    try {
        const user = (req as any).user;
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
        }

        const fileData: CreateChatFileAttachmentData = req.body;
        const { message_id } = req.params;

        if (!fileData.file_name || !fileData.file_url || !fileData.file_size || !fileData.mime_type) {
            return res.status(400).json({
                success: false,
                message: 'All file fields are required'
            });
        }

        // Verify the message exists
        const message = await getChatMessageById(message_id);
        if (!message) {
            return res.status(404).json({
                success: false,
                message: 'Chat message not found'
            });
        }

        // Generate a unique ID for the file attachment
        const fileId = `chatfile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const newFile = await createChatFileAttachment({
            id: fileId,
            file_name: fileData.file_name,
            file_url: fileData.file_url,
            file_size: fileData.file_size,
            mime_type: fileData.mime_type,
            message_id: message_id,
            uploaded_by: user.id
        });

        const response: ChatFileAttachmentResponse = {
            success: true,
            message: 'File attachment uploaded successfully',
            file: newFile
        };

        res.status(201).json(response);
    } catch (error) {
        console.error('Error creating chat file attachment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload file attachment'
        });
    }
};

// Get file attachments for a chat message
export const handleGetChatFileAttachments: RequestHandler = async (req, res) => {
    try {
        const { message_id } = req.params;

        const files = await getChatFileAttachmentsByMessage(message_id);

        const response = {
            success: true,
            message: 'File attachments retrieved successfully',
            files
        };

        res.json(response);
    } catch (error) {
        console.error('Error getting chat file attachments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get file attachments'
        });
    }
};

// Register routes
router.get('/messages', authenticateToken, handleGetChatMessages);
router.post('/messages', authenticateToken, handleCreateChatMessage);
router.post('/messages/:message_id/attachments', authenticateToken, handleCreateChatFileAttachment);
router.get('/messages/:message_id/attachments', authenticateToken, handleGetChatFileAttachments);

export default router;