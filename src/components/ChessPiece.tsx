
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
        ${piece.color === 'white' ? 'text-white' : 'text-black'}
        ${isSelected ? 'bg-purple-300 bg-opacity-50 rounded-full' : ''}`}
      onClick={handleClick}
      style={{ 
        touchAction: 'none',
        userSelect: 'none',
      }}
    >
      {pieceSymbols[piece.color][piece.type]}
    </div>
  );
};

export default ChessPiece;
