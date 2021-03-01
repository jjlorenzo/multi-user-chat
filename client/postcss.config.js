const plugins = {
  "postcss-nesting": {},
}

if (process.env.NODE_ENV === "production") {
  plugins["@fullhuman/postcss-purgecss"] = {
    content: ["./index.html", "./src/**/*.tsx"],
  }
}

module.exports = {
  plugins,
}
