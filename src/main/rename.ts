import { ipcMain, IpcMainEvent } from 'electron';
import fs from 'fs';

ipcMain.on('start-rename', (event: IpcMainEvent, filePaths: string[]): void => {
  console.log(filePaths);

  filePaths.forEach(path => {
    const stat = fs.lstatSync(path);
    console.log('是否是文件：' + stat.isFile());
    console.log('是否是文件夹：' + stat.isDirectory());
  });

  setTimeout(() => {
    event.reply('files-renamed', filePaths);
  }, 1500);
});
