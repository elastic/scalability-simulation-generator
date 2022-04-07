import fs from 'fs';

import * as yargs from 'yargs';

export type CliOutput = {
    readonly dir: string,
    readonly packageName: string,
    readonly errMessage?: string 
}

export const cli = (): CliOutput => {
    const args = yargs
        .option('dir', { alias: 'sourceDir', type: 'string', demandOption: true, description: 'Path to APM parser output' })
        .option('packageName', { alias: 'packageName', type: 'string', demandOption: true, description: 'Scala package name to use' })
        .usage('node scripts/generate_simulations.js --dir ./apm_output --package org.kibanaLoadTest --class MySimulation')
        .parseSync()
    const { dir, packageName } = args

    if (!fs.existsSync(args.dir)) {
        return {dir, packageName, errMessage: `Path '${dir}' does not exist`};
    }

    if (!(new RegExp('^[a-z][a-zA-Z.]{0,}$').test(args.packageName))) {
        return {dir, packageName, errMessage: `Package name '${packageName}' is not valid, try 'org.kibanaLoadTest'`}
    }

    return { dir, packageName }
}