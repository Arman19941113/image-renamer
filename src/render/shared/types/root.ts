export interface Config {
  format: string;
  sequence: string;
  recursive: boolean;
}

export interface ConfigAction {
  type: 'format' | 'sequence' | 'recursive';
  payload: string | boolean;
}

export interface StartRename {
  (filePaths: string[]): void;
}

export interface RenameResult {
  prePath: string;
  newPath: string;
  message: string;
}

export type RenameResults = RenameResult[];
