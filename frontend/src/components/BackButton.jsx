import React from 'react';
import { useNavigate } from 'react-router-dom';

export const BackButton = ({ className = '', label = 'Back' }) => {
    const navigate = useNavigate();

    return (
        <button
            className={`btn btn-secondary back-btn ${className}`}
            onClick={() => navigate(-1)}
        >
            ← {label}
        </button>
    );
};
