import { test } from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { createFilmQueue } from './public/film-queue.js';
import { films } from './public/films.js';

test('ten distinct, complete film bundles exist locally', async () => {
  assert.equal(films.length, 10);
  for (const key of ['id', 'video', 'poster', 'credit']) assert.equal(new Set(films.map(f => f[key])).size, 10);
  for (const film of films) {
    await access(new URL('./public' + film.video, import.meta.url));
    await access(new URL('./public' + film.poster, import.meta.url));
    assert.ok(film.title && film.source.pid && film.differs.length);
  }
});
test('each round includes every film; no repeat at round boundaries', () => {
  for (const random of [() => 0, () => 0.5, () => 0.9999, Math.random]) {
    const queue = createFilmQueue(films, random);
    let previous;
    for (let round = 0; round < 100; round++) {
      const seen = new Set();
      for (let i = 0; i < films.length; i++) {
        const film = queue.next();
        assert.notEqual(film, previous);
        seen.add(film);
        previous = film;
      }
      assert.equal(seen.size, 10);
    }
  }
});
test('first selection varies with random input; empty/single lists are safe', () => {
  assert.notEqual(createFilmQueue(films, () => 0).next(), createFilmQueue(films, () => 0.9999).next());
  assert.equal(createFilmQueue([]).next(), null);
  const singleton = createFilmQueue([films[0]]);
  assert.equal(singleton.next(), films[0]);
  assert.equal(singleton.next(), films[0]);
});
