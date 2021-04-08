import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { ExifData } from 'exif';

export interface Config {
  format: string;
  sequence: string;
  recursive: boolean;
  remove: boolean;
}

export interface RenameResult {
  prePath: string;
  newPath: string;
  message: string;
}

// '001' + 2 = '003'
export function addNumToStr(str = '0', num: number): string {
  const originLength = str.length;
  let result = (Number(str) + num).toString();
  if (result.length > originLength) {
    // result = result.slice(-originLength);
    result = new Array(originLength).fill('9').join('');
  } else {
    while (result.length < originLength) {
      result = '0' + result;
    }
  }
  return result;
}

export interface PathRecord {
  originPath: string;
  randomPath: string;
}
// to avoid filename conflict
export function renameWithTemporaryPath(filePaths: string[]): PathRecord[] {
  const random = crypto.randomBytes(10).toString('hex');
  const baseSequence = new Array(filePaths.length).fill('0').join('');
  const pathInfo: PathRecord[] = [];
  filePaths.forEach((prePath, index) => {
    const newFilename = random + addNumToStr(baseSequence, index) + path.extname(prePath);
    const newPath = prePath.replace(path.basename(prePath), newFilename);
    try {
      fs.renameSync(prePath, newPath);
      pathInfo.push({
        originPath: prePath,
        randomPath: newPath,
      });
    } catch (e) {
      // this file can;t be renamed
    }
  });
  return pathInfo;
}

// filter the symbols are not allowed in the filename
export function filterNameSymbol(filePath: string | undefined): string {
  if (!filePath) return '';
  return filePath.replace(/[\\/:*?<>|]/g, ' ');
}

export interface VariablesMap {
  [propName: string]: string;
}
export function getVariablesMap(sequence: string, exifData?: ExifData): VariablesMap {
  if (exifData) {
    const timeList = exifData.exif.CreateDate?.replace(' ', ':').split(':') || [];
    return {
      '{YYYY}': timeList[0] || '{YYYY}',
      '{MM}': timeList[1] || '{MM}',
      '{DD}': timeList[2] || '{DD}',
      '{hh}': timeList[3] || '{hh}',
      '{mm}': timeList[4] || '{mm}',
      '{ss}': timeList[5] || '{ss}',
      '{sequence}': sequence,
      '{make}': filterNameSymbol(exifData.image.Make) || '{make}',
      '{model}': filterNameSymbol(exifData.image.Model) || '{model}',
      '{lens}': filterNameSymbol(exifData.exif.LensModel) || '{lens}',
    };
  }
  return {
    '{sequence}': sequence,
  };
}

// this function is used when the filename can be renamed
export function assumeRename(prePth: string, newPath: string): string {
  let finalPath = newPath;
  if (fs.existsSync(finalPath)) {
    const extname = path.extname(finalPath);
    const basename = path.basename(finalPath);
    const basenameWithoutExtname = path.basename(finalPath, extname);
    const random = crypto.randomBytes(10).toString('hex');
    finalPath = finalPath.replaceAll(basename, `${basenameWithoutExtname}-${random}${extname}`);
  }
  fs.renameSync(prePth, finalPath);
  return finalPath;
}
