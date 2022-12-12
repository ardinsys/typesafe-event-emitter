# TypeSafe frontend Event emitter

## To create an emitter

Here we have 2 generic type for the emmiter. First one specifies wich events can be emitted and the second one specifies which events can be subscribed to. (Actually these are just type restrictions, if you want, you can subscribe to any string :))

Usually the more specific should extend the less specific one, beacuse you would only use 2 different types in bridge mode.

```ts
interface EventPlayload {
  test: string;
  someOtherProperty: number;
}

interface ListenEvent {
  eventName: EventPayload;
}

interface EmitEvent {
  eventName: EventPayload;
  otherEventName: EventPayload;
}

const emitter = new EventEmitter<EmitEvent, ListenEvent>();
```

## Subscribe to an event

```ts
emitter.on("eventName", (params) => {
  // here params are correctly inferred as string from the ListenEvent type.
  // Do something here
});
```

## Subscribe to an event only once

```ts
emitter.once("eventName", (params) => {
  // here params are correctly inferred as string from the ListenEvent type.
  // Do something here
});
```

## Unscubscribe

```ts
// Removes function by reference
emitter.off("eventName", listener);
```

```ts
// Every subscription returns a function which will remove the listener if you call it.
const unsubscribe = emitter.on("eventName", (params) => {
  // ...
});

unsubscribe();
```

## Emit an event

```ts
emitter.emit(
  "eventName",
  "this is the payload which is need to be the type of string as it is inferred from the type EmitEvent"
);
```

## Stop propagation

Listeners will be invoked in a reverse order, which means, that the last subscriber will be invoked first. This enables the term stop propagation to work. Meaning: if a handler says that we should stop, then the rest of the subscribers won't invoked.

Return this from a handler to break the invoke loop:

```ts
emitter.on("eventName", (params) => {
  return { stopProgation: true };
});
```

## Stop propagation for "once" events

Code wise, it's basically the same.

```ts
emitter.once("eventName", (params) => {
  return { stopProgation: true };
});
```

But keep in mind, if this stop results in other "once" listeners not being invoked, then those listeners won't be deleted until they invoked once eventually.

## Event emitter bridge

If you have some internal emitters which events need to be reemitted by an other emitter, the you can connect the two. Keep in mind, that this is a **one directional connection**.

```ts
// const emitter1 = emitter instance;
// const emitter2 = emitter instance;

emitter1.bridgeEmit(emitter2);
```

The above code means, that emitter 2 will re-emit emitter1 events in itself. Nothing more, nothing less.

If you try to outsmart the system by writing the same code in the other direction as well..., I wish you good luck :)
