// A transactional test double. Tests never connect to a real Firebase project.
export class MemoryDb {
  constructor() { this.records = new Map(); this.queue = Promise.resolve(); this.failWrites = false; }
  collection(name) {
    return {
      doc: id => {
        const path = `${name}/${id}`;
        return { path, id,
          get: async () => this.snapshot(path),
          set: async value => { if (this.failWrites) throw new Error('write failed'); this.records.set(path, structuredClone(value)); },
          update: async value => { if (this.failWrites) throw new Error('write failed'); this.records.set(path, { ...this.records.get(path), ...structuredClone(value) }); },
          delete: async () => this.records.delete(path),
        };
      },
      get: async () => ({ docs: [...this.records.keys()].filter(path => path.startsWith(name + '/')).map(path => this.snapshot(path)) }),
    };
  }
  snapshot(path) { const value = this.records.get(path); return { id: path.split('/')[1], exists: value !== undefined, data: () => structuredClone(value) }; }
  async runTransaction(work) {
    const previous = this.queue;
    let unlock;
    this.queue = new Promise(resolve => { unlock = resolve; });
    await previous;
    const staged = [];
    let writing = false;
    try {
      const result = await work({
        get: async ref => { if (writing) throw new Error('Firestore requires all reads before writes'); return this.snapshot(ref.path); },
        set: (ref, value) => { writing = true; staged.push([ref.path, structuredClone(value)]); },
      });
      if (this.failWrites) throw new Error('write failed');
      for (const [path, value] of staged) this.records.set(path, value);
      return result;
    } finally { unlock(); }
  }
}
