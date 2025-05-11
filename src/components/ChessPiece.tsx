
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
  // Unicode chess pieces
  const pieceSymbols = {
    white: {
      king: '♔',
      queen: '♕',
      rook: '♖',
      bishop: '♗',
      knight: '♘',
      pawn: '♙',
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
      className={`absolute inset-0 flex items-center justify-center text-4xl cursor-pointer
        ${isSelected ? 'bg-purple-300 bg-opacity-50 rounded-full' : ''}`}
      onClick={handleClick}
      style={{ 
        touchAction: 'none',
        userSelect: 'none',
        // Enhanced styling for white pieces to make them clearer and sharper
        ...(piece.color === 'white' ? {
          color: '#FFFFFF',
          textShadow: '0px 0px 1px #000, 0px 0px 2px #000',
          WebkitTextFillColor: '#FFFFFF',
          WebkitTextStroke: '1.2px #000',
          filter: 'contrast(1.2) brightness(1.05) drop-shadow(0px 0px 1px rgba(0,0,0,0.9))',
          fontWeight: 'bold',
          transform: 'scale(1.02)',
        } : {
          color: 'black',
          textShadow: '0px 0px 2px #fff',
          filter: 'drop-shadow(0px 0px 1px rgba(255,255,255,0.5))',
        }),
      }}
    >
      {pieceSymbols[piece.color][piece.type]}
    </div>
  );
};

export default ChessPiece;
