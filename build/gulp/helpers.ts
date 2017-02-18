// tslint:disable no-var-requires no-require-imports typedef
import * as path from 'path';
import * as child_process from 'child_process';

export function globify(...dirs: string[]): string {
  dirs.push('**');
  dirs.push('*');
  return path.join(...dirs);
}

// stolen from
//   https://github.com/angular/material2/blob/master/tools/gulp/task_helpers.ts
export interface ExecTaskOptions {
  // Whether to output to STDOUT and STDERR.
  silent?: boolean;
  // If an error happens, this will replace the standard error.
  errMessage?: string;
}

// stolen from
//   https://github.com/angular/material2/blob/master/tools/gulp/task_helpers.ts
export function execTask(binPath: string, args: string[], options: ExecTaskOptions = {}) {
  return (done: (err?: string) => void) => {
    const childProcess = child_process.spawn(binPath, args);

    if (!options.silent) {
      childProcess.stdout.on('data', (data: string) => {
        process.stdout.write(data);
      });

      childProcess.stderr.on('data', (data: string) => {
        process.stderr.write(data);
      });
    }

    childProcess.on('close', (code: number) => {
      if (code !== 0) {
        if (options.errMessage === undefined) {
          let cmdargs: string[] = [];
          cmdargs.push(binPath, ...args);
          done(`command ${cmdargs} failed: ${code}`);
        } else {
          done(options.errMessage);
        }
      } else {
        done();
      }
    });
  };
}