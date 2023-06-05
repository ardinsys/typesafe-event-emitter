import { EventEmitter } from ".";
import { beforeEach, describe, expect, it } from "vitest";

type EventType = {
  test: string;
};

describe("Event emitter", () => {
  let eventEmitter = new EventEmitter<EventType, EventType>();

  beforeEach(() => {
    eventEmitter = new EventEmitter<EventType, EventType>();
  });

  it('should invoke all registered "on" listeners if stop propgation does not present', () => {
    let invokeCount = 0;

    eventEmitter.on("test", () => {
      invokeCount++;
    });
    eventEmitter.on("test", () => {
      invokeCount++;
    });

    eventEmitter.emit("test", "test message");
    expect(invokeCount).toBe(2);
    eventEmitter.emit("test", "test message");
    expect(invokeCount).toBe(4);
  });

  it('should invoke all registered "once" listeners if stop propgation does not present', () => {
    let invokeCount = 0;

    eventEmitter.once("test", () => {
      invokeCount++;
    });
    eventEmitter.once("test", () => {
      invokeCount++;
    });

    eventEmitter.emit("test", "test message");

    expect(invokeCount).toBe(2);
  });

  it("shouldn't delete \"once\" listeners which weren't invoked beacuse of stop propagation", () => {
    let invokeCount = 0;

    eventEmitter.once("test", () => {
      invokeCount++;
      return { stopPropagation: true };
    });
    eventEmitter.once("test", () => {
      invokeCount++;
    });

    eventEmitter.emit("test", "test message");
    expect(invokeCount).toBe(1);

    eventEmitter.emit("test", "test message");
    expect(invokeCount).toBe(2);
  });

  it('shouldn\'t invoke "once" listners after they are invoked once', () => {
    let invokeCount = 0;

    eventEmitter.once("test", () => {
      invokeCount++;
    });
    eventEmitter.once("test", () => {
      invokeCount++;
    });

    eventEmitter.emit("test", "test message");
    expect(invokeCount).toBe(2);
    eventEmitter.emit("test", "test message");
    expect(invokeCount).toBe(2);
  });

  it("should handle unsubsscribe via the returned function", () => {
    let invokeCount = 0;
    const unsub = eventEmitter.on("test", () => {
      invokeCount++;
    });

    eventEmitter.emit("test", "test message");
    expect(invokeCount).toBe(1);

    unsub();

    eventEmitter.emit("test", "test message");
    expect(invokeCount).toBe(1);
  });

  it('should handle unsubsscribe via the "off" method', () => {
    let invokeCount = 0;
    const listener = () => {
      invokeCount++;
    };

    eventEmitter.on("test", listener);

    eventEmitter.emit("test", "test message");
    expect(invokeCount).toBe(1);

    eventEmitter.off("test", listener);

    eventEmitter.emit("test", "test message");
    expect(invokeCount).toBe(1);
  });

  it('shouldn\'t invoke "on" listeners which were stopped by stop propagation', () => {
    let invokeCount = 0;

    eventEmitter.on("test", () => {
      invokeCount++;
      return { stopPropagation: true };
    });
    eventEmitter.on("test", () => {
      invokeCount++;
    });

    eventEmitter.emit("test", "test message");
    expect(invokeCount).toBe(1);

    eventEmitter.emit("test", "test message");
    expect(invokeCount).toBe(2);
  });

  it('should respect the priority of "on" listeners', () => {
    const invokeOrder: number[] = [];

    eventEmitter.on(
      "test",
      () => {
        invokeOrder.push(4);
      },
      4
    );
    eventEmitter.on(
      "test",
      () => {
        invokeOrder.push(3);
      },
      3
    );
    eventEmitter.on(
      "test",
      () => {
        invokeOrder.push(3);
      },
      3
    );
    eventEmitter.on(
      "test",
      () => {
        invokeOrder.push(2);
      },
      2
    );

    eventEmitter.emit("test", "test message");
    expect(invokeOrder).toStrictEqual([4, 3, 3, 2]);
  });
});
