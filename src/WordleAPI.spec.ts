import { GameStatus, WordleAPI } from './WordleAPI';

// Low DB Sync mock class.
class MockLowSync {
  data: any = {};

  constructor(adapter: any, defaultData: any) {
    this.data = defaultData;
  }

  write(): any {}

  read(): any {}
}

// Initialize Mocks
jest.mock('lowdb', () => ({
  LowSync: jest.fn().mockImplementation(() => new MockLowSync(null, { games: [], guesses: [] })),
}));

jest.mock('lowdb/node', () => ({
  JSONFileSync: jest.fn(),
}));

jest.mock('fs', () => ({
  readFileSync: () => 'wordl',
}));

// Test Data.
const testMatches = [
  {
    letter: 'w',
    matchType: 'correct',
  },
  {
    letter: 'o',
    matchType: 'correct',
  },
  {
    letter: 'r',
    matchType: 'correct',
  },
  {
    letter: 'd',
    matchType: 'correct',
  },
  {
    letter: 'l',
    matchType: 'correct',
  },
];

const wordle = new WordleAPI({
  dbFile: 'wordle-test-db.json',
  wordFile: 'words.txt',
});

describe('WordleAPI: Game Create/List', () => {
  it('should create a new game', () => {
    const game = wordle.createGame();
    expect(game.id).toBe(1);
    expect(game.status).toBe(GameStatus.Started);
  });

  it('should create a second game', () => {
    const game = wordle.createGame();
    expect(game.id).toBe(2);
    expect(game.status).toBe(GameStatus.Started);
  });

  it('should get all games', () => {
    const games = wordle.getCleanGames();
    expect(games.length).toBe(2);
  });

  it('should get one game', () => {
    const game = wordle.getGame(2);
    expect(game?.id).toBe(2);
  });
});

describe('WordleAPI: Guesses Create/List', () => {
  const game = {
    id: 1,
    word: wordle.word,
    status: GameStatus.Started,
  };

  it('should create a new guess', () => {
    const guess = wordle.addGuess(game, 'testr');
    expect(game.id).toBe(1);
    expect(guess.id).toBe(1);
  });

  it('should create 4 more guesses', () => {
    let guess = wordle.addGuess(game, 'testr');
    expect(guess.id).toBe(2);

    guess = wordle.addGuess(game, 'testr');
    expect(guess.id).toBe(3);

    guess = wordle.addGuess(game, 'testr');
    expect(guess.id).toBe(4);

    guess = wordle.addGuess(game, 'testr');
    expect(guess.id).toBe(5);
  });

  it('should create a fully correct guess', () => {
    const guess = wordle.addGuess(game, 'wordl');
    expect(guess.id).toBe(6);

    expect(guess.matches).toEqual(testMatches);
  });

  it('should list all guesses for the finished game', () => {
    const guesses = wordle.getGuesses(1);
    expect(guesses.length).toEqual(6);
  });

  it('should show no guesses for the new game', () => {
    const guesses = wordle.getGuesses(2);
    expect(guesses.length).toEqual(0);
  });
});

describe('WordleAPI: Game Ending', () => {
  it('should have ended the game after 6 guesses', () => {
    expect(wordle.getGame(1)?.status).toEqual(GameStatus.Ended);
  });

  it('should have the ended game reveal its word', () => {
    const game = wordle.getGame(1);
    expect.assertions(1);

    if (game !== undefined) {
      const cleanGame = wordle.getCleanGame(game);
      expect(cleanGame).toEqual(game);
    }
  });
});
