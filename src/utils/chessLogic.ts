
import { Piece, PieceColor, PieceType, Position, GameState, ChessMove } from "@/types/chess";

// Initialize a new chess game
export const initializeGame = (): GameState => {
  const board: (Piece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Set up pawns
  for (let i = 0; i < 8; i++) {
    board[1][i] = { type: 'pawn', color: 'black' };
    board[6][i] = { type: 'pawn', color: 'white' };
  }
  
  // Set up rooks
  board[0][0] = { type: 'rook', color: 'black' };
  board[0][7] = { type: 'rook', color: 'black' };
  board[7][0] = { type: 'rook', color: 'white' };
  board[7][7] = { type: 'rook', color: 'white' };
  
  // Set up knights
  board[0][1] = { type: 'knight', color: 'black' };
  board[0][6] = { type: 'knight', color: 'black' };
  board[7][1] = { type: 'knight', color: 'white' };
  board[7][6] = { type: 'knight', color: 'white' };
  
  // Set up bishops
  board[0][2] = { type: 'bishop', color: 'black' };
  board[0][5] = { type: 'bishop', color: 'black' };
  board[7][2] = { type: 'bishop', color: 'white' };
  board[7][5] = { type: 'bishop', color: 'white' };
  
  // Set up queens
  board[0][3] = { type: 'queen', color: 'black' };
  board[7][3] = { type: 'queen', color: 'white' };
  
  // Set up kings
  board[0][4] = { type: 'king', color: 'black' };
  board[7][4] = { type: 'king', color: 'white' };
  
  return {
    board,
    currentPlayer: 'white',
    moveHistory: [],
    capturedPieces: {
      white: [],
      black: [],
    },
    isCheck: false,
    isCheckmate: false,
    isDraw: false,
  };
};

// Check if a move is valid for a specific piece
export const isValidMove = (
  gameState: GameState,
  from: Position,
  to: Position
): boolean => {
  const { board, currentPlayer } = gameState;
  const piece = board[from.y][from.x];
  
  // Check if there is a piece at the starting position
  if (!piece) return false;
  
  // Check if it's the current player's turn
  if (piece.color !== currentPlayer) return false;
  
  // Check if destination has a piece of the same color
  if (board[to.y][to.x] && board[to.y][to.x]?.color === currentPlayer) return false;
  
  // Check piece-specific movement rules
  switch (piece.type) {
    case 'pawn':
      return isValidPawnMove(gameState, from, to);
    case 'rook':
      return isValidRookMove(gameState, from, to);
    case 'knight':
      return isValidKnightMove(gameState, from, to);
    case 'bishop':
      return isValidBishopMove(gameState, from, to);
    case 'queen':
      return isValidQueenMove(gameState, from, to);
    case 'king':
      return isValidKingMove(gameState, from, to);
    default:
      return false;
  }
};

// Pawn movement validation
const isValidPawnMove = (
  gameState: GameState,
  from: Position,
  to: Position
): boolean => {
  const { board } = gameState;
  const piece = board[from.y][from.x];
  if (!piece || piece.type !== 'pawn') return false;
  
  const direction = piece.color === 'white' ? -1 : 1;
  const startingRow = piece.color === 'white' ? 6 : 1;
  
  // Forward movement
  if (from.x === to.x) {
    // Single square forward
    if (to.y === from.y + direction && !board[to.y][to.x]) {
      return true;
    }
    
    // Double square forward from starting position
    if (
      from.y === startingRow &&
      to.y === from.y + 2 * direction &&
      !board[from.y + direction][from.x] &&
      !board[to.y][to.x]
    ) {
      return true;
    }
  }
  
  // Diagonal capture
  if (
    (to.x === from.x - 1 || to.x === from.x + 1) &&
    to.y === from.y + direction &&
    board[to.y][to.x] &&
    board[to.y][to.x]?.color !== piece.color
  ) {
    return true;
  }
  
  // TODO: Add en passant logic
  
  return false;
};

// Rook movement validation
const isValidRookMove = (
  gameState: GameState,
  from: Position,
  to: Position
): boolean => {
  // Rook can only move horizontally or vertically
  if (from.x !== to.x && from.y !== to.y) return false;
  
  const { board } = gameState;
  
  // Check for pieces in the way
  if (from.x === to.x) {
    // Vertical movement
    const start = Math.min(from.y, to.y);
    const end = Math.max(from.y, to.y);
    
    for (let y = start + 1; y < end; y++) {
      if (board[y][from.x]) return false;
    }
  } else {
    // Horizontal movement
    const start = Math.min(from.x, to.x);
    const end = Math.max(from.x, to.x);
    
    for (let x = start + 1; x < end; x++) {
      if (board[from.y][x]) return false;
    }
  }
  
  return true;
};

// Knight movement validation
const isValidKnightMove = (
  gameState: GameState,
  from: Position,
  to: Position
): boolean => {
  // Knight moves in an L-shape: 2 squares in one direction and 1 square perpendicular
  const dx = Math.abs(to.x - from.x);
  const dy = Math.abs(to.y - from.y);
  
  return (dx === 1 && dy === 2) || (dx === 2 && dy === 1);
};

// Bishop movement validation
const isValidBishopMove = (
  gameState: GameState,
  from: Position,
  to: Position
): boolean => {
  // Bishop can only move diagonally
  const dx = Math.abs(to.x - from.x);
  const dy = Math.abs(to.y - from.y);
  if (dx !== dy) return false;
  
  const { board } = gameState;
  
  // Check for pieces in the way
  const xDirection = to.x > from.x ? 1 : -1;
  const yDirection = to.y > from.y ? 1 : -1;
  
  for (let i = 1; i < dx; i++) {
    if (board[from.y + i * yDirection][from.x + i * xDirection]) return false;
  }
  
  return true;
};

// Queen movement validation
const isValidQueenMove = (
  gameState: GameState,
  from: Position,
  to: Position
): boolean => {
  // Queen can move like a rook or a bishop
  return isValidRookMove(gameState, from, to) || isValidBishopMove(gameState, from, to);
};

// King movement validation
const isValidKingMove = (
  gameState: GameState,
  from: Position,
  to: Position
): boolean => {
  // King can move one square in any direction
  const dx = Math.abs(to.x - from.x);
  const dy = Math.abs(to.y - from.y);
  
  if (dx <= 1 && dy <= 1) return true;
  
  // TODO: Add castling logic
  
  return false;
};

// Make a move on the board and update game state
export const makeMove = (
  gameState: GameState,
  from: Position,
  to: Position
): GameState => {
  const newGameState = JSON.parse(JSON.stringify(gameState)) as GameState;
  const { board } = newGameState;
  
  const piece = board[from.y][from.x];
  if (!piece) return gameState;
  
  // Record captured piece if any
  const capturedPiece = board[to.y][to.x];
  if (capturedPiece) {
    newGameState.capturedPieces[capturedPiece.color].push(capturedPiece);
  }
  
  // Create move record
  const move: ChessMove = {
    piece,
    from,
    to,
    captured: capturedPiece || undefined,
  };
  
  // Update board
  board[to.y][to.x] = { ...piece, hasMoved: true };
  board[from.y][from.x] = null;
  
  // Handle pawn promotion
  if (piece.type === 'pawn' && (to.y === 0 || to.y === 7)) {
    board[to.y][to.x] = { ...board[to.y][to.x]!, type: 'queen' };
    move.promotion = 'queen';
  }
  
  // Add move to history
  newGameState.moveHistory.push(move);
  
  // Check for check and checkmate
  const isInCheck = checkForCheck(newGameState, newGameState.currentPlayer === 'white' ? 'black' : 'white');
  newGameState.isCheck = isInCheck;
  move.isCheck = isInCheck;
  
  if (isInCheck) {
    const isCheckmate = checkForCheckmate(newGameState);
    newGameState.isCheckmate = isCheckmate;
    move.isCheckmate = isCheckmate;
  }
  
  // Switch player
  newGameState.currentPlayer = newGameState.currentPlayer === 'white' ? 'black' : 'white';
  
  return newGameState;
};

// Find the king's position for a given color
const findKing = (board: (Piece | null)[][], color: PieceColor): Position | null => {
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const piece = board[y][x];
      if (piece && piece.type === 'king' && piece.color === color) {
        return { x, y };
      }
    }
  }
  return null;
};

