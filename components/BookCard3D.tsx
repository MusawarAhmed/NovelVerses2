import React from 'react';
import { Link } from 'react-router-dom';
import { Novel } from '../types';

interface BookCard3DProps {
    novel: Novel;
    className?: string;
}

const BookCard3D: React.FC<BookCard3DProps> = ({ novel, className = '' }) => {
    return (
        <div className={`book-3d-wrapper ${className}`}>
             <Link to={`/novel/${novel.slug || novel.id}`} className="book-3d-container block cursor-pointer">
                <div className="book-3d">
                    <img
                        alt={novel.title}
                        src={novel.coverUrl}
                        className="w-full h-full object-cover rounded-r-sm"
                    />
                </div>
            </Link>
            
            {/* Embedded styles for this component to ensure 3D effect works without global CSS pollution */}
            <style>{`
                .book-3d-wrapper {
                     display: flex;
                     justify-content: center;
                     padding: 20px 0;
                }
                .book-3d-container {
                    perspective: 600px;
                    width: 160px; /* Scaled down slightly for grid */
                    height: 240px; 
                }

                @media (min-width: 768px) {
                    .book-3d-container {
                        width: 180px; 
                        height: 270px;
                    }
                }

                @keyframes initAnimation3D {
                    0% { transform: rotateY(0deg); }
                    100% { transform: rotateY(-30deg); }
                }

                .book-3d {
                    width: 100%;
                    height: 100%;
                    position: relative;
                    transform-style: preserve-3d;
                    transform: rotateY(-30deg);
                    transition: 1s ease;
                    animation: 1s ease 0s 1 initAnimation3D;
                    box-shadow: 10px 10px 30px rgba(0,0,0,0.3); 
                }

                .book-3d-container:hover .book-3d, 
                .book-3d-container:focus .book-3d {
                    transform: rotateY(0deg);
                    box-shadow: 5px 5px 15px rgba(0,0,0,0.2);
                }

                .book-3d > img {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    transform: translateZ(20px); /* Reduced depth for smaller size */
                    border-radius: 0 2px 2px 0;
                    background-color: #333;
                }

                /* Pages effect (Spine/Side) */
                .book-3d::before {
                    position: absolute;
                    content: ' ';
                    left: 0;
                    top: 2px;
                    width: 38px; /* Adjusted for depth */
                    height: calc(100% - 4px);
                    transform: translateX(calc(100% - 22px)) rotateY(90deg); /* Math roughly checks out for width */
                    /* Actually, simpler way: place it at the right edge, rotated */
                    /* Let's use the Slider's logic but scaled */
                    /* Slider: width 48px, translateX 172px (Width 200 - ~28) */
                    
                    /* Dynamic calculation is hard in pure CSS without vars. 
                       Let's approximate: Width 180. TranslateZ 20. 
                       Side needs to cover the gap. 
                       Let's stick to a simpler spine effect or just the standard 3D box.
                    */
                    
                    /* Reverting to Slider's approach but using percentages/calc if possible? 
                       No, let's use fixed pixel math for the '180px' version and accept slight error on mobile 160px 
                       OR just use one size for simplicity? 
                       Let's use a fixed size to guarantee "Book Design" looks good.
                    */
                }
                
                /* Overwrite generic Book 3D logic with fixed size approach for now to ensure visual stability */
                .book-3d-container {
                     width: 180px;
                     height: 270px;
                }
                
                .book-3d > img {
                    transform: translateZ(25px);
                }

                .book-3d::before {
                    position: absolute;
                    content: ' ';
                    left: 0;
                    top: 3px;
                    width: 48px;
                    height: calc(100% - 6px);
                    transform: translateX(152px) rotateY(90deg); /* 180 - 28ish? */
                    background: linear-gradient(90deg, 
                        #fff 0%, #f9f9f9 5%, #fff 10%, #f9f9f9 15%, 
                        #fff 20%, #f9f9f9 25%, #fff 30%, #f9f9f9 35%, 
                        #fff 40%, #f9f9f9 45%, #fff 50%, #f9f9f9 55%, 
                        #fff 60%, #f9f9f9 65%, #fff 70%, #f9f9f9 75%, 
                        #fff 80%, #f9f9f9 85%, #fff 90%, #f9f9f9 95%, #fff 100%
                    );
                }

                .book-3d::after {
                    position: absolute;
                    top: 0;
                    left: 0;
                    content: ' ';
                    width: 100%;
                    height: 100%;
                    transform: translateZ(-25px);
                    background-color: #333;
                    border-radius: 0 2px 2px 0;
                }
            `}</style>
        </div>
    );
};

export default BookCard3D;
