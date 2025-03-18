import { jest } from "@jest/globals";

export class mockRedis {
  private static store: Record<string, any[]> = {};

  static flushAll = jest.fn();

  static xAdd = jest.fn();

  static xRead = jest.fn();

  static commandOptions = jest.fn();
}
