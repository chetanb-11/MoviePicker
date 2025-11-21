import React from 'react';

const Badge = ({ children, className = "" }) => (
    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${className}`}>
        {children}
    </span>
);

export default Badge;
