import { useState } from 'react';
import { Database, UploadCloud, Wifi, WifiOff, ChevronDown } from 'lucide-react';
import api from '../services/api';
import { useAppStore } from '../store/useAppStore';

export default function DataSourcePanel() {
    const [mode, setMode] = useState('connect');
    const setSchema = useAppStore(state => state.setSchema);
    const schema = useAppStore(state => state.schema);
    const [collapsed, setCollapsed] = useState(false);

    // Connect state
    const [dbType, setDbType] = useState('postgres');
    const [host, setHost] = useState('');
    const [port, setPort] = useState('');
    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');
    const [database, setDatabase] = useState('');

    // Upload state
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState(null);

    const handleConnect = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatusMsg(null);
        try {
            const { data } = await api.post('/db/connect', { type: dbType, host, port, user, password, database });
            setSchema(data.schema);
            setStatusMsg({ type: 'success', text: 'Connected successfully!' });
        } catch (error) {
            setStatusMsg({ type: 'error', text: error.response?.data?.message || error.message });
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!file) return;
        setLoading(true);
        setStatusMsg(null);
        const formData = new FormData();
        formData.append('file', file);
        try {
            const { data } = await api.post('/db/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSchema(data.schema);
            setStatusMsg({ type: 'success', text: 'File uploaded successfully!' });
        } catch (error) {
            setStatusMsg({ type: 'error', text: error.response?.data?.message || error.message });
        } finally {
            setLoading(false);
        }
    };

    // Connected state
    if (schema) {
        return (
            <div className="glass-card rounded-2xl p-4 md:p-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="p-2 bg-green-500/20 rounded-xl flex-shrink-0">
                            <Wifi className="text-green-400 h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-base font-semibold text-white">Database Connected</h3>
                            <button 
                                onClick={() => setCollapsed(!collapsed)}
                                className="text-xs text-gray-400 hover:text-gray-300 flex items-center gap-1 transition-smooth"
                            >
                                {collapsed ? 'Show' : 'Hide'} Schema
                                <ChevronDown className={`h-3 w-3 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
                            </button>
                        </div>
                    </div>
                    <button 
                        onClick={() => setSchema(null)} 
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-sm font-medium transition-smooth flex-shrink-0"
                    >
                        <WifiOff className="h-4 w-4" />
                        <span className="hidden sm:inline">Disconnect</span>
                    </button>
                </div>
                {!collapsed && (
                    <div className="mt-3 bg-gray-900/60 p-3 md:p-4 rounded-xl overflow-auto max-h-32 text-xs md:text-sm text-gray-300 font-mono">
                        <pre className="whitespace-pre-wrap break-words">{schema}</pre>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="glass-card rounded-2xl p-4 md:p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-400" />
                Data Source
            </h3>

            {/* Mode tabs */}
            <div className="flex p-1 bg-gray-800/80 rounded-xl mb-5 gap-1">
                <button 
                    onClick={() => setMode('connect')} 
                    className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-smooth flex items-center justify-center gap-2
                        ${mode === 'connect' 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                        }`}
                >
                    <Wifi className="h-4 w-4" />
                    Connect DB
                </button>
                <button 
                    onClick={() => setMode('upload')} 
                    className={`flex-1 py-2.5 rounded-lg font-medium text-sm transition-smooth flex items-center justify-center gap-2
                        ${mode === 'upload' 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                            : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
                        }`}
                >
                    <UploadCloud className="h-4 w-4" />
                    Upload File
                </button>
            </div>

            {/* Status message */}
            {statusMsg && (
                <div className={`mb-4 p-3 rounded-xl text-sm ${
                    statusMsg.type === 'success' 
                        ? 'bg-green-500/10 border border-green-500/30 text-green-400' 
                        : 'bg-red-500/10 border border-red-500/30 text-red-400'
                }`}>
                    {statusMsg.text}
                </div>
            )}

            {mode === 'connect' ? (
                <form onSubmit={handleConnect} className="space-y-3">
                    <select 
                        value={dbType} 
                        onChange={e => setDbType(e.target.value)} 
                        className="w-full bg-gray-800/80 border border-gray-600/50 rounded-xl px-4 py-2.5 text-white text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-smooth"
                    >
                        <option value="postgres">PostgreSQL</option>
                        <option value="mysql">MySQL</option>
                    </select>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input type="text" placeholder="Host" required value={host} onChange={e => setHost(e.target.value)} 
                            autoComplete="off"
                            className="bg-gray-800/80 border border-gray-600/50 rounded-xl px-4 py-2.5 text-white text-sm w-full placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-smooth" />
                        <input type="text" placeholder="Port" required value={port} onChange={e => setPort(e.target.value)} 
                            autoComplete="off"
                            className="bg-gray-800/80 border border-gray-600/50 rounded-xl px-4 py-2.5 text-white text-sm w-full placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-smooth" />
                    </div>
                    <input type="text" placeholder="Database Name" required value={database} onChange={e => setDatabase(e.target.value)} 
                        autoComplete="off"
                        className="bg-gray-800/80 border border-gray-600/50 rounded-xl px-4 py-2.5 text-white text-sm w-full placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-smooth" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input type="text" placeholder="Username" required value={user} onChange={e => setUser(e.target.value)} 
                            autoComplete="off"
                            className="bg-gray-800/80 border border-gray-600/50 rounded-xl px-4 py-2.5 text-white text-sm w-full placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-smooth" />
                        <input type="password" placeholder="Password" required value={password} onChange={e => setPassword(e.target.value)} 
                            autoComplete="new-password"
                            className="bg-gray-800/80 border border-gray-600/50 rounded-xl px-4 py-2.5 text-white text-sm w-full placeholder-gray-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-smooth" />
                    </div>
                    <button type="submit" disabled={loading} 
                        className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium rounded-xl transition-smooth disabled:opacity-50 shadow-lg shadow-blue-600/20 text-sm">
                        {loading ? 'Connecting...' : 'Connect'}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleUpload} className="space-y-4">
                    <div className="border-2 border-dashed border-gray-600/50 rounded-2xl p-6 md:p-8 text-center hover:border-blue-500/40 transition-smooth group cursor-pointer"
                         onClick={() => document.getElementById('file-upload').click()}>
                        <UploadCloud className="mx-auto h-10 w-10 text-gray-500 mb-3 group-hover:text-blue-400 transition-smooth" />
                        <label className="cursor-pointer">
                            <span className="text-blue-400 hover:text-blue-300 font-medium text-sm">Browse files</span>
                            <input id="file-upload" type="file" className="hidden" accept=".csv,.db,.sqlite" onChange={e => setFile(e.target.files[0])} />
                        </label>
                        <p className="text-gray-500 text-xs mt-2">Supports CSV, SQLite (.db, .sqlite)</p>
                        {file && (
                            <div className="mt-3 flex items-center justify-center gap-2 text-green-400 text-sm">
                                <Database className="h-4 w-4" />
                                <span className="truncate max-w-48">{file.name}</span>
                            </div>
                        )}
                    </div>
                    <button type="submit" disabled={!file || loading} 
                        className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium rounded-xl transition-smooth disabled:opacity-50 shadow-lg shadow-blue-600/20 text-sm">
                        {loading ? 'Uploading...' : 'Upload & Analyze'}
                    </button>
                </form>
            )}
        </div>
    );
}
