import { diff, patch } from './wrapper.mjs';

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

const bsdiffButton = document.querySelector('#bsdiff');
bsdiffButton.addEventListener('click', async () => {
  const oldFile = document.querySelector('#oldFile').files[0];
  assert(oldFile, 'No old file selected');
  const newFile = document.querySelector('#newFile').files[0];
  assert(newFile, 'No new file selected');
  const oldFileData = new Uint8Array(await oldFile.arrayBuffer());
  const newFileData = new Uint8Array(await newFile.arrayBuffer());
  bsdiffButton.disabled = true;
  const patchFileData = await diff(oldFileData, newFileData).catch(err => err);
  console.log(typeof patchFileData);
  bsdiffButton.disabled = false;
  assert(patchFileData, patchFileData.message || 'Failed to create patch file');
  const blob = new Blob([patchFileData], { type: 'application/octet-stream' });
  downloadBlob(blob, `${oldFile.name}.bsdiff`);
});

const bspatchButton = document.querySelector('#bspatch');
bspatchButton.addEventListener('click', async () => {
  const oldFile = document.querySelector('#oldFile2').files[0];
  assert(oldFile, 'No old file selected');
  const patchFile = document.querySelector('#patchFile').files[0];
  assert(patchFile, 'No patch file selected');
  const oldFileData = new Uint8Array(await oldFile.arrayBuffer());
  const patchFileData = new Uint8Array(await patchFile.arrayBuffer());
  bspatchButton.disabled = true;
  const newFileData = await patch(oldFileData, patchFileData).catch(err => err);
  bspatchButton.disabled = false;
  assert(newFileData, newFileData.message || 'Failed to create new file');
  const blob = new Blob([newFileData], { type: oldFile.type });
  const splitedOldName = oldFile.name.split(',');
  splitedOldName.splice(-1, 0, 'patched');
  downloadBlob(blob, splitedOldName.join('.'));
});
