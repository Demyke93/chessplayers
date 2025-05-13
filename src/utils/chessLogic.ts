
import { Piece, PieceColor, PieceType, Position, GameState, ChessMove } from "@/types/chess";

// Initialize a new chess game
export const initializeGame = (): GameState => {
  const board: (Piece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Set up pawns
  for (let i = 0; i < 8; i++) {
    board[1][i] = { type: 'pawn', color: 'black', hasMoved: false };
    board[6][i] = { type: 'pawn', color: 'white', hasMoved: false };
  }
  
  // Set up rooks
  board[0][0] = { type: 'rook', color: 'black', hasMoved: false };
  board[0][7] = { type: 'rook', color: 'black', hasMoved: false };
  board[7][0] = { type: 'rook', color: 'white', hasMoved: false };
  board[7][7] = { type: 'rook', color: 'white', hasMoved: false };
  
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
  board[0][4] = { type: 'king', color: 'black', hasMoved: false };
  board[7][4] = { type: 'king', color: 'white', hasMoved: false };
  
  // 5 minutes in milliseconds = 300000
  const fiveMinutes = 5 * 60 * 1000;
  
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
    isStalemate: false,
    isDraw: false,
    enPassantTarget: null,
    timers: {
      white: fiveMinutes,
      black: fiveMinutes
    },
    lastMoveTimestamp: null,
    timerActive: false
  };
};

// Check if a move is valid for a specific piece
export const isValidMove = (
  gameState: GameState,
  from: Position,
  to: Position
): boolean => {
  const { board, currentPlayer, enPassantTarget } = gameState;
  const piece = board[from.y][from.x];
  
  // Check if there is a piece at the starting position
  if (!piece) return false;
  
  // Check if it's the current player's turn
  if (piece.color !== currentPlayer) return false;
  
  // Check if destination has a piece of the same color
  if (board[to.y][to.x] && board[to.y][to.x]?.color === currentPlayer) return false;
  
  // Check piece-specific movement rules
  let validMove = false;
  switch (piece.type) {
    case 'pawn':
      validMove = isValidPawnMove(gameState, from, to);
      break;
    case 'rook':
      validMove = isValidRookMove(gameState, from, to);
      break;
    case 'knight':
      validMove = isValidKnightMove(gameState, from, to);
      break;
    case 'bishop':
      validMove = isValidBishopMove(gameState, from, to);
      break;
    case 'queen':
      validMove = isValidQueenMove(gameState, from, to);
      break;
    case 'king':
      validMove = isValidKingMove(gameState, from, to) || isValidCastling(gameState, from, to);
      break;
    default:
      return false;
  }
  
  // If not a valid move according to piece rules, return early
  if (!validMove) return false;
  
  // Check if move would put/leave own king in check
  if (wouldBeInCheck(gameState, from, to)) {
    return false;
  }
  
  return true;
};

// Check if moving from 'from' to 'to' would leave the player's king in check
const wouldBeInCheck = (gameState: GameState, from: Position, to: Position): boolean => {
  // Create a deep copy of the game state
  const newGameState = JSON.parse(JSON.stringify(gameState)) as GameState;
  const { board } = newGameState;
  const piece = board[from.y][from.x];
  
  if (!piece) return false;
  
  // Handle en passant capture
  let capturedPiecePos = { x: to.x, y: to.y };
  if (piece.type === 'pawn' && to.x !== from.x && !board[to.y][to.x]) {
    // Must be en passant, captured pawn is on the same rank as 'from'
    capturedPiecePos = { x: to.x, y: from.y };
  }
  
  // Save captured piece temporarily
  const capturedPiece = board[capturedPiecePos.y][capturedPiecePos.x];
  
  // Make temporary move
  board[to.y][to.x] = piece;
  board[from.y][from.x] = null;
  
  // If en passant, also remove the captured pawn
  if (piece.type === 'pawn' && to.x !== from.x && !capturedPiece) {
    board[capturedPiecePos.y][capturedPiecePos.x] = null;
  }
  
  // Check if own king is in check after move
  const kingPosition = findKing(board, piece.color);
  let inCheck = false;
  
  if (kingPosition) {
    inCheck = isPositionUnderAttack(newGameState, kingPosition, piece.color === 'white' ? 'black' : 'white');
  }
  
  return inCheck;
};

