import React, { useEffect, useRef, useState } from 'react';

/**
 * FloatingCalculator Widget
 * - Draggable, minimize/maximize-able floating calculator
 * - Injects calculated results into focused input fields
 * - Pure vanilla JS math engine with chaining operations support
 */

const FloatingCalculator: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);
  const previousDisplayRef = useRef<HTMLDivElement>(null);

  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 320, y: window.innerHeight - 500 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Calculator state
  const calcStateRef = useRef({
    display: '0',
    previousValue: null as number | null,
    operation: null as string | null,
    waitingForOperand: true,
    fullExpression: '', // Track the expression for display
    lastFocusedInput: null as HTMLInputElement | HTMLTextAreaElement | null,
  });

  // Initialize global input tracking on mount
  useEffect(() => {
    const handleInputFocus = (e: Event) => {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement;
      if (target.type === 'text' || target.type === 'number' || target.tagName === 'TEXTAREA') {
        calcStateRef.current.lastFocusedInput = target;
      }
    };

    document.addEventListener('focus', handleInputFocus, true);
    return () => document.removeEventListener('focus', handleInputFocus, true);
  }, []);

  // Update display and previous display
  const updateDisplay = () => {
    if (displayRef.current) {
      displayRef.current.textContent = calcStateRef.current.display;
    }
    if (previousDisplayRef.current) {
      previousDisplayRef.current.textContent = calcStateRef.current.fullExpression;
    }
  };

  // Input a number
  const inputNumber = (num: string) => {
    const state = calcStateRef.current;
    if (state.waitingForOperand) {
      state.display = num;
      state.waitingForOperand = false;
    } else {
      state.display = state.display === '0' ? num : state.display + num;
    }
    state.fullExpression += num;
    updateDisplay();
  };

  // Input decimal point
  const inputDecimal = () => {
    const state = calcStateRef.current;
    if (state.waitingForOperand) {
      state.display = '0.';
      state.waitingForOperand = false;
      state.fullExpression += '0.';
    } else if (!state.display.includes('.')) {
      state.display += '.';
      state.fullExpression += '.';
    }
    updateDisplay();
  };

  // Handle operation
  const handleOperation = (nextOp: string) => {
    const state = calcStateRef.current;
    const inputValue = parseFloat(state.display);

    if (state.previousValue === null) {
      state.previousValue = inputValue;
    } else if (state.operation) {
      const result = performCalculation(state.previousValue, inputValue, state.operation);
      state.display = String(result);
      state.previousValue = result;
      state.fullExpression = String(result);
    }

    state.operation = nextOp;
    state.waitingForOperand = true;
    state.fullExpression += ` ${nextOp} `;
    updateDisplay();
  };

  // Perform calculation
  const performCalculation = (prev: number, current: number, op: string): number => {
    switch (op) {
      case '+':
        return prev + current;
      case '-':
        return prev - current;
      case '*':
        return prev * current;
      case '/':
        if (current === 0) {
          alert('Cannot divide by zero');
          return prev;
        }
        return prev / current;
      default:
        return current;
    }
  };

  // Equals
  const handleEquals = () => {
    const state = calcStateRef.current;
    const inputValue = parseFloat(state.display);

    if (state.operation && state.previousValue !== null) {
      const result = performCalculation(state.previousValue, inputValue, state.operation);
      state.display = String(result);
      state.previousValue = null;
      state.operation = null;
      state.waitingForOperand = true;
      state.fullExpression = '';
    }
    updateDisplay();
  };

  // Clear
  const handleClear = () => {
    calcStateRef.current = {
      display: '0',
      previousValue: null,
      operation: null,
      waitingForOperand: true,
      fullExpression: '',
      lastFocusedInput: calcStateRef.current.lastFocusedInput,
    };
    updateDisplay();
  };

  // Apply to focused input field
  const handleApplyToField = () => {
    const state = calcStateRef.current;
    const input = state.lastFocusedInput;

    if (!input) {
      alert('No input field focused. Click an input field first, then calculate.');
      return;
    }

    input.value = state.display;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    alert(`Applied "${state.display}" to field`);
  };

  // Dragging logic
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const header = (e.target as HTMLElement).closest('.calc-header');
    if (!header) return;

    setIsDragging(true);
    if (containerRef.current) {
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  return (
    <div
      ref={containerRef}
      className="calc-container"
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 10000,
        width: '300px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        userSelect: 'none',
      }}
    >
      {/* Header with drag handle */}
      <div
        className="calc-header"
        onMouseDown={handleMouseDown}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '12px 12px 0 0',
          cursor: 'grab',
          fontWeight: 'bold',
          fontSize: '14px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
      >
        <span>Smart Calc</span>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: 'none',
            color: 'white',
            padding: '4px 10px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.2)';
          }}
        >
          {isMinimized ? '▲' : '▼'}
        </button>
      </div>

      {/* Calculator body (hidden when minimized) */}
      {!isMinimized && (
        <div
          style={{
            backgroundColor: '#1a1a2e',
            borderRadius: '0 0 12px 12px',
            padding: '16px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
            border: '1px solid #2d2d44',
          }}
        >
          {/* Display area */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginBottom: '16px',
            }}
          >
            {/* Previous operation display */}
            <div
              ref={previousDisplayRef}
              style={{
                backgroundColor: '#0f0f1e',
                color: '#888',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                textAlign: 'right',
                minHeight: '20px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              &nbsp;
            </div>

            {/* Main display */}
            <div
              ref={displayRef}
              style={{
                backgroundColor: '#0f0f1e',
                color: '#4ade80',
                padding: '16px 12px',
                borderRadius: '6px',
                fontSize: '28px',
                fontWeight: 'bold',
                textAlign: 'right',
                border: '2px solid #667eea',
                fontFamily: 'monospace',
              }}
            >
              0
            </div>
          </div>

          {/* Button grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
              marginBottom: '12px',
            }}
          >
            {/* Row 1 */}
            <CalcButton label="C" onClick={handleClear} variant="danger" />
            <CalcButton label="/" onClick={() => handleOperation('/')} variant="operation" />
            <CalcButton label="*" onClick={() => handleOperation('*')} variant="operation" />
            <CalcButton label="−" onClick={() => handleOperation('-')} variant="operation" />

            {/* Row 2 */}
            <CalcButton label="7" onClick={() => inputNumber('7')} />
            <CalcButton label="8" onClick={() => inputNumber('8')} />
            <CalcButton label="9" onClick={() => inputNumber('9')} />
            <CalcButton label="+" onClick={() => handleOperation('+')} variant="operation" />

            {/* Row 3 */}
            <CalcButton label="4" onClick={() => inputNumber('4')} />
            <CalcButton label="5" onClick={() => inputNumber('5')} />
            <CalcButton label="6" onClick={() => inputNumber('6')} />
            <CalcButton label="." onClick={inputDecimal} />

            {/* Row 4 */}
            <CalcButton label="1" onClick={() => inputNumber('1')} />
            <CalcButton label="2" onClick={() => inputNumber('2')} />
            <CalcButton label="3" onClick={() => inputNumber('3')} />
            <CalcButton label="=" onClick={handleEquals} variant="equals" />

            {/* Row 5 */}
            <CalcButton label="0" onClick={() => inputNumber('0')} style={{ gridColumn: 'span 2' }} />
            <CalcButton label="←" onClick={() => {
              const state = calcStateRef.current;
              state.display = state.display.slice(0, -1) || '0';
              updateDisplay();
            }} />
            <CalcButton label="⌃" onClick={() => handleOperation('+')} variant="operation" />
          </div>

          {/* Apply to Field button */}
          <button
            onClick={handleApplyToField}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#059669';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.5)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#10b981';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
            }}
          >
            APPLY TO FIELD
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Reusable calculator button component
 */
interface CalcButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'operation' | 'equals' | 'danger';
  style?: React.CSSProperties;
}

const CalcButton: React.FC<CalcButtonProps> = ({ label, onClick, variant = 'default', style }) => {
  const getButtonStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      padding: '12px 8px',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
      ...style,
    };

    switch (variant) {
      case 'operation':
        return {
          ...baseStyle,
          backgroundColor: '#f59e0b',
          color: 'white',
        };
      case 'equals':
        return {
          ...baseStyle,
          backgroundColor: '#3b82f6',
          color: 'white',
        };
      case 'danger':
        return {
          ...baseStyle,
          backgroundColor: '#ef4444',
          color: 'white',
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: '#2d2d44',
          color: '#e0e0e0',
        };
    }
  };

  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...getButtonStyle(),
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hovered
          ? `0 4px 12px ${variant === 'operation' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(0, 0, 0, 0.3)'}`
          : '0 2px 6px rgba(0, 0, 0, 0.2)',
      }}
    >
      {label}
    </button>
  );
};

export default FloatingCalculator;
