/* eslint-disable @typescript-eslint/no-explicit-any */

export abstract class Singleton {
  private static instances: Map<new (...args: any[]) => any, any> = new Map();
  private static allowInstantiation: WeakMap<Function, boolean> = new WeakMap();

  protected constructor() {
    if (!Singleton.allowInstantiation.get(this.constructor)) {
      throw new Error(`Cannot instantiate ${this.constructor.name} directly! Use getInstance() instead.`);
    }
  }

  static getInstance<T extends Singleton, A extends any[]>(this: new (...args: A) => T, ...args: A): T;
  static getInstance<T extends Singleton, A extends any[]>(this: new (...args: A) => T): T;
  static getInstance<T extends Singleton, A extends any[]>(this: new (...args: A) => T, ...args: A): T {
    if (!Singleton.instances.has(this)) {
      if (this.length > 0 && args.length === 0) {
        throw new Error(`Cannot instantiate ${this.name} without arguments! You must provide arguments to getInstance()!`);
      }
      Singleton.allowInstantiation.set(this, true);
      Singleton.instances.set(this, new this(...args));
      Singleton.allowInstantiation.set(this, false);
    }
    return Singleton.instances.get(this)!;
  }
}
