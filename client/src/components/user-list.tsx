import type { IPublishPacket } from "mqtt-packet"
import MQTTPattern from "mqtt-pattern"
import { useContext, useEffect, useState } from "preact/hooks"
import { Server } from "../context"

export function UserList() {
  const [users, usersSet] = useState<Record<string, boolean>>({})
  const server = useContext(Server)
  const clientId = server.client?.options.clientId

  useEffect(() => {
    if (server.client) {
      server.client.on("message", function (_1: any, _2: any, packet: IPublishPacket) {
        if (MQTTPattern.matches(`${server.topic}/status`, packet.topic)) {
          usersSet(JSON.parse(packet.payload.toString()))
        }
      })
      server.client.subscribe(`${server.topic}/status`, { qos: 2 })
    }
    return () => {
      if (server.client) {
        server.client.unsubscribe(`${server.topic}/status`)
      }
    }
  }, [])

  return (
    <ul class="list-group list-group-flush flush-none overflow-scroll flex-grow-1">
      {Object.entries(users)
        .sort()
        .map(([username, online]) => (
          <UserItem key={username} username={username} online={online} current={username === clientId}></UserItem>
        ))}
    </ul>
  )
}

function Status({ online }: { online: boolean }) {
  if (online == true) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        class="text-success pe-1"
        viewBox="0 0 16 16">
        <circle cx="8" cy="8" r="8" />
      </svg>
    )
  }
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      class="text-success pe-1"
      viewBox="0 0 16 16">
      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
    </svg>
  )
}

function UserItem({ username, online, current }: { username: string; online: boolean; current: boolean }) {
  return (
    <li class="list-group-item d-flex align-items-center">
      <Status online={online} />
      <small class={`text-truncate ${current && "fw-bold"}`}>{username}</small>
    </li>
  )
}
