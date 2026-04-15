import React from "react";
import { Button } from "react-bootstrap";

export default function HeroBanner({
  title,
  subtitle,
  buttonText,
  buttonIcon: Icon,
  onButtonClick,
  buttonVariant = "success"
}) {
  return (
    <div 
      className="card border-0 rounded-4 mb-4 overflow-hidden shadow-sm position-relative" 
      style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" }}
    >
      <div 
        className="position-absolute rounded-circle" 
        style={{ width: '300px', height: '300px', background: 'rgba(255,255,255,0.02)', top: '-100px', right: '-50px' }}
      ></div>
      
      <div className="card-body p-4 position-relative z-1 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
        <div className="text-white">
          <h3 className="fw-bolder mb-1 d-flex align-items-center gap-2">
            {title}
          </h3>
          {subtitle && (
            <p className="mb-0 opacity-75 small">{subtitle}</p>
          )}
        </div>

        {buttonText && onButtonClick && (
          <Button 
            variant={buttonVariant} 
            className="fw-bold rounded-pill px-4 py-2 d-flex align-items-center gap-2 shadow-lg hover-lift border-0"
            onClick={onButtonClick}
          >
            {Icon && <Icon size={18} />} {buttonText}
          </Button>
        )}
      </div>
    </div>
  );
}