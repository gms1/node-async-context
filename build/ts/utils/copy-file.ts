import * as fsex from 'fs-extra';

export function copyFileSync(infile: string, outfile: string): void {
  fsex.copySync(infile, outfile);
}