// Pawn movement validation
const isValidPawnMove = (
  gameState: GameState,
  from: Position,
  to: Position
): boolean => {
  const { board, enPassantTarget } = gameState;
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
    to.y === from.y + direction
  ) {
    // Regular capture
    if (board[to.y][to.x] && board[to.y][to.x]?.color !== piece.color) {
      return true;
    }
    
    // En passant capture
    if (
      !board[to.y][to.x] && 
      enPassantTarget && 
      to.x === enPassantTarget.x && 
      to.y === enPassantTarget.y
    ) {
      return true;
    }
  }
  
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
  
  // One step in any direction
  return dx <= 1 && dy <= 1 && !(dx === 0 && dy === 0);
};

// Castling validation
const isValidCastling = (
  gameState: GameState,
  from: Position,
  to: Position
): boolean => {
  const { board, currentPlayer } = gameState;
  const piece = board[from.y][from.x];
  
  if (!piece || piece.type !== 'king' || piece.hasMoved) return false;
  
  const isShortCastling = to.x - from.x === 2; // Kingside castling
  const isLongCastling = from.x - to.x === 2;  // Queenside castling
  
  // Must be a horizontal move on the back rank
  if (
    from.y !== to.y || 
    (!isShortCastling && !isLongCastling) || 
    from.y !== (currentPlayer === 'white' ? 7 : 0)
  ) {
    return false;
  }
  
  // Find the rook
  const rookX = isShortCastling ? 7 : 0;
  const rookPos = { x: rookX, y: from.y };
  const rook = board[rookPos.y][rookPos.x];
  
  // Check if rook exists and hasn't moved
  if (!rook || rook.type !== 'rook' || rook.color !== currentPlayer || rook.hasMoved) {
    return false;
  }
  
  // Check for pieces between king and rook
  const start = isShortCastling ? from.x + 1 : rookPos.x + 1;
  const end = isShortCastling ? rookPos.x : from.x;
  
  for (let x = start; x < end; x++) {
    if (board[from.y][x]) return false;
  }
  
  // Check if king is in check or passes through check
  const kingMoveDirection = isShortCastling ? 1 : -1;
  
  // Check current position
  if (isKingInCheck(gameState, currentPlayer)) return false;
  
  // Check intermediate position
  const intermediatePos = { x: from.x + kingMoveDirection, y: from.y };
  if (isPositionUnderAttack(gameState, intermediatePos, currentPlayer === 'white' ? 'black' : 'white')) {
    return false;
  }
  
  // Check destination position
  if (isPositionUnderAttack(gameState, to, currentPlayer === 'white' ? 'black' : 'white')) {
    return false;
  }
  
  return true;
};

