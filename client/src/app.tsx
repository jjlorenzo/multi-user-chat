import { render } from "preact"
import { useContext, useState } from "preact/hooks"
import "./app.css"
import { ChatRoom, LoginForm } from "./components"
import { Server } from "./context"

function App() {
  const [server, serverSet] = useState(useContext(Server))

  function onLoginFormSuccess({ client }: { client: any }) {
    serverSet({ ...server, client })
  }

  if (server.client) {
    return (
      <Server.Provider value={server}>
        <ChatRoom />
      </Server.Provider>
    )
  }
  return <LoginForm onSuccess={onLoginFormSuccess} />
}

if (import.meta.env.DEV) {
  import("preact/debug").then(() => render(<App />, document.getElementById("app")!))
} else {
  render(<App />, document.getElementById("app")!)
}
