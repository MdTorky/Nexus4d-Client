
import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { Loader } from '../ui/Loader';

interface ContactMessage {
    _id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export default function ContactMessagesList() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/contact/admin/messages');
            setMessages(data);
        } catch (error) {
            showToast('Failed to load messages', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const markAsRead = async (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        try {
            await api.put(`/contact/admin/messages/${id}/read`);
            setMessages(prev => prev.map(msg =>
                msg._id === id ? { ...msg, isRead: true } : msg
            ));
        } catch (error) {
            console.error(error);
        }
    };

    const deleteMessage = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm('Delete this signal?')) return;
        try {
            await api.delete(`/contact/admin/messages/${id}`);
            setMessages(prev => prev.filter(msg => msg._id !== id));
            if (selectedMessage?._id === id) setSelectedMessage(null);
            showToast('Signal deleted', 'success');
        } catch (error) {
            showToast('Failed to delete', 'error');
        }
    };

    const handleSelectMessage = (msg: ContactMessage) => {
        setSelectedMessage(msg);
        if (!msg.isRead) markAsRead(msg._id);
    };

    if (loading) return <div className="p-8 flex justify-center"><Loader /></div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-150">
            {/* List */}
            <div className="lg:col-span-1 bg-white/5 rounded-xl border border-white/10 overflow-hidden flex flex-col">
                <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Icon icon="mdi:inbox-full" className="text-nexus-green" />
                        Inbox ({messages.filter(m => !m.isRead).length})
                    </h3>
                    <button onClick={fetchMessages} className="text-gray-400 hover:text-white">
                        <Icon icon="mdi:refresh" />
                    </button>
                </div>
                <div className="overflow-y-auto flex-1 custom-scrollbar">
                    {messages.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No signals found.</div>
                    ) : (
                        messages.map(msg => (
                            <div
                                key={msg._id}
                                onClick={() => handleSelectMessage(msg)}
                                className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${selectedMessage?._id === msg._id ? 'bg-white/10 border-l-2 border-l-nexus-green' : ''
                                    } ${!msg.isRead ? 'bg-nexus-green/5' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-sm font-bold truncate ${!msg.isRead ? 'text-nexus-green' : 'text-white'}`}>
                                        {msg.name}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                        {new Date(msg.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-300 font-medium truncate mb-1">
                                    {msg.subject}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                    {msg.message}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Detail View */}
            <div className="lg:col-span-2 bg-white/5 rounded-xl border border-white/10 overflow-hidden flex flex-col relative">
                {selectedMessage ? (
                    <>
                        <div className="p-6 border-b border-white/10 flex justify-between items-start bg-white/5">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-2">{selectedMessage.subject}</h2>
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="text-nexus-green bg-nexus-green/10 px-2 py-0.5 rounded text-xs font-bold uppercase">Incoming</span>
                                    <span className="text-gray-400">From: <span className="text-white">{selectedMessage.name}</span> &lt;{selectedMessage.email}&gt;</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <a
                                    href={`mailto:${selectedMessage.email}`}
                                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white"
                                    title="Reply"
                                >
                                    <Icon icon="mdi:reply" className="text-xl" />
                                </a>
                                <button
                                    onClick={(e) => deleteMessage(selectedMessage._id, e)}
                                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500"
                                    title="Delete"
                                >
                                    <Icon icon="mdi:trash-can" className="text-xl" />
                                </button>
                            </div>
                        </div>
                        <div className="p-8 overflow-y-auto flex-1">
                            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap font-mono text-sm">
                                {selectedMessage.message}
                            </p>
                        </div>
                        <div className="p-4 border-t border-white/10 text-xs text-gray-500 flex justify-between bg-black/20">
                            <span>ID: {selectedMessage._id}</span>
                            <span>Received: {new Date(selectedMessage.createdAt).toLocaleString()}</span>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
                        <Icon icon="mdi:message-outline" className="text-6xl opacity-20" />
                        <p>Select a transmission to decypher.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
