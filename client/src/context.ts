import { createContext } from "preact"
import type { MqttClient } from "mqtt"

const chatroom = (import.meta.env.VITE_CHATROOM as string) || "default"

interface IServer {
  client?: MqttClient
  topic: string
  url: string
}

export const Server = createContext<IServer>({
  client: undefined,
  topic: `chat-room/${chatroom}`,
  url: `ws://${location.hostname}:9001`,
})
