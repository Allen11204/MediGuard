import { useState, useRef, useEffect } from 'react'
import { sendMessage } from '../../services/llmApi'

export default function ChatBot({ patientId }) {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am MediGuard AI assistant. I securely query patient records and knowledge bases. How can I help?' }
    ])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const bottomRef = useRef(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, loading])

    const handleSend = async () => {
        const text = input.trim()
        if (!text || loading) return

        const userMessage = { role: 'user', content: text }
        const updatedMessages = [...messages, userMessage]
        setMessages(updatedMessages)
        setInput('')
        setLoading(true)

        try {
            const history = updatedMessages.slice(1, -1)
            const res = await sendMessage(patientId, text, history)
            setMessages([...updatedMessages, { role: 'assistant', content: res.data.reply }])
        } catch (err) {
            setMessages([...updatedMessages, { role: 'assistant', content: '⚠️ Sorry, an error occurred while connecting to AI.' }])
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
        <aside className="chat-panel">
            <div className="chat-header">
                <h3>🤖 Clinical Assistant</h3>
                <div className="chat-dot"></div>
            </div>

            <div className="chat-messages">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`chat-bubble chat-bubble-${msg.role}`}>
                        {msg.content}
                    </div>
                ))}
                {loading && (
                    <div className="chat-bubble chat-bubble-assistant chat-thinking" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <span style={{ animation: 'blink 1.4s infinite .2s' }}>•</span>
                        <span style={{ animation: 'blink 1.4s infinite .4s' }}>•</span>
                        <span style={{ animation: 'blink 1.4s infinite .6s' }}>•</span>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            <div className="chat-input-area" style={{ padding: '12px', borderTop: '1px solid var(--border)', background: '#fff', display: 'flex', gap: '8px' }}>
                <input 
                    type="text" 
                    className="form-input" 
                    style={{ flex: 1, margin: 0 }}
                    value={input} 
                    onChange={e => setInput(e.target.value)} 
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about records..." 
                    disabled={loading} 
                />
                <button 
                    className="btn btn-primary btn-sm" 
                    onClick={handleSend} 
                    disabled={loading || !input.trim()}
                >
                    Send ➔
                </button>
            </div>
            
            <style>{`
                @keyframes blink { 0% { opacity: .2; } 20% { opacity: 1; } 100% { opacity: .2; } }
            `}</style>
        </aside>
    )
}
