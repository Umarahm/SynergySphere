import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Download, FileText, Image, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { useAuth } from '@/hooks/useAuth';
import { ChatMessage, ChatMessageResponse, ChatMessagesResponse } from '@shared/api';
import { toast } from 'sonner';

interface ChatMessageWithFiles extends ChatMessage {
    files?: Array<{
        id: string;
        file_name: string;
        file_url: string;
        file_size: number;
        mime_type: string;
    }>;
}

export default function Chatroom() {
    const [messages, setMessages] = useState<ChatMessageWithFiles[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { user, token } = useAuth();

    useEffect(() => {
        if (token) {
            fetchMessages();
        }
    }, [token]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchMessages = async () => {
        if (!token) {
            console.log('No token available, skipping message fetch');
            setIsLoadingMessages(false);
            return;
        }

        try {
            const response = await fetch('/api/chat/messages', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to fetch messages: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const data: ChatMessagesResponse = await response.json();
            if (data.success && data.messages) {
                setMessages(data.messages as ChatMessageWithFiles[]);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);

            // Check for authentication errors
            if (error instanceof Error && (error.message.includes('403') || error.message.includes('401'))) {
                toast.error('Authentication expired. Please log in again.');
            } else if (error instanceof Error && error.message.includes('503')) {
                toast.error('Database temporarily unavailable. Please try again later.');
            } else {
                toast.error('Failed to load messages');
            }
        } finally {
            setIsLoadingMessages(false);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || isLoading || !token) return;

        setIsLoading(true);
        try {
            const response = await fetch('/api/chat/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: newMessage.trim() })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to send message: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const data: ChatMessageResponse = await response.json();
            if (data.success && data.chat_message) {
                setMessages(prev => [...prev, data.chat_message as ChatMessageWithFiles]);
                setNewMessage('');
            }
        } catch (error) {
            console.error('Error sending message:', error);

            // Check for authentication errors
            if (error instanceof Error && (error.message.includes('403') || error.message.includes('401'))) {
                toast.error('Authentication expired. Please log in again.');
            } else if (error instanceof Error && error.message.includes('503')) {
                toast.error('Database temporarily unavailable. Please try again later.');
            } else {
                toast.error('Failed to send message');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !token) return;

        // For demo purposes, we'll simulate file upload
        // In a real app, you'd upload to a file storage service first
        const fileUrl = `https://example.com/uploads/${file.name}`;

        try {
            // First create a message for the file
            const messageResponse = await fetch('/api/chat/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: `📎 Shared a file: ${file.name}` })
            });

            if (!messageResponse.ok) {
                const errorText = await messageResponse.text();
                throw new Error(`Failed to create file message: ${messageResponse.status} ${messageResponse.statusText} - ${errorText}`);
            }

            const messageData: ChatMessageResponse = await messageResponse.json();
            if (messageData.success && messageData.chat_message) {
                // Add file attachment to the message
                const fileAttachmentResponse = await fetch(`/api/chat/messages/${messageData.chat_message.id}/attachments`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        file_name: file.name,
                        file_url: fileUrl,
                        file_size: file.size,
                        mime_type: file.type
                    })
                });

                const messageWithFile = {
                    ...messageData.chat_message,
                    files: fileAttachmentResponse.ok ? [{
                        id: `file_${Date.now()}`,
                        file_name: file.name,
                        file_url: fileUrl,
                        file_size: file.size,
                        mime_type: file.type
                    }] : []
                };

                setMessages(prev => [...prev, messageWithFile]);
                toast.success('File shared successfully');
            }
        } catch (error) {
            console.error('Error uploading file:', error);

            // Check for authentication errors
            if (error instanceof Error && (error.message.includes('403') || error.message.includes('401'))) {
                toast.error('Authentication expired. Please log in again.');
            } else {
                toast.error('Failed to upload file');
            }
        }

        // Reset file input
        e.target.value = '';
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB';
        return Math.round(bytes / 1048576) + ' MB';
    };

    const getFileIcon = (mimeType: string) => {
        if (mimeType.startsWith('image/')) return <Image className="w-4 h-4" />;
        if (mimeType.startsWith('video/')) return <Video className="w-4 h-4" />;
        return <FileText className="w-4 h-4" />;
    };

    const formatTime = (dateString: string | Date) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (isLoadingMessages) {
        return (
            <SidebarProvider>
                <div className="flex min-h-screen bg-background">
                    <Sidebar />
                    <SidebarInset className="flex-1">
                        <Header />
                        <main className="flex-1 p-4 md:p-6 lg:p-8">
                            <div className="flex items-center justify-center min-h-[400px]">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                                    <p className="text-muted-foreground">Loading chatroom...</p>
                                </div>
                            </div>
                        </main>
                    </SidebarInset>
                </div>
            </SidebarProvider>
        );
    }

    if (!token) {
        return (
            <SidebarProvider>
                <div className="flex min-h-screen bg-background">
                    <Sidebar />
                    <SidebarInset className="flex-1">
                        <Header />
                        <main className="flex-1 p-4 md:p-6 lg:p-8">
                            <div className="flex items-center justify-center min-h-[400px]">
                                <div className="text-center">
                                    <p className="text-muted-foreground">Please log in to access the chatroom.</p>
                                </div>
                            </div>
                        </main>
                    </SidebarInset>
                </div>
            </SidebarProvider>
        );
    }

    return (
        <SidebarProvider>
            <div className="flex min-h-screen bg-background">
                <Sidebar />
                <SidebarInset className="flex-1">
                    <Header />
                    <main className="flex-1 p-4 md:p-6 lg:p-8">
                        <Card className="flex-1 flex flex-col">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    Global Chatroom
                                    <Badge variant="secondary" className="ml-2">
                                        {messages.length} messages
                                    </Badge>
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="flex-1 flex flex-col p-0">
                                {/* Messages Area */}
                                <ScrollArea className="flex-1 p-6">
                                    <div className="space-y-4">
                                        {messages.map((message) => {
                                            const isOwnMessage = message.sender_id === user?.id;
                                            const isProjectManager = message.sender_role === 'project_manager';

                                            return (
                                                <div
                                                    key={message.id}
                                                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group`}
                                                >
                                                    <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Badge
                                                                variant={isProjectManager ? 'default' : 'secondary'}
                                                                className={`text-xs ${isProjectManager ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}`}
                                                            >
                                                                {isProjectManager ? '👔 PM' : '👤 EMP'}
                                                            </Badge>
                                                            <span className="text-sm font-medium text-foreground">
                                                                {message.sender_name}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {formatTime(message.created_at)}
                                                            </span>
                                                        </div>

                                                        <div
                                                            className={`rounded-2xl px-4 py-2 ${isOwnMessage
                                                                ? 'bg-primary text-primary-foreground'
                                                                : 'bg-muted text-muted-foreground'
                                                                }`}
                                                        >
                                                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                                                            {/* File attachments */}
                                                            {message.files && message.files.length > 0 && (
                                                                <div className="mt-2 space-y-2">
                                                                    {message.files.map((file) => (
                                                                        <div
                                                                            key={file.id}
                                                                            className={`flex items-center gap-2 p-2 rounded-lg ${isOwnMessage ? 'bg-primary-foreground/10' : 'bg-background'
                                                                                }`}
                                                                        >
                                                                            {getFileIcon(file.mime_type)}
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="text-xs font-medium truncate">{file.file_name}</p>
                                                                                <p className="text-xs opacity-70">{formatFileSize(file.file_size)}</p>
                                                                            </div>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="ghost"
                                                                                className="h-6 w-6 p-0"
                                                                                onClick={() => window.open(file.file_url, '_blank')}
                                                                            >
                                                                                <Download className="w-3 h-3" />
                                                                            </Button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>
                                </ScrollArea>

                                {/* Message Input */}
                                <div className="border-t p-4">
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={handleFileSelect}
                                            className="px-3"
                                        >
                                            <Paperclip className="w-4 h-4" />
                                        </Button>

                                        <Input
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            placeholder="Type your message..."
                                            className="flex-1"
                                            disabled={isLoading}
                                        />

                                        <Button
                                            onClick={sendMessage}
                                            disabled={!newMessage.trim() || isLoading}
                                            size="sm"
                                        >
                                            <Send className="w-4 h-4" />
                                        </Button>

                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            className="hidden"
                                            onChange={handleFileUpload}
                                            accept="*/*"
                                        />
                                    </div>

                                    {/* <p className="text-xs text-muted-foreground mt-2">
                                    Press Enter to send • Shift+Enter for new line •
                                    <span className="text-blue-500">Blue badges</span> are Project Managers •
                                    <span className="text-green-500">Green badges</span> are Employees
                                </p> */}
                                </div>
                            </CardContent>
                        </Card>
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}