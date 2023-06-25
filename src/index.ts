import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import Router from 'koa-router';

import { GameStatus, WordleAPI } from './WordleAPI.js';

const dbFile = 'wordle-db.json';
const wordFile = 'words.txt';
const wordle = new WordleAPI({ dbFile, wordFile });

/**
 * Wordle API Server POC
 *
 * Provides its own rule set and game api.
 * No user account or permissions needed
 *
 * GET /games
 *   Returns all active games and their state.
 *
 * POST /games
 *   Create a new game and return current state.
 *
 * GET /games/[id]
 *  Returns game state for a game ID
 *
 * POST /games/[id]/guesses
 *   Submit a new guess, returns mask of guess.
 *
 * GET /games/[id]/guesses
 *   List all guesses for a game.
 *
 * GET /games/[id]/guesses/[id]
 *   Get a single guess for a game.
 *
 */

console.log('Welcome to the Wordle API server!');
console.log(`Today's word is "${wordle.word}", shhhh!`);

// Configure App/API server.
const app = new Koa();
const port = process.env.PORT ?? 3000;
const router = new Router();

// GET Games list.
router.get('/games', async (ctx) => {
  // Set body to games DB (less the secret word for running games).
  ctx.body = wordle.getCleanGames();
});

// Create new game.
router.post('/games', async (ctx) => {
  ctx.body = wordle.createGame();
});

// Get specific game.
router.get('/games/:id', async (ctx) => {
  const game = wordle.getGame(ctx.params.id);
  if (game !== undefined) {
    ctx.body = wordle.getCleanGame(game);
  } else {
    ctx.throw(404);
  }
});

// Add a guess for a specific game
router.post('/games/:gameId/guesses', async (ctx) => {
  // Get the associated game, fail if not found.
  const { gameId } = ctx.params;
  const game = wordle.getGame(gameId);
  if (game === undefined) {
    ctx.throw(404, `Game ID ${gameId} not found`);
    return;
  }

  // Fail for completed games
  if (game.status !== GameStatus.Started) {
    ctx.throw(406, `Game (ID ${gameId}) has ended and is no longer accepting guesses. The word was '${game.word}'.`);
    return;
  }

  // Parse body for word.
  const body: string = ctx.request.body as string;
  const testWord = body.trim().toLowerCase();

  // Throw out anything that isn't the right length.
  if (testWord.length !== wordle.wordLength) {
    ctx.throw(406, `Guesses must be exctly ${wordle.wordLength} characters long`);
  } else {
    ctx.body = wordle.addGuess(game, testWord);
  }
});

// Read out all guesses for a game
router.get('/games/:gameId/guesses', async (ctx) => {
  // Get the associated game, fail if not found.
  const { gameId } = ctx.params;
  const game = wordle.getGame(gameId);
  if (game === undefined) {
    ctx.throw(404, `Game ID ${gameId} not found`);
    return;
  }

  ctx.body = wordle.getGuesses(game.id);
});

// Read a single guess for a game
router.get('/games/:gameId/guesses/:guessId', async (ctx) => {
  // Get the associated game, fail if not found.
  const { gameId, guessId } = ctx.params;
  const game = wordle.getGame(gameId);
  if (game === undefined) {
    ctx.throw(404, `Game ID ${gameId} not found`);
    return;
  }

  const guesses = wordle.getGuesses(game.id);
  const guess = guesses.find(({ id }) => id === parseInt(guessId, 10));

  if (guess === undefined) {
    ctx.throw(404, `Guess ID ${guessId} not found`);
    return;
  }

  ctx.body = guess;
});

// Set body parser, working app middleware, actually start server.
app.use(bodyParser({ enableTypes: ['text'] }));
app.use(router.routes());

console.log(`Starting server on localhost:${port}...`);
app.listen(port);
