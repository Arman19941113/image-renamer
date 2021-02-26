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

function dealPath(filePath: string, format: string, sequence: number) {
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
          '{sequence}': sequence, // todo support 001
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
              message: 'File exists.',
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

ipcMain.on('start-rename', (event: IpcMainEvent, filePaths: string[], config: Config): void => {
  const { format, recursive } = config;
  let sequence = parseInt(config.sequence, 10) || 0;

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
  const promiseList = flatPaths.map(targetPath => {
    return dealPath(targetPath, format, sequence++);
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
