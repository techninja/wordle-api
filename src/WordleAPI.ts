import { readFileSync } from 'fs';
import { LowSync } from 'lowdb';
import { JSONFileSync } from 'lowdb/node';

// Types
export enum GameStatus {
  Started = 'started',
  Ended = 'ended',
}

export enum MatchStatus {
  None = 'none',
  Partial = 'partial',
  Correct = 'correct',
}

export interface CleanGame {
  id: number;
  status: GameStatus;
}

export interface Game extends CleanGame {
  word: string;
}

export interface MatchSet {
  letter: string;
  matchType: MatchStatus;
}

export interface Guess {
  gameId: number;
  id: number;
  wordGuess: string;
  matches: MatchSet[];
}

interface DataSchema {
  games: Game[];
  guesses: Guess[];
}

interface WordleAPIConstructorArguments {
  dbFile: string;
  wordFile: string;
  wordLength?: number;
}

/**
 * Wordle Data Controller Class
 *
 * @export
 * @class WordleAPI
 */
export class WordleAPI {
  // List of words for the game.
  words: string[];

  // Current word for the game, random on init.
  word: string;

  // Expected word length.
  wordLength: number = 5;

  // Database operator.
  db: LowSync<DataSchema>;

  /**
   * Creates an instance of WordleAPI.
   *
   * @param {WordleAPIConstructorArguments} { dbFile, wordFile, wordLength }
   * @memberof WordleAPI
   */
  constructor({ dbFile, wordFile }: WordleAPIConstructorArguments) {
    // Initialize DB connection.
    const adapter = new JSONFileSync<DataSchema>(dbFile);
    const defaultData: DataSchema = { games: [], guesses: [] };
    this.db = new LowSync<DataSchema>(adapter, defaultData);
    this.db.read();

    // Get list of words.
    this.words = readFileSync(wordFile, 'utf-8').trim().split('\n');
    // Pick a random word.
    this.word = this.words[Math.floor(Math.random() * this.words.length)];
  }

  /**
   * Lookup a game by its ID.
   *
   * @param {(number | string)} findId
   *   Numeric ID of the game to find.
   *
   * @returns {(Game | undefined)}
   *   The matching game, or undefined if none found.
   *
   * @memberof WordleAPI
   */
  getGame(findId: number | string): Game | undefined {
    return this.db.data.games.find(({ id }) => id === parseInt(`${findId}`, 10));
  }

  /**
   * Get all guesses for a given game ID.
   *
   * @param {number} byGameId
   *   Game ID to match guesses on.
   *
   * @returns {Guess[]}
   *
   * @memberof WordleAPI
   */
  getGuesses(byGameId: number): Guess[] {
    return this.db.data.guesses?.filter(({ gameId }) => gameId === byGameId);
  }

  /**
   * Sanitize games to hide their words till they're done.
   *
   * @param {Game} g
   *   Game to clean.
   *
   * @returns {(Game | CleanGame)}
   *   Cleaned game, or regular game if it's ended.
   *
   * @memberof WordleAPI
   */
  getCleanGame(g: Game): Game | CleanGame {
    return g.status === GameStatus.Started ? { id: g.id, status: g.status } : g;
  }

  /**
   * Get a list of all games, optionally cleaned.
   *
   * @returns {(Game[] | CleanGame[])}
   *
   * @memberof WordleAPI
   */
  getCleanGames(): Game[] | CleanGame[] {
    return this.db.data.games.map(this.getCleanGame);
  }

  /**
   * Match each letter of a guessed word to the passed word.
   *
   * @param {string} word
   *   Word to check against.
   * @param {string} guess
   *   Guessed word to be checked.
   *
   * @returns {MatchSet[]}
   *   Array for every letter, with matching state.
   *
   * @memberof WordleAPI
   */
  getLetterWordMatches(word: string, guess: string): MatchSet[] {
    const matches: MatchSet[] = [];

    Array.from(guess).forEach((letter: any, i: number) => {
      // Assume no match or exists if included.
      const cMatch: MatchSet = {
        letter,
        matchType: word.includes(letter) ? MatchStatus.Partial : MatchStatus.None,
      };

      // Perfect match
      if (letter === word[i]) {
        cMatch.matchType = MatchStatus.Correct;
      }

      matches.push(cMatch);
    });

    return matches;
  }

  /**
   * Create a new game.
   *
   * @returns {CleanGame}
   * @memberof WordleAPI
   */
  createGame(): CleanGame {
    const newGame: Game = {
      word: this.word,
      id: this.db.data.games.length + 1,
      status: GameStatus.Started,
    };

    this.db.data.games.push(newGame);
    this.db.write();

    return this.getCleanGame(newGame);
  }

  /**
   * Update a given game with an entire entry.
   *
   * @param {Game} game
   *   The game data to be updated (matched by ID).
   *
   * @returns {Game}
   *
   * @memberof WordleAPI
   */
  updateGame(game: Game): Game {
    for (let index = 0; index < this.db.data.games.length; index++) {
      const g = this.db.data.games[index];

      if (g.id === game.id) {
        this.db.data.games[index] = game;
      }
    }
    this.db.write();
    return game;
  }

  /**
   * Add a new guess for a game.
   *
   * @param {Game} game
   *   The game object.
   * @param {string} testWord
   *   The word to be tested.
   *
   * @returns {Guess}
   *
   * @memberof WordleAPI
   */
  addGuess(game: Game, testWord: string): Guess {
    // Get all existing guesses for the game ID.
    const guesses = this.getGuesses(game.id);

    // Build the guess.
    const guess: Guess = {
      id: guesses.length + 1,
      gameId: game.id,
      wordGuess: testWord,
      matches: this.getLetterWordMatches(game.word, testWord),
    };

    this.db.data.guesses.push(guess);

    // Update database.
    this.db.write();

    // End the game once we hit 6 guesses.
    if (guesses.length >= 5) {
      this.updateGame({ ...game, status: GameStatus.Ended });
    }

    return guess;
  }
}
