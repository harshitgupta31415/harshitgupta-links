import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
const data = JSON.parse(await fs.readFile('data/content.json', 'utf8'));
const ids = new Set();
for (const [group, entries] of Object.entries(data)) {
  assert(entries.length > 0, `${group} is empty`);
  for (const entry of entries) {
    const key = `${group}/${entry.id}`;
    assert(!ids.has(key), `Duplicate ID: ${key}`);
    ids.add(key);
    assert(entry.name && entry.description, `Missing copy for ${entry.id}`);
    const url = new URL(entry.url);
    assert.equal(url.protocol, 'https:');
    assert(
      !url.username && !url.password && !url.search,
      `Unexpected credentials or tracking: ${entry.id}`,
    );
  }
}
assert.equal(data.profiles.length, 13);
assert.equal(data.projects.length, 4);
assert.equal(data.platforms.length, 12);
assert.equal(
  data.profiles.find((p) => p.id === 'codeforces').url,
  'https://codeforces.com/profile/HarshitGupta314',
);
assert.equal(
  data.projects.find((p) => p.id === 'memvora').url,
  'https://github.com/harshitgupta31415/memvora',
);
let bytes = 0,
  triangles = 0;
for (const filename of await fs.readdir('public/models')) {
  if (!filename.endsWith('.gltf')) continue;
  const model = JSON.parse(await fs.readFile(path.join('public/models', filename), 'utf8'));
  for (const resource of [...model.buffers, ...(model.images ?? [])]) {
    assert(resource.uri && !resource.uri.includes('..'), `Invalid local asset: ${filename}`);
    await fs.access(path.join('public/models', resource.uri));
  }
  for (const mesh of model.meshes)
    for (const primitive of mesh.primitives)
      triangles += (model.accessors[primitive.indices]?.count ?? 0) / 3;
}
for await (const filename of walk('public/models')) bytes += (await fs.stat(filename)).size;
assert(bytes < 1_500_000, 'Environment download exceeded 1.5 MB budget');
async function* walk(folder) {
  for (const item of await fs.readdir(folder, { withFileTypes: true })) {
    const file = path.join(folder, item.name);
    if (item.isDirectory()) yield* walk(file);
    else yield file;
  }
}
console.log(
  `Validated ${data.profiles.length} owned profiles, ${data.projects.length} projects, and ${data.platforms.length} platform suggestions.`,
);
console.log(
  `All authored model dependencies resolve. Environment assets: ${(bytes / 1024).toFixed(0)} KiB. Prototype geometry: ${Math.round(triangles)} triangles.`,
);
