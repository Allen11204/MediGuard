import { useState, useRef, useEffect } from 'react'
import { sendMessage } from '../services/llmApi'

function ChatBot({ patientId }) {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am MediGuard assistant. How can I help you?' }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const bottomRef = useRef(null)

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = async () => {
        const text = input.trim()
        if (!text || loading) return

        // Add user message to chat
        const userMessage = { role: 'user', content: text }
        const updatedMessages = [...messages, userMessage]
        setMessages(updatedMessages)
        setInput('')
        setLoading(true)

        try {
            // history = all messages before the one we just added (excludes the initial greeting)
            const history = updatedMessages.slice(1, -1)
            const res = await sendMessage(patientId, text, history)
            setMessages([...updatedMessages, { role: 'assistant', content: res.data.reply }])
        } catch (err) {
            setMessages([...updatedMessages, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }])
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', marginTop: '24px' }}>
            <h3 style={{ marginTop: 0 }}>MediGuard Assistant</h3>

            {/* Message list */}
            <div style={{ height: '300px', overflowY: 'auto', marginBottom: '12px', padding: '8px', background: '#f9f9f9', borderRadius: '4px' }}>
                {messages.map((msg, idx) => (
                    <div key={idx} style={{
                        display: 'flex',
                        justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        marginBottom: '8px'
                    }}>
                        <div style={{
                            maxWidth: '70%',
                            padding: '8px 12px',
                            borderRadius: '12px',
                            background: msg.role === 'user' ? '#0070f3' : '#e0e0e0',
                            color: msg.role === 'user' ? '#fff' : '#000',
                            whiteSpace: 'pre-wrap'
                        }}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '8px' }}>
                        <div style={{ padding: '8px 12px', borderRadius: '12px', background: '#e0e0e0', color: '#666' }}>
                            Thinking...
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <div style={{ display: 'flex', gap: '8px' }}>
                <input
                    style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about this patient..."
                    disabled={loading}
                />
                <button onClick={handleSend} disabled={loading || !input.trim()}>
                    Send
                </button>
            </div>
        </div>
    )
}

export default ChatBot
