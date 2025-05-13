
import React, { useEffect, useState } from 'react';
import { GameState, PieceColor } from '@/types/chess';
import { Clock } from 'lucide-react';

interface ChessTimerProps {
  gameState: GameState;
  onTimeOut: (color: PieceColor) => void;
}

const ChessTimer: React.FC<ChessTimerProps> = ({ gameState, onTimeOut }) => {
  // Local state for display purposes
  const [whiteTime, setWhiteTime] = useState(gameState.timers.white);
  const [blackTime, setBlackTime] = useState(gameState.timers.black);
  
  // Update timer every 100ms
  useEffect(() => {
    if (!gameState.timerActive || gameState.isCheckmate || gameState.isStalemate || gameState.isDraw) {
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      if (gameState.lastMoveTimestamp) {
        const elapsed = now - gameState.lastMoveTimestamp;
        
        if (gameState.currentPlayer === 'white') {
          const newTime = Math.max(0, gameState.timers.white - elapsed);
          setWhiteTime(newTime);
          if (newTime === 0) {
            onTimeOut('white');
          }
        } else {
          const newTime = Math.max(0, gameState.timers.black - elapsed);
          setBlackTime(newTime);
          if (newTime === 0) {
            onTimeOut('black');
          }
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [gameState, onTimeOut]);

  // Format time as mm:ss
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex justify-between mb-4 bg-gray-100 rounded-md p-3">
      <div className={`flex items-center px-3 py-1 rounded ${gameState.currentPlayer === 'white' ? 'bg-white border border-gray-300 shadow-sm' : ''}`}>
        <div className="w-4 h-4 bg-white border border-gray-300 rounded-full mr-2"></div>
        <Clock className="mr-1" size={16} />
        <span className={`font-mono ${whiteTime < 30000 && gameState.currentPlayer === 'white' ? 'text-red-600 font-bold' : ''}`}>
          {formatTime(whiteTime)}
        </span>
      </div>
      
      <div className={`flex items-center px-3 py-1 rounded ${gameState.currentPlayer === 'black' ? 'bg-gray-200 border border-gray-300 shadow-sm' : ''}`}>
        <div className="w-4 h-4 bg-black rounded-full mr-2"></div>
        <Clock className="mr-1" size={16} />
        <span className={`font-mono ${blackTime < 30000 && gameState.currentPlayer === 'black' ? 'text-red-600 font-bold' : ''}`}>
          {formatTime(blackTime)}
        </span>
      </div>
    </div>
  );
};

export default ChessTimer;
