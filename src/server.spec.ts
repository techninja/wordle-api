import './mocks';

import request from 'supertest';

import { app } from './app';

const req = request(app.callback());

describe('WordleAPI Server: Games List/Create', () => {
  test('Create new game', async () => {
    const response = await req.post('/games');
    expect(response.status).toBe(201);
    expect(response.text).toMatchSnapshot();
  });

  test('Create second new game', async () => {
    const response = await req.post('/games');
    expect(response.status).toBe(201);
    expect(response.text).toMatchSnapshot();
  });

  test('List new games', async () => {
    const response = await req.get('/games');
    expect(response.status).toBe(200);
    expect(response.text).toMatchSnapshot();
  });

  test('View game 1', async () => {
    const response = await req.get('/games/1');
    expect(response.status).toBe(200);
    expect(response.text).toMatchSnapshot();
  });

  test('View game 2', async () => {
    const response = await req.get('/games/2');
    expect(response.status).toBe(200);
    expect(response.text).toMatchSnapshot();
  });

  test('No game 3', async () => {
    const response = await req.get('/games/3');
    expect(response.status).toBe(404);
    expect(response.text).toMatchSnapshot();
  });
});

describe('WordleAPI Server: Guesses List/Create', () => {
  test('Create new guess', async () => {
    const response = await req.post('/games/1/guesses').send('testr').set('Content-Type', 'text/plain');
    expect(response.status).toBe(201);
    expect(response.text).toMatchSnapshot();
  });

  test('Create 4 more guesses', async () => {
    let response = await req.post('/games/1/guesses').send('testr').set('Content-Type', 'text/plain');
    expect(response.status).toBe(201);
    expect(response.text).toMatchSnapshot();

    response = await req.post('/games/1/guesses').send('words').set('Content-Type', 'text/plain');
    expect(response.status).toBe(201);
    expect(response.text).toMatchSnapshot();

    response = await req.post('/games/1/guesses').send('fordl').set('Content-Type', 'text/plain');
    expect(response.status).toBe(201);
    expect(response.text).toMatchSnapshot();

    response = await req.post('/games/1/guesses').send('testr').set('Content-Type', 'text/plain');
    expect(response.status).toBe(201);
    expect(response.text).toMatchSnapshot();
  });

  test('Create last fully correct guess', async () => {
    const response = await req.post('/games/1/guesses').send('wordl').set('Content-Type', 'text/plain');
    expect(response.status).toBe(201);
    expect(response.text).toMatchSnapshot();
  });

  test('Fail to create a 7th guess', async () => {
    const response = await req.post('/games/1/guesses').send('fails').set('Content-Type', 'text/plain');
    expect(response.status).toBe(422);
    expect(response.text).toMatchSnapshot();
  });

  test('View All Guesses', async () => {
    const response = await req.get('/games/1/guesses');
    expect(response.status).toBe(200);
    expect(response.text).toMatchSnapshot();
  });

  test('See no Guesses for second game', async () => {
    const response = await req.get('/games/2/guesses');
    expect(response.status).toBe(200);
    expect(response.text).toMatchSnapshot();
  });
});
