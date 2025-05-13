
import React, { useState } from 'react';
import { Piece, Position, GameState } from '@/types/chess';
import { isValidMove, makeMove, getPossibleMoves, getAlgebraicNotation } from '@/utils/chessLogic';
import ChessPiece from './ChessPiece';
import { Dot } from 'lucide-react';

interface ChessboardProps {
  gameState: GameState;
  onMove: (newGameState: GameState) => void;
}

const Chessboard: React.FC<ChessboardProps> = ({ gameState, onMove }) => {
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [highlightedSquares, setHighlightedSquares] = useState<Position[]>([]);

  const handleSquareClick = (position: Position) => {
    const piece = gameState.board[position.y][position.x];
    
    // If a piece is already selected
    if (selectedPosition) {
      // If clicking the same piece, deselect it
      if (selectedPosition.x === position.x && selectedPosition.y === position.y) {
        setSelectedPosition(null);
        setHighlightedSquares([]);
        return;
      }
      
      // If clicking a valid move destination
      if (highlightedSquares.some(pos => pos.x === position.x && pos.y === position.y)) {
        const newGameState = makeMove(gameState, selectedPosition, position);
        onMove(newGameState);
        setSelectedPosition(null);
        setHighlightedSquares([]);
        return;
      }
    }
    
    // Select a new piece if it belongs to the current player
    if (piece && piece.color === gameState.currentPlayer) {
      setSelectedPosition(position);
      setHighlightedSquares(getPossibleMoves(gameState, position));
    }
  };

  const handlePieceSelect = (position: Position) => {
    handleSquareClick(position);
  };

  const isSquareHighlighted = (position: Position) => {
    return highlightedSquares.some(pos => pos.x === position.x && pos.y === position.y);
  };

  // Render the board
  const renderSquares = () => {
    const squares = [];
    
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const position: Position = { x, y };
        const piece = gameState.board[y][x];
        const isLight = (x + y) % 2 === 0;
        const isSelected = selectedPosition?.x === x && selectedPosition?.y === y;
        const isHighlighted = isSquareHighlighted(position);
        
        squares.push(
          <div 
            key={`${x}-${y}`}
            className={`relative w-full pb-[100%] 
              ${isLight ? 'bg-[#f0d9b5]' : 'bg-[#b58863]'}
              ${isSelected ? 'ring-2 ring-[#786514] ring-inset' : ''}`}
            onClick={() => handleSquareClick(position)}
          >
            {/* Coordinate labels */}
            {x === 0 && (
              <div className="absolute -left-6 top-1/2 transform -translate-y-1/2 text-sm text-gray-600">
                {8 - y}
              </div>
            )}
            {y === 7 && (
              <div className="absolute bottom-[-1.5rem] left-1/2 transform -translate-x-1/2 text-sm text-gray-600">
                {String.fromCharCode(97 + x)}
              </div>
            )}
            
            {/* Green dot for legal moves */}
            {isHighlighted && !piece && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-[#F2FCE2] opacity-80"></div>
              </div>
            )}

            {/* Green highlight for captures */}
            {isHighlighted && piece && (
              <div className="absolute inset-0 ring-4 ring-[#F2FCE2] ring-opacity-40 ring-inset"></div>
            )}
            
            {/* Chess piece */}
            {piece && (
              <ChessPiece 
                piece={piece} 
                position={position}
                isSelected={isSelected}
                onSelect={handlePieceSelect}
              />
            )}
          </div>
        );
      }
    }
    
    return squares;
  };

  return (
    <div className="relative w-[95vw] max-w-md md:max-w-lg lg:max-w-xl mx-auto">
      <div className="grid grid-cols-8 gap-0 border-4 border-[#b58863] shadow-xl aspect-square">
        {renderSquares()}
      </div>
    </div>
  );
};

export default Chessboard;
