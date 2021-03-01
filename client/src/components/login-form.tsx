import { connect } from "mqtt"
import { useContext, useEffect, useState } from "preact/hooks"
import { Server } from "../context"

export function LoginForm({ onSuccess }: { onSuccess: any }) {
  const [errormsg, errormsgSet] = useState("")
  const [loading, loadingSet] = useState(false)
  const [username, usernameSet] = useState(sessionStorage.getItem("user.username") || "")
  const [autoConnect, autoConnectSet] = useState(!!username)
  const server = useContext(Server)

  useEffect(() => {
    if (autoConnect) {
      const client = connect(server.url, {
        clientId: username,
        username,
        clean: true,
      })
      client.on("error", () => {
        autoConnectSet(false)
        client.end()
      })
      client.once("connect", () => {
        onSuccess({ client: client })
      })
    }
  }, [])

  function usernameInput(event: any) {
    usernameSet(event.target.value)
  }

  function submit(event: any) {
    event.preventDefault()
    errormsgSet("")
    loadingSet(true)
    const client = connect(server.url, {
      clientId: username,
      username,
      clean: true,
    })
    client.once("error", (error: any) => {
      loadingSet(false)
      errormsgSet(error.message)
      client.end()
    })
    client.once("connect", () => {
      loadingSet(false)
      sessionStorage.setItem("user.username", username)
      onSuccess({ client })
    })
  }

  if (autoConnect) {
    return (
      <div class="d-flex flex-column align-items-center justify-content-center h-100">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }
  return (
    <div class="d-flex flex-column align-items-center">
      <div class="card shadow-sm mt-5">
        <form class="card-body min-w-300px" onSubmit={submit}>
          <h3 class="mb-3 text-center">Please enter</h3>
          <div class="form-text mb-3 text-center">
            Using any <code>nickname</code>
          </div>
          <div class="input-group-vertical mb-3">
            <label for="username" class="visually-hidden">
              Nickname
            </label>
            <input
              type="text"
              class="form-control"
              id="username"
              placeholder="Nickname"
              required
              autofocus
              autocorrect="off"
              autocapitalize="none"
              value={username}
              onInput={usernameInput}
            />
            {errormsg && <div class="invalid-feedback text-center">{errormsg}</div>}
          </div>
          <div class="d-flex justify-content-center">
            <button class="btn btn-primary w-75" type="submit">
              {loading ? (
                <span class="spinner-border spinner-border-sm">
                  <span class="visually-hidden">Start...</span>
                </span>
              ) : (
                "Start"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
