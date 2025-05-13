
export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
export type PieceColor = 'white' | 'black';

export interface Piece {
  type: PieceType;
  color: PieceColor;
  hasMoved?: boolean;
}

export interface Position {
  x: number;
  y: number;
}

export interface ChessMove {
  piece: Piece;
  from: Position;
  to: Position;
  captured?: Piece;
  isCheck?: boolean;
  isCheckmate?: boolean;
  isStalemate?: boolean;
  isCastling?: boolean;
  isEnPassant?: boolean;
  promotion?: PieceType;
}

export interface GameState {
  board: (Piece | null)[][];
  currentPlayer: PieceColor;
  moveHistory: ChessMove[];
  capturedPieces: {
    white: Piece[];
    black: Piece[];
  };
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  enPassantTarget: Position | null;
  timers: {
    white: number;
    black: number;
  };
  lastMoveTimestamp: number | null;
  timerActive: boolean;
}

