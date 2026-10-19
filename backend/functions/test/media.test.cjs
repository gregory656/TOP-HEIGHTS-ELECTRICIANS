const { test } = require('node:test');
const assert = require('node:assert/strict');
const { mediaUrl } = require('../lib/catalogue');

test('image URLs work without Firebase Storage and unsafe schemes or credentials are rejected', () => {
  for (const image of ['/solarenergy.jpeg', 'https://images.example.test/solar.jpg', 'https://res.cloudinary.com/example/image/upload/solar.jpg']) {
    assert.equal(mediaUrl(image), image);
  }
  for (const image of ['javascript:alert(1)', 'data:image/svg+xml,<svg></svg>', 'http://images.example.test/panel.jpg', 'https://user:password@images.example.test/panel.jpg', '//images.example.test/panel.jpg', '/../private', 'https://images.example.test:8443/panel.jpg']) {
    assert.throws(() => mediaUrl(image));
  }
});
