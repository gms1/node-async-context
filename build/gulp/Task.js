'use strict';
class Task {
  constructor(name, deps) {
    this.name = name;
    this._deps = new Set();
    if (deps) {
      this.addDeps(deps);
    }
  }
  addDeps(deps) {
    if (Array.isArray(deps)) {
      deps.forEach((dep) => this._deps.add(dep));
    } else {
      this._deps.add(deps);
    }
  }
  get deps() {
    return Array.from(this._deps);
  }
}
exports.Task = Task;
