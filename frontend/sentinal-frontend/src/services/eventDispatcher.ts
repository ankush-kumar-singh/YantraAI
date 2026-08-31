/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ServerEvent {
  type: string;
  session_id?: string;
  seq?: number;
  timestamp?: string;
  payload?: any;
}

export type EventCallback = (event: ServerEvent) => void;

class EventDispatcher {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  public addEventListener(type: string, callback: EventCallback): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);
  }

  public removeEventListener(type: string, callback: EventCallback): void {
    const set = this.listeners.get(type);
    if (set) {
      set.delete(callback);
    }
  }

  public dispatch(event: ServerEvent): void {
    // Dispatch to specific event type listeners
    const typeSet = this.listeners.get(event.type);
    if (typeSet) {
      typeSet.forEach((cb) => {
        try {
          cb(event);
        } catch (err) {
          console.error(`Error in event listener for ${event.type}:`, err);
        }
      });
    }

    // Dispatch to wildcard listeners
    const wildcardSet = this.listeners.get('*');
    if (wildcardSet) {
      wildcardSet.forEach((cb) => {
        try {
          cb(event);
        } catch (err) {
          console.error(`Error in wildcard event listener:`, err);
        }
      });
    }
  }
}

export const eventDispatcherInstance = new EventDispatcher();
export const eventDispatcher = (event: ServerEvent): void => {
  eventDispatcherInstance.dispatch(event);
};
