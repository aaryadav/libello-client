'use client'

import { Square } from "lucide-react";
import { useChat } from 'ai/react';

import { Button } from './ui/button'

const ChatWindow = () => {
    const { messages, input, handleInputChange, handleSubmit, stop, isLoading } = useChat({
        api: '/api/chat',
    });

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSubmit(event);
        }
    };

    return (
        <div className="chat-window">
            <div className="messages">
                {messages.map((m, index) => (
                    <div className="">
                        <div
                            className={`message
                                        ${m.role === "user" ? "bg-white" : "bg-outputgrey"}
                            `}
                        >
                            {m.content}
                        </div>
                    </div>
                ))}
            </div>
            <div
                className="prompt "
            >
                <form onSubmit={handleSubmit} className="form flex items-center ">
                    <textarea
                        className="input-box px-4 py-2 w-[480px]"
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder='Type your message here.'
                        disabled={isLoading}
                    />

                    {isLoading ? (
                        <Button
                            onClick={stop}
                            className="round-btn"
                        >
                            <Square size={16} />
                        </Button>
                    ) : (
                        ""
                    )}
                </form>
            </div>
        </div >
    );
};

export { ChatWindow };