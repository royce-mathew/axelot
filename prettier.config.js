// @ts-check

/** @type {import("prettier").Config} */
module.exports = {
  endOfLine: 'lf',
  semi: false,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: 'es5',
  plugins: ["@prettier/plugin-oxc", "@ianvs/prettier-plugin-sort-imports"],
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
  importOrder: [
    '^(react/(.*)$)|^(react$)',
    '^(next/(.*)$)|^(next$)',
    '<THIRD_PARTY_MODULES>',
    '^types$',
    '^@/types/(.*)$',
    '^@/config/(.*)$',
    '^@/lib/(.*)$',
    '^@/hooks/(.*)$',
    '^@/components/(.*)$',
    '^@/registry/(.*)$',
    '^@/styles/(.*)$',
    '^@/app/(.*)$',
    '^[./]'
  ],
}
