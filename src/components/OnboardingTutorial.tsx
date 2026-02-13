import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';

interface OnboardingTutorialProps {
    onComplete: () => void;
}

const steps = [
    {
        title: "Welcome to Precision Measure",
        description: "Your digital field-note for high-accuracy reference measurements. Let's get you calibrated.",
        illustration: (
            <svg viewBox="0 0 200 150" className="sketch-svg">
                {/* Hand sketch (Simplified) */}
                <path d="M40,110 Q50,90 60,95 Q70,100 80,80 Q90,60 110,70 Q130,80 150,110" fill="none" stroke="currentColor" strokeWidth="2.5" />
                <path d="M60,95 Q80,110 100,90" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" />
                <path d="M40,120 L160,120" fill="none" stroke="var(--primary)" strokeWidth="3" />
                <path d="M40,115 L40,125 M160,115 L160,125" fill="none" stroke="var(--primary)" strokeWidth="3" />
                <text x="100" y="140" textAnchor="middle" fontSize="12" fill="currentColor" fontFamily="Exo 2">20 cm.</text>
            </svg>
        )
    },
    {
        title: "Step 1: Calibration",
        description: "Upload a photo with a known object (like a credit card). Drag the points to match its edges and set the length.",
        illustration: (
            <svg viewBox="0 0 200 150" className="sketch-svg">
                {/* Calibration Card Sketch */}
                <rect x="50" y="50" width="100" height="60" rx="6" fill="none" stroke="currentColor" strokeWidth="2.5" />
                <circle cx="65" cy="65" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <line x1="50" y1="110" x2="150" y2="110" stroke="var(--primary)" strokeWidth="4" />
                <text x="100" y="85" textAnchor="middle" fontSize="10" fill="currentColor">REFERENCE OBJECT</text>
                {/* Measurement markers */}
                <circle cx="50" cy="110" r="12" fill="rgba(0, 240, 255, 0.2)" stroke="var(--primary)" strokeWidth="2" />
                <circle cx="150" cy="110" r="12" fill="rgba(0, 240, 255, 0.2)" stroke="var(--primary)" strokeWidth="2" />
            </svg>
        )
    },
    {
        title: "Step 2: Start Measuring",
        description: "Once calibrated, upload your project photo. The app will automatically scale all your measurements based on your reference.",
        illustration: (
            <svg viewBox="0 0 200 150" className="sketch-svg">
                {/* Object Measure Sketch */}
                <path d="M70,40 L130,40 L150,110 L50,110 Z" fill="none" stroke="currentColor" strokeWidth="2.5" />
                <line x1="50" y1="120" x2="150" y2="120" stroke="var(--primary)" strokeWidth="3" />
                <path d="M100,30 Q110,10 130,20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
                <text x="100" y="140" textAnchor="middle" fontSize="12" fill="var(--primary)" fontWeight="bold">REAL-WORLD SCALE</text>
            </svg>
        )
    },
    {
        title: "Step 3: Export & Share",
        description: "Overlay all your saved measurements onto the final image. Download your field-note or share it instantly with your team.",
        illustration: (
            <svg viewBox="0 0 200 150" className="sketch-svg">
                {/* Export Sketch */}
                <rect x="60" y="40" width="80" height="100" fill="none" stroke="currentColor" strokeWidth="2.5" />
                <path d="M90,70 L110,70 M90,90 L110,90 M90,110 L110,110" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="100" cy="50" r="15" fill="rgba(0, 240, 255, 0.1)" stroke="var(--primary)" strokeWidth="2" />
                <path d="M100,55 L100,45 M95,50 L105,50" fill="none" stroke="var(--primary)" strokeWidth="2" />
                <text x="100" y="130" textAnchor="middle" fontSize="10" fill="currentColor">EXPORTED DATA</text>
            </svg>
        )
    }
];

export const OnboardingTutorial: React.FC<OnboardingTutorialProps> = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Trigger entrance animation
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleClose();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onComplete, 400); // Wait for transition
    };

    return (
        <div className={`tutorial-overlay ${isVisible ? 'active' : ''}`}>
            <div className="tutorial-card glass-panel">
                <button className="tutorial-close" onClick={handleClose}>
                    <X size={20} />
                </button>

                <div className="tutorial-content">
                    <div className="tutorial-illustration">
                        {steps[currentStep].illustration}
                    </div>

                    <div className="tutorial-text">
                        <h2>{steps[currentStep].title}</h2>
                        <p>{steps[currentStep].description}</p>
                    </div>

                    <div className="tutorial-steps-indicator">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={`step-dot ${i === currentStep ? 'active' : ''} ${i < currentStep ? 'completed' : ''}`}
                            />
                        ))}
                    </div>
                </div>

                <div className="tutorial-footer">
                    <button
                        className="btn"
                        onClick={handleBack}
                        style={{ opacity: currentStep === 0 ? 0 : 1, pointerEvents: currentStep === 0 ? 'none' : 'auto' }}
                    >
                        <ChevronLeft size={18} />
                        Back
                    </button>

                    <button className="btn btn-primary" onClick={handleNext}>
                        {currentStep === steps.length - 1 ? (
                            <>Got it! <Check size={18} /></>
                        ) : (
                            <>Next <ChevronRight size={18} /></>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
