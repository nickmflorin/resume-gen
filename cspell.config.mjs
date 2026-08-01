export default {
  version: '0.2',
  language: 'en',
  dictionaryDefinitions: [
    {
      name: 'project-words',
      path: './dictionary.txt',
      addWords: true,
    },
  ],
  dictionaries: ['project-words'],
  ignorePaths: [
    'node_modules/**',
    'build/**',
    'public/assets/fonts/**',
    'package-lock.json',
    // A frozen snapshot; it is a record, not code we maintain.
    'content/reference/**',
  ],
};
