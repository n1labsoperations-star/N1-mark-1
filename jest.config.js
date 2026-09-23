module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['./jest.setup.js'],
  // Navigation and Redux packages ship ESM that Jest must transpile.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native[^/]*|@react-native(-community)?|@react-navigation|@reduxjs/toolkit|react-redux|immer|redux|redux-saga|@redux-saga|reselect)/)',
  ],
};
