// 3D Realistic Bookshelf Component
import React from 'react';
import { Link } from 'react-router-dom';
import { Novel } from '../types';

interface BookshelfProps {
    novels: Novel[];
    skin?: string;
}

const SKIN_CONFIG: Record<string, { 
    container: string;
    border: string;
    plank: string;
    plankTop: string;
    bg: string;
    texture: string;
    lighting: string;
}> = {
    'classic_wood': {
        container: 'bg-[#3E2723]',
        border: 'border-[#2D1B15]',
        plank: 'bg-[#5D4037]',
        plankTop: 'bg-[#4E342E]',
        bg: 'bg-black/10',
        texture: 'url("https://www.transparenttextures.com/patterns/wood-pattern.png")',
        lighting: 'bg-gradient-to-tr from-black/60 via-transparent to-yellow-500/10'
    },
    'magical_archive': {
        container: 'bg-[#1a1b4b]', // Deep Indigo
        border: 'border-[#312e81]',
        plank: 'bg-[#312e81]', // Indigo 900
        plankTop: 'bg-[#4338ca]', // Indigo 700
        bg: 'bg-indigo-500/5',
        texture: 'url("https://www.transparenttextures.com/patterns/stardust.png")',
        lighting: 'bg-gradient-to-tr from-purple-900/60 via-transparent to-indigo-400/20 mix-blend-screen'
    },
    'data_vault': {
        container: 'bg-slate-950', 
        border: 'border-cyan-900',
        plank: 'bg-slate-900',
        plankTop: 'bg-cyan-950',
        bg: 'bg-cyan-500/10',
        texture: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")',
        lighting: 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950/50 to-black'
    },
    'haunted_mahogany': {
        container: 'bg-[#1c1917]', // Stone 950
        border: 'border-[#7f1d1d]', // Red 900
        plank: 'bg-[#292524]',
        plankTop: 'bg-[#44403c]',
        bg: 'bg-red-950/20',
        texture: 'url("https://www.transparenttextures.com/patterns/criss-xcross.png")',
        lighting: 'bg-gradient-to-b from-black via-red-950/10 to-transparent'
    },
    'sakura_dream': {
        container: 'bg-[#fdf2f8]', // Pink 50
        border: 'border-[#fbcfe8]', // Pink 200
        plank: 'bg-[#fce7f3]', // Pink 100
        plankTop: 'bg-[#f472b6]', // Pink 400
        bg: 'bg-pink-100/50',
        texture: 'url("https://www.transparenttextures.com/patterns/cubes.png")',
        lighting: 'bg-gradient-to-br from-white via-transparent to-pink-200/30'
    }
};

