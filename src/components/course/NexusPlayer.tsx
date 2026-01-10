import { useState, useRef, useEffect, useCallback } from 'react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';

interface NexusPlayerProps {
    src: string;
    poster?: string;
    autoPlay?: boolean;
    onEnded?: () => void;
}

export default function NexusPlayer({ src, poster, autoPlay = false, onEnded }: NexusPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Playback State
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isBuffering, setIsBuffering] = useState(false);
    const [isEnded, setIsEnded] = useState(false);

    // Volume State
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [prevVolume, setPrevVolume] = useState(1);

    // UI State
    const [showControls, setShowControls] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [quality, setQuality] = useState('1080p');

    // Interaction State
    const [seekOverlay, setSeekOverlay] = useState<{ type: 'forward' | 'backward', key: number } | null>(null);
    const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Initialize
    useEffect(() => {
        if (autoPlay && videoRef.current) {
            videoRef.current.play().catch(() => setIsPlaying(false));
            setIsPlaying(true);
        }
    }, [autoPlay, src]);

    // --- Media Controls ---

    const togglePlay = useCallback(() => {
        if (!videoRef.current) return;
        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
            setIsEnded(false);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    }, []);

    const toggleMute = () => {
        if (!videoRef.current) return;
        if (isMuted) {
            videoRef.current.volume = prevVolume;
            setIsMuted(false);
            setVolume(prevVolume);
        } else {
            setPrevVolume(volume);
            videoRef.current.volume = 0;
            setIsMuted(true);
            setVolume(0);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        if (videoRef.current) {
            videoRef.current.volume = val;
            setVolume(val);
            setIsMuted(val === 0);
        }
    };

    const seek = (seconds: number) => {
        if (!videoRef.current) return;
        videoRef.current.currentTime = Math.min(Math.max(videoRef.current.currentTime + seconds, 0), duration);
        setSeekOverlay({ type: seconds > 0 ? 'forward' : 'backward', key: Date.now() });
    };

    const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        if (videoRef.current) {
            const time = (duration / 100) * val;
            videoRef.current.currentTime = time;
            setProgress(val);
            setCurrentTime(time);
        }
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

    const setSpeed = (rate: number) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = rate;
            setPlaybackSpeed(rate);
            setShowSettings(false);
        }
    };

    const changeQuality = (q: string) => {
        setQuality(q);
        setShowSettings(false);
    };

    // --- Time Updates ---

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        setCurrentTime(videoRef.current.currentTime);
        setDuration(videoRef.current.duration);
        setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
    };

    const formatTime = (time: number) => {
        if (isNaN(time)) return "00:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    // --- Mouse & Keyboard ---

    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        if (isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 2500);
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (document.activeElement?.tagName === 'INPUT') return;
            switch (e.key.toLowerCase()) {
                case ' ':
                case 'k': e.preventDefault(); togglePlay(); break;
                case 'f': e.preventDefault(); toggleFullscreen(); break;
                case 'm': e.preventDefault(); toggleMute(); break;
                case 'arrowleft': e.preventDefault(); seek(-5); break;
                case 'arrowright': e.preventDefault(); seek(5); break;
                case 'arrowup': e.preventDefault(); if (videoRef.current) { const v = Math.min(volume + 0.1, 1); videoRef.current.volume = v; setVolume(v); setIsMuted(false); } break;
                case 'arrowdown': e.preventDefault(); if (videoRef.current) { const v = Math.max(volume - 0.1, 0); videoRef.current.volume = v; setVolume(v); setIsMuted(v === 0); } break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [togglePlay, volume, isMuted, duration]);


    return (
        <div
            ref={containerRef}
            className="group relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl select-none font-sans"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
            onContextMenu={(e) => e.preventDefault()}
        >
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                className="w-full h-full object-contain"
                onTimeUpdate={handleTimeUpdate}
                onWaiting={() => setIsBuffering(true)}
                onCanPlay={() => setIsBuffering(false)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => { setIsPlaying(false); setIsEnded(true); setShowControls(true); if (onEnded) onEnded(); }}
                onClick={togglePlay}
                playsInline
            />

            {/* Gradient Overlay for better contrast */}
            <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`} />

            {/* Top Bar - No Content per request */}
            <AnimatePresence>
                {showControls && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start pointer-events-none"
                    >
                        <img src="/Logo Horizontal.png" alt="" className='absolute top-3 right-4 w-25 opacity-70' />

                    </motion.div>
                )}
            </AnimatePresence>

            {/* Center Play/Buffering/Replay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {isBuffering ? (
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-nexus-green/30 border-t-nexus-green rounded-full animate-spin" />
                        <Icon icon="mdi:lightning-bolt" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-nexus-green animate-pulse" />
                    </div>
                ) : (
                    <AnimatePresence>
                        {(!isPlaying || showControls) && (
                            <motion.button
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0 }}
                                onClick={togglePlay}
                                className="pointer-events-auto bg-white/10 backdrop-blur-md p-6 rounded-full border border-white/20 hover:bg-nexus-green hover:border-nexus-green hover:text-black hover:scale-110 transition-all text-white group/playbutton"
                            >
                                <Icon icon={isEnded ? "mdi:restart" : isPlaying ? "mdi:pause" : "mdi:play"} className="text-4xl ml-1 group-hover/playbutton:ml-0" />
                            </motion.button>
                        )}
                    </AnimatePresence>
                )}
            </div>

            {/* Seek Feedback Animation - FIXED duration and visibility */}
            <AnimatePresence mode="wait">
                {seekOverlay && (
                    <motion.div
                        key={seekOverlay.key}
                        initial={{ opacity: 0, scale: 0.5, x: seekOverlay.type === 'forward' ? 50 : -50 }}
                        animate={{ opacity: 1, scale: 1, x: seekOverlay.type === 'forward' ? 100 : -100 }}
                        exit={{ opacity: 0, scale: 1.5 }}
                        transition={{ duration: 0.4 }}
                        onAnimationComplete={() => setSeekOverlay(null)}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
                    >
                        <div className="bg-black/80 backdrop-blur-md p-4 rounded-full flex flex-col items-center border border-white/10 shadow-xl">
                            {/* Updated Icons to 5 */}
                            <Icon icon={seekOverlay.type === 'forward' ? "mdi:fast-forward-5" : "mdi:rewind-5"} className="text-3xl text-nexus-green" />
                            <span className="text-xs font-bold text-white mt-1">{seekOverlay.type === 'forward' ? '+5s' : '-5s'}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Controls Container */}
            <AnimatePresence>
                {showControls && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-0 left-0 right-0 px-6 pb-6 pt-20 bg-gradient-to-t from-black via-black/60 to-transparent"
                    >
                        {/* Progress Bar */}
                        <div className="relative w-full h-1.5 bg-white/20 rounded-full mb-4 group/progress cursor-pointer hover:h-2 transition-all duration-300">
                            <div
                                className="absolute top-0 left-0 h-full bg-nexus-green rounded-full shadow-[0_0_15px_#22c55e]"
                                style={{ width: `${progress}%` }}
                            />
                            <div
                                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity"
                                style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
                            />
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={progress}
                                onChange={handleSeekChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                        </div>

                        {/* Control Buttons */}
                        <div className="flex items-center justify-between">

                            {/* Left: Play/Volume/Time */}
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-4 border-r border-white/10 pr-6">
                                    <button onClick={togglePlay} className="text-gray-300 hover:text-white hover:text-nexus-green transition-colors">
                                        <Icon icon={isEnded ? "mdi:restart" : isPlaying ? "mdi:pause" : "mdi:play"} className="text-3xl" />
                                    </button>
                                    {/* Logo next to play button */}
                                    <img src="/Logo TP.png" className="h-8 object-contain opacity-80" alt="Nexus" />
                                </div>

                                <div className="flex items-center gap-2 group/vol">
                                    <button onClick={toggleMute} className="text-gray-300 hover:text-white transition-colors">
                                        <Icon icon={isMuted || volume === 0 ? "mdi:volume-off" : volume < 0.5 ? "mdi:volume-medium" : "mdi:volume-high"} className="text-2xl" />
                                    </button>
                                    <div className="w-0 overflow-hidden group-hover/vol:w-24 transition-all duration-300 ease-out">
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.05"
                                            value={isMuted ? 0 : volume}
                                            onChange={handleVolumeChange}
                                            className="w-20 mx-2 h-1 bg-gray-500 rounded-full accent-white cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <span className="text-xs font-mono font-medium text-gray-400">
                                    {formatTime(currentTime)} <span className="text-gray-600 mx-1">/</span> {formatTime(duration)}
                                </span>
                            </div>

                            {/* Right: Settings/Fullscreen */}
                            <div className="flex items-center gap-4 relative">

                                <AnimatePresence>
                                    {showSettings && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute bottom-12 right-0 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 w-64 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
                                        >
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2 text-nexus-green text-xs font-black uppercase tracking-widest border-b border-white/10 pb-2 mb-2">
                                                    <Icon icon="mdi:cog" /> Player Settings
                                                </div>

                                                {/* Speed Control */}
                                                <div>
                                                    <span className="text-xs text-gray-400 font-bold uppercase mb-2 block">Playback Speed</span>
                                                    <div className="grid grid-cols-4 gap-2">
                                                        {[0.5, 1.0, 1.5, 2.0].map(speed => (
                                                            <button
                                                                key={speed}
                                                                onClick={() => setSpeed(speed)}
                                                                className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all ${playbackSpeed === speed
                                                                    ? 'bg-nexus-green text-black'
                                                                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                                                    }`}
                                                            >
                                                                {speed}x
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* QUALITY UPDATED */}
                                                <div>
                                                    <span className="text-xs text-gray-400 font-bold uppercase mb-2 block">Quality</span>
                                                    <div className="space-y-1">
                                                        {['4K Ultra HD', '1080p FHD', '720p HD', '480p SD', 'Auto'].map(q => (
                                                            <button
                                                                key={q}
                                                                onClick={() => changeQuality(q)}
                                                                className={`w-full text-left px-3 py-2 rounded-lg border text-xs font-medium flex justify-between items-center transition-all ${quality === q
                                                                    ? 'bg-nexus-green/10 border-nexus-green/30 text-nexus-green'
                                                                    : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                                                    }`}
                                                            >
                                                                <span>{q}</span>
                                                                {quality === q && <Icon icon="mdi:check-circle" className="text-nexus-green" />}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button
                                    onClick={() => setShowSettings(!showSettings)}
                                    className={`text-gray-300 hover:text-white transition-all ${showSettings ? 'rotate-90 text-nexus-green' : ''}`}
                                >
                                    <Icon icon="mdi:cog-outline" className="text-2xl" />
                                </button>

                                <button onClick={toggleFullscreen} className="text-gray-300 hover:text-white transition-colors">
                                    <Icon icon={isFullscreen ? "mdi:fullscreen-exit" : "mdi:fullscreen"} className="text-3xl" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