// Check if a position is under attack by a specific color
const isPositionUnderAttack = (
  gameState: GameState,
  position: Position,
  attackerColor: PieceColor
): boolean => {
  const { board } = gameState;
  
  // Check each piece of the attacker's color to see if it can attack the position
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const piece = board[y][x];
      
      if (piece && piece.color === attackerColor) {
        const from = { x, y };
        
        // Special handling for pawn attacks which are different than pawn moves
        if (piece.type === 'pawn') {
          const direction = piece.color === 'white' ? -1 : 1;
          const diagonalAttack1 = { x: x - 1, y: y + direction };
          const diagonalAttack2 = { x: x + 1, y: y + direction };
          
          if (
            (diagonalAttack1.x === position.x && diagonalAttack1.y === position.y) ||
            (diagonalAttack2.x === position.x && diagonalAttack2.y === position.y)
          ) {
            return true;
          }
        } 
        // For all other pieces, use their normal movement rules
        else if (
          // Create a temporary game state with the attacker as the current player
          isValidMove(
            { ...gameState, currentPlayer: attackerColor },
            from,
            position
          )
        ) {
          return true;
        }
      }
    }
  }
  
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
  
  // Update timers on move
  const now = Date.now();
  if (newGameState.lastMoveTimestamp && newGameState.timerActive) {
    const elapsed = now - newGameState.lastMoveTimestamp;
    if (newGameState.currentPlayer === 'white') {
      newGameState.timers.white = Math.max(0, newGameState.timers.white - elapsed);
    } else {
      newGameState.timers.black = Math.max(0, newGameState.timers.black - elapsed);
    }
  }
  
  // Set move timestamp
  newGameState.lastMoveTimestamp = now;
  
  // Create move record
  const move: ChessMove = {
    piece,
    from,
    to,
  };
  
  // Handle castling
  if (piece.type === 'king' && Math.abs(to.x - from.x) === 2) {
    move.isCastling = true;
    const isKingSide = to.x > from.x;
    
    // Move the rook
    const rookFromX = isKingSide ? 7 : 0;
    const rookToX = isKingSide ? to.x - 1 : to.x + 1;
    
    // Get the rook and move it
    const rook = board[from.y][rookFromX];
    board[from.y][rookToX] = { ...rook!, hasMoved: true };
    board[from.y][rookFromX] = null;
  }
  
  // Handle en passant capture
  let isEnPassant = false;
  if (
    piece.type === 'pawn' && 
    from.x !== to.x && 
    !board[to.y][to.x] &&
    newGameState.enPassantTarget &&
    to.x === newGameState.enPassantTarget.x &&
    to.y === newGameState.enPassantTarget.y
  ) {
    isEnPassant = true;
    move.isEnPassant = true;
    
    // The captured pawn is on the same rank as the moving pawn
    const capturedPawn = board[from.y][to.x];
    if (capturedPawn) {
      move.captured = capturedPawn;
      newGameState.capturedPieces[capturedPawn.color].push(capturedPawn);
      board[from.y][to.x] = null; // Remove the captured pawn
    }
  } else {
    // Handle regular capture
    const capturedPiece = board[to.y][to.x];
    if (capturedPiece) {
      move.captured = capturedPiece;
      newGameState.capturedPieces[capturedPiece.color].push(capturedPiece);
    }
  }
  
  // Set new en passant target
  newGameState.enPassantTarget = null;
  if (
    piece.type === 'pawn' &&
    Math.abs(to.y - from.y) === 2
  ) {
    // Set en passant target to the square the pawn "jumped over"
    const direction = piece.color === 'white' ? -1 : 1;
    newGameState.enPassantTarget = { x: to.x, y: from.y + direction };
  }
  
  // Update board
  board[to.y][to.x] = { ...piece, hasMoved: true };
  board[from.y][from.x] = null;
  
  // Handle pawn promotion
  if (piece.type === 'pawn' && (to.y === 0 || to.y === 7)) {
    board[to.y][to.x] = { ...board[to.y][to.x]!, type: 'queen' };
    move.promotion = 'queen';
    // TODO: Allow player to choose promotion piece
  }
  
  // Add move to history
  newGameState.moveHistory.push(move);
  
  // Switch player
  newGameState.currentPlayer = newGameState.currentPlayer === 'white' ? 'black' : 'white';
  
  // Check for check, checkmate, and stalemate
  const isInCheck = isKingInCheck(newGameState, newGameState.currentPlayer);
  newGameState.isCheck = isInCheck;
  move.isCheck = isInCheck;
  
  if (isInCheck) {
    // Check for checkmate
    const hasLegalMoves = playerHasLegalMoves(newGameState);
    if (!hasLegalMoves) {
      newGameState.isCheckmate = true;
      move.isCheckmate = true;
    }
  } else {
    // Check for stalemate
    const hasLegalMoves = playerHasLegalMoves(newGameState);
    if (!hasLegalMoves) {
      newGameState.isStalemate = true;
      move.isStalemate = true;
      newGameState.isDraw = true;
    }
  }
  
  return newGameState;
};

