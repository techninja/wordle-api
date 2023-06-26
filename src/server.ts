import { app, wordle } from './app.js';

const port = process.env.PORT ?? 3000;
console.log(`Starting server on localhost:${port}...`);
app.listen(port);

console.log('Welcome to the Wordle API server!');
console.log(`Today's word is "${wordle.word}", shhhh!`);
