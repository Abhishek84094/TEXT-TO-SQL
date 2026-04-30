import { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ChatInterface from '../components/ChatInterface';
import DataSourcePanel from '../components/DataSourcePanel';
import { useAppStore } from '../store/useAppStore';
import api from '../services/api';
import { Menu } from 'lucide-react';

export default function Dashboard() {
    const token = useAppStore(state => state.token);
    const setHistory = useAppStore(state => state.setHistory);
    const theme = useAppStore(state => state.theme);
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        if (!token) {
            navigate('/login');
        } else {
            // Fetch history from persistent storage
            const fetchHistory = async () => {
                try {
                    const { data } = await api.get('/query/history');
                    setHistory(data);
                } catch (error) {
                    console.error('Failed to fetch history:', error);
                }
            };
            fetchHistory();
        }
    }, [token, navigate, setHistory]);

    if (!token) return null;

    return (
        <div className={`flex h-screen overflow-hidden relative ${theme === 'light' ? 'bg-gray-100 text-gray-900' : 'bg-gray-900 text-white'}`}>
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 sidebar-overlay z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-72 transform transition-smooth
                lg:relative lg:translate-x-0 lg:w-72 lg:flex-shrink-0
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                {/* Mobile top bar */}
                <div className="lg:hidden flex items-center px-4 py-3 bg-gray-800/80 backdrop-blur-sm border-b border-gray-700/50">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-lg hover:bg-gray-700 transition-smooth"
                    >
                        <Menu className="h-5 w-5 text-gray-300" />
                    </button>
                    <h1 className="ml-3 text-lg font-semibold gradient-text">Data AI</h1>
                </div>

                {/* Content area - Full screen and scrollable */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {/* Data source panel */}
                    <div className="p-4 md:p-6 pb-0">
                        <DataSourcePanel />
                    </div>
                    {/* Chat interface follows naturally */}
                    <ChatInterface />
                </div>
            </div>
        </div>
    );
}