// Take back the last move
export const takeBackMove = (gameState: GameState): GameState => {
  // Make a deep copy of the game state
  const newGameState = JSON.parse(JSON.stringify(gameState)) as GameState;
  
  // Check if there's a move to take back
  if (newGameState.moveHistory.length === 0) {
    return gameState; // Nothing to take back
  }
  
  // Get the last move
  const lastMove = newGameState.moveHistory.pop()!;
  
  // Switch back to previous player
  newGameState.currentPlayer = lastMove.piece.color;
  
  // Reset check/checkmate/stalemate flags
  newGameState.isCheck = false;
  newGameState.isCheckmate = false;
  newGameState.isStalemate = false;
  newGameState.isDraw = false;
  
  // Move the piece back
  const { board } = newGameState;
  board[lastMove.from.y][lastMove.from.x] = lastMove.piece;
  
  // If the piece was a king or rook that moved for the first time, reset hasMoved
  if ((lastMove.piece.type === 'king' || lastMove.piece.type === 'rook') && 
      lastMove.piece.hasMoved === true) {
    board[lastMove.from.y][lastMove.from.x]!.hasMoved = false;
  }
  
  // Handle captured piece
  if (lastMove.captured) {
    // If it was an en passant capture, the pawn goes on a different square
    if (lastMove.isEnPassant) {
      board[lastMove.from.y][lastMove.to.x] = lastMove.captured;
      board[lastMove.to.y][lastMove.to.x] = null;
    } else {
      board[lastMove.to.y][lastMove.to.x] = lastMove.captured;
    }
    
    // Remove from captured pieces array
    newGameState.capturedPieces[lastMove.captured.color] = 
      newGameState.capturedPieces[lastMove.captured.color].filter(
        (_, index, arr) => index !== arr.length - 1
      );
  } else {
    board[lastMove.to.y][lastMove.to.x] = null;
  }
  
  // Handle castling
  if (lastMove.isCastling) {
    const isKingSide = lastMove.to.x > lastMove.from.x;
    const rookFromX = isKingSide ? lastMove.to.x - 1 : lastMove.to.x + 1;
    const rookToX = isKingSide ? 7 : 0;
    
    // Move the rook back
    board[lastMove.from.y][rookToX] = {
      type: 'rook',
      color: lastMove.piece.color,
      hasMoved: false,
    };
    board[lastMove.from.y][rookFromX] = null;
  }
  
  // Handle promotion - we can't determine original pawn, so just convert back to pawn
  if (lastMove.promotion) {
    board[lastMove.from.y][lastMove.from.x]!.type = 'pawn';
  }
  
  // Set the timers for the player who just got their turn back
  const now = Date.now();
  if (newGameState.lastMoveTimestamp && newGameState.timerActive) {
    // Calculate time returned to the previous player
    const opponentColor = lastMove.piece.color === 'white' ? 'black' : 'white';
    const elapsed = now - newGameState.lastMoveTimestamp;
    newGameState.timers[opponentColor] += elapsed;
  }
  
  // Update timestamp
  newGameState.lastMoveTimestamp = now;
  
  return newGameState;
};

// Check if the king of a specific color is in check
const isKingInCheck = (gameState: GameState, kingColor: PieceColor): boolean => {
  const { board } = gameState;
  const kingPosition = findKing(board, kingColor);
  
  if (!kingPosition) return false;
  
  return isPositionUnderAttack(
    gameState, 
    kingPosition, 
    kingColor === 'white' ? 'black' : 'white'
  );
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

// Check if a player has any legal moves
const playerHasLegalMoves = (gameState: GameState): boolean => {
  const { board, currentPlayer } = gameState;
  
  // Check every piece of the current player
  for (let fromY = 0; fromY < 8; fromY++) {
    for (let fromX = 0; fromX < 8; fromX++) {
      const piece = board[fromY][fromX];
      
      if (piece && piece.color === currentPlayer) {
        // Check every possible destination
        for (let toY = 0; toY < 8; toY++) {
          for (let toX = 0; toX < 8; toX++) {
            const from = { x: fromX, y: fromY };
            const to = { x: toX, y: toY };
            
            // If there's a legal move, return true
            if (isValidMove(gameState, from, to)) {
              return true;
            }
          }
        }
      }
    }
  }
  
  // No legal moves found
  return false;
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
      const to = { x, y };
      if (isValidMove(gameState, position, to)) {
        possibleMoves.push(to);
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
