import { EventEmitter } from 'events';

export class EventBus {
  private static instance: EventBus;
  private emitter: EventEmitter;

  private constructor() {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(50); 
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public publish(event: string, payload: any): void {
    console.log(`[EventBus] Publishing event "${event}":`, JSON.stringify(payload));
    this.emitter.emit(event, payload);
  }

  public subscribe(event: string, callback: (payload: any) => void): void {
    this.emitter.on(event, callback);
  }

  public unsubscribe(event: string, callback: (payload: any) => void): void {
    this.emitter.off(event, callback);
  }
}
