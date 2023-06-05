export interface ChangeEvent<T> {
  oldValue: T;
  value: T;
}

export type ErrorEvent<T extends Error> = T;

export type StringKeyEvent = Record<string, any>;

export type EventHandler<T = any> = (
  params: T
) => null | undefined | void | { stopPropagation: boolean };

type EventMeta = {
  once?: boolean;
};

/**
 * Where E for the events that can be emitted
 * and L for the events that can be subscribed.
 */
class EventEmitter<E extends StringKeyEvent, L extends StringKeyEvent> {
  private events: Partial<
    Record<
      keyof L,
      Partial<Record<number, { meta?: EventMeta; handler: EventHandler }[]>>
    >
  > = {};
  private bridges: EventEmitter<any, any>[] = [];

  once<K extends keyof L>(event: K, handler: EventHandler<L[K]>, priority = 0) {
    this.on(event, handler, priority, true);
  }

  on<K extends keyof L>(
    event: K,
    handler: EventHandler<L[K]>,
    priority = 0,
    once = false
  ): () => void {
    const events = this.events[event];
    const eventPriority = events?.[priority];
    if (!events) this.events[event] = {};
    if (!eventPriority) this.events[event]![priority] = [];

    this.events[event]?.[priority]?.push({ handler, meta: { once } });

    return () => {
      this.events[event]![priority] = this.events[event]![priority]!.filter(
        (listener) => listener.handler !== handler
      );
      // Delete priority if empty
      if (this.events[event]![priority]?.length === 0) {
        delete this.events[event]![priority];
      }
    };
  }

  emit<K extends keyof E>(event: K, params?: E[K]): void {
    const eventName = event as keyof L;
    const firedOnceListeners: Partial<
      Record<number, { meta?: EventMeta; handler: EventHandler }[]>
    > = {};

    const eventPriorities = Object.keys(this.events[eventName] || {})
      .map((key) => Number(key))
      .sort((a, b) => b - a);

    let stopPropagation = false;

    for (const priority of eventPriorities) {
      const listeners = this.events[eventName]?.[priority];
      if (!listeners) continue;

      for (const listener of listeners) {
        const result = listener.handler(params);
        if (listener.meta?.once) {
          if (!firedOnceListeners[priority]) firedOnceListeners[priority] = [];
          firedOnceListeners[priority]!.push(listener);
        }
        // If stopPropagation is true, break the loop and the outer loop as well
        if (result && result.stopPropagation) {
          stopPropagation = true;
          break;
        }
      }
      if (stopPropagation) break;
    }

    // Remove once listeners
    for (const priority of Object.keys(firedOnceListeners)) {
      for (const listener of firedOnceListeners[Number(priority)]!) {
        this.off(eventName, listener.handler, Number(priority));
      }
    }

    if (!stopPropagation) {
      this.bridges.forEach((eventbus) => eventbus.emit(event, params));
    }
  }

  off<K extends keyof L>(
    event: K,
    handler: (params: L[K]) => any,
    priority = 0
  ) {
    if (!this.events[event]) return;
    if (!this.events[event]![priority]) return;

    this.events[event]![priority] = this.events[event]![priority]!.filter(
      (listener) => listener.handler !== handler
    );
  }

  bridgeEmit(eventBus: EventEmitter<any, any>) {
    this.bridges.push(eventBus);
  }
}

export { EventEmitter };
