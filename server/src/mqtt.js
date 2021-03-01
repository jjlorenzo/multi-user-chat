import aedes from "aedes"
import { createServer } from "aedes-server-factory"
import fs from "fs"
import MQTTPattern from "mqtt-pattern"
import { MessageLogStore, StatusStore } from "./utils.js"

const broker = aedes({ id: "aedes" })
const logger = new console.Console(
  process.env.NODE_ENV !== "production"
    ? {
        stderr: process.stderr,
        stdout: process.stdout,
        inspectOptions: {
          breakLength: process.stdout.columns,
        },
      }
    : {
        stderr: fs.createWriteStream("/dev/null"),
        stdout: fs.createWriteStream("/dev/null"),
      },
)
const msglog = MessageLogStore(process.env.NODE_ENV !== "production" ? 4 : 20)
const server = createServer(broker, { ws: true })
const status = StatusStore()

broker.authenticate = function (_client, _username, _password, callback) {
  callback(null, true)
}

broker.authorizePublish = function (client, packet, cb) {
  if (MQTTPattern.matches("chat-room/+", packet.topic)) {
    packet.payload = Buffer.from(JSON.stringify({ date: new Date(), user: client.id, text: packet.payload.toString() }))
    msglog[packet.topic].enqueue(packet.payload)
    cb(null)
  } else {
    cb(new Error(`Not authorized to publish to ${packet.topic}`))
  }
}

broker.authorizeSubscribe = function (_client, subscription, cb) {
  if (
    MQTTPattern.matches("chat-room/+", subscription.topic) ||
    MQTTPattern.matches("chat-room/+/+", subscription.topic)
  ) {
    cb(null, subscription)
  } else {
    cb(new Error(`Not authorized to subscribe to ${subscription.topic}`))
  }
}

broker.on("subscribe", (subscriptions, client) => {
  subscriptions.forEach(subscription => {
    const { topic } = subscription
    if (MQTTPattern.matches("chat-room/+", topic)) {
      if (client.id in status[topic] === false) {
        const msgs = [...msglog[topic].decoded()]
        if (msgs.length > 0) {
          client.publish(
            {
              topic,
              payload: Buffer.from(JSON.stringify({ date: new Date(), kind: "EHLO", data: msgs })),
              qos: 2,
            },
            function () {
              logger.log("-> EHLO client=%o msgs=%o", client.id, msgs)
            },
          )
        }
      }
    }
  })
})

broker.subscribe("$SYS/+/new/subscribes", function (packet, cb) {
  const { clientId, subs } = JSON.parse(packet.payload.toString())
  subs.forEach(({ topic }) => {
    if (MQTTPattern.matches("chat-room/+", topic)) {
      status[topic][clientId] = true
      broker.publish({
        topic,
        payload: Buffer.from(JSON.stringify({ date: new Date(), kind: "STATUS", user: clientId, text: "online" })),
        qos: 2,
      })
      broker.publish({ topic: `${topic}/status`, payload: Buffer.from(JSON.stringify(status[topic])), qos: 2 })
    }
  })
  cb()
})

broker.subscribe("$SYS/+/new/unsubscribes", function (packet, cb) {
  const { clientId, subs } = JSON.parse(packet.payload.toString())
  subs.forEach(topic => {
    if (MQTTPattern.matches("chat-room/+", topic)) {
      status[topic][clientId] = false
      broker.publish({
        topic,
        payload: Buffer.from(JSON.stringify({ date: new Date(), kind: "STATUS", user: clientId, text: "offline" })),
        qos: 2,
      })
      broker.publish({ topic: `${topic}/status`, payload: Buffer.from(JSON.stringify(status[topic])), qos: 2 })
    }
  })
  cb()
})

if (process.env.NODE_ENV !== "production") {
  // logger.clear()
  broker.on("client", function (client) {
    logger.debug("=> connected %o", { client: { id: client.id } })
  })
  broker.on("clientDisconnect", function (client) {
    logger.debug("=> disconnected %o", { client: { id: client.id } })
  })
  broker.on("clientError", function (client, err) {
    logger.error("=> error %o", { client: { id: client.id, message: err.message } })
  })
  broker.on("publish", function (packet, client) {
    logger.log("-> %s client=%o payload=%o", packet.topic, client?.id, packet.payload.toString())
  })
}

server.listen(9001, "0.0.0.0", function () {
  const { address, port } = this.address()
  logger.log("=> server/listen address=%o port=%o", address, port)
})
