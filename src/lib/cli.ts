import fs from 'fs';
import path from 'path';

import * as yargs from 'yargs';

export type CliOutput = {
    readonly dir: string,
    readonly logs?: boolean,
    readonly baseUrl?: URL,
    readonly packageName: string,
    readonly errMessage?: string 
}

const isAValidUrl = (str: string) => {
    try {
      new URL(str);
      return true;
    } catch (err) {
      return false;
    }
};

export const cli = (): CliOutput => {
    const args = yargs
        .option('dir', { alias: 'dir', type: 'string', demandOption: true, description: 'Path to APM parser output' })
        .option('url', {alias: 'baseUrl', type: 'string', demandOption: true, description: 'Kibana base url' })
        .option('packageName', { alias: 'packageName', type: 'string', demandOption: true, description: 'Scala package name to use' })
        .option('logs', { alias: 'printLogs', type: 'boolean', demandOption: false, description: 'Debug flag to print data into console' })
        .usage('node scripts/generate_simulations.js --dir ./apm --packageName org.kibanaLoadTest --url "http://localhost:5620"')
        .parseSync()
    const { logs, packageName } = args;
    const dir = path.resolve(args.dir);

    if (!fs.existsSync(dir) || !fs.lstatSync(dir).isDirectory()) {
        return {dir, packageName, errMessage: `Path '${dir}' does not exist or non-folder`};
    }

    if (!(new RegExp('^[a-z][a-zA-Z.]{0,}$').test(packageName))) {
        return {dir, packageName, errMessage: `Package name '${packageName}' is not valid, try 'org.kibanaLoadTest'`}
    }

    if (!isAValidUrl(args.url)) {
        return {dir, packageName, errMessage: `Url '${args.url}' is not valid`}
    }

    const baseUrl = new URL(args.url);

    return { baseUrl, dir, logs, packageName }
}