export const Bookshelf: React.FC<BookshelfProps> = ({ novels, skin = 'classic_wood' }) => {
    
    const theme = SKIN_CONFIG[skin] || SKIN_CONFIG['classic_wood'];

    // Generate deterministic random properties based on Novel ID
    // so the book looks the same every render
    const getBookStyle = (id: string, index: number) => {
        const colors = [
            'bg-[#8B4513]', // SaddleBrown
            'bg-[#556B2F]', // DarkOliveGreen
            'bg-[#191970]', // MidnightBlue
            'bg-[#800000]', // Maroon
            'bg-[#2F4F4F]', // DarkSlateGray
            'bg-[#483D8B]', // DarkSlateBlue
            'bg-[#A52A2A]', // Brown
            'bg-[#000000]', // Black
            'bg-[#3E2723]', // Dark Bean
        ];
        
        // Simple hash function for pseudo-randomness
        const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + index;
        
        const color = colors[hash % colors.length];
        const height = 180 + (hash % 60); // 180px - 240px
        const thickness = 30 + (hash % 20); // 30px - 50px
        const pattern = hash % 3 === 0 ? 'border-dashed border-yellow-500/30' : 'border-double border-white/20';
        
        return { color, height, thickness, pattern };
    };

    // Group into shelves of ~8-12 books depending on width
    // For simplicity, just one wrapping flex container that looks like "shelves"
    // But to force "rows", we might need to chunk them if we want the wooden plank under each row.
    // Let's stick to a Flex wrap container with a "shelf" background for the row.
    
    // Actually, "shelves" implies horizontal bars. 
    // Let's render chunks.
    const chunkSize = 10;
    const shelves = [];
    for (let i = 0; i < novels.length; i += chunkSize) {
        shelves.push(novels.slice(i, i + chunkSize));
    }
    if (shelves.length === 0) shelves.push([]);

    return (
        <div className={`${theme.container} p-4 rounded-xl shadow-2xl border-4 ${theme.border} relative overflow-hidden transition-colors duration-500`}>
             {/* Texture Overlay */}
             <div className="absolute inset-0 opacity-10 pointer-events-none" 
                  style={{ backgroundImage: theme.texture }}></div>
             
             {/* Magical Parsicle Effects for special skins */}
             {skin === 'magical_archive' && <div className="absolute inset-0 bg-indigo-500/10 animate-pulse pointer-events-none"></div>}
            
            <div className="space-y-0 relative z-10">
                {shelves.map((shelfBooks, i) => (
                    <div key={i} className="relative pt-8 pb-0 px-4">
                        {/* The Books */}
                        <div className="flex items-end justify-center gap-1 sm:gap-2 h-[260px] perspective-[1000px] mb-[-4px] z-20 relative">
                            {shelfBooks.map((novel, idx) => {
                                const style = getBookStyle(novel.id, idx);
                                
                                return (
                                    <div 
                                        key={novel.id} 
                                        className="relative group preserve-3d transition-transform duration-1000 ease-in-out cursor-pointer hover:z-50"
                                        style={{ 
                                            width: `${style.thickness}px`, 
                                            height: `${style.height}px`,
                                            perspective: '1500px',
                                            transformStyle: 'preserve-3d' // Force 3D context
                                        }}
                                    >
                                        <Link 
                                           to={`/novel/${novel.id}`} 
                                           className="block w-full h-full preserve-3d transition-transform duration-1000 ease-in-out group-hover:[transform:rotateX(-25deg)_rotateY(-40deg)_rotateZ(-15deg)_translateY(-50px)_translateX(-30px)_translateZ(100px)]"
                                           style={{ transformStyle: 'preserve-3d' }} 
                                        >
                                            {/* SPINE: width=thickness, height=height */}
                                            <div 
                                                className={`absolute inset-0 ${style.color} border-2 ${skin === 'classic_wood' ? 'border-[#2D1B15]' : 'border-black/20'} rounded-[3px] flex flex-col items-center justify-between py-2 text-center shadow-inner`}
                                                style={{ 
                                                    transform: 'rotateY(0deg) translateZ(0px)', // From snippet
                                                    backfaceVisibility: 'hidden'
                                                }}
                                            >
                                                <span className="flex-1 font-serif text-[10px] sm:text-xs text-amber-100 font-bold overflow-hidden px-1 py-2 leading-tight opacity-90" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                                                    {novel.title}
                                                </span>
                                                <span className="text-[8px] text-amber-200/60 font-mono mb-1 truncate max-w-full">
                                                    {novel.author?.split(' ')[0] || 'NV'}
                                                </span>
                                            </div>

                                            {/* TOP: width=thickness, height=CoverWidth(190) */}
                                            {/* Snippet Top: width 50, height 190. transform: rotateX(90deg) translateZ(95px) translateY(-95px) */}
                                            {/* 95 is 190/2. So translateZ(CoverWidth/2) translateY(-CoverWidth/2) */}
                                            <div 
                                                className="absolute bg-[#f4ecd8] border border-[#e4dcc8]"
                                                style={{ 
                                                    width: `${style.thickness}px`,
                                                    height: '190px', // Standard Cover Width from snippet
                                                    top: '-2px',
                                                    backgroundImage: 'linear-gradient(90deg, white 90%, gray 10%)',
                                                    backgroundSize: '5px 5px',
                                                    transform: `rotateX(90deg) translateZ(${190/2}px) translateY(-${190/2}px)`
                                                }}
                                            ></div>

                                            {/* COVER: width=190, height=height */}
                                            {/* Snippet Cover: left: 50px (thickness), rotateY(90deg) translateZ(0) */}
                                            <div 
                                                className="absolute bg-slate-800 overflow-hidden border border-black/20"
                                                style={{ 
                                                    width: '190px',
                                                    height: `${style.height}px`,
                                                    left: `${style.thickness}px`,
                                                    top: '0px',
                                                    transform: 'rotateY(90deg) translateZ(0)',
                                                    transformOrigin: 'left', // Hinge on spine
                                                    backfaceVisibility: 'visible'
                                                }}
                                            >
                                                {novel.coverUrl ? (
                                                    <img src={novel.coverUrl} alt={novel.title} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className={`w-full h-full ${style.color} flex items-center justify-center p-4 text-center text-amber-100 font-serif`}>
                                                         {novel.title}
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
                                            </div>

                                            {/* Closing the Box (Optional but good for completeness) */}
                                            {/* BOTTOM (Opposite Top) */}
                                             {/* <div 
                                                className="absolute bg-[#f4ecd8] border border-[#e4dcc8]"
                                                style={{ 
                                                    width: `${style.thickness}px`,
                                                    height: '190px', 
                                                    bottom: '-2px', // Approx
                                                    // Opposite of Top
                                                    transform: `rotateX(90deg) translateZ(${190/2}px) translateY(-${190/2}px) translateZ(-${style.height}px)` // Just guessing position relative to top? No, complex.
                                                    // Let's Skip Bottom for now as snippet didn't have it and it's hidden mostly.
                                                }}
                                            ></div> */}

                                        </Link>
                                    </div>
                                );
                            })}
                            
                            {shelfBooks.length === 0 && (
                                <div className={`h-full flex items-end justify-center w-full pb-8 opacity-30 ${skin === 'sakura_dream' ? 'text-pink-400' : 'text-[#8D6E63]'} font-serif italic`}>
                                    Empty Shelf...
                                </div>
                            )}
                        </div>

                        {/* The Wood Shelf Plank */}
                        <div className={`h-6 w-full ${theme.plank} relative shadow-lg rounded-sm border-t ${skin === 'classic_wood' ? 'border-[#6D4C41]' : theme.border}`}>
                            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent"></div>
                            {/* Top highlight of plank */}
                            <div className={`absolute -top-1 left-0 right-0 h-1 ${theme.plankTop} skew-x-[45deg] opacity-50`}></div>
                            <div className="absolute -bottom-4 left-4 right-4 h-4 bg-black/40 blur-md rounded-[50%]"></div>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Ambient Lighting */}
            <div className={`absolute inset-0 pointer-events-none z-30 mix-blend-overlay ${theme.lighting}`}></div>
        </div>
    );
};
