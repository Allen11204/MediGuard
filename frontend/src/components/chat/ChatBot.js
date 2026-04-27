import { useState, useRef, useEffect } from 'react'
import { sendMessage } from '../../services/llmApi'

function ChatBot({ patientId }) {
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am MediGuard assistant. How can I help you?' }
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
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '600px', margin: 0, overflow: 'hidden' }}>
            <div className="card-header">
                <span className="card-title">🤖 AI Assistant</span>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ask about {patientId ? 'this patient' : 'your health'}</div>
            </div>

            <div className="card-body" style={{ flex: 1, overflowY: 'auto', padding: '15px', background: 'var(--bg-app)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {messages.map((msg, idx) => (
                    <div key={idx} style={{
                        display: 'flex',
                        justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    }}>
                        <div style={{
                            maxWidth: '85%',
                            padding: '12px 16px',
                            borderRadius: msg.role === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                            background: msg.role === 'user' ? 'var(--primary)' : '#fff',
                            color: msg.role === 'user' ? '#fff' : 'inherit',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                            whiteSpace: 'pre-wrap',
                            lineHeight: 1.5
                        }}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {loading && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <div style={{
                            padding: '12px 16px',
                            borderRadius: '12px 12px 12px 0',
                            background: '#fff',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                            color: 'var(--text-muted)'
                        }}>
                            <div className="typing-indicator" style={{ display: 'flex', gap: '4px' }}>
                                <span style={{ animation: 'blink 1.4s infinite .2s' }}>•</span>
                                <span style={{ animation: 'blink 1.4s infinite .4s' }}>•</span>
                                <span style={{ animation: 'blink 1.4s infinite .6s' }}>•</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            <div style={{ padding: '15px', borderTop: '1px solid var(--border-color)', background: '#fff', display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    style={{ flex: 1, padding: '10px', fontSize: '15px', color: '#000', backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '4px' }}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message AI Assistant...`}
                    disabled={loading}
                />
                <button className="btn btn-primary" onClick={handleSend} disabled={loading || !input.trim()} style={{ whiteSpace: 'nowrap' }}>
                    Send ➔
                </button>
            </div>
            <style>{`
                @keyframes blink {
                    0% { opacity: .2; }
                    20% { opacity: 1; }
                    100% { opacity: .2; }
                }
            `}</style>
        </div>
    )
}

export default ChatBot
