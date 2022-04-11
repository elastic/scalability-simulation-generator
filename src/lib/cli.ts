import fs from 'fs';
import path from 'path';

import * as yargs from 'yargs';

export type CliOutput = {
    readonly dir: string,
    readonly logs?: boolean,
    readonly packageName: string,
    readonly errMessage?: string 
}

export const cli = (): CliOutput => {
    const args = yargs
        .option('dir', { alias: 'sourceDir', type: 'string', demandOption: true, description: 'Path to APM parser output' })
        .option('packageName', { alias: 'packageName', type: 'string', demandOption: true, description: 'Scala package name to use' })
        .option('logs', { alias: 'printLogs', type: 'boolean', demandOption: false, description: 'Debug flag to print data into console' })
        .usage('node scripts/generate_simulations.js --dir ./apm_output --package org.kibanaLoadTest --class MySimulation')
        .parseSync()
    const { logs, packageName } = args;
    const dir = path.resolve(args.dir);

    if (!fs.existsSync(dir) || !fs.lstatSync(dir).isDirectory()) {
        return {dir, packageName, errMessage: `Path '${dir}' does not exist or non-folder`};
    }

    if (!(new RegExp('^[a-z][a-zA-Z.]{0,}$').test(packageName))) {
        return {dir, packageName, errMessage: `Package name '${packageName}' is not valid, try 'org.kibanaLoadTest'`}
    }

    return { dir, logs, packageName }
}