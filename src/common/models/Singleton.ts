/* eslint-disable @typescript-eslint/no-explicit-any */

export abstract class Singleton {
  private static instances: Map<new (...args: any[]) => any, any> = new Map();
  private static allowInstatiation: boolean = false;

  protected constructor() {
    if (!Singleton.allowInstatiation) {
      throw new Error(`Cannot instantiate ${this.constructor.name} directly! Use getInstance() instead.`);
    }
  }

  static getInstance<T extends Singleton, A extends any[]>(this: new (...args: A) => T, ...args: A): T;
  static getInstance<T extends Singleton, A extends any[]>(this: new (...args: A) => T): T;
  static getInstance<T extends Singleton, A extends any[]>(this: new (...args: A) => T, ...args: A): T {
    if (!Singleton.instances.has(this)) {
      Singleton.allowInstatiation = true;
      if (!args || args.length === 0) {
        Singleton.instances.set(this, new this(...([] as any[] as A)));
      } else {
        Singleton.instances.set(this, new this(...args));
      }
      Singleton.allowInstatiation = false;
    }
    return Singleton.instances.get(this);
  }
}
