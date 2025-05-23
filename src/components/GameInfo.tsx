
import React from 'react';
import { GameState, ChessMove, PieceType, PieceColor } from '@/types/chess';
import { getAlgebraicNotation } from '@/utils/chessLogic';
import { Button } from '@/components/ui/button';
import ChessTimer from './ChessTimer';
import { ArrowLeft } from 'lucide-react';

interface GameInfoProps {
  gameState: GameState;
  onRestart: () => void;
  onTakeback: () => void;
  onTimeOut: (color: PieceColor) => void;
  onTimerToggle: () => void;
}

const GameInfo: React.FC<GameInfoProps> = ({ 
  gameState, 
  onRestart, 
  onTakeback, 
  onTimeOut,
  onTimerToggle
}) => {
  const { currentPlayer, moveHistory, capturedPieces, isCheck, isCheckmate, isStalemate, isDraw, timerActive } = gameState;

  // Format a move for display
  const formatMove = (move: ChessMove, index: number) => {
    const pieceSymbol = getPieceSymbol(move.piece.type);
    const from = getAlgebraicNotation(move.from);
    const to = getAlgebraicNotation(move.to);
    const capture = move.captured ? 'x' : '';
    const check = move.isCheck ? '+' : '';
    const checkmate = move.isCheckmate ? '#' : '';
    
    return (
      <div key={index} className="mb-1 flex justify-between">
        <span className="font-mono">{Math.floor(index / 2) + 1}.</span>
        <span>{pieceSymbol}{from}{capture}{to}{check}{checkmate}</span>
      </div>
    );
  };

  // Get symbol for a piece type
  const getPieceSymbol = (type: PieceType): string => {
    switch (type) {
      case 'king': return 'K';
      case 'queen': return 'Q';
      case 'rook': return 'R';
      case 'bishop': return 'B';
      case 'knight': return 'N';
      case 'pawn': return '';
      default: return '';
    }
  };

  // Render captured pieces
  const renderCapturedPieces = (color: PieceColor) => {
    const pieces = capturedPieces[color];
    if (!pieces.length) return null;

    return (
      <div className="flex flex-wrap">
        {pieces.map((piece, i) => {
          const symbol = {
            king: color === 'white' ? '♔' : '♚',
            queen: color === 'white' ? '♕' : '♛',
            rook: color === 'white' ? '♖' : '♜',
            bishop: color === 'white' ? '♗' : '♝',
            knight: color === 'white' ? '♘' : '♞',
            pawn: color === 'white' ? '♙' : '♟',
          }[piece.type];
          
          return <span key={i} className="text-xl">{symbol}</span>;
        })}
      </div>
    );
  };

  // Group moves in pairs for display
  const getPairedMoves = () => {
    const pairs = [];
    for (let i = 0; i < moveHistory.length; i += 2) {
      const whiteMove = moveHistory[i];
      const blackMove = moveHistory[i + 1];
      pairs.push(
        <div key={i/2} className="flex justify-between mb-1">
          <div className="w-6 text-right font-mono">{Math.floor(i/2) + 1}.</div>
          <div className="flex-1 mx-2">{formatAlgebraicNotation(whiteMove)}</div>
          <div className="flex-1">{blackMove ? formatAlgebraicNotation(blackMove) : ''}</div>
        </div>
      );
    }
    return pairs;
  };

  // Format a move in algebraic notation
  const formatAlgebraicNotation = (move: ChessMove): string => {
    // Special notation for castling
    if (move.isCastling) {
      return move.to.x > move.from.x ? 'O-O' : 'O-O-O';
    }
    
    const pieceSymbol = getPieceSymbol(move.piece.type);
    const to = getAlgebraicNotation(move.to);
    const capture = move.captured || move.isEnPassant ? 'x' : '';
    const check = move.isCheck ? '+' : '';
    const checkmate = move.isCheckmate ? '#' : '';
    const promotion = move.promotion ? `=${getPieceSymbol(move.promotion)}` : '';
    
    return `${pieceSymbol}${capture}${to}${promotion}${check}${checkmate}`;
  };

  // Removed the renderGameRules function and its usage

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <ChessTimer gameState={gameState} onTimeOut={onTimeOut} />

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">
            {isCheckmate ? (
              <span className="text-red-600">Checkmate!</span>
            ) : isCheck ? (
              <span className="text-orange-500">Check!</span>
            ) : isStalemate ? (
              <span className="text-gray-600">Stalemate</span>
            ) : isDraw ? (
              <span className="text-gray-600">Draw</span>
            ) : (
              <span>Current Turn</span>
            )}
          </h2>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onTakeback} 
              disabled={moveHistory.length === 0 || isCheckmate || isStalemate || isDraw}
            >
              <ArrowLeft size={16} className="mr-1" />
              Takeback
            </Button>
            <Button 
              onClick={onRestart}
              variant="destructive" 
              size="sm"
            >
              Restart
            </Button>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full mr-2 ${currentPlayer === 'white' ? 'bg-white border border-gray-400' : 'bg-black'}`}></div>
            <span className="capitalize">{!isCheckmate && !isStalemate && !isDraw && `${currentPlayer}'s Turn`}</span>
          </div>
          
          <Button 
            variant={timerActive ? "default" : "secondary"} 
            size="sm" 
            onClick={onTimerToggle}
            disabled={isCheckmate || isStalemate || isDraw}
          >
            {timerActive ? "Pause Timer" : "Start Timer"}
          </Button>
        </div>
        
        {isCheckmate && (
          <div className="text-red-600 mt-2">
            {currentPlayer === 'white' ? 'Black' : 'White'} wins by checkmate!
          </div>
        )}
        
        {isStalemate && (
          <div className="text-gray-600 mt-2">
            Game drawn by stalemate.
          </div>
        )}
        
        {/* Removed the Chess Rules section that was here */}
      </div>
      
      <div className="mb-4">
        <h3 className="font-semibold mb-1">Captured Pieces</h3>
        <div className="flex justify-between">
          <div>
            <div className="text-sm text-gray-600 mb-1">Black captured:</div>
            {renderCapturedPieces('black')}
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">White captured:</div>
            {renderCapturedPieces('white')}
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold mb-1">Move History</h3>
        <div className="h-48 overflow-y-auto border border-gray-200 rounded p-2 bg-gray-50">
          {getPairedMoves()}
        </div>
      </div>
    </div>
  );
};

export default GameInfo;
