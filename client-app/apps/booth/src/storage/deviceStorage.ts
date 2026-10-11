// Booth device storage.
//
// Each key is one small JSON file inside the app's private documents folder
// (<DocumentDirectory>/happypix-booth/<key>.json). It is NOT AsyncStorage and
// NOT browser storage. The device identity lives in its own file, so logging
// out or clearing the cached event never touches it.
import RNFS from 'react-native-fs';
import { setStorageAdapter, type StorageAdapter } from '../../../../packages/api/src/index';

const ROOT = `${RNFS.DocumentDirectoryPath}/happypix-booth`;

// Serialise file operations so a write and a read can never interleave.
let queue: Promise<unknown> = Promise.resolve();
const serial = <T>(task: () => Promise<T>): Promise<T> => {
  const run = queue.then(task, task);
  queue = run.catch(() => undefined);
  return run;
};

const fileFor = (key: string) => `${ROOT}/${key.replace(/[^a-zA-Z0-9_-]/g, '_')}.json`;

export const deviceFileStorage: StorageAdapter = {
  getItem: (key) =>
    serial(async () => {
      const path = fileFor(key);
      if (!(await RNFS.exists(path))) return null;
      return RNFS.readFile(path, 'utf8');
    }),
  setItem: (key, value) =>
    serial(async () => {
      if (!(await RNFS.exists(ROOT))) await RNFS.mkdir(ROOT);
      const path = fileFor(key);
      const tmp = `${path}.tmp`;
      await RNFS.writeFile(tmp, value, 'utf8');
      if (await RNFS.exists(path)) await RNFS.unlink(path);
      await RNFS.moveFile(tmp, path);
    }),
  removeItem: (key) =>
    serial(async () => {
      const path = fileFor(key);
      if (await RNFS.exists(path)) await RNFS.unlink(path);
    }),
};

setStorageAdapter(deviceFileStorage);

/**
 * Captured photos are local file URIs. Read them as base64 data URLs so the
 * backend can store them. A photo that cannot be read is skipped, not fatal.
 */
export async function photosAsDataUrls(uris: string[]): Promise<string[]> {
  const out: string[] = [];
  for (const uri of uris) {
    try {
      const path = uri.replace(/^file:\/\//, '');
      const base64 = await RNFS.readFile(path, 'base64');
      out.push(`data:image/jpeg;base64,${base64}`);
    } catch (err) {
      console.warn('[Photos] Could not read captured photo', err);
    }
  }
  return out;
}
