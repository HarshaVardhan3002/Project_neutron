'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
    Bot,
    User,
    Send,
    Loader2,
    MessageSquare,
    Trash2,
    Plus,
    History,
    Sparkles,
    Brain,
    BookOpen,
    Target
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api.service';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    tokens_used?: number;
    model_used?: string;
    created_at: string;
}

interface ChatSession {
    id: string;
    title: string;
    context_type: string;
    context_id?: string;
    created_at: string;
    updated_at: string;
    message_count: number;
    last_message_at?: string;
}

interface AIChatProps {
    context?: {
        contextType?: 'general' | 'course' | 'test' | 'lesson';
        contextId?: string;
        contextName?: string;
        userLevel?: string;
        testType?: string;
    };
    className?: string;
}

export default function AIChat({ context = {}, className = '' }: AIChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showSessions, setShowSessions] = useState(false);
    const [loadingSessions, setLoadingSessions] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadSessions();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadSessions = async () => {
        try {
            setLoadingSessions(true);
            const response = await apiClient.getChatSessions({ limit: 20 });

            if (response.error) {
                toast.error(response.error);
                return;
            }

            setSessions(response.data?.sessions || []);
        } catch (error) {
            console.error('Error loading sessions:', error);
            toast.error('Failed to load chat sessions');
        } finally {
            setLoadingSessions(false);
        }
    };

    const loadMessages = async (sessionId: string) => {
        try {
            const response = await apiClient.getChatMessages(sessionId, { limit: 100 });

            if (response.error) {
                toast.error(response.error);
                return;
            }

            setMessages(response.data?.messages || []);
            setCurrentSessionId(sessionId);
        } catch (error) {
            console.error('Error loading messages:', error);
            toast.error('Failed to load messages');
        }
    };

    const sendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage = inputMessage.trim();
        setInputMessage('');
        setIsLoading(true);

        // Add user message to UI immediately
        const tempUserMessage: ChatMessage = {
            id: `temp-${Date.now()}`,
            role: 'user',
            content: userMessage,
            created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, tempUserMessage]);

        try {
            const response = await apiClient.sendChatMessage(userMessage, currentSessionId || undefined, context);

            if (response.error) {
                toast.error(response.error);
                // Remove the temporary message
                setMessages(prev => prev.filter(m => m.id !== tempUserMessage.id));
                return;
            }

            // Update session ID if this was a new session
            if (!currentSessionId) {
                setCurrentSessionId(response.data.sessionId);
                await loadSessions(); // Refresh sessions list
            }

            // Add AI response
            const aiMessage: ChatMessage = {
                id: `ai-${Date.now()}`,
                role: 'assistant',
                content: response.data.message,
                tokens_used: response.data.tokensUsed,
                model_used: 'gemini-pro',
                created_at: new Date().toISOString()
            };

            setMessages(prev => [
                ...prev.filter(m => m.id !== tempUserMessage.id),
                { ...tempUserMessage, id: `user-${Date.now()}` },
                aiMessage
            ]);

        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
            // Remove the temporary message
            setMessages(prev => prev.filter(m => m.id !== tempUserMessage.id));
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    const startNewSession = () => {
        setCurrentSessionId(null);
        setMessages([]);
        setShowSessions(false);
        inputRef.current?.focus();
    };

    const deleteSession = async (sessionId: string) => {
        if (!confirm('Are you sure you want to delete this chat session?')) return;

        try {
            const response = await apiClient.deleteChatSession(sessionId);

            if (response.error) {
                toast.error(response.error);
                return;
            }

            toast.success('Chat session deleted');

            // If this was the current session, clear it
            if (currentSessionId === sessionId) {
                setCurrentSessionId(null);
                setMessages([]);
            }

            // Refresh sessions list
            await loadSessions();
        } catch (error) {
            console.error('Error deleting session:', error);
            toast.error('Failed to delete session');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const getContextIcon = (contextType: string) => {
        switch (contextType) {
            case 'course':
                return <BookOpen className="h-4 w-4" />;
            case 'test':
                return <Target className="h-4 w-4" />;
            case 'lesson':
                return <Brain className="h-4 w-4" />;
            default:
                return <MessageSquare className="h-4 w-4" />;
        }
    };

    const getWelcomeMessage = () => {
        if (context.contextType === 'course') {
            return `Hi! I'm your AI tutor. I can help you with questions about ${context.contextName || 'your course'}. What would you like to know?`;
        } else if (context.contextType === 'test') {
            return `Hello! I can help analyze your test performance and suggest improvements. How can I assist you today?`;
        } else if (context.contextType === 'lesson') {
            return `Hi there! I'm here to help you understand ${context.contextName || 'this lesson'} better. What questions do you have?`;
        }
        return "Hello! I'm your AI English tutor. I can help you with IELTS, TOEFL, PTE, and GRE preparation. What would you like to learn today?";
    };

    return (
        <div className={`flex flex-col h-full ${className}`}>
            <Card className="flex-1 flex flex-col">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-lg">
                                <Sparkles className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">AI Tutor</CardTitle>
                                <CardDescription>
                                    {context.contextType ? `${context.contextType} assistance` : 'General English learning support'}
                                </CardDescription>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowSessions(true)}
                            >
                                <History className="h-4 w-4 mr-2" />
                                History
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={startNewSession}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                New Chat
                            </Button>
                        </div>
                    </div>
                    {context.contextType && (
                        <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="flex items-center gap-1">
                                {getContextIcon(context.contextType)}
                                {context.contextName || context.contextType}
                            </Badge>
                            {context.testType && (
                                <Badge variant="outline">{context.testType}</Badge>
                            )}
                        </div>
                    )}
                </CardHeader>

                <CardContent className="flex-1 flex flex-col p-0">
                    <ScrollArea className="flex-1 px-6">
                        <div className="space-y-4 py-4">
                            {messages.length === 0 && (
                                <div className="flex items-center justify-center py-8">
                                    <div className="text-center max-w-md">
                                        <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">
                                            {getWelcomeMessage()}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'
                                        }`}
                                >
                                    {message.role === 'assistant' && (
                                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                                            <Bot className="h-4 w-4 text-white" />
                                        </div>
                                    )}

                                    <div
                                        className={`max-w-[80%] rounded-lg px-4 py-2 ${message.role === 'user'
                                            ? 'bg-primary text-primary-foreground ml-auto'
                                            : 'bg-muted'
                                            }`}
                                    >
                                        <div className="whitespace-pre-wrap text-sm">
                                            {message.content}
                                        </div>
                                        <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                                            <span>
                                                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                                            </span>
                                            {message.tokens_used && (
                                                <span>{message.tokens_used} tokens</span>
                                            )}
                                        </div>
                                    </div>

                                    {message.role === 'user' && (
                                        <div className="bg-primary p-2 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                                            <User className="h-4 w-4 text-primary-foreground" />
                                        </div>
                                    )}
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex gap-3 justify-start">
                                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                                        <Bot className="h-4 w-4 text-white" />
                                    </div>
                                    <div className="bg-muted rounded-lg px-4 py-2 max-w-[80%]">
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span className="text-sm">AI is thinking...</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    </ScrollArea>

                    <div className="border-t p-4">
                        <div className="flex gap-2">
                            <Input
                                ref={inputRef}
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask me anything about English learning..."
                                disabled={isLoading}
                                className="flex-1"
                            />
                            <Button
                                onClick={sendMessage}
                                disabled={!inputMessage.trim() || isLoading}
                                size="sm"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            AI responses are generated and may not always be accurate. Please verify important information.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Chat Sessions Dialog */}
            <Dialog open={showSessions} onOpenChange={setShowSessions}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Chat History</DialogTitle>
                        <DialogDescription>
                            Your previous conversations with the AI tutor
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {loadingSessions ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No chat sessions yet. Start a conversation to see your history here.
                            </div>
                        ) : (
                            sessions.map((session) => (
                                <div
                                    key={session.id}
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                                    onClick={() => {
                                        loadMessages(session.id);
                                        setShowSessions(false);
                                    }}
                                >
                                    <div className="flex items-center gap-3 flex-1">
                                        {getContextIcon(session.context_type)}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{session.title}</p>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <span>{session.message_count} messages</span>
                                                <span>•</span>
                                                <span>
                                                    {formatDistanceToNow(new Date(session.updated_at), { addSuffix: true })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteSession(session.id);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}