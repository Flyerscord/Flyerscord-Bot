import fs from "fs";
import path from "path";

import Logger from "stumper";
import File from "../models/File";

export default abstract class Files {
  static getFilesInDir(dir: string, includeDirs = false): Array<fs.Dirent> {
    const contents = fs.readdirSync(dir, { withFileTypes: true });

    if (!includeDirs) {
      return contents.filter((file) => file.isFile() == true);
    }
    return contents;
  }

  static getAllJsFilesRecursive(dir: string, ignoredFiles: Array<string> = []): Array<File> {
    const files: Array<File> = [];

    const contents = this.getFilesInDir(dir, true);
    for (let i = 0; i < contents.length; i++) {
      if (contents[i].isDirectory()) {
        const f = this.getAllJsFilesRecursive(path.join(dir, contents[i].name));
        files.push(...f);
      } else if (contents[i].isFile() && !ignoredFiles.includes(contents[i].name)) {
        files.push(new File(dir, contents[i].name));
      }
    }
    return files;
  }
}
