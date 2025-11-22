import React, { useEffect, useRef, useState } from 'react';

// Floating Smart Calculator - Vanilla React, no external libs
export default function SmartCalc() {
  const [expr, setExpr] = useState('');
  const [display, setDisplay] = useState('0');
  const [steps, setSteps] = useState('');
  const [minimized, setMinimized] = useState(false);
  const [position, setPosition] = useState<{ right?: number; bottom?: number; left?: number; top?: number }>({ right: 24, bottom: 24 });
  const draggingRef = useRef(false);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  // Track last focused input/textarea
  useEffect(() => {
    function onFocus(e: FocusEvent) {
      const target = e.target as HTMLElement;
      if (!target) return;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || (target as HTMLElement).getAttribute('contenteditable') === 'true') {
        lastFocusedRef.current = target;
      }
    }
    window.addEventListener('focusin', onFocus);
    return () => window.removeEventListener('focusin', onFocus);
  }, []);

  // Drag handlers
  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!draggingRef.current || !nodeRef.current) return;
      e.preventDefault();
      const x = e.clientX - dragOffset.current.x;
      const y = e.clientY - dragOffset.current.y;
      // set top/left so we stop using bottom/right when user drags
      setPosition({ left: x, top: y });
    }
    function onMouseUp() {
      draggingRef.current = false;
    }
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  function startDrag(e: React.MouseEvent) {
    const node = nodeRef.current;
    if (!node) return;
    draggingRef.current = true;
    const rect = node.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  // Safe evaluate: only allow numbers, operators, parentheses, decimal and spaces
  function safeEval(input: string): { ok: boolean; result?: number | string; error?: string } {
    const cleaned = input.replace(/\s+/g, '');
    if (!cleaned) return { ok: true, result: 0 };
    if (!/^[0-9+\-*/().]+$/.test(cleaned)) return { ok: false, error: 'Invalid characters' };
    try {
      // eslint-disable-next-line no-new-func
      // Use Function to evaluate arithmetic only
      const fn = new Function(`return (${cleaned});`);
      const res = fn();
      if (typeof res !== 'number' || !isFinite(res)) {
        return { ok: false, error: 'Math error' };
      }
      return { ok: true, result: res };
    } catch (err) {
      return { ok: false, error: 'Parse error' };
    }
  }

  function handleButton(val: string) {
    if (val === 'C') {
      setExpr('');
      setDisplay('0');
      setSteps('');
      return;
    }
    if (val === '=') {
      const r = safeEval(expr || display);
      if (!r.ok) {
        setDisplay('Err');
        setSteps(expr);
      } else {
        setSteps(expr || display);
        setDisplay(String(r.result));
        setExpr(String(r.result));
      }
      return;
    }
    // append value
    // prevent leading multiple operators
    if (/^[+\-*/]$/.test(val)) {
      // if expr empty and display is present, start with display
      if (!expr) setExpr(display + val);
      else setExpr((prev) => prev + val);
    } else {
      setExpr((prev) => (prev || '') + val);
      setDisplay((prev) => (prev === '0' || prev === 'Err' ? val : prev + val));
    }
  }

  function applyToField() {
    const target = lastFocusedRef.current as HTMLInputElement | HTMLTextAreaElement | null;
    if (!target) {
      alert('No input selected. Click on an input field first.');
      return;
    }
    const value = display === 'Err' ? '' : display;
    // Focus the target, set value, dispatch events
    try {
      target.focus();
      (target as any).value = value;
      const inputEvent = new Event('input', { bubbles: true });
      target.dispatchEvent(inputEvent);
      const changeEvent = new Event('change', { bubbles: true });
      target.dispatchEvent(changeEvent);
    } catch (e) {
      console.error('Failed to apply to field', e);
      alert('Failed to apply to the selected field. See console.');
    }
  }

  const keypad = [
    ['7', '8', '9', '/'],
    ['4', '5', '6', '*'],
    ['1', '2', '3', '-'],
    ['0', '.', 'C', '+'],
  ];

  // styles scoped via unique class prefix
  const cls = 'sc-';

  return (
    <div
      ref={nodeRef}
      className={`${cls}container`}
      style={{
        position: 'fixed',
        zIndex: 999999,
        right: position.right !== undefined ? position.right : undefined,
        bottom: position.bottom !== undefined ? position.bottom : undefined,
        left: position.left !== undefined ? position.left : undefined,
        top: position.top !== undefined ? position.top : undefined,
      }}
    >
      <style>{`
        .${cls}container { width: 320px; max-width: 90vw; font-family: Inter, system-ui, sans-serif; }
        .${cls}card { background: linear-gradient(180deg,#0b0210, #120417); border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,0.6); overflow:hidden; color:#fff; border:1px solid rgba(139,92,246,0.12); }
        .${cls}header { display:flex; align-items:center; justify-content:space-between; padding:10px 12px; cursor:grab; background:linear-gradient(90deg, rgba(109,40,217,0.9), rgba(59,130,246,0.6)); }
        .${cls}title { font-weight:700; color:#fff; letter-spacing:0.4px; }
        .${cls}controls { display:flex; gap:8px; }
        .${cls}btn { background:rgba(255,255,255,0.06); border:none; color:#fff; padding:6px 8px; border-radius:8px; cursor:pointer; }
        .${cls}displayWrap { padding:12px; background:linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.35)); }
        .${cls}steps { font-size:12px; color:rgba(255,255,255,0.6); min-height:16px; }
        .${cls}display { font-size:24px; font-weight:700; margin-top:6px; color:#fff; min-height:28px; }
        .${cls}pad { padding:12px; display:grid; grid-template-columns: repeat(4,1fr); gap:8px; }
        .${cls}key { background:linear-gradient(180deg, #1b0724, #22072c); border-radius:8px; padding:14px 8px; text-align:center; font-weight:700; cursor:pointer; user-select:none; color:#e9e2ff; border:1px solid rgba(255,255,255,0.04); }
        .${cls}apply { grid-column: span 4; margin-top:8px; background:linear-gradient(90deg,#8b5cf6,#3b82f6); padding:12px; border-radius:8px; text-align:center; font-weight:800; cursor:pointer; }
        .${cls}minimized { width: 160px; }
        @media (max-width:420px){ .${cls}container{ width: 92vw; right:8px; bottom:12px; } }
      `}</style>

      <div className={`${cls}card`}>
        <div className={`${cls}header`} onMouseDown={startDrag} title="Drag to move">
          <div className={`${cls}title`}>Smart Calc</div>
          <div className={`${cls}controls`}>
            <button
              className={`${cls}btn`}
              aria-label="minimize"
              onClick={(e) => {
                e.stopPropagation();
                setMinimized((m) => !m);
              }}
            >
              {minimized ? '🔼' : '🔽'}
            </button>
          </div>
        </div>

        <div className={`${cls}displayWrap`}>
          <div className={`${cls}steps`}>{steps}</div>
          <div className={`${cls}display`}>{display}</div>
        </div>

        {!minimized && (
          <div style={{ padding: 12 }}>
            <div className={`${cls}pad`}>
              {keypad.flat().map((k) => (
                <div
                  key={k}
                  className={`${cls}key`}
                  onClick={() => handleButton(k)}
                >
                  {k}
                </div>
              ))}
            </div>
            <div className={`${cls}apply`} onClick={applyToField}>
              APPLY TO FIELD
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
