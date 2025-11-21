import React from 'react';
import { Film } from 'lucide-react';
import { IMG_BASE_URL } from '../../services/api';

const Poster = ({ path, size = "w342", className = "", alt }) => (
    <div className={`bg-slate-800 overflow-hidden relative ${className}`}>
        {path ? (
            <img src={`${IMG_BASE_URL}/${size}${path}`} alt={alt} className="w-full h-full object-cover" loading="lazy" />
        ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600 bg-slate-800">
                <Film className="w-1/3 h-1/3 opacity-20" />
            </div>
        )}
    </div>
);

export default Poster;
