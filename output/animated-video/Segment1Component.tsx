import React from 'react';

export default function DivergentFutures() {
  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        backgroundColor: '#0f172a', // slate-900
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {/* Central stem that splits */}
        <div
          className="stem-animation"
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '25%',
            width: 2,
            background: '#ffffff',
            transform: 'translateX(-50%)',
            height: '0%',
          }}
        />

        {/* US Path - Left side (AI/Neural) */}
        <div
          className="us-path-container"
          style={{ position: 'absolute', left: 0, top: '40%', width: '50%', height: '40%', opacity: 0, transform: 'translateX(-100px)' }}
        >
          {/* AI Neural Network Pattern */}
          <div className="neural-network" style={{ position: 'absolute', top: '20%', left: '20%', width: 300, height: 200, opacity: 0 }}>
            {/* Nodes */}
            <div className="neural-node" style={{ position: 'absolute', width: 12, height: 12, background: '#60a5fa', borderRadius: '50%', boxShadow: '0 0 10px #3b82f6', top: 20, left: 50 }} />
            <div className="neural-node" style={{ position: 'absolute', width: 12, height: 12, background: '#60a5fa', borderRadius: '50%', boxShadow: '0 0 10px #3b82f6', top: 80, left: 20 }} />
            <div className="neural-node" style={{ position: 'absolute', width: 12, height: 12, background: '#60a5fa', borderRadius: '50%', boxShadow: '0 0 10px #3b82f6', top: 140, left: 60 }} />
            <div className="neural-node" style={{ position: 'absolute', width: 12, height: 12, background: '#60a5fa', borderRadius: '50%', boxShadow: '0 0 10px #3b82f6', top: 60, left: 150 }} />
            <div className="neural-node" style={{ position: 'absolute', width: 12, height: 12, background: '#60a5fa', borderRadius: '50%', boxShadow: '0 0 10px #3b82f6', top: 100, left: 200 }} />

            {/* Connections */}
            {[
              { top: 26, left: 62, width: 88, rotate: -20 },
              { top: 86, left: 32, width: 118, rotate: 45 },
              { top: 66, left: 162, width: 58, rotate: 60 },
              { top: 146, left: 72, width: 128, rotate: -30 },
              { top: 26, left: 50, width: 30, rotate: 90 },
              { top: 100, left: 200, width: 40, rotate: -90 },
            ].map((c, i) => (
              <div
                key={i}
                className="neural-connection"
                style={{
                  position: 'absolute',
                  height: 2,
                  width: c.width,
                  top: c.top,
                  left: c.left,
                  background: 'linear-gradient(90deg, transparent, #3b82f6, transparent)',
                  transform: `rotate(${c.rotate}deg)`,
                  opacity: 0.3,
                }}
              />
            ))}
          </div>

          {/* US Label */}
          <div className="path-label us-label" style={{ position: 'absolute', bottom: '10%', left: '20%', opacity: 0, color: '#fff' }}>
            <span style={{ color: '#60a5fa', fontSize: 24, fontWeight: 700 }}>US</span>
            <span style={{ color: '#ffffff', fontSize: 20, marginLeft: 12 }}>Closed AI Models</span>
          </div>
        </div>

        {/* China Path - Right side (Electric) */}
        <div
          className="china-path-container"
          style={{ position: 'absolute', right: 0, top: '40%', width: '50%', height: '40%', opacity: 0, transform: 'translateX(100px)' }}
        >
          {/* Electric/Energy Pattern */}
          <div className="electric-grid" style={{ position: 'absolute', top: '20%', right: '20%', width: 300, height: 200, opacity: 0 }}>
            {[
              { top: 40, left: 20, width: 120, rotate: 0 },
              { top: 80, left: 50, width: 100, rotate: 30 },
              { top: 120, left: 30, width: 140, rotate: -15 },
            ].map((f, i) => (
              <div
                key={i}
                className="energy-flow"
                style={{
                  position: 'absolute',
                  height: 3,
                  width: f.width,
                  top: f.top,
                  left: f.left,
                  transform: `rotate(${f.rotate}deg)`,
                  background: 'linear-gradient(90deg, #fbbf24, #f59e0b, #d97706)',
                  boxShadow: '0 0 5px #f59e0b',
                }}
              />
            ))}

            {/* Battery Symbol */}
            <div className="battery-symbol" style={{ position: 'absolute', top: '60%', right: '30%', opacity: 0 }}>
              <div className="battery-body" style={{ width: 50, height: 25, background: '#dc2626', border: '2px solid #ef4444', borderRadius: 4, position: 'relative' }} />
              <div className="battery-terminal" style={{ position: 'absolute', right: -8, top: '50%', transform: 'translateY(-50%)', width: 6, height: 12, background: '#ef4444', borderRadius: '0 2px 2px 0' }} />
              <div className="battery-charge" style={{ position: 'absolute', left: 4, top: 4, width: '70%', height: 'calc(100% - 8px)', background: 'linear-gradient(90deg, #fbbf24, #f59e0b)', borderRadius: 2 }} />
            </div>

            {/* Lightning */}
            <div className="lightning-bolt" style={{ position: 'absolute', top: '30%', right: '10%', width: 0, height: 0, opacity: 0, borderLeft: '15px solid transparent', borderRight: '15px solid transparent', borderBottom: '30px solid #fbbf24' }} />
          </div>

          {/* China Label */}
          <div className="path-label china-label" style={{ position: 'absolute', bottom: '10%', right: '20%', opacity: 0, color: '#fff', textAlign: 'right' }}>
            <span style={{ color: '#f87171', fontSize: 24, fontWeight: 700 }}>CHINA</span>
            <span style={{ color: '#ffffff', fontSize: 20, marginLeft: 12 }}>Electric Stack</span>
          </div>
        </div>

        {/* Central message */}
        <div className="message-container" style={{ position: 'absolute', top: '25%', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', opacity: 0 }}>
          <h1 className="fade-in-text" style={{ color: '#ffffff', fontSize: 40, fontWeight: 700, marginBottom: 16, opacity: 0 }}>Two Nations, Two Futures</h1>
          <p className="fade-in-text-delayed" style={{ color: '#cbd5e1', fontSize: 22, opacity: 0 }}>
            America bets on closed AI intelligence while China powers the electric revolution through energy and actuation.
          </p>
        </div>
      </div>

      <style>{`
        .stem-animation { height: 30%; animation: growStem 2s ease-out forwards; }
        @keyframes growStem { 0% { height: 0%; } 50% { height: 30%; } 100% { height: 30%; } }

        .us-path-container { animation: slideInLeft 3s ease-out 1s forwards; }
        .china-path-container { animation: slideInRight 3s ease-out 1s forwards; }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-100px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(100px); } to { opacity: 1; transform: translateX(0); } }

        .neural-network { animation: fadeInNeural 2s ease-out 3.5s forwards; }
        @keyframes fadeInNeural { to { opacity: 1; } }

        .neural-connection { animation: pulse 2s ease-in-out infinite; }
        @keyframes pulse { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }

        .electric-grid { animation: fadeInElectric 2s ease-out 3.5s forwards; }
        @keyframes fadeInElectric { to { opacity: 1; } }

        .battery-symbol { animation: fadeInBattery 1s ease-out 4s forwards; }
        @keyframes fadeInBattery { to { opacity: 1; } }

        .energy-flow { animation: energyPulse 1.5s ease-in-out infinite; }
        @keyframes energyPulse { 0%,100% { box-shadow: 0 0 5px #f59e0b; transform: scaleX(1); } 50% { box-shadow: 0 0 15px #f59e0b; transform: scaleX(1.1); } }

        .lightning-bolt { animation: lightningFlash 2s ease-in-out infinite; }
        @keyframes lightningFlash { 0%,90%,100% { opacity: 0; } 5%,85% { opacity: 1; } }

        .path-label { animation: fadeInLabel 1s ease-out 4.5s forwards; }
        @keyframes fadeInLabel { to { opacity: 1; } }

        .message-container { animation: fadeInMessage 2s ease-out 0.5s forwards; }
        @keyframes fadeInMessage { to { opacity: 1; } }
        .fade-in-text { animation: fadeInText 1.5s ease-out 0.5s forwards; }
        .fade-in-text-delayed { animation: fadeInText 1.5s ease-out 1.5s forwards; }
        @keyframes fadeInText { to { opacity: 1; } }
      `}</style>
    </div>
  );
}
