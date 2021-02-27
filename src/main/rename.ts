import { ipcMain, IpcMainEvent } from 'electron';
import fs from 'fs';
import path from 'path';
import exif, { ExifData } from 'exif';

interface Config {
  format: string;
  sequence: string;
  recursive: boolean;
}

function filterSymbol(filePath: string | undefined) {
  if (!filePath) return '';
  return filePath.replace(/[\\/:*?<>|]/g, ' ');
}

function dealPath(filePath: string, format: string, sequence: string) {
  return new Promise(resolve => {
    exif(filePath, (error: Error | null, data: ExifData) => {
      const prePath = filePath;
      if (error) {
        resolve({
          prePath,
          newPath: prePath,
          message: error.message,
        });
      } else {
        const timeList = data.exif.CreateDate?.replace(' ', ':').split(':') || [];
        let newFilename = format + path.extname(prePath);
        const varMap = {
          '{YYYY}': timeList[0] || '{YYYY}',
          '{MM}': timeList[1] || '{MM}',
          '{DD}': timeList[2] || '{DD}',
          '{hh}': timeList[3] || '{hh}',
          '{mm}': timeList[4] || '{mm}',
          '{ss}': timeList[5] || '{ss}',
          '{sequence}': sequence,
          '{make}': filterSymbol(data.image.Make) || '{make}',
          '{model}': filterSymbol(data.image.Model) || '{model}',
          '{lens}': filterSymbol(data.exif.LensModel) || '{lens}',
        };
        Object.entries(varMap).forEach(([key, value]) => {
          newFilename = newFilename.replaceAll(key, value);
        });
        const newPath = prePath.replace(path.basename(prePath), newFilename);
        try {
          if (fs.existsSync(newPath)) {
            resolve({
              prePath,
              newPath: prePath,
              message: 'Target filename exists.',
            });
          } else {
            fs.renameSync(prePath, newPath);
            // todo revert record
            resolve({
              prePath,
              newPath,
              message: '',
            });
          }
        } catch (e) {
          resolve({
            prePath,
            newPath: prePath,
            message: e.message,
          });
        }
      }
    });
  });
}

function addNumToStr(str = '0', num: number): string {
  const originLength = str.length;
  let result = (Number(str) + num).toString();
  if (result.length > originLength) {
    result = result.slice(-originLength);
  } else {
    while (result.length < originLength) {
      result = '0' + result;
    }
  }
  return result;
}

ipcMain.on('start-rename', (event: IpcMainEvent, filePaths: string[], config: Config): void => {
  const { format, sequence, recursive } = config;

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
  const promiseList = flatPaths.map((targetPath, index) => {
    return dealPath(targetPath, format, addNumToStr(sequence, index));
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
