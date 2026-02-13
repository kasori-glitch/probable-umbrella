import React from 'react';
import { Trash2, Save } from 'lucide-react';
import type { SavedMeasurement } from '../types';

interface SidebarProps {
    savedMeasurements: SavedMeasurement[];
    canSave: boolean;
    onSaveMeasurement: () => void;
    onDeleteMeasurement: (id: string) => void;
    onRenameMeasurement: (id: string, name: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    savedMeasurements,
    canSave,
    onSaveMeasurement,
    onDeleteMeasurement,
    onRenameMeasurement
}) => {
    return (
        <aside className="glass-panel" style={{
            width: 'var(--sidebar-width)',
            height: '100%',
            padding: '24px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            borderLeft: '1px solid rgba(0, 240, 255, 0.2)',
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
        }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <h3 style={{
                    margin: 0,
                    fontSize: '1rem',
                    color: 'var(--primary)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                }}>
                    Saved Measures
                </h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Max 3 slots available
                </p>
            </div>

            <button
                className="btn btn-primary"
                disabled={!canSave}
                onClick={onSaveMeasurement}
                style={{
                    width: '100%',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    opacity: canSave ? 1 : 0.5,
                    cursor: canSave ? 'pointer' : 'not-allowed',
                    fontSize: '0.9rem'
                }}
            >
                <Save size={18} />
                Save Current ({savedMeasurements.length}/3)
            </button>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
                {savedMeasurements.length === 0 ? (
                    <div style={{
                        height: '100px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px dashed rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        color: 'var(--text-muted)',
                        fontSize: '0.8rem',
                        textAlign: 'center',
                        padding: '12px'
                    }}>
                        No saved measurements yet
                    </div>
                ) : (
                    savedMeasurements.map((m) => (
                        <div key={m.id} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            background: 'rgba(255,255,255,0.05)',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            position: 'relative',
                            transition: 'all 0.2s'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <input
                                    type="text"
                                    value={m.name}
                                    onChange={(e) => onRenameMeasurement(m.id, e.target.value)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'var(--primary)',
                                        fontWeight: 700,
                                        width: '80%',
                                        fontSize: '0.9rem',
                                        outline: 'none'
                                    }}
                                />
                                <button
                                    onClick={() => onDeleteMeasurement(m.id)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: 'rgba(255,68,68,0.6)',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = 'rgb(255,68,68)'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,68,68,0.6)'}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', fontFamily: 'Exo 2' }}>
                                {m.value.toFixed(2)} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>{m.unit}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </aside>
    );
};
