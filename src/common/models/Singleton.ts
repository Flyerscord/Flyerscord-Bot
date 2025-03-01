/* eslint-disable @typescript-eslint/no-explicit-any */
export abstract class Singleton<T> {
  private static instances = new Map<new (...args: any[]) => any, any>();

  protected constructor() {
    const subclass = this.constructor as new (...args: any[]) => T;
    if (Singleton.instances.has(subclass)) {
      throw new Error(`${subclass.name} is a singleton and can only be instantiated once.`);
    }
    Singleton.instances.set(subclass, this);
  }

  static getInstance<T extends Singleton<any>, A extends any[]>(this: new (...args: A) => T, ...args: A): T {
    if (!Singleton.instances.has(this)) {
      Singleton.instances.set(this, new this(...args));
    }
    return Singleton.instances.get(this) as T;
  }
}
