class MessageQueue extends Array {
  constructor(max_length = 20) {
    super()
    this.max_length = max_length
  }

  enqueue(value) {
    if (this.length === this.max_length) {
      this.shift()
    }
    return this.push(value)
  }

  decoded() {
    return this.map(item => JSON.parse(item.toString()))
  }
}

export function MessageLogStore(max_length) {
  return new Proxy(
    {},
    {
      get: function (target, prop, receiver) {
        if (prop in target === false) {
          Reflect.set(target, prop, new MessageQueue(max_length), receiver)
        }
        return Reflect.get(target, prop, receiver)
      },
    },
  )
}

export function StatusStore() {
  return new Proxy(
    {},
    {
      get: function (target, prop, receiver) {
        if (prop in target === false) {
          Reflect.set(target, prop, {}, receiver)
        }
        return Reflect.get(target, prop, receiver)
      },
    },
  )
}
