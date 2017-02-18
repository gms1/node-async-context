// tslint:disable no-var-requires no-require-imports typedef
import * as path from 'path';
import { Configuration } from './Configuration';
import { TaskBuilder } from './TaskBuilder';

let rootDir = path.dirname(path.dirname(__dirname));
let config = new Configuration(rootDir);
let taskBuilder = new TaskBuilder(config);

taskBuilder.create();
