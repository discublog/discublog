export default {
  '**/*.(j|t)s?(x)': [
    'pnpm run format',
    () => 'pnpm run ts:check',
    'pnpm run lint --',
  ],
}
