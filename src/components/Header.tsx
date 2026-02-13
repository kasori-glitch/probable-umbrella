import React from 'react';
import { Target } from 'lucide-react';

export const Header: React.FC = () => {
    return (
        <header style={{
            height: 'var(--header-height)',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            background: 'var(--bg-panel)',
            backdropFilter: 'var(--glass-blur)',
            borderBottom: '1px solid rgba(0, 240, 255, 0.2)',
            zIndex: 100,
            justifyContent: 'space-between'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Logo: Magnifier inspired circle with crosshair */}
                <div
                    className="logo-animated"
                    style={{
                        position: 'relative',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        border: '2px solid var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 10px var(--primary-glow)',
                        background: 'rgba(0,0,0,0.5)'
                    }}
                >
                    <Target size={16} color="var(--primary)" />
                    {/* Small inner crosshair logic if needed, but Target icon works well */}
                </div>

                <h1
                    className="header-text-animated"
                    style={{
                        margin: 0,
                        fontSize: '1.2rem',
                        fontWeight: 800,
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        fontFamily: 'var(--font-family)',
                        background: 'linear-gradient(to right, var(--primary), #fff)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        filter: 'drop-shadow(0 0 5px var(--primary-glow))'
                    }}
                >
                    On screen mesure
                </h1>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                v1.0.0
            </div>
        </header>
    );
};
