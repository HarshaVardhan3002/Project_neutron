/**
 * @fileoverview A dialog component for the AI Q&A chatbot.
 */
'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

type Message = {
    sender: 'user' | 'ai';
    text: string;
};

type AiChatDialogProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
};

/**
 * Renders the AI Chat Dialog.
 * @returns {JSX.Element} The chat dialog component.
 */
export default function AiChatDialog({ isOpen, onOpenChange }: AiChatDialogProps) {
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'ai', text: "Hello! I'm your AI assistant for this module. Ask me anything about skimming and scanning." }
    ]);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim()) return;

        const newMessages: Message[] = [
            ...messages,
            { sender: 'user', text: input },
            // Mock AI response
            { sender: 'ai', text: `You asked about "${input}". In this context, scanning is the best technique to quickly find specific details like names or dates in a text.` }
        ];
        setMessages(newMessages);
        setInput('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg h-[70vh] flex flex-col p-0">
                <DialogHeader className="p-4 border-b">
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        AI Assistant
                    </DialogTitle>
                    <DialogDescription>
                        Ask questions related to the current lesson: "Skimming and Scanning".
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="flex-grow p-4">
                   <div className="space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                                {msg.sender === 'ai' && (
                                    <Avatar className="h-8 w-8 border">
                                        <AvatarFallback><Sparkles className="h-4 w-4"/></AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={`rounded-lg p-3 max-w-xs ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                    <p className="text-sm">{msg.text}</p>
                                </div>
                                {msg.sender === 'user' && (
                                     <Avatar className="h-8 w-8 border">
                                        <AvatarFallback>U</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                   </div>
                </ScrollArea>
                <div className="p-4 border-t">
                    <div className="flex items-center gap-2">
                        <Input 
                            placeholder="Type your question..." 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <Button onClick={handleSend}><Send className="h-4 w-4" /></Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
