import React, { useState } from 'react';
import { getHealth } from '../api/health.js';
import { extractErrorMessage } from '../api/http.js';

export const HealthPage = () => {
    const [health, setHealth] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleCheck = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getHealth();
            setHealth(res);
        } catch (err) {
            setError(extractErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="section-header">
                <div>
                    <h2 className="section-title">Healthcheck</h2>
                    <p className="section-description">
                        Quick ping to `/api/v1/healthcheck` to confirm backend status.
                    </p>
                </div>
            </div>

            {error && <div className="error-text">Error: {error}</div>}

            <div className="card">
                <div className="card-header">
                    <div>
                        <div className="card-title">Ping server</div>
                        <div className="card-subtitle">`GET /api/v1/healthcheck`</div>
                    </div>
                </div>
                <div className="card-body">
                    <button className="btn" type="button" disabled={loading} onClick={handleCheck}>
                        {loading ? 'Checking…' : 'Run healthcheck'}
                    </button>
                    <div className="json-viewer" style={{ marginTop: '0.5rem' }}>
                        <pre>{JSON.stringify(health, null, 2)}</pre>
                    </div>
                </div>
            </div>
        </div>
    );
};
