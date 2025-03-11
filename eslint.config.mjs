// @ts-check

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

// TODO: use vue eslinter https://eslint.vuejs.org/user-guide
// TODO: setup eslint config prettier, to avoid both fighting for style https://eslint.vuejs.org/user-guide/#example-configuration-with-typescript-eslint-and-prettier
// TODO: use tseslint.configs.recommendedTypeChecked from https://typescript-eslint.io/getting-started/typed-linting/
export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended/*TypeChecked , {
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
}*/,
)
