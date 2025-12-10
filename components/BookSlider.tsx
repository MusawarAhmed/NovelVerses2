import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Novel } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';

interface BookSliderProps {
    novels: Novel[];
    title?: string;
}

const BookCard = ({ novel }: { novel: Novel }) => {
    return (
        <Link 
            to={`/novel/${novel.slug || novel.id}`} 
            className="book-container block mx-auto my-8 cursor-pointer"
        >
            <div className="book">
                <img
                    alt={novel.title}
                    src={novel.coverUrl}
                    className="w-full h-full object-cover rounded-r-sm"
                />
            </div>
        </Link>
    );
};

const BookSlider: React.FC<BookSliderProps> = ({ novels, title = "Editor's Choice" }) => {
    const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);

    if (!novels || novels.length === 0) return null;

    return (
        <div className="w-full py-16 overflow-hidden bg-slate-50 dark:bg-slate-900/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <span className="w-1.5 h-8 bg-primary rounded-full shadow-lg shadow-primary/50"></span>
                        {title}
                    </h2>
                    
                    {/* Custom Navigation Buttons */}
                    <div className="flex gap-2">
                        <button 
                            onClick={() => swiperInstance?.slidePrev()}
                            className="p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm text-slate-600 dark:text-slate-300"
                            aria-label="Previous slide"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button 
                            onClick={() => swiperInstance?.slideNext()}
                            className="p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm text-slate-600 dark:text-slate-300"
                            aria-label="Next slide"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
                
                <Swiper
                    modules={[Autoplay]}
                    onSwiper={setSwiperInstance}
                    spaceBetween={50}
                    slidesPerView={1}
                    loop={true}
                    autoplay={{ delay: 5000, disableOnInteraction: false }}
                    breakpoints={{
                        640: { slidesPerView: 2, spaceBetween: 20 },
                        768: { slidesPerView: 3, spaceBetween: 40 },
                        1024: { slidesPerView: 4, spaceBetween: 50 },
                        1280: { slidesPerView: 5, spaceBetween: 60 },
                    }}
                    className="pb-8 px-4"
                >
                    {novels.map((novel) => (
                        <SwiperSlide key={novel.id} className="flex justify-center py-8">
                            <BookCard novel={novel} />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
            
            <style>{`
                .book-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    perspective: 600px;
                }

                @keyframes initAnimation {
                    0% { transform: rotateY(0deg); }
                    100% { transform: rotateY(-30deg); }
                }

                .book {
                    width: 200px;
                    height: 300px;
                    position: relative;
                    transform-style: preserve-3d;
                    transform: rotateY(-30deg);
                    transition: 1s ease;
                    animation: 1s ease 0s 1 initAnimation;
                }

                .book-container:hover .book, 
                .book-container:focus .book {
                    transform: rotateY(0deg);
                }

                .book > img {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 200px;
                    height: 300px;
                    transform: translateZ(25px);
                    border-radius: 0 2px 2px 0;
                    box-shadow: 5px 5px 20px rgba(0,0,0,0.5);
                    background-color: #333;
                }

                .book::before {
                    position: absolute;
                    content: ' ';
                    left: 0;
                    top: 3px;
                    width: 48px;
                    height: 294px;
                    transform: translateX(172px) rotateY(90deg);
                    background: linear-gradient(90deg, 
                        #fff 0%, #f9f9f9 5%, #fff 10%, #f9f9f9 15%, 
                        #fff 20%, #f9f9f9 25%, #fff 30%, #f9f9f9 35%, 
                        #fff 40%, #f9f9f9 45%, #fff 50%, #f9f9f9 55%, 
                        #fff 60%, #f9f9f9 65%, #fff 70%, #f9f9f9 75%, 
                        #fff 80%, #f9f9f9 85%, #fff 90%, #f9f9f9 95%, #fff 100%
                    );
                }

                .book::after {
                    position: absolute;
                    top: 0;
                    left: 0;
                    content: ' ';
                    width: 200px;
                    height: 300px;
                    transform: translateZ(-25px);
                    background-color: #333;
                    border-radius: 0 2px 2px 0;
                    box-shadow: -10px 0 50px 10px rgba(0,0,0,0.3);
                }
            `}</style>
        </div>
    );
};

export default BookSlider;
