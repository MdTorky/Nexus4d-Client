import { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import { Document, Page, pdfjs } from 'react-pdf';
import { motion, AnimatePresence } from 'framer-motion';

// Import PDF styles
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF Worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface NexusViewerProps {
    type: 'pdf' | 'image' | 'slide' | 'link';
    url: string;
    title?: string;
}

export default function NexusViewer({ type, url, title }: NexusViewerProps) {
    const [isLoading, setIsLoading] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    // PDF State
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [rotation, setRotation] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [inputPage, setInputPage] = useState("1"); // For jump-to-page input

    // Control Timeout
    const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Reset state on URL change
    useEffect(() => {
        setPageNumber(1);
        setScale(1.0);
        setRotation(0);
        setInputPage("1");
        setIsLoading(true);
    }, [url]);

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
    };

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setIsLoading(false);
    }

    const changePage = (offset: number) => {
        const newPage = Math.min(Math.max(1, pageNumber + offset), numPages);
        setPageNumber(newPage);
        setInputPage(String(newPage));
    };

    const handlePageSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const p = parseInt(inputPage);
        if (!isNaN(p) && p >= 1 && p <= numPages) {
            setPageNumber(p);
        } else {
            setInputPage(String(pageNumber)); // Revert if invalid
        }
    };

    const changeScale = (delta: number) => {
        setScale(prevScale => Math.min(Math.max(0.5, prevScale + delta), 3.0));
    };

    const rotate = () => {
        setRotation(prev => (prev + 90) % 360);
    };

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const fitToWidth = () => {
        // This is a naive implementation; proper fit-to-width requires measuring container
        // For now, setting a standard "fit" scale like 1.2 or 1.0 depending on layout
        setScale(1.2);
    };

    const fitToPage = () => {
        setScale(0.8);
    };

    // Auto-hide controls
    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (document.activeElement?.tagName === 'INPUT') return;

            switch (e.key) {
                case 'ArrowRight': changePage(1); break;
                case 'ArrowLeft': changePage(-1); break;
                case 'ArrowUp': changeScale(0.1); break; // Zoom In
                case 'ArrowDown': changeScale(-0.1); break; // Zoom Out
                case 'r': rotate(); break; // Rotate
                case 'f': toggleFullscreen(); break; // Fullscreen
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [pageNumber, numPages, scale]);


    // --- RENDERERS ---

    if (type === 'image') {
        return (
            <div
                ref={containerRef}
                className="w-full h-full bg-black flex items-center justify-center relative overflow-hidden group select-none"
                onContextMenu={handleContextMenu}
            >
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 border-4 border-nexus-green/30 border-t-nexus-green rounded-full animate-spin" />
                    </div>
                )}
                <img
                    src={url}
                    alt={title || "Course Material"}
                    className={`max-w-full max-h-full object-contain pointer-events-none ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                    onLoad={() => setIsLoading(false)}
                />
                <div className="absolute top-4 right-4 z-20 opacity-30 pointer-events-none">
                    <img src="/Logo Vertical.png" className="w-10 object-contain" alt="Nexus" />
                </div>
            </div>
        );
    }

    if (type === 'pdf' || type === 'slide') {
        return (
            <div
                ref={containerRef}
                className="w-full h-full bg-[#111] relative flex flex-col overflow-hidden select-none group"
                onContextMenu={handleContextMenu}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setShowControls(false)}
            >
                {/* Main Content Area */}
                <div className="flex-1 overflow-auto flex justify-center items-start p-8 relative scrollbar-thin scrollbar-thumb-nexus-green/20 scrollbar-track-transparent">
                    <div
                        className="relative shadow-2xl transition-transform duration-300 ease-out origin-top"
                        style={{ transform: `scale(${scale}) rotate(${rotation}deg)` }}
                    >
                        <Document
                            file={url}
                            onLoadSuccess={onDocumentLoadSuccess}
                            loading={
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-16 h-16 border-4 border-nexus-green/30 border-t-nexus-green rounded-full animate-spin" />
                                </div>
                            }
                            error={
                                <div className="text-red-500 flex flex-col items-center gap-2 p-10 bg-white/5 rounded-2xl">
                                    <Icon icon="mdi:alert-circle" width="40" />
                                    <p>Failed to load PDF</p>
                                </div>
                            }
                            className="flex justify-center"
                        >
                            <Page
                                pageNumber={pageNumber}
                                scale={1} // We handle scale via CSS transform for smoother Zoom
                                renderAnnotationLayer={false} // Performance optimization
                                renderTextLayer={false} // Security/Cleanliness
                                className="shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                            />
                        </Document>

                        {/* Security Overlay */}
                        <div className="absolute inset-0 z-20 bg-transparent" />
                    </div>
                </div>

                {/* Secure Watermark */}
                <div className="absolute top-5 right-5 z-10 opacity-20 pointer-events-none select-none">
                    <img src="/Logo Vertical.png" className="w-12" alt="Nexus" />
                </div>

                {/* Title Overlay (Fade out) */}
                <AnimatePresence>
                    {showControls && title && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-30"
                        >
                            <h3 className="text-center text-white/50 text-xs font-black uppercase tracking-widest">{title}</h3>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Command Bar */}
                <AnimatePresence>
                    {numPages > 0 && showControls && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/90 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl flex items-center gap-2 shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-30"
                        >
                            {/* Page Navigation */}
                            <div className="flex items-center gap-1 bg-white/5 rounded-xl px-2 py-1">
                                <button
                                    onClick={() => changePage(-1)}
                                    disabled={pageNumber <= 1}
                                    className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <Icon icon="mdi:chevron-left" width="20" />
                                </button>

                                <form onSubmit={handlePageSubmit} className="flex items-center">
                                    <input
                                        type="text"
                                        value={inputPage}
                                        onChange={(e) => setInputPage(e.target.value)}
                                        className="w-8 bg-transparent text-center text-white text-xs font-bold focus:outline-none focus:text-nexus-green selection:bg-nexus-green selection:text-black"
                                    />
                                    <span className="text-gray-500 text-[10px] select-none">/ {numPages}</span>
                                </form>

                                <button
                                    onClick={() => changePage(1)}
                                    disabled={pageNumber >= numPages}
                                    className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                >
                                    <Icon icon="mdi:chevron-right" width="20" />
                                </button>
                            </div>

                            <div className="w-px h-4 bg-white/10" />

                            {/* View Controls */}
                            <div className="flex items-center gap-1">
                                {/* <button
                                    onClick={rotate}
                                    className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                                    title="Rotate"
                                >
                                    <Icon icon="mdi:rotate-right" width="18" />
                                </button> */}

                                <img src="/Logo TP.png" className='w-7' alt="" />


                            </div>

                            <div className="w-px h-4 bg-white/10" />

                            {/* Zoom Controls */}
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => changeScale(-0.1)}
                                    className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                                >
                                    <Icon icon="mdi:minus" width="16" />
                                </button>
                                <span className="text-[10px] font-mono text-nexus-green w-8 text-center select-none">
                                    {Math.round(scale * 100)}%
                                </span>
                                <button
                                    onClick={() => changeScale(0.1)}
                                    className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                                >
                                    <Icon icon="mdi:plus" width="16" />
                                </button>
                            </div>

                            <div className="w-px h-4 bg-white/10 flex gap-1" />
                            <button
                                onClick={() => scale === 1.2 ? fitToPage() : fitToWidth()}
                                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                                title="Toggle Fit"
                            >
                                <Icon icon={scale > 1 ? "mdi:fit-to-page-outline" : "mdi:fit-to-screen-outline"} width="18" />
                            </button>
                            {/* Fullscreen */}
                            <button
                                onClick={toggleFullscreen}
                                className="p-1.5 text-gray-400 hover:text-nexus-green hover:bg-white/10 rounded-lg transition-all"
                                title="Fullscreen"
                            >
                                <Icon icon={isFullscreen ? "mdi:fullscreen-exit" : "mdi:fullscreen"} width="18" />
                            </button>

                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // Fallback for Links
    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-black/40 backdrop-blur-md p-8 text-center relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-nexus-green/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="bg-white/5 border border-white/10 p-8 rounded-full mb-6 relative group shadow-[0_0_50px_rgba(0,0,0,0.3)]">
                <div className="absolute inset-0 bg-nexus-green/20 rounded-full animate-ping opacity-20 group-hover:opacity-40 pointer-events-none"></div>
                <Icon icon="mdi:link-variant" className="text-nexus-green text-6xl relative z-10" />
            </div>

            <h3 className="text-white text-2xl font-black uppercase tracking-wider mb-3">{title || "External Resource"}</h3>
            <p className="text-gray-400 mb-8 max-w-md text-sm font-light">
                This secure material is hosted on an external server. Access authorization required.
            </p>

            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative px-8 py-4 bg-nexus-green text-black font-black uppercase tracking-widest text-xs rounded-lg hover:bg-white transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(34,197,94,0.3)] flex items-center gap-3 overflow-hidden"
            >
                <div className="absolute inset-0 bg-white/50 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 skew-x-12" />
                <span>Initialize Uplink</span>
                <Icon icon="mdi:open-in-new" className="text-lg" />
            </a>
        </div>
    );
}
