import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X, ChevronDown } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatSidebarProps {
    recapData: any;
    isOpen: boolean;
    onClose: () => void;
}

export function ChatSidebar({ recapData, isOpen, onClose }: ChatSidebarProps) {
    const [messages, setMessages] = useState<Array<{ role: string; text: string }>>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || !recapData) return;

        const userText = input.trim();
        setMessages((prev) => [...prev, { role: "user", text: userText }]);
        setInput("");
        setLoading(true);

        try {
            const backend = import.meta.env.VITE_BACKEND_URL || "https://riftwrapped.ishaan812.com";
            const url = backend.replace(/\/$/, "") + "/api/chatbot/sendMessage";

            // Build the request body with the detailed stats structure
            const body = {
                stats: {
                    message: recapData.message, // Full message object with all stats
                },
                conversation: messages
                    .filter((m) => m.role === "user" || m.role === "assistant")
                    .map((m) => ({
                        role: m.role,
                        content: [
                            {
                                text: m.text,
                            },
                        ],
                    }))
                    .concat([
                        {
                            role: "user",
                            content: [
                                {
                                    text: userText,
                                },
                            ],
                        },
                    ]),
            };

            console.debug("ChatSidebar sending message", { url, body });

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorText = await response.text();
                setMessages((prev) => [
                    ...prev,
                    {
                        role: "assistant",
                        text: `Error: ${response.status} ${errorText}`,
                    },
                ]);
                return;
            }

            const data = await response.json();

            // Extract response text from various possible formats
            let assistantText = "";
            if (data?.response) {
                assistantText = data.response;
            } else if (data?.conversation && Array.isArray(data.conversation)) {
                const assistantMsg = data.conversation.find(
                    (c: any) => c.role === "assistant"
                );
                if (assistantMsg?.content && Array.isArray(assistantMsg.content)) {
                    assistantText = assistantMsg.content.map((c: any) => c.text).join("\n\n");
                } else if (assistantMsg?.text) {
                    assistantText = assistantMsg.text;
                }
            }

            if (!assistantText) {
                assistantText =
                    "(No response received from server)";
            }

            setMessages((prev) => [...prev, { role: "assistant", text: assistantText }]);
        } catch (err: any) {
            console.error("ChatSidebar error:", err);
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    text: `Error: ${err?.message || "Failed to send message"}`,
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-[#0b1426] border-l border-[#785a28] shadow-2xl flex flex-col z-40 animate-in slide-in-from-right">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#785a28]">
                <div className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-[#c89b3c]" />
                    <h3 className="font-semibold text-white">Ask AI Assistant</h3>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-[#1b2a3a] rounded transition-colors"
                    aria-label="Close sidebar"
                >
                    <X className="h-5 w-5 text-[#a09b8c]" />
                </button>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                        <div>
                            <MessageCircle className="h-12 w-12 text-[#c89b3c]/20 mx-auto mb-3" />
                            <p className="text-sm text-[#a09b8c]">
                                Ask me anything about your stats and performance!
                            </p>
                        </div>
                        
                        {/* Example Prompts */}
                        <div className="w-full space-y-2 pt-2">
                            <p className="text-xs text-[#a09b8c]/60 uppercase tracking-wider">Suggested questions:</p>
                            {[
                                "What are my top strengths?",
                                "How can I improve my winrate?",
                                "What's my playstyle?",
                                "Which champion should I focus on?",
                                "What's my main weakness?",
                                "How do I compare to pro players?"
                            ].map((prompt, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setInput(prompt);
                                    }}
                                    className="w-full text-left px-3 py-2 rounded text-xs text-[#c89b3c] bg-[#0a1428]/40 border border-[#c89b3c]/30 hover:bg-[#c89b3c]/10 hover:border-[#c89b3c]/60 transition-colors"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"
                                    }`}
                            >
                                <div
                                    className={`max-w-xs rounded-lg px-4 py-3 ${message.role === "user"
                                            ? "bg-[#c89b3c] text-[#0a1428]"
                                            : "bg-[#1b2a3a] text-[#f0e6d2] border border-[#273241]"
                                        }`}
                                >
                                    {message.role === "assistant" ? (
                                        <div className="prose prose-invert prose-sm max-w-none">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    p: ({ children }) => (
                                                        <p className="mb-2 last:mb-0 text-sm">{children}</p>
                                                    ),
                                                    h1: ({ children }) => (
                                                        <h1 className="text-lg font-bold mb-2 mt-3 first:mt-0">
                                                            {children}
                                                        </h1>
                                                    ),
                                                    h2: ({ children }) => (
                                                        <h2 className="text-base font-bold mb-2 mt-2">
                                                            {children}
                                                        </h2>
                                                    ),
                                                    h3: ({ children }) => (
                                                        <h3 className="text-sm font-bold mb-1 mt-2">
                                                            {children}
                                                        </h3>
                                                    ),
                                                    ul: ({ children }) => (
                                                        <ul className="list-disc list-inside mb-2 space-y-1 text-sm">
                                                            {children}
                                                        </ul>
                                                    ),
                                                    ol: ({ children }) => (
                                                        <ol className="list-decimal list-inside mb-2 space-y-1 text-sm">
                                                            {children}
                                                        </ol>
                                                    ),
                                                    li: ({ children }) => <li className="text-sm">{children}</li>,
                                                    strong: ({ children }) => (
                                                        <strong className="font-bold text-[#c89b3c]">
                                                            {children}
                                                        </strong>
                                                    ),
                                                    em: ({ children }) => <em className="italic">{children}</em>,
                                                    code: ({ inline, children }: { inline?: boolean; children: React.ReactNode }) =>
                                                        inline ? (
                                                            <code className="bg-[#0a1428] px-1.5 py-0.5 rounded text-xs font-mono">
                                                                {children}
                                                            </code>
                                                        ) : (
                                                            <code className="block bg-[#0a1428] p-2 rounded text-xs font-mono overflow-x-auto mb-2">
                                                                {children}
                                                            </code>
                                                        ),
                                                    blockquote: ({ children }) => (
                                                        <blockquote className="border-l-4 border-[#c89b3c] pl-3 italic my-2 text-sm">
                                                            {children}
                                                        </blockquote>
                                                    ),
                                                }}
                                            >
                                                {message.text}
                                            </ReactMarkdown>
                                        </div>
                                    ) : (
                                        <p className="text-sm">{message.text}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-[#1b2a3a] border border-[#273241] rounded-lg px-4 py-3">
                                    <div className="flex gap-2">
                                        <div className="w-2 h-2 bg-[#c89b3c] rounded-full animate-bounce" />
                                        <div
                                            className="w-2 h-2 bg-[#c89b3c] rounded-full animate-bounce"
                                            style={{ animationDelay: "0.1s" }}
                                        />
                                        <div
                                            className="w-2 h-2 bg-[#c89b3c] rounded-full animate-bounce"
                                            style={{ animationDelay: "0.2s" }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[#785a28]">
                <div className="flex gap-2">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask anything... (Shift+Enter for new line)"
                        rows={3}
                        className="flex-1 bg-[#091222] border border-[#273241] rounded px-3 py-2 text-sm text-[#f0e6d2] placeholder-[#a09b8c] focus:outline-none focus:ring-1 focus:ring-[#c89b3c] resize-none"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={loading || !input.trim()}
                        className="self-end px-3 py-2 bg-[#c89b3c] text-[#0a1428] rounded font-semibold text-sm hover:bg-[#d8ac4d] disabled:bg-[#273241] disabled:text-[#8892a6] transition-colors"
                        aria-label="Send message"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
