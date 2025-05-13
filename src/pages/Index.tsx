
import React, { useState, useEffect } from 'react';
import Chessboard from '@/components/Chessboard';
import GameInfo from '@/components/GameInfo';
import { GameState, PieceColor } from '@/types/chess';
import { initializeGame, takeBackMove } from '@/utils/chessLogic';

const Index = () => {
  const [gameState, setGameState] = useState<GameState>(initializeGame());

  // Start timer when first move is made
  useEffect(() => {
    if (gameState.moveHistory.length === 1 && gameState.timerActive === false) {
      const newGameState = { 
        ...gameState,
        timerActive: true,
        lastMoveTimestamp: Date.now()
      };
      setGameState(newGameState);
    }
  }, [gameState.moveHistory.length]);

  const handleMove = (newGameState: GameState) => {
    setGameState(newGameState);
    // Removed toast notifications
  };

  const handleRestart = () => {
    setGameState(initializeGame());
    // Removed toast notification
  };

  const handleTakeback = () => {
    const newGameState = takeBackMove(gameState);
    setGameState(newGameState);
    // Removed toast notification
  };

  const handleTimeOut = (color: PieceColor) => {
    if (gameState.isCheckmate || gameState.isStalemate || gameState.isDraw) {
      return; // Game is already over
    }

    // Update game state to reflect the game is over
    setGameState({
      ...gameState,
      isCheckmate: true, // Using checkmate flag to indicate game over
      timerActive: false,
    });
  };

  const handleTimerToggle = () => {
    const now = Date.now();
    
    if (gameState.timerActive) {
      // Pausing the timer - save the current times
      setGameState({
        ...gameState,
        timerActive: false,
      });
    } else {
      // Starting/resuming the timer
      setGameState({
        ...gameState,
        timerActive: true,
        lastMoveTimestamp: now,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-purple-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-purple-900">Chess Game</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Chessboard gameState={gameState} onMove={handleMove} />
          </div>
          
          <div>
            <GameInfo 
              gameState={gameState} 
              onRestart={handleRestart} 
              onTakeback={handleTakeback} 
              onTimeOut={handleTimeOut}
              onTimerToggle={handleTimerToggle}
            />
          </div>
        </div>
        
        <div className="mt-8 text-center text-gray-500">
          <p>Two-player chess game - share this device to play against a friend</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
