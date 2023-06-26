// Low DB Sync mock class.
export class MockLowSync {
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
