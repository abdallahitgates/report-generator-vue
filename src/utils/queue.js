/**
 * Runs async tasks at most `limit` at a time. A dashboard loads its widgets
 * through one, so twelve widgets do not hit the server's per-user limit at once.
 */
export function createQueue(limit = 3) {
  let running = 0;
  const waiting = [];

  function next() {
    if (running >= limit || waiting.length === 0) return;
    const { task, resolve, reject } = waiting.shift();
    running++;
    Promise.resolve()
      .then(task)
      .then(resolve, reject)
      .finally(() => {
        running--;
        next();
      });
  }

  return function run(task) {
    return new Promise((resolve, reject) => {
      waiting.push({ task, resolve, reject });
      next();
    });
  };
}
