import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Code, AlertCircle, History } from 'lucide-react';
import api from '../services/api';
import { useAppStore } from '../store/useAppStore';
import ResultsTable from './ResultsTable';
import DataVisualization from './DataVisualization';

export default function ChatInterface() {
    const [question, setQuestion] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [historyOpen, setHistoryOpen] = useState(false);
    const messagesEndRef = useRef(null);
    const schema = useAppStore(state => state.schema);
    const addHistoryItem = useAppStore(state => state.addHistoryItem);
    const history = useAppStore(state => state.history);
    const theme = useAppStore(state => state.theme);

    // Load history into messages when history changes
    useEffect(() => {
        if (history && history.length > 0) {
            const historyMessages = [];
            [...history].reverse().forEach(item => {
                historyMessages.push({ type: 'user', content: item.question });
                historyMessages.push({ 
                    type: 'bot', 
                    sql: item.sql_query || item.sqlQuery, 
                    results: item.results 
                });
            });
            setMessages(historyMessages);
        }
    }, [history]);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!question.trim()) return;
        const currentQ = question;
        setMessages(prev => [...prev, { type: 'user', content: currentQ }]);
        setQuestion('');
        setLoading(true);
        try {
            const { data } = await api.post('/query/execute', { question: currentQ });
            setMessages(prev => [...prev, { type: 'bot', sql: data.sqlQuery, results: data.results }]);
            addHistoryItem({ 
                question: currentQ, 
                sql_query: data.sqlQuery, 
                results: data.results,
                timestamp: new Date() 
            });
        } catch (error) {
            setMessages(prev => [...prev, { type: 'error', content: error.response?.data?.message || error.message }]);
        } finally {
            setLoading(false);
        }
    };

    if (!schema) {
        return (
            <div className={`flex-1 flex items-center justify-center flex-col px-4 ${theme === 'light' ? 'text-gray-400' : 'text-gray-500'}`}>
                <div className={`p-4 rounded-2xl mb-4 ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-800/50'}`}>
                    <Bot className="h-12 w-12 md:h-16 md:w-16 opacity-50" />
                </div>
                <p className="text-lg md:text-xl text-center">Connect a data source to begin chatting</p>
                <p className="text-sm text-gray-600 mt-2 text-center">Upload a .db/.csv file or connect to PostgreSQL/MySQL</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex overflow-hidden relative h-full">
            {/* Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 relative h-full">
                {/* Header with History Toggle */}
                <div className={`flex items-center justify-between px-4 py-2 border-b ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-gray-800/50 border-gray-700/50'}`}>
                    <h2 className="text-sm font-semibold opacity-70 flex items-center gap-2">
                        <Bot className="h-4 w-4" />
                        Chat Assistant
                    </h2>
                    <button 
                        onClick={() => setHistoryOpen(!historyOpen)}
                        className={`p-2 rounded-lg flex items-center gap-2 text-xs font-medium transition-smooth ${
                            historyOpen 
                                ? 'bg-blue-600 text-white' 
                                : theme === 'light' ? 'bg-gray-200 text-gray-600 hover:bg-gray-300' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                        <History className="h-4 w-4" />
                        {historyOpen ? 'Hide History' : 'Show History'}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-3 md:px-6 py-4 space-y-4 pb-28">
                    {messages.length === 0 && (
                        <div className="text-center mt-8 md:mt-16">
                            <div className={`inline-block p-4 rounded-2xl mb-4 ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-800/50'}`}>
                                <Bot className="h-10 w-10 opacity-50 text-blue-400" />
                            </div>
                            <h2 className={`text-xl md:text-2xl font-medium ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>How can I help you analyze your data?</h2>
                            <p className="text-sm text-gray-500 mt-2">Ask any question in natural language</p>
                        </div>
                    )}
                    {messages.map((msg, idx) => (
                        <div key={idx} id={`msg-${Math.floor(idx/2)}`} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex gap-3 max-w-full md:max-w-[85%] lg:max-w-[75%] ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                <div className={`flex-shrink-0 h-8 w-8 rounded-xl flex items-center justify-center ${msg.type === 'user' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : msg.type === 'error' ? 'bg-red-500/20' : theme === 'light' ? 'bg-gray-200' : 'bg-gray-700/80'}`}>
                                    {msg.type === 'user' ? <User className="h-4 w-4 text-white" /> : msg.type === 'error' ? <AlertCircle className="h-4 w-4 text-red-400" /> : <Bot className="h-4 w-4 text-blue-400" />}
                                </div>
                                <div className={`min-w-0 rounded-2xl p-3 md:p-4 ${msg.type === 'user' ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white' : msg.type === 'error' ? 'bg-red-500/10 border border-red-500/30 text-red-300' : theme === 'light' ? 'bg-white border border-gray-200 shadow-sm text-gray-800' : 'glass-card text-gray-200'}`}>
                                    {msg.type === 'user' || msg.type === 'error' ? (
                                        <p className="text-sm break-words">{msg.content}</p>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className={`${theme === 'light' ? 'bg-gray-50' : 'bg-gray-900/80'} rounded-xl p-3 font-mono text-xs border ${theme === 'light' ? 'border-gray-200' : 'border-gray-700/50'} overflow-x-auto`}>
                                                <div className="flex items-center space-x-2 text-gray-400 mb-2 text-xs uppercase">
                                                    <Code className="h-3.5 w-3.5" />
                                                    <span>Generated SQL</span>
                                                </div>
                                                <pre className={`${theme === 'light' ? 'text-blue-600' : 'text-green-400'} whitespace-pre-wrap break-all`}>{msg.sql}</pre>
                                            </div>
                                            <ResultsTable results={msg.results} />
                                            <DataVisualization data={msg.results} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="flex items-center gap-3">
                                <div className={`h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 ${theme === 'light' ? 'bg-gray-200' : 'bg-gray-700/80'}`}>
                                    <Bot className="h-4 w-4 text-blue-400" />
                                </div>
                                <div className={`${theme === 'light' ? 'bg-gray-100' : 'glass-card'} rounded-2xl px-5 py-3 flex items-center gap-1.5`}>
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-75"></div>
                                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-150"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                
                <div className={`absolute bottom-0 left-0 right-0 p-3 md:p-5 pt-8 ${theme === 'light' ? 'bg-gradient-to-t from-gray-100 via-gray-100/95 to-transparent' : 'bg-gradient-to-t from-gray-900 via-gray-900/95 to-transparent'}`}>
                    <form onSubmit={handleSend} className="max-w-3xl mx-auto relative flex items-center">
                        <input type="text" value={question} onChange={e => setQuestion(e.target.value)}
                            placeholder="Ask a question about your data..."
                            className={`w-full text-sm rounded-2xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-xl transition-smooth ${theme === 'light' ? 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400' : 'bg-gray-800/90 border border-gray-600/50 text-white placeholder-gray-500'}`} />
                        <button type="submit" disabled={loading || !question.trim()} className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-500 rounded-xl transition-smooth disabled:opacity-30">
                            <Send className="h-4 w-4 text-white" />
                        </button>
                    </form>
                    <p className="text-center text-xs text-gray-500 mt-2 hidden md:block">AI can make mistakes. Always verify important queries.</p>
                </div>
            </div>

            {/* In-Page History Sidebar */}
            {historyOpen && (
                <div className={`w-64 md:w-80 border-l flex flex-col animate-in slide-in-from-right duration-300 ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-gray-800/95 border-gray-700/50'}`}>
                    <div className="p-4 border-b flex items-center justify-between">
                        <h3 className="font-semibold flex items-center gap-2">
                            <History className="h-4 w-4" />
                            Query History
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {history.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center mt-10 italic">No history yet</p>
                        ) : (
                            history.map((item, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={() => {
                                        const element = document.getElementById(`msg-${history.length - 1 - idx}`);
                                        if (element) {
                                            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        }
                                    }}
                                    className={`p-3 rounded-xl border cursor-pointer transition-smooth ${theme === 'light' ? 'bg-gray-50 border-gray-200 hover:bg-gray-100' : 'bg-gray-700/30 border-gray-700/50 hover:bg-gray-700/50'}`}
                                >
                                    <p className="text-xs font-medium truncate">{item.question}</p>
                                    <p className="text-[10px] text-gray-500 mt-1">{new Date(item.timestamp || item.created_at).toLocaleDateString()}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
