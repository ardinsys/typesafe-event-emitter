export interface ChangeEvent<T> {
  oldValue: T;
  value: T;
}

export type ErrorEvent<T extends Error> = T;

export type StringKeyEvent = Record<string, any>;

export type EventHandler<T = any> = (
  params: T
) => null | undefined | void | { stopPropagation: boolean };

/**
 * Where E for the events that can be emitted
 * and L for the events that can be subscribed.
 */
class EventEmitter<E extends StringKeyEvent, L extends StringKeyEvent> {
  private events: Partial<Record<keyof L, EventHandler[]>>;
  private eventsOnce: Partial<Record<keyof L, EventHandler[]>>;
  private bridges: EventEmitter<any, any>[];

  constructor() {
    this.events = {};
    this.eventsOnce = {};
    this.bridges = [];
  }

  once<K extends keyof L>(event: K, handler: EventHandler<L[K]>) {
    if (!Array.isArray(this.eventsOnce[event])) {
      this.eventsOnce[event] = [];
    }
    this.eventsOnce[event]!.unshift(handler);
  }

  on<K extends keyof L>(event: K, handler: EventHandler<L[K]>): () => void {
    if (!Array.isArray(this.events[event])) {
      this.events[event] = [];
    }
    this.events[event]!.unshift(handler);
    return () => {
      this.events[event] = this.events[event]!.filter(
        (listener) => listener !== handler
      );
    };
  }

  emit<K extends keyof E>(event: K, params?: E[K]): void {
    const eventName = event as keyof L;
    const firedOnceListeners: EventHandler[] = [];
    for (const listener of this.eventsOnce[eventName] || []) {
      const result = listener(params);
      firedOnceListeners.push(listener);
      if (result && result.stopPropagation) break;
    }
    this.eventsOnce[eventName] = this.eventsOnce[eventName]?.filter(
      (listener) => !firedOnceListeners.includes(listener)
    );
    if (this.eventsOnce[eventName]?.length === 0) {
      delete this.eventsOnce[eventName];
    }

    for (const listener of this.events[eventName] || []) {
      const result = listener(params);
      if (result && result.stopPropagation) break;
    }
    this.bridges.forEach((eventbus) => eventbus.emit(event, params));
  }

  off<K extends keyof L>(event: K, handler: (params: L[K]) => any) {
    this.events[event] = this.events[event]?.filter(
      (listener) => listener !== handler
    );
  }

  bridgeEmit(eventBus: EventEmitter<any, any>) {
    this.bridges.push(eventBus);
  }
}

export { EventEmitter };
