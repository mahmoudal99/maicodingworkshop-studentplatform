export function hashSeed(input: string) {
  let hash = 2166136261;

  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

export function createSeededRandom(seed: string) {
  let state = hashSeed(seed) || 0x12345678;

  return () => {
    state = Math.imul(state, 1664525) + 1013904223;
    state >>>= 0;
    return state / 4294967296;
  };
}

export function shuffleWithSeed<T>(items: readonly T[], seed: string) {
  const next = [...items];
  const random = createSeededRandom(seed);

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}

export function sampleWithSeed<T>(items: readonly T[], count: number, seed: string) {
  return shuffleWithSeed(items, seed).slice(0, count);
}

export function pickWithSeed<T>(items: readonly T[], seed: string) {
  const random = createSeededRandom(seed);
  return items[Math.floor(random() * items.length)];
}
