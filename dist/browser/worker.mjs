import { loadBsdiff, loadBspatch } from '../main.mjs';
self.onmessage = async (event) => {
  const { type, args } = event.data;
  switch (type) {
    case 'diff': {
      const [oldFileData, newFileData] = args;
      const bsdiff = await loadBsdiff();
      bsdiff.FS.writeFile('/oldFile', oldFileData);
      bsdiff.FS.writeFile('/newFile', newFileData);
      bsdiff.callMain(['/oldFile', '/newFile', '/patchFile']);
      const patchFileData = bsdiff.FS.readFile('/patchFile');
      self.postMessage(patchFileData, [patchFileData.buffer]);
      break;
    }
    case 'patch': {
      const [oldFileData, patchFileData] = args;
      const bspatch = await loadBspatch();
      bspatch.FS.writeFile('/oldFile', oldFileData);
      bspatch.FS.writeFile('/patchFile', patchFileData);
      bspatch.callMain(['/oldFile', '/newFile', '/patchFile']);
      const newFileData = bspatch.FS.readFile('/newFile');
      console.log('newFileData', newFileData);
      self.postMessage(newFileData, [newFileData.buffer]);
      break;
    }
  }
};
