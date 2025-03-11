module.exports = {
  root: true, // プロジェクトのルートであることを指定
  extends: [
    'eslint:recommended', // ESLintの推奨ルール
    'plugin:@typescript-eslint/recommended', // TypeScript推奨ルール
    'plugin:react/recommended', // React推奨ルール
    'plugin:react-native/all', // React Native全ルール
    'plugin:prettier/recommended', // Prettier連携
  ],
  parser: '@typescript-eslint/parser', // TypeScriptパーサーの指定
  plugins: [
    '@typescript-eslint', // TypeScriptプラグイン
    'react', // Reactプラグイン
    'react-native', // React Nativeプラグイン
    'prettier', // Prettierプラグイン
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true, // JSXのサポート
    },
    ecmaVersion: 2021, // ECMAScriptバージョン
    sourceType: 'module', // ESモジュールを使用
  },
  env: {
    'react-native/react-native': true, // React Native環境
  },
  rules: {
    // TypeScript関連
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }], // 未使用変数の警告（_で始まる引数は無視）
    '@typescript-eslint/explicit-function-return-type': 'off', // 関数の戻り値の型指定を必須にしない
    '@typescript-eslint/no-explicit-any': 'warn', // any型の使用を警告

    // React関連
    'react/prop-types': 'off', // TypeScriptを使用する場合は不要
    'react/react-in-jsx-scope': 'off', // React 17以降は不要
    'react/display-name': 'off', // displayName不要
    'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }], // JSX中の不要な波括弧を禁止

    // React Native関連
    'react-native/no-inline-styles': 'warn', // インラインスタイルを警告
    'react-native/no-raw-text': ['error', { skip: ['Text'] }], // Text以外のコンポーネントでの生テキスト使用を禁止
    'react-native/no-unused-styles': 'error', // 未使用のスタイルを禁止
    'react-native/split-platform-components': 'warn', // プラットフォーム固有コンポーネントの分割を推奨

    // Prettier関連
    'prettier/prettier': ['error', {}, { usePrettierrc: true }], // Prettierのルールを適用

    // その他
    'no-console': 'warn', // console.*の使用を警告
    'no-debugger': 'error', // debuggerの使用を禁止
  },
  settings: {
    react: {
      version: 'detect', // Reactバージョンの自動検出
    },
  },
};
