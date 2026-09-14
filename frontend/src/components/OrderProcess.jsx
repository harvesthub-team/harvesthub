// src/components/OrderProcess.jsx - AUTO-PLAY VERSION
import { useState, useEffect, useRef } from 'react';
import './OrderProcess.css';

export default function OrderProcess() {
  const [activeStep, setActiveStep] = useState(0);
  const intervalRef = useRef(null);

  const steps = [
    {
      icon: '📱',
      title: 'Browse Products',
      description: 'Explore fresh produce from verified farmers in your district',
      color: '#4CAF50',
      bgColor: 'rgba(76, 175, 80, 0.15)'
    },
    {
      icon: '🛒',
      title: 'Place Order',
      description: 'Select your items, choose quantity, and place your order',
      color: '#FF9800',
      bgColor: 'rgba(255, 152, 0, 0.15)'
    },
    {
      icon: '✅',
      title: 'Order Confirmed',
      description: 'Farmer receives your order and confirms availability',
      color: '#2196F3',
      bgColor: 'rgba(33, 150, 243, 0.15)'
    },
    {
      icon: '🚚',
      title: 'On the Way',
      description: 'Fresh produce is packed and shipped to your doorstep',
      color: '#9C27B0',
      bgColor: 'rgba(156, 39, 176, 0.15)'
    },
    {
      icon: '🏠',
      title: 'Delivered!',
      description: 'Enjoy fresh farm produce delivered to your home',
      color: '#4CAF50',
      bgColor: 'rgba(76, 175, 80, 0.15)'
    }
  ];

  // Auto-play: loops continuously
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= steps.length - 1) {
          return 0; // Reset to beginning
        }
        return prev + 1;
      });
    }, 2200); // Change step every 2.2 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [steps.length]);

  return (
    <div className="order-process">
      <div className="order-process__header">
        <h3 className="order-process__title">🔄 How Your Order Travels</h3>
        <div className="order-process__status">
          <span className="order-process__status-text">
            Step {activeStep + 1} of {steps.length}
          </span>
        </div>
      </div>

      <div className="order-process__container">
        {/* Animated Progress Line */}
        <div className="order-process__line">
          <div 
            className="order-process__line-fill" 
            style={{ 
              width: `${(activeStep / (steps.length - 1)) * 100}%` 
            }}
          ></div>
        </div>

        {/* Steps */}
        <div className="order-process__steps">
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`order-process__step ${index <= activeStep ? 'active' : ''}`}
              style={{ 
                '--step-color': step.color,
                '--step-bg': step.bgColor
              }}
            >
              <div className="order-process__step-circle">
                <span className="order-process__step-icon">{step.icon}</span>
                {index <= activeStep && (
                  <div className="order-process__step-pulse"></div>
                )}
              </div>
              <div className="order-process__step-content">
                <h4 className="order-process__step-title">{step.title}</h4>
                <p className="order-process__step-description">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}