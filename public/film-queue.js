// A shuffled round plays every film once. Round boundaries never repeat a film.
export function createFilmQueue(items, random = Math.random) {
  let remaining = [];
  let previous;
  return {
    next() {
      if (!items.length) return null;
      if (!remaining.length) {
        remaining = [...items];
        for (let i = remaining.length - 1; i > 0; i--) {
          const j = Math.floor(random() * (i + 1));
          [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
        }
        if (remaining.length > 1 && remaining[0] === previous) {
          [remaining[0], remaining[1]] = [remaining[1], remaining[0]];
        }
      }
      previous = remaining.shift();
      return previous;
    },
  };
}
