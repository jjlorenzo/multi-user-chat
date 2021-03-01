import { useContext, useState } from "preact/hooks"
import { Server } from "../context"

export function MessageForm() {
  const [text, textSet] = useState(import.meta.env.DEV ? "development" : "")
  const server = useContext(Server)

  function onSubmit(event: any) {
    event.preventDefault()
    if (server.client) {
      server.client.publish(server.topic, text, { qos: 2 }, () => {
        if (import.meta.env.DEV) {
          textSet(text => `${text}+`)
        } else {
          textSet("")
        }
      })
    }
  }

  function textInput(event: any) {
    textSet(event.target.value)
  }

  return (
    <form class="border-top pt-2 px-2" onSubmit={onSubmit}>
      <div class="input-group">
        <input class="form-control border-primary" type="text" value={text} onInput={textInput} />
        <button class="btn btn-primary px-4" type="submit">
          Send
        </button>
      </div>
    </form>
  )
}
