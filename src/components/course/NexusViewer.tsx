import { useState } from 'react';
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

    // PDF State
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);
    const [showControls, setShowControls] = useState(true);

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
    };

    function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setNumPages(numPages);
        setIsLoading(false);
    }

    const changePage = (offset: number) => {
        setPageNumber(prevPageNumber => Math.min(Math.max(1, prevPageNumber + offset), numPages));
    };

    const changeScale = (delta: number) => {
        setScale(prevScale => Math.min(Math.max(0.5, prevScale + delta), 3.0));
    };

    if (type === 'image') {
        return (
            <div
                className="w-full h-full bg-black flex items-center justify-center relative overflow-hidden group select-none"
                onContextMenu={handleContextMenu}
            >
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Icon icon="mdi:loading" className="animate-spin text-nexus-green text-4xl" />
                    </div>
                )}
                <img
                    src={url}
                    alt={title || "Course Material"}
                    className={`max-w-full max-h-full object-contain pointer-events-none ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
                    onLoad={() => setIsLoading(false)}
                />
                {/* Overlay to prevent drag/drop */}
                <div className="absolute inset-0 z-10"></div>
                <div className="absolute bottom-4 right-4 z-20 opacity-50 pointer-events-none">
                    <img src="/Logo Vertical.png" className="w-10 object-contain" alt="Nexus" />
                </div>
            </div>
        );
    }

    function onDocumentLoadError(error: Error) {
        console.error('Error loading PDF:', error);
    }

    if (type === 'pdf' || type === 'slide') {
        return (
            <div
                className="w-full h-full bg-gray-900 relative flex flex-col overflow-hidden select-none group"
                onContextMenu={handleContextMenu}
                onMouseEnter={() => setShowControls(true)}
                onMouseLeave={() => setShowControls(false)}
            >
                {/* Main Content Area */}
                <div className="flex-1 overflow-auto flex justify-center items-start p-8 relative scrollbar-thin scrollbar-thumb-nexus-green/20 scrollbar-track-transparent">
                    <div className="relative shadow-2xl">
                        <Document
                            file={url}
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={onDocumentLoadError}
                            loading={
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Icon icon="mdi:loading" className="animate-spin text-nexus-green text-4xl" />
                                </div>
                            }
                            error={
                                <div className="text-red-500 flex flex-col items-center gap-2">
                                    <Icon icon="mdi:alert-circle" width="40" />
                                    <p>Failed to load PDF</p>
                                </div>
                            }
                            className="flex justify-center"
                        >
                            <Page
                                pageNumber={pageNumber}
                                scale={scale}
                                renderAnnotationLayer={true}
                                renderTextLayer={true}
                                className="bg-white shadow-lg"
                            />
                        </Document>

                        {/* Overlay to prevent interaction/download */}
                        <div className="absolute inset-0 z-20"></div>
                    </div>
                </div>

                {/* Secure Watermark */}
                <div className="absolute top-4 right-4 z-10 opacity-30 pointer-events-none mix-blend-difference">
                    <img src="/Logo Vertical.png" className="w-12 object-contain" alt="Nexus" />
                </div>

                {/* Custom PDF Controls */}
                <AnimatePresence>
                    {numPages > 0 && showControls && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md border border-white/10 p-2 rounded-xl flex items-center gap-4 shadow-2xl z-30"
                        >
                            {/* Pagination */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => changePage(-1)}
                                    disabled={pageNumber <= 1}
                                    className="p-2 text-white hover:text-nexus-green disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Icon icon="mdi:chevron-left" width="24" />
                                </button>
                                <span className="text-sm font-bold text-white min-w-[80px] text-center">
                                    Page {pageNumber} / {numPages}
                                </span>
                                <button
                                    onClick={() => changePage(1)}
                                    disabled={pageNumber >= numPages}
                                    className="p-2 text-white hover:text-nexus-green disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Icon icon="mdi:chevron-right" width="24" />
                                </button>
                            </div>
                            <div className="w-px h-6 bg-white/20"></div>


                            <div>
                                <img src="/Logo TP.png" className='w-10 object-contain' alt="Nexus Logo" />
                            </div>

                            <div className="w-px h-6 bg-white/20"></div>

                            {/* Zoom */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => changeScale(-0.1)}
                                    className="p-2 text-white hover:text-nexus-green transition-colors"
                                    title="Zoom Out"
                                >
                                    <Icon icon="mdi:minus" width="20" />
                                </button>
                                <span className="text-xs font-mono text-gray-300 w-12 text-center">
                                    {Math.round(scale * 100)}%
                                </span>
                                <button
                                    onClick={() => changeScale(0.1)}
                                    className="p-2 text-white hover:text-nexus-green transition-colors"
                                    title="Zoom In"
                                >
                                    <Icon icon="mdi:plus" width="20" />
                                </button>
                            </div>


                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // Fallback for Links
    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-nexus-card/30 p-8 text-center">
            <div className="bg-nexus-green/10 p-6 rounded-full mb-6 relative group">
                <div className="absolute inset-0 bg-nexus-green/20 rounded-full animate-ping opacity-20 group-hover:opacity-40"></div>
                <Icon icon="mdi:link-variant" className="text-nexus-green text-5xl relative z-10" />
            </div>
            <h3 className="text-white text-xl font-bold mb-2">{title || "External Resource"}</h3>
            <p className="text-gray-400 mb-6 max-w-md">This material is hosted externally. Click below to open it in a secure new tab.</p>

            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 bg-nexus-green text-black font-bold rounded-full hover:bg-white transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(0,255,163,0.3)] flex items-center gap-2"
            >
                Open Resource <Icon icon="mdi:open-in-new" />
            </a>
        </div>
    );
}
