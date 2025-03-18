import { jest } from "@jest/globals";

export class mockRedis {
  static xRead = jest.fn<() => Promise<any>>();
  static commandOptions = jest.fn();
}
