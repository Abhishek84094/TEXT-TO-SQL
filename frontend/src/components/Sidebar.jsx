import { LogOut, History, Database, X, Sun, Moon } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export default function Sidebar({ onClose }) {
    const user = useAppStore(state => state.user);
    const logout = useAppStore(state => state.logout);
    const theme = useAppStore(state => state.theme);
    const setTheme = useAppStore(state => state.setTheme);

    return (
        <div className="w-full h-full bg-gray-800/95 backdrop-blur-xl border-r border-gray-700/50 flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-gray-700/50 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-600/20 rounded-xl">
                        <Database className="text-blue-400 h-6 w-6" />
                    </div>
                    <h1 className="text-xl font-bold gradient-text tracking-wide">Data AI</h1>
                </div>
                <button 
                    onClick={onClose} 
                    className="lg:hidden p-2 rounded-lg hover:bg-gray-700 transition-smooth"
                >
                    <X className="h-5 w-5 text-gray-400" />
                </button>
            </div>
            
            {/* Menu items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <button 
                    onClick={() => {
                        const newTheme = theme === 'dark' ? 'light' : 'dark';
                        setTheme(newTheme);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-700/60 transition-smooth group text-left"
                >
                    <div className="p-2 bg-gray-700/80 rounded-lg group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-smooth">
                        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    </div>
                    <span className="text-sm font-medium text-gray-300 group-hover:text-white">
                        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </span>
                </button>
            </div>

            {/* User profile */}
            <div className="p-4 border-t border-gray-700/50 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 min-w-0">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm text-white font-medium truncate">{user?.name || 'User'}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
                        </div>
                    </div>
                    <button 
                        onClick={logout} 
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-smooth flex-shrink-0"
                        title="Logout"
                    >
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
