module.exports = {
  presets: ["module:@react-native/babel-preset"],
  plugins: [
    [
      require.resolve("babel-plugin-module-resolver"),

      {
        cwd: "babelrc",
        extensions: [".ts", ".tsx", ".js", ".ios.js", ".android.js"],
        alias: {
          "@assets": "./assets",
          "@src": "./src",
          "@components": "./components",
        },
      },
    ],
  ],
  env: {
    production: {
      plugins: ["react-native-paper/babel"],
    },
  },
};