// Check if a king is in check
const checkForCheck = (gameState: GameState, kingColor: PieceColor): boolean => {
  const { board } = gameState;
  const kingPosition = findKing(board, kingColor);
  if (!kingPosition) return false;
  
  // Check if any opponent piece can capture the king
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const piece = board[y][x];
      if (piece && piece.color !== kingColor) {
        if (isValidMove({ ...gameState, currentPlayer: piece.color }, { x, y }, kingPosition)) {
          return true;
        }
      }
    }
  }
  
  return false;
};

// Check if a player is in checkmate
const checkForCheckmate = (gameState: GameState): boolean => {
  // A player is in checkmate if they are in check and have no legal moves
  
  // This is a simplified implementation
  // In a real chess game, you would need to check all possible moves for each piece
  return false; // TODO: Implement proper checkmate detection
};

// Check if a position is on the board
export const isOnBoard = (pos: Position): boolean => {
  return pos.x >= 0 && pos.x < 8 && pos.y >= 0 && pos.y < 8;
};

// Get all possible moves for a piece
export const getPossibleMoves = (
  gameState: GameState,
  position: Position
): Position[] => {
  const possibleMoves: Position[] = [];
  const piece = gameState.board[position.y][position.x];
  
  if (!piece || piece.color !== gameState.currentPlayer) {
    return [];
  }
  
  // Check all positions on the board
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      if (isValidMove(gameState, position, { x, y })) {
        possibleMoves.push({ x, y });
      }
    }
  }
  
  return possibleMoves;
};

// Get algebraic notation for a position (e.g., "e4")
export const getAlgebraicNotation = (pos: Position): string => {
  const file = String.fromCharCode(97 + pos.x);
  const rank = 8 - pos.y;
  return `${file}${rank}`;
};

// Parse algebraic notation into a position
export const parseAlgebraicNotation = (notation: string): Position => {
  const file = notation.charCodeAt(0) - 97;
  const rank = 8 - parseInt(notation[1]);
  return { x: file, y: rank };
};
