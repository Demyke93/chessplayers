
import React from 'react';
import { Piece, Position } from '@/types/chess';

interface ChessPieceProps {
  piece: Piece;
  position: Position;
  isSelected: boolean;
  onSelect: (position: Position) => void;
}

const ChessPiece: React.FC<ChessPieceProps> = ({ 
  piece, 
  position, 
  isSelected, 
  onSelect 
}) => {
  // Unicode chess pieces - using stronger symbols similar to Lichess
  const pieceSymbols = {
    white: {
      king: '♚',
      queen: '♛',
      rook: '♜',
      bishop: '♝',
      knight: '♞',
      pawn: '♟',
    },
    black: {
       king: '♚',
      queen: '♛',
      rook: '♜',
      bishop: '♝',
      knight: '♞',
      pawn: '♟',
    },
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(position);
  };

  return (
    <div
      className={`absolute inset-0 flex items-center justify-center cursor-pointer
        ${isSelected ? 'bg-purple-300 bg-opacity-50 rounded-full' : ''}`}
      onClick={handleClick}
      style={{ 
        touchAction: 'none',
        userSelect: 'none',
        fontSize: '2.5rem', // Larger size like Lichess
        fontWeight: 'bold',
        color: piece.color === 'white' ? '#ffffff' : '#000000',
        textShadow: piece.color === 'white' 
          ? '0px 0px 2px rgba(0,0,0,0.8), 0px 0px 1px rgba(0,0,0,0.9)' 
          : '0px 0px 2px rgba(255,255,255,0.7), 0px 0px 1px rgba(255,255,255,0.9)',
        filter: piece.color === 'white' 
          ? 'drop-shadow(0px 0px 2px rgba(0,0,0,0.7))' 
          : 'drop-shadow(0px 0px 1px rgba(255,255,255,0.8))',
      }}
    >
      {pieceSymbols[piece.color][piece.type]}
    </div>
  );
};

export default ChessPiece;
