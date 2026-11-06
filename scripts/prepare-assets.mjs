import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// Pass the extracted, official Quaternius Standard pack directory.
const source = process.argv[2];
if (!source) throw new Error('Pass the extracted asset pack directory.');
const destination = path.resolve('public/models');
await fs.mkdir(path.join(destination, 'textures'), { recursive: true });
const models = {
  floor: 'Platforms/Platform_Squares',
  wall: 'Walls/WallBand_Straight',
  trim: 'Walls/TopCables_Straight',
  column: 'Columns/Column_Pipes',
  computer: 'Props/Prop_Computer',
  access: 'Props/Prop_AccessPoint',
  light: 'Props/Prop_Light_Wide',
  cable: 'Props/Prop_Cable_3',
  vent: 'Props/Prop_Vent_Big',
  rail: 'Props/Prop_Rail_4',
};
const textures = new Set();
for (const [name, relative] of Object.entries(models)) {
  const original = path.join(source, 'glTF', relative + '.gltf');
  const gltf = JSON.parse(await fs.readFile(original, 'utf8'));
  for (const [i, buffer] of (gltf.buffers ?? []).entries()) {
    const filename = `${name}-${i}.bin`;
    await fs.copyFile(
      path.resolve(path.dirname(original), decodeURI(buffer.uri)),
      path.join(destination, filename),
    );
    buffer.uri = filename;
  }
  for (const image of gltf.images ?? []) {
    const originalImage = path.join(source, 'Textures', path.basename(decodeURI(image.uri)));
    const filename = path.parse(originalImage).name + '.webp';
    if (!textures.has(filename)) {
      await sharp(originalImage)
        .resize({ width: 512, height: 512, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 88 })
        .toFile(path.join(destination, 'textures', filename));
      textures.add(filename);
    }
    image.uri = 'textures/' + filename;
  }
  await fs.writeFile(path.join(destination, `${name}.gltf`), JSON.stringify(gltf));
  const positions = gltf.meshes.flatMap((mesh) =>
    mesh.primitives.map((p) => gltf.accessors[p.attributes.POSITION]),
  );
  const min = [0, 1, 2].map((i) => Math.min(...positions.map((p) => p.min[i])));
  const max = [0, 1, 2].map((i) => Math.max(...positions.map((p) => p.max[i])));
  console.log(
    name,
    'bounds',
    min.map((n) => n.toFixed(2)),
    max.map((n) => n.toFixed(2)),
  );
}
await fs.copyFile(path.join(source, 'License_Standard.txt'), path.join(destination, 'LICENSE.txt'));
console.log('Prepared 10 authored modules, shared 512px textures, and original CC0 licence.');
