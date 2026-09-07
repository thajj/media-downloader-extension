import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// Load the browser ES module without changing the CommonJS Webpack configuration.
const source = await readFile(new URL('../src/content/mediaDetector.js', import.meta.url), 'utf8');
const { MediaDetector } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);

test('preserves signed image query parameters while keeping a clean filename', () => {
  const detector = new MediaDetector();
  detector.processImageSource('https://example.com/photo.jpg?signature=abc%2F123&width=640#preview');
  assert.deepEqual(detector.getImageUrls(), [{
    url: 'https://example.com/photo.jpg?signature=abc%2F123&width=640',
    filename: 'photo.jpg',
  }]);
});

test('keeps distinct transformed images and deduplicates identical URLs', () => {
  const detector = new MediaDetector();
  detector.processSrcSet('https://example.com/photo.png?w=320 1x, https://example.com/photo.png?w=640 2x');
  detector.processImageSource('https://example.com/photo.png?w=320');
  assert.deepEqual(detector.getImageUrls().map(image => image.url), [
    'https://example.com/photo.png?w=320',
    'https://example.com/photo.png?w=640',
  ]);
});

test('handles lazy-loaded signed images', () => {
  const detector = new MediaDetector();
  detector.processDataAttributes({ src: 'https://example.com/lazy.jpeg?token=abc' });
  assert.equal(detector.getImageUrls()[0].url, 'https://example.com/lazy.jpeg?token=abc');
});

test('matches extensions on the path and excludes query strings from filenames', () => {
  const detector = new MediaDetector();
  assert.equal(detector.isValidImageUrl('https://example.com/photo.JPG?size=2'), true);
  assert.equal(detector.isValidImageUrl('https://example.com/page?name=photo.jpg'), false);
  assert.equal(detector.extractFilename('https://example.com/photo.jpg?redirect=/other#preview'), 'photo.jpg');
  detector.processImageSource('https://example.com/plain.gif');
  assert.equal(detector.getImageUrls()[0].filename, 'plain.gif');
});
