## Deployment/Test Instructions
``` sh
docker-compose up
```

You can access the chat UI at http://0.0.0.0:5000/. Feel free to open that url in several tabs, so you can emulate multiple clients/users.

## Implementation Details

### Topics

#### 1. `chat-room/+name` the main topic where:

- Clients:
  - PUBLISH messages to others
  - RECEIVE messages from others
  - RECEIVE extended hello (EHLO)
  - RECEIVE which user connect/disconnect from the chatroom
  
- Broker:

  - authorize PUBLISH only to this topic, as a side effect, if the package is authorized, its payload gets transformed from a simple text to an object that contains {date, text, user}
  - store each message from clients (used later for EHLO)
  - PUBLISH the EHLO to new clients
  - PUBLISH client connect/disconnect events

#### 2. `chat-room/+name/status` a secondary topic where:

- Clients:

  - RECEIVE the online status of each user in the room

- Broker:

  - PUBLISH the online status of each user (in the room) when it changes

#### 3. `$SYS/+/new/subscribes` and `$SYS/+/new/unsubscribes` system topic where:

- Broker:
  - SUBSCRIBE to RECEIVE the online status of users and notify to the subscribers

### Broker

#### Handlers

* [authorizePublish](https://github.com/moscajs/aedes/blob/master/docs/Aedes.md#handler-authorizepublish-client-packet-callback) allows PUBLISH if topic is `chat-room/+`

  Side-effects

  * Overwrites `packet.payload` from `text` to `{date, text, user}`
  * Store payload in `msglog` queue

* [authorizeSubscribe](https://github.com/moscajs/aedes/blob/master/docs/Aedes.md#handler-authorizesubscribe-client-subscription-callback) allows SUBSCRIBE if topic match one of:

  * `chat-room/+`
  * `chat-room/+/+`

#### Event Listeners

- [subscribe](https://github.com/moscajs/aedes/blob/master/docs/Aedes.md#event-subscribe) PUBLISH to client the `EHLO`message if **is the first time the client subscribe to this topic and there are previous messages**.
  - `EHLO` payload is built from `msglog[topic]`

#### Subscriptions

- `$SYS/+/new/subscribes` Keep track of **subscribed** client (using `status` store) and notify subscribers

- `$SYS/+/new/unsubscribes` Keep track of **unsubscribed** client (using `status` store) and notify subscribers

### Clients

#### MessageForm

- PUBLISH to `chat-room/+name`

#### MessageList

- SUBSCRIBE to `chat-room/+name`

#### UserList

- SUBSCRIBE to `chat-room/+name/status`

## Improvements for the future?

Reusing the main topic for the **client messages** and **broker special messages resulting from an event** is probably not a good idea. Using another subtopic for the later (similarly to what we do with `chat-room/+name/status`) is a good idea, so the client can decide what to receive. To be honest, I'm running out of time but the changes are simpler:

- Client **MessageList** component:
  - add subscribe to that new topic, 
  - extract the logic from the existing handler
- Broker **$SYS/+/new/subscribes** and **$SYS/+/new/unsubscribes** subscriptions:
  - PUBLISH to this new topic the online/offline message

Investigate if we are overusing MQTT **qos=2** since problably the user messages are the only ones that are critical

Change the connect for reuse session **clean=false** in the client

Complete support for authentication since we are not inspired by **4chan**

Use a persistant storage and mqemitter

Init the broker inside a cluster

