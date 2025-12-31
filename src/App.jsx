import React, { useState, useEffect, useRef } from 'react';

const App = () => {
  const [gameState, setGameState] = useState('START'); 
  const [countdown, setCountdown] = useState(3);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  
  const canvasRef = useRef(null);
  const bird = useRef({ x: 80, y: 300, velocity: 0, radius: 15 });
  const pipes = useRef([]);
  const frameId = useRef();
  
  const GRAVITY = 0.4;
  const JUMP = -7;
  const PIPE_SPEED = 2.5;
  const PIPE_GAP = 180;

  const initSession = () => {
    bird.current = { x: 80, y: 300, velocity: 0, radius: 15 };
    pipes.current = [];
    setScore(0);
    setCountdown(3);
    setGameState('COUNTDOWN');
  };

  useEffect(() => {
    let timer;
    if (gameState === 'COUNTDOWN') {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      } else {
        setGameState('PLAYING');
      }
    }
    return () => clearTimeout(timer);
  }, [gameState, countdown]);

  const handleAction = () => {
    if (gameState === 'START' || gameState === 'GAMEOVER') {
      initSession();
    } else if (gameState === 'PLAYING') {
      bird.current.velocity = JUMP;
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') handleAction();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  const update = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'PLAYING') {
      bird.current.velocity += GRAVITY;
      bird.current.y += bird.current.velocity;

      if (bird.current.y + bird.current.radius > canvas.height || bird.current.y - bird.current.radius < 0) {
        setGameState('GAMEOVER');
      }

      if (pipes.current.length === 0 || pipes.current[pipes.current.length - 1].x < canvas.width - 250) {
        const minHeight = 50;
        const maxHeight = canvas.height - PIPE_GAP - minHeight;
        const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
        pipes.current.push({ x: canvas.width, topHeight, width: 60, passed: false });
      }

      pipes.current.forEach((pipe) => {
        pipe.x -= PIPE_SPEED;
        if (!pipe.passed && pipe.x + pipe.width < bird.current.x) {
          pipe.passed = true;
          setScore(s => s + 1);
        }
        if (
          bird.current.x + bird.current.radius > pipe.x &&
          bird.current.x - bird.current.radius < pipe.x + pipe.width &&
          (bird.current.y - bird.current.radius < pipe.topHeight ||
           bird.current.y + bird.current.radius > pipe.topHeight + PIPE_GAP)
        ) {
          setGameState('GAMEOVER');
        }
      });
      pipes.current = pipes.current.filter(p => p.x + p.width > -50);
    }

    pipes.current.forEach(p => {
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(p.x, 0, p.width, p.topHeight);
      ctx.fillRect(p.x, p.topHeight + PIPE_GAP, p.width, canvas.height);
    });

    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(bird.current.x, bird.current.y, bird.current.radius, 0, Math.PI * 2);
    ctx.fill();
    
    frameId.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    frameId.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId.current);
  }, [gameState]);

  useEffect(() => {
    if (score > highScore) setHighScore(score);
  }, [score]);

  return (
    <div className="w-full h-screen bg-slate-950 flex items-center justify-center p-4 font-sans text-white">
      <div 
        className="relative shadow-2xl rounded-2xl overflow-hidden cursor-pointer bg-slate-900 border-4 border-slate-800"
        style={{ width: '400px', height: '600px' }}
        onClick={handleAction}
      >
        <canvas ref={canvasRef} width={400} height={600} className="w-full h-full block" />
        
        <div className="absolute top-8 left-0 w-full text-center pointer-events-none">
          <div className="text-white text-7xl font-black">{score}</div>
          <div className="text-emerald-400 text-xs font-bold uppercase tracking-widest">Best: {highScore}</div>
        </div>

        {gameState === 'COUNTDOWN' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="text-9xl font-black text-white">
               {countdown === 0 ? "GO!" : countdown}
             </div>
          </div>
        )}

        {(gameState === 'START' || gameState === 'GAMEOVER') && (
          <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-5xl font-black text-white mb-2 italic">ZEN BIRD</h1>
            <p className="text-slate-500 text-xs mb-10 uppercase tracking-widest">Tap to Jump</p>
            
            {gameState === 'GAMEOVER' && (
              <div className="mb-10">
                <div className="text-red-500 text-sm font-bold uppercase">Game Over</div>
                <div className="text-white text-6xl font-black">{score}</div>
              </div>
            )}

            <button className="px-12 py-4 bg-yellow-400 text-black font-black rounded-2xl">
              {gameState === 'START' ? 'FLY NOW' : 'RETRY'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;