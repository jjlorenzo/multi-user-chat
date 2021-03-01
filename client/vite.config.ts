import { defineConfig } from "vite"
import preactRefresh from "@prefresh/vite"

// https://vitejs.dev/config/
export default defineConfig({
  esbuild: {
    jsxFactory: "h",
    jsxFragment: "Fragment",
    jsxInject: `import { h, Fragment } from "preact"`,
  },
  plugins: [preactRefresh()],
  resolve: {
    alias: {
      mqtt: "mqtt/dist/mqtt.min.js",
    },
  },
})
