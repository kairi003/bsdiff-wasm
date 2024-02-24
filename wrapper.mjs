async function runWorker(message, transferList) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./worker.mjs', { type: 'module' });
    worker.onmessage = (event) => {
      worker.terminate();
      resolve(event.data);
    };
    worker.onerror = (event) => {
      worker.terminate();
      reject(new Error(event.message));
    };
    worker.postMessage(message, transferList);
  });
}

/**
 * Execute bsdiff in background thread
 * @param {Uint8Array} oldFileData 
 * @param {Uint8Array} newFileData 
 * @returns Promise<Uint8Array>
 */
export async function diff(oldFileData, newFileData) {
  return runWorker(
    { type: 'diff', args: [oldFileData, newFileData] },
    [oldFileData.buffer, newFileData.buffer]
  );
}

/**
 * Execute bspatch in background thread
 * @param {Uint8Array} oldFileData
 * @param {Uint8Array} patchFileData
 * @returns Promise<Uint8Array>
 */
export async function patch(oldFileData, patchFileData) {
  return runWorker(
    { type: 'patch', args: [oldFileData, patchFileData] },
    [oldFileData.buffer, patchFileData.buffer]
  );
}


