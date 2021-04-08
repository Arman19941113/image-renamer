import { ipcMain, IpcMainEvent } from 'electron';
import fs from 'fs';
import os from 'os';
import path from 'path';
import exif, { ExifData } from 'exif';
import {
  addNumToStr,
  renameWithTemporaryPath,
  getVariablesMap,
  assumeRename,
  VariablesMap,
  RenameResult,
  PathRecord,
  Config,
} from './util';

const exifVariables = ['{YYYY}', '{MM}', '{DD}', '{hh}', '{mm}', '{ss}', '{make}', '{model}', '{lens}'];

function removeToDesktop(originPath: string, currentPath: string): RenameResult {
  const removeTargetDir = path.join(os.homedir(), 'Desktop', 'no-exif-dir');
  if (!fs.existsSync(removeTargetDir)) {
    fs.mkdirSync(removeTargetDir);
  }
  const basename = path.basename(originPath);
  const targetPath = path.join(removeTargetDir, basename);
  const finalPath = assumeRename(currentPath, targetPath);
  return {
    prePath: originPath,
    newPath: finalPath,
    message: '',
  };
}

function renamePath(variablesMap: VariablesMap, format: string, originPath: string, currentPath: string): RenameResult {
  // generate new path by format
  let newFilename = format + path.extname(currentPath);
  Object.entries(variablesMap).forEach(([key, value]) => {
    newFilename = newFilename.replaceAll(key, value);
  });
  const newPath = currentPath.replace(path.basename(currentPath), newFilename);

  if (fs.existsSync(newPath)) {
    const finalPath = assumeRename(currentPath, originPath);
    return {
      prePath: originPath,
      newPath: finalPath,
      message: 'Target filename exists.',
    };
  }

  fs.renameSync(currentPath, newPath);
  return {
    prePath: originPath,
    newPath,
    message: '',
  };
}

function dealPath(pathInfo: PathRecord, format: string, sequence: string, remove: boolean) {
  return new Promise(resolve => {
    const { originPath, randomPath: currentPath } = pathInfo;
    if (exifVariables.some(item => format.includes(item))) {
      exif(currentPath, (error: Error | null, exifData: ExifData) => {
        if (error) {
          // read exif data failed
          if (remove) {
            // remove file to desktop
            resolve(removeToDesktop(originPath, currentPath));
          } else {
            // don't rename(equal to rename to the origin filename)
            const finalPath = assumeRename(currentPath, originPath);
            resolve({
              prePath: originPath,
              newPath: finalPath,
              message: error.message,
            });
          }
        } else {
          resolve(renamePath(getVariablesMap(sequence, exifData), format, originPath, currentPath));
        }
      });
    } else {
      resolve(renamePath(getVariablesMap(sequence), format, originPath, currentPath));
    }
  });
}

ipcMain.on('start-rename', (event: IpcMainEvent, filePaths: string[], config: Config): void => {
  const { format, sequence, recursive, remove } = config;

  // get all file path in a flat list
  const flatPaths: string[] = [];
  const rootPaths = [...filePaths]; // root path always work
  const queue = [...filePaths];
  while (queue.length) {
    const targetPath = queue.shift() as string;
    // ignore files starts with .
    if (path.basename(targetPath).startsWith('.')) continue;

    const stat = fs.lstatSync(targetPath);
    if (stat.isFile()) {
      flatPaths.push(targetPath);
    } else if (stat.isDirectory() && (recursive || rootPaths.includes(targetPath))) {
      const childrenPath = fs.readdirSync(targetPath).map(p => path.join(targetPath, p));
      if (childrenPath.length) queue.push(...childrenPath);
    }
  }

  const startTime = Date.now();
  const duration = 150;
  const promiseList = renameWithTemporaryPath(flatPaths).map((pathInfo, index) => {
    return dealPath(pathInfo, format, addNumToStr(sequence, index), remove);
  });
  Promise.all(promiseList).then(res => {
    const spentTime = Date.now() - startTime;
    if (spentTime < duration) {
      setTimeout(() => {
        event.reply('files-renamed-success', res);
      }, duration - spentTime);
    } else {
      event.reply('files-renamed-success', res);
    }
    return null;
  });
});
