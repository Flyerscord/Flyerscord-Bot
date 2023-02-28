import p from "path";

export default class File {
  path: string;
  fileName: string;

  constructor(path: string, fileName: string) {
    this.path = path;
    this.fileName = fileName;
  }

  toString() {
    return `Path: ${p.join(this.path, this.fileName)}`;
  }
}
