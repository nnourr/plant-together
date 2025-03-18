import { jest } from "@jest/globals";

export class mockRedis {
  private static store: Record<string, any[]> = {};

  static flushAll = jest.fn(() => {
    for (const key in this.store) {
      delete this.store[key];
    }
    return Promise.resolve();
  });

  static xAdd = jest.fn((key: string, id: string, payload: any) => {
    if (!this.store[key]) {
      this.store[key] = [];
    }
    // Use a fixed id for simplicity.
    const entry = { id: "1-0", message: payload };
    this.store[key].push(entry);
    return Promise.resolve("1-0");
  });

  static xRead = jest.fn(
    (options: any, { key, id }: { key: string; id: string }) => {
      if (this.store[key] && this.store[key].length > 0) {
        return Promise.resolve([
          {
            name: Buffer.from(key),
            messages: this.store[key],
          },
        ]);
      }
      return Promise.resolve(null);
    }
  );

  static commandOptions = jest.fn((opts: any) => opts);
}
