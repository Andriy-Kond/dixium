module.exports = {
  devServer: {
    client: {
      overlay: {
        errors: true,
        warnings: false,
        runtimeErrors: false, // Вимкнути відображення runtime errors
      },
    },
  },
};
