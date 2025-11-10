import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";

interface Props {
    recapData: any | null;
}

const ChatbotCard: React.FC<Props> = ({ recapData }) => {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Array<{ role: string; text: string }>>([]);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        // scroll to bottom when messages change
        if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async () => {
        if (!input || !recapData) return;
        const userText = input.trim();
        if (!userText) return;

        // append user message locally
        setMessages((m) => [...m, { role: "user", text: userText }]);
        setInput("");
        setLoading(true);

        try {
            const body = {
                stats: recapData,
                conversation: [
                    {
                        role: "user",
                        content: [{ text: userText }],
                    },
                ],
            };

            const res = await fetch("http://0.0.0.0:9000/api/chatbot/sendMessage", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const txt = await res.text();
                setMessages((m) => [...m, { role: "assistant", text: `Error: ${res.status} ${txt}` }]);
                return;
            }

            const data = await res.json();

            // Try to extract assistant reply in a few possible shapes
            let assistantText = "";
            if (data?.conversation && Array.isArray(data.conversation)) {
                const assistantMsg = data.conversation.find((c: any) => c.role === "assistant");
                if (assistantMsg?.content && Array.isArray(assistantMsg.content)) {
                    assistantText = assistantMsg.content.map((c: any) => c.text).join("\n\n");
                } else if (assistantMsg?.text) {
                    assistantText = assistantMsg.text;
                }
            }

            if (!assistantText && data?.message) {
                // fallback: maybe response contains a message object
                try {
                    if (typeof data.message === "string") assistantText = data.message;
                    else if (Array.isArray(data.message?.content)) assistantText = data.message.content.map((c: any) => c.text).join("\n\n");
                } catch (e) {
                    /* ignore */
                }
            }

            if (!assistantText && data?.text) assistantText = data.text;

            if (!assistantText) assistantText = "(No response)";

            setMessages((m) => [...m, { role: "assistant", text: assistantText }]);
        } catch (err: any) {
            setMessages((m) => [...m, { role: "assistant", text: `Request failed: ${err?.message || err}` }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <Card className="p-4 bg-[#0b1426]/95 border-[#785a28]">
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-[#c89b3c]">Chatbot</h3>
                <p className="text-xs text-[#d1c6ac]">Ask about your recap — e.g. "What sort of players should I duo with?"</p>

                <div ref={containerRef} className="max-h-48 overflow-auto rounded-sm border border-[#273241] bg-[#091222]/80 p-3">
                    {messages.length === 0 ? (
                        <p className="text-xs text-[#a09b8c]">No messages yet. Type a question to get started.</p>
                    ) : (
                        messages.map((m, idx) => (
                            <div key={idx} className={`mb-2 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                                <div className={`inline-block max-w-full break-words rounded-md px-3 py-2 ${m.role === 'user' ? 'bg-[#c89b3c] text-[#0a1428]' : 'bg-[#0f1724] text-[#e6e6e6]'}`}>
                                    <div className="text-xs font-semibold mb-1">{m.role === 'user' ? 'You' : 'Assistant'}</div>
                                    <div className="whitespace-pre-wrap text-sm">{m.text}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="flex gap-2">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask something about your season..."
                        className="flex-1 rounded-sm border border-[#273241] bg-[#07101b] px-3 py-2 text-sm text-white outline-none focus:ring-1 focus:ring-[#c89b3c]"
                        aria-label="Chat prompt"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={loading || !input}
                        className={`rounded-sm px-3 py-2 text-sm font-semibold ${loading || !input ? 'bg-[#2c3542] text-[#8892a6]' : 'bg-[#c89b3c] text-[#0a1428]'}`}
                    >
                        {loading ? 'Sending...' : 'Send'}
                    </button>
                </div>
            </div>
        </Card>
    );
};

export default ChatbotCard;
