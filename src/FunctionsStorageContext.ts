import React from "react";

export interface FunctionData {
  func: string;
  color: number;
}

export class FunctionsStorage {
  private _onSave?: (this: this, t: this) => void;
  private _onUpdate: ((this: this, t: this) => void)[] = [];
  readonly state: Record<string, FunctionData> = {};
  private _nextId = 0;

  triggerUpdate() {
    for (const cb of this._onUpdate) {
      cb.call(this, this);
    }
  }

  clear(subscriptions = true) {
    for (const id in this.state) {
      delete this.state[id];
    }
    this._nextId = 0;
    if (subscriptions) {
      this._onSave = undefined;
      this._onUpdate.length = 0;
    }
  }

  nextId() {
    return (this._nextId++).toString(16);
  }

  updateFunctionRecord(id: string, data: Partial<FunctionData>) {
    const r = this.state[id] || (this.state[id] = { func: "", color: 0 });
    if (data.func != null) {
      r.func = data.func;
    }
    if (data.color != null) {
      r.color = data.color;
    }
    this.triggerUpdate();
  }

  removeFunctionRecord(id: string) {
    delete this.state[id];
    this.triggerUpdate();
  }

  onUpdate(cb: (this: this, t: this) => void) {
    let index = this._onUpdate.length;
    this._onUpdate[index] = cb;
    return () => {
      if (this._onUpdate[index] !== cb) {
        index = this._onUpdate.indexOf(cb);
      }
      if (index >= 0) {
        this._onUpdate.splice(index, 1);
      }
    };
  }

  setSave(cb?: ((this: this, t: this) => void) | null) {
    this._onSave = cb || undefined;
  }

  trySave() {
    this._onSave?.(this);
  }
}

export const FunctionsStorageContext = React.createContext(new FunctionsStorage());
