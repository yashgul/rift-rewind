import { useState, useRef, useEffect } from "react";
import { MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
    recapData?: any | null;
    isOpen?: boolean;
    onClose?: () => void;
}

const ChatOverlay: React.FC<Props> = ({ recapData = null, isOpen = true, onClose = () => { } }) => {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Array<{ role: string; text: string }>>([]);
    const [loading, setLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isOverlayFocused, setIsOverlayFocused] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    // Scroll to bottom when messages change
    useEffect(() => {
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
        // Always stop navigation events when there's content
        if (input.length > 0) {
            // Stop event bubbling to prevent slide navigation
            e.stopPropagation();
            try { e.nativeEvent.stopImmediatePropagation(); } catch { }

            // For left/right arrows, let the default behavior handle cursor movement
            if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                return;
            }

            // Block navigation keys (up/down/space)
            if (e.key === "ArrowUp" || e.key === "ArrowDown" || e.key === "Space") {
                e.preventDefault();
            }

            // Send message on Enter if there's content
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div
            tabIndex={0}
            onFocus={() => setIsOverlayFocused(true)}
            onBlur={() => setIsOverlayFocused(false)}
            className={`fixed left-4 bottom-16 z-50 transition-all duration-300 ${isExpanded ? 'w-[350px] h-[450px]' : 'w-[350px] h-[50px] hover:h-[52px] cursor-pointer'
                }`}
            onClick={() => {
                setIsOverlayFocused(true);
                if (!isExpanded) setIsExpanded(true);
            }}
        >
            <div className="h-full bg-[#0b1426] border border-[#785a28] rounded-lg flex flex-col shadow-xl">
                {/* Header */}
                <div className="p-3 border-b border-[#273241] flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                        <MessageCircle className="w-5 h-5 text-[#c89b3c] shrink-0" />
                        <h2 className="text-[#c89b3c] font-semibold truncate">Chat with Assistant</h2>
                    </div>
                    {isExpanded ? (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded(false);
                            }}
                            className="p-1.5 hover:bg-[#1b2a3a] rounded-sm transition-colors shrink-0"
                            aria-label="Collapse chat"
                        >
                            <ChevronDown className="w-4 h-4 text-[#a09b8c]" />
                        </button>
                    ) : (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded(true);
                            }}
                            className="p-1.5 hover:bg-[#1b2a3a] rounded-sm transition-colors shrink-0"
                            aria-label="Expand chat"
                        >
                            <ChevronUp className="w-4 h-4 text-[#a09b8c]" />
                        </button>
                    )}
                </div>

                {isExpanded && (
                    <>
                        {/* Messages */}
                        <div
                            ref={containerRef}
                            className="flex-1 overflow-y-auto p-3 space-y-3 [scrollbar-width:thin] [scrollbar-color:rgb(39,50,65)_transparent] hover:[scrollbar-color:rgb(60,75,95)_transparent]"
                        >
                            {messages.length === 0 ? (
                                <p className="text-[#a09b8c] text-center">Ask anything about your recap stats!</p>
                            ) : (
                                messages.map((m, idx) => (
                                    <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div
                                            className={`max-w-[85%] rounded-lg px-4 py-2 ${m.role === 'user'
                                                ? 'bg-[#c89b3c] text-[#0a1428]'
                                                : 'bg-[#1b2a3a] text-[#f0e6d2] border border-[#273241]'
                                                }`}
                                        >
                                            <div className="text-xs opacity-75 mb-1">
                                                {m.role === 'user' ? 'You' : 'Assistant'}
                                            </div>
                                            <div className="prose prose-invert prose-sm max-w-none [scrollbar-width:thin] [scrollbar-color:rgb(39,50,65)_transparent] hover:[scrollbar-color:rgb(60,75,95)_transparent]">
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                                        ul: ({ children }) => <ul className="mb-2 list-disc pl-4 last:mb-0">{children}</ul>,
                                                        ol: ({ children }) => <ol className="mb-2 list-decimal pl-4 last:mb-0">{children}</ol>,
                                                        h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                                                        h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                                                        h3: ({ children }) => <h3 className="text-sm font-bold mb-2">{children}</h3>,
                                                        code: ({ inline, children }: { inline?: boolean; children: React.ReactNode }) => (
                                                            inline
                                                                ? <code className="bg-[#1b2a3a] px-1 py-0.5 rounded">{children}</code>
                                                                : <code className="block bg-[#1b2a3a] p-2 rounded">{children}</code>
                                                        ),
                                                        table: ({ children }) => (
                                                            <div className="overflow-x-auto">
                                                                <table className="min-w-full border-collapse border border-[#273241] mb-2">
                                                                    {children}
                                                                </table>
                                                            </div>
                                                        ),
                                                        th: ({ children }) => (
                                                            <th className="border border-[#273241] bg-[#1b2a3a] p-2 text-left">{children}</th>
                                                        ),
                                                        td: ({ children }) => (
                                                            <td className="border border-[#273241] p-2">{children}</td>
                                                        ),
                                                    }}
                                                >
                                                    {m.text}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-3 border-t border-[#273241]">
                            <div className="flex gap-2">
                                <input
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask anything about your stats..."
                                    className="flex-1 bg-[#091222] border border-[#273241] rounded-sm px-3 py-2 text-sm text-[#f0e6d2] placeholder-[#a09b8c] focus:outline-none focus:ring-1 focus:ring-[#c89b3c]"
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={loading || !input}
                                    className={`px-4 py-2 rounded-sm text-sm font-semibold transition-colors ${loading || !input
                                        ? 'bg-[#273241] text-[#8892a6]'
                                        : 'bg-[#c89b3c] text-[#0a1428] hover:bg-[#d8ac4d]'
                                        }`}
                                >
                                    {loading ? 'Sending...' : 'Send'}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ChatOverlay;