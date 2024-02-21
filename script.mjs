import { loadBsdiff, loadBspatch } from './dist/main.mjs';

const bsdiffPromise = loadBsdiff();
const bspatchPromise = loadBspatch();

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function assert(condition, message) {
  if (!condition || condition instanceof Error) {
    alert(message);
    throw new Error(message);
  }
}

document.querySelector('#bsdiff').addEventListener('click', async () => {
  const oldFile = document.querySelector('#oldFile').files[0];
  assert(oldFile, 'No old file selected');
  const newFile = document.querySelector('#newFile').files[0];
  assert(newFile, 'No new file selected');
  const oldFileData = new Uint8Array(await oldFile.arrayBuffer());
  const newFileData = new Uint8Array(await newFile.arrayBuffer());
  const bsdiff = await bsdiffPromise;
  bsdiff.FS.writeFile('/oldFile', oldFileData);
  bsdiff.FS.writeFile('/newFile', newFileData);
  bsdiff.callMain(['/oldFile', '/newFile', '/patchFile']);
  const patchFile = bsdiff.FS.readFile('/patchFile');
  const blob = new Blob([patchFile], { type: 'application/octet-stream' });
  downloadBlob(blob, `${oldFileData.name}.bsdiff`);
});

document.querySelector('#bspatch').addEventListener('click', async () => {
  const oldFile = document.querySelector('#oldFile2').files[0];
  assert(oldFile, 'No old file selected');
  const patchFile = document.querySelector('#patchFile').files[0];
  assert(patchFile, 'No patch file selected');
  const oldFileData = new Uint8Array(await oldFile.arrayBuffer());
  const patchFileData = new Uint8Array(await patchFile.arrayBuffer());
  const bspatch = await bspatchPromise;
  bspatch.FS.writeFile('/oldFile', oldFileData);
  bspatch.FS.writeFile('/patchFile', patchFileData);
  bspatch.callMain(['/oldFile', '/newFile', '/patchFile']);
  const newFile = bspatch.FS.readFile('/newFile');
  const blob = new Blob([newFile], { type: oldFile.type });
  const splitedOldName = oldFile.name.split(',');
  splitedOldName.splice(-1, 0, 'patched');
  downloadBlob(blob, splitedOldName.join('.'));
});
