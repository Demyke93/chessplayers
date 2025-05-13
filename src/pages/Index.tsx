
import React, { useState, useEffect } from 'react';
import Chessboard from '@/components/Chessboard';
import GameInfo from '@/components/GameInfo';
import { GameState, PieceColor } from '@/types/chess';
import { initializeGame, takeBackMove } from '@/utils/chessLogic';
import { toast } from '@/hooks/use-toast';

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
    
    // Show notifications for special game states
    if (newGameState.isCheckmate) {
      const winner = newGameState.currentPlayer === 'white' ? 'Black' : 'White';
      toast({
        title: "Checkmate!",
        description: `${winner} wins the game!`,
        duration: 5000,
      });
    } else if (newGameState.isStalemate) {
      toast({
        title: "Stalemate!",
        description: "The game is a draw by stalemate.",
        duration: 5000,
      });
    } else if (newGameState.isCheck) {
      toast({
        title: "Check!",
        description: `${newGameState.currentPlayer}'s king is in check!`,
        duration: 3000,
      });
    }
  };

  const handleRestart = () => {
    setGameState(initializeGame());
    toast({
      title: "New Game",
      description: "The board has been reset. White moves first.",
      duration: 3000,
    });
  };

  const handleTakeback = () => {
    const newGameState = takeBackMove(gameState);
    setGameState(newGameState);
    
    if (gameState.moveHistory.length > 0) {
      toast({
        title: "Move Taken Back",
        description: "The last move has been undone.",
        duration: 3000,
      });
    }
  };

  const handleTimeOut = (color: PieceColor) => {
    if (gameState.isCheckmate || gameState.isStalemate || gameState.isDraw) {
      return; // Game is already over
    }

    const winner = color === 'white' ? 'Black' : 'White';
    
    toast({
      title: "Time's Up!",
      description: `${winner} wins on time!`,
      duration: 5000,
    });

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
