import { useState, useRef, useEffect } from 'react';
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

    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isBuffering, setIsBuffering] = useState(false);
    const [seekOverlay, setSeekOverlay] = useState<{ type: 'forward' | 'backward', key: number } | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [quality, setQuality] = useState('auto');

    // Hide controls timeout
    const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (autoPlay && videoRef.current) {
            videoRef.current.play().catch(() => {
                // Autoplay was prevented
                setIsPlaying(false);
            });
        }
    }, [autoPlay, src]);

    const handlePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
                setIsPlaying(false);
                setShowControls(true);
            } else {
                videoRef.current.play();
                setIsPlaying(true);
                startHideControlsTimer();
            }
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime;
            const total = videoRef.current.duration;
            setCurrentTime(current);
            setDuration(total);
            setProgress((current / total) * 100);
        }
    };

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (videoRef.current) {
            const manualChange = Number(e.target.value);
            videoRef.current.currentTime = (videoRef.current.duration / 100) * manualChange;
            setProgress(manualChange);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = Number(e.target.value);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
            setVolume(newVolume);
            setIsMuted(newVolume === 0);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            if (isMuted) {
                videoRef.current.volume = volume || 1;
                setIsMuted(false);
            } else {
                videoRef.current.volume = 0;
                setIsMuted(true);
            }
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const startHideControlsTimer = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        if (isPlaying) {
            controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
        }
    };

    const handleMouseMove = () => {
        startHideControlsTimer();
    };

    const handleSeek = (direction: 'forward' | 'backward') => {
        if (videoRef.current) {
            const time = videoRef.current.currentTime;
            if (direction === 'forward') {
                videoRef.current.currentTime = time + 5;
                setSeekOverlay({ type: 'forward', key: Date.now() });
            } else {
                videoRef.current.currentTime = time - 5;
                setSeekOverlay({ type: 'backward', key: Date.now() });
            }
            startHideControlsTimer();
        }
    };

    // const changeSpeed = (speed: number) => {
    //     if (videoRef.current) {
    //         videoRef.current.playbackRate = speed;
    //         setPlaybackSpeed(speed);
    //         setShowSettings(false);
    //     }
    // };

    const changeSpeed = (speed: number, close = true) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = speed;
            setPlaybackSpeed(speed);
            if (close) setShowSettings(false);
        }
    };


    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (document.activeElement?.tagName === 'INPUT') return;

            switch (e.key) {
                case ' ': // Space
                case 'k':
                case 'K':
                    e.preventDefault();
                    handlePlayPause();
                    break;
                case 'f':
                case 'F':
                    toggleFullscreen();
                    break;
                case 'm':
                case 'M':
                    toggleMute();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    handleSeek('forward');
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    handleSeek('backward');
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPlaying, isMuted, volume, playbackSpeed]);

    return (
        <div
            ref={containerRef}
            className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group select-none"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => isPlaying && setShowControls(false)}
            onContextMenu={(e) => e.preventDefault()} // Disable Right Click
        >
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                className="w-full h-full object-contain"
                onTimeUpdate={handleTimeUpdate}
                onWaiting={() => setIsBuffering(true)}
                onCanPlay={() => setIsBuffering(false)}
                onEnded={() => {
                    setIsPlaying(false);
                    setShowControls(true);
                    onEnded && onEnded();
                }}
                onClick={handlePlayPause}
                controls={false} // Native controls hidden
                playsInline
            />

            <div className="absolute bottom-4 right-4 z-20 opacity-50 pointer-events-none">
                <img src="/Logo Vertical.png" className="w-10 object-contain" alt="Nexus" />
            </div>

            {/* Buffering Spinner */}
            {isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                    <Icon icon="mdi:loading" className="animate-spin text-nexus-green text-5xl" />
                </div>
            )}

            {/* Center Play/Pause Animation (Optional) */}
            {!isPlaying && !isBuffering && !seekOverlay && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10 cursor-pointer" onClick={handlePlayPause}>
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-nexus-green/90 p-5 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.5)] cursor-pointer hover:scale-110 transition-transform"
                    >
                        <Icon icon="mdi:play" width="48" className="text-black ml-1" />
                    </motion.div>
                </div>
            )}

            {/* Seek Overlay Animation */}
            <AnimatePresence>
                {seekOverlay && (
                    <motion.div
                        key={seekOverlay.key}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.2 }}
                        onAnimationComplete={() => setSeekOverlay(null)}
                        className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
                    >
                        <div className="bg-black/60 p-4 rounded-full flex  items-center justify-center backdrop-blur-sm">
                            <Icon
                                icon={seekOverlay.type === 'forward' ? "mdi:fast-forward-5" : "mdi:rewind-5"}
                                className="text-white text-4xl"
                            />
                            {/* <span className="text-xs font-bold text-white mt-1">
                                {seekOverlay.type === 'forward' ? '+5s' : '-5s'}
                            </span> */}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Custom Controls Bar */}
            <AnimatePresence>
                {showControls && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black via-black/80 to-transparent pt-12 pb-4 px-4 z-30"
                    >
                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-gray-700/50 rounded-full mb-4 relative group/progress cursor-pointer">
                            <div
                                className="absolute top-0 left-0 h-full bg-nexus-green rounded-full shadow-[0_0_10px_#00ffa3]"
                                style={{ width: `${progress}%` }}
                            />
                            {/* Hoverable Interaction Area for easier seeking */}
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={progress}
                                onChange={handleProgressChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-40"
                            />
                            {/* Detailed Scrubber Handle (visible on hover) */}
                            <div
                                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover/progress:opacity-100 transition-opacity pointer-events-none"
                                style={{ left: `${progress}%`, transform: `translate(-50%, -50%)` }}
                            />
                        </div>

                        {/* Controls Interface */}
                        <div className="flex items-center justify-between pointer-events-none *:pointer-events-auto">
                            <div className="flex items-center gap-4">
                                <img src="/Logo Vertical.png" className='w-10 object-contain' alt="Nexus Logo" />
                                <button onClick={handlePlayPause} className="text-white hover:text-nexus-green transition-colors">
                                    <Icon icon={isPlaying ? "mdi:pause" : "mdi:play"} width="28" />
                                </button>

                                <div className="flex items-center gap-2 group/volume">
                                    <button onClick={toggleMute} className="text-white hover:text-nexus-green transition-colors">
                                        <Icon icon={isMuted || volume === 0 ? "mdi:volume-off" : volume < 0.5 ? "mdi:volume-medium" : "mdi:volume-high"} width="24" />
                                    </button>
                                    <div className="w-0 overflow-hidden group-hover/volume:w-24 transition-all duration-300">
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.1"
                                            value={isMuted ? 0 : volume}
                                            onChange={handleVolumeChange}
                                            className="w-20 h-1 bg-gray-600 rounded-full accent-white cursor-pointer ml-2"
                                        />
                                    </div>
                                </div>

                                <div className="text-xs font-mono text-gray-300">
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 relative">
                                {/* Settings Menu */}
                                <AnimatePresence>
                                    {showSettings && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute bottom-12 right-0 bg-black/95 border border-white/10 rounded-lg p-3 w-48 shadow-2xl backdrop-blur-lg"
                                        >
                                            <div className="space-y-3">
                                                {/* <img src="/Logo Horizontal.png" alt="" className="w-20 object-contain m-auto -mt-5" /> */}
                                                {/* Quality - Placeholder until backend HLS */}
                                                <div>
                                                    <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
                                                        <Icon icon="mdi:high-definition" /> Quality
                                                    </div>
                                                    <div className="space-y-1">
                                                        {['Auto (1080p)', '720p', '480p'].map((q) => (
                                                            <button
                                                                key={q}
                                                                onClick={() => { setQuality(q); setShowSettings(false); }}
                                                                className={`w-full text-left px-2 py-1.5 rounded text-sm flex items-center justify-between ${quality === q ? 'bg-nexus-green/20 text-nexus-green' : 'text-gray-300 hover:bg-white/10'
                                                                    }`}
                                                            >
                                                                {q}
                                                                {quality === q && <Icon icon="mdi:check" />}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="h-px bg-white/10" />

                                                {/* Speed */}
                                                {/* <div>
                                                    <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
                                                        <Icon icon="mdi:speedometer" /> Speed
                                                    </div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {[0.5, 1, 1.5, 2].map((s) => (
                                                            <button
                                                                key={s}
                                                                onClick={() => changeSpeed(s)}
                                                                className={`flex-1 px-2 py-1 rounded text-xs font-bold ${playbackSpeed === s ? 'bg-nexus-green text-black' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                                                    }`}
                                                            >
                                                                {s}x
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div> */}
                                                {/* Speed */}
                                                <div>
                                                    <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">
                                                        <Icon icon="mdi:speedometer" /> Speed
                                                    </div>

                                                    {/* Preset Buttons */}
                                                    <div className="flex flex-wrap gap-1 justify-center mb-3">
                                                        {[0.5, 1, 1.5, 2, 2.5, 3].map((s) => (
                                                            <button
                                                                key={s}
                                                                onClick={() => changeSpeed(s)}
                                                                className={`px-2 py-1 rounded text-xs font-bold transition ${playbackSpeed === s
                                                                    ? 'bg-nexus-green text-black'
                                                                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                                                                    }`}
                                                            >
                                                                {s}x
                                                            </button>
                                                        ))}
                                                    </div>

                                                    {/* Slider */}
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="range"
                                                            min="0.25"
                                                            max="5"
                                                            step="0.05"
                                                            value={playbackSpeed}
                                                            onChange={(e) => changeSpeed(Number(e.target.value), false)}
                                                            className="w-full h-1 bg-gray-600 rounded-full accent-nexus-green cursor-pointer"
                                                        />
                                                        <span className="text-xs font-mono text-gray-300 w-10 text-right">
                                                            {playbackSpeed.toFixed(2)}x
                                                        </span>
                                                    </div>
                                                </div>

                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button
                                    onClick={() => setShowSettings(!showSettings)}
                                    className={`transition-colors ${showSettings ? 'text-nexus-green rotate-45' : 'text-gray-400 hover:text-white'}`}
                                    title="Settings"
                                >
                                    <Icon icon="mdi:cog-outline" width="22" />
                                </button>

                                <button onClick={toggleFullscreen} className="text-white hover:text-nexus-green transition-colors">
                                    <Icon icon={isFullscreen ? "mdi:fullscreen-exit" : "mdi:fullscreen"} width="28" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
