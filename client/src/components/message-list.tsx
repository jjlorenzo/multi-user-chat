import type { IPublishPacket } from "mqtt-packet"
import { useContext, useEffect, useState } from "preact/hooks"
import { Server } from "../context"
import MQTTPattern from "mqtt-pattern"

export function MessageList() {
  const [messages, messagesSet] = useState<any[]>([])
  const server = useContext(Server)

  function areFromSameDay(d1: Date, d2: Date) {
    return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear()
  }

  useEffect(() => {
    if (server.client) {
      server.client.on("message", function (_, __, packet: IPublishPacket) {
        if (MQTTPattern.matches(server.topic, packet.topic)) {
          const payload = JSON.parse(packet.payload.toString())
          const date = new Date(payload.date)
          messagesSet(messages => {
            let nday: null | boolean = null
            if (import.meta.env.DEV) {
              nday = payload.text?.toLowerCase() === "good morning"
            }
            if (!nday) {
              if (messages.length > 0) {
                nday = !areFromSameDay(date, messages[messages.length - 1].date)
              } else {
                nday = true
              }
            }
            if ("kind" in payload) {
              if (payload.kind === "EHLO") {
                return messages.concat({
                  id: packet.messageId,
                  nday,
                  date,
                  kind: payload.kind,
                  data: payload.data.map((message: any) => ({ ...message, date: new Date(message.date) })),
                })
              } else if (payload.kind === "STATUS") {
                return messages.concat({
                  id: packet.messageId,
                  nday,
                  date,
                  kind: payload.kind,
                  user: payload.user,
                  text: payload.text,
                })
              } else {
                return messages
              }
            }
            return messages.concat({
              id: packet.messageId,
              nday,
              date,
              user: payload.user,
              text: payload.text,
            })
          })
        }
      })
      server.client.subscribe(server.topic, { qos: 2 })
    }
    return () => {
      if (server.client) {
        server.client.unsubscribe(server.topic)
      }
    }
  }, [])

  return (
    <ul class="list-group list-group-flush flush-none overflow-scroll flex-grow-1">
      {messages.map((message, idx) => (
        <MessageItem key={`${idx}-${message.id}`} message={message}></MessageItem>
      ))}
    </ul>
  )
}

function MessageItem({ message }: { message: any }) {
  const result: any = []
  if (message.kind === "EHLO") {
    result.push(
      <li class="list-group-item d-flex align-items-top">
        <div class="card text-dark shadow-sm w-100">
          <ul class="list-group list-group-flush flush-none">
            {message.data.map((message: any) => (
              <li class="list-group-item bg-light">
                <small class="aps-2">
                  <span class="text-nowrap text-secondary pe-1">
                    {message.date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                  </span>
                  <strong class="pe-1">{message.user}</strong>
                  <span class="text-muted">{message.text}</span>
                </small>
              </li>
            ))}
          </ul>
        </div>
      </li>,
    )
    if (message.nday) {
      result.push(
        <li class="list-group-item day-separator">
          <small class="position-relative border rounded-pill p-2 bg-light">{message.date.toDateString()}</small>
        </li>,
      )
    }
  } else {
    if (message.nday) {
      result.push(
        <li class="list-group-item day-separator">
          <small class="position-relative border rounded-pill p-2 bg-light">{message.date.toDateString()}</small>
        </li>,
      )
    }
    if (message.kind === "STATUS") {
      result.push(
        <li class="list-group-item d-flex align-items-top">
          {message.text == "online" && (
            <small class="text-primary">
              Connected <strong>{message.user}</strong>
            </small>
          )}
          {message.text == "offline" && (
            <small class="text-danger">
              Disconnected <strong>{message.user}</strong>
            </small>
          )}
        </li>,
      )
    }
    if ("kind" in message === false) {
      result.push(
        <li class="list-group-item d-flex align-items-top">
          <small class="text-nowrap text-muted pe-1">
            {message.date.toLocaleTimeString([], { timeStyle: "short" })}
          </small>
          <small class="ps-2">
            <strong class="ms-2-neg pe-1">{message.user}</strong>
            <span class="text-muted">{message.text}</span>
          </small>
        </li>,
      )
    }
  }
  return result
}
