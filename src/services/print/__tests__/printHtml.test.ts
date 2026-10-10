const mockModule: { printHtml: jest.Mock } | null = {
  printHtml: jest.fn(() => Promise.resolve()),
};
let mockAvailable = true;
jest.mock('n1-print', () => ({
  get N1Print() {
    return mockAvailable ? mockModule : null;
  },
}));

import { printHtml } from '../printHtml';

beforeEach(() => {
  mockAvailable = true;
  mockModule!.printHtml.mockClear();
});

test('hands the page to the native print module', async () => {
  await expect(printHtml('<p>Hi</p>', 'Job')).resolves.toBe(true);
  expect(mockModule!.printHtml).toHaveBeenCalledWith('<p>Hi</p>', 'Job');
});

test('is false in a build without the module', async () => {
  mockAvailable = false;
  await expect(printHtml('<p>Hi</p>', 'Job')).resolves.toBe(false);
});

test('passes on a failed print', async () => {
  mockModule!.printHtml.mockImplementationOnce(() =>
    Promise.reject(new Error('E_PRINT')),
  );
  await expect(printHtml('<p>Hi</p>', 'Job')).rejects.toThrow('E_PRINT');
});
