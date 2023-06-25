# Wordle Game API

A simple API interface written in the express based [KOA](https://github.com/koajs) for Node.js, to create a "Wordle" like game using a local wordlist and [LowDB](https://github.com/typicode/lowdb) JSON file database.

## Installation and running

With Node v18+ installed (and possibly some lower versions):

1. Clone the repository locally via

```
git clone https://github.com/techninja/wordle-api.git
```

2. Run `npm install` to get dependencies
3. Run `npm start` to start the server
4. Run `npm test` to run linting and automated tests

## Using the API Endpoints

- `GET /games`
  - Returns all active games and their state.
- `POST /games`
  - Creates a new game and returns current state.
  - No arguments/data required
- `GET /games/[id]`
  - Returns game state for a game ID.
- `POST /games/[id]/guesses`
  - Submit a new guess, returns mask of guess correctness.
  - POST body should be raw plaintext of the word guess
- `GET /games/[id]/guesses`
  - List all guesses for a game.
- `GET /games/[id]/guesses/[id]`
  - Get a single guess for a game.
