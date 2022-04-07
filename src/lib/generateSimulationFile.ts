import fs from 'fs';
import path from 'path';

import { buildSimulation } from './buildSimulation';
import { Request } from './buildSimulation';
import { cli } from './cli';
import {parseTraces} from './parseTraces';
import { Journey } from './types/journey';

export type SimulationParams = {
    readonly simulationName: string,
    readonly packageName: string,
    readonly scenarioName: string,
    readonly baseUrl: string,
    readonly maxUsersCount: number,
    readonly requests: ReadonlyArray<Request>,
}

export const generateSimulations = () => {
    const { dir, packageName, errMessage } = cli();

    if (errMessage) {
        return console.error(`Error: ${errMessage}`);
    }

    const jsonInDir = fs.readdirSync(dir).filter(file => path.extname(file) === '.json');
    jsonInDir.forEach(file => {
        const journey: Journey = JSON.parse(fs.readFileSync(path.resolve(dir, file)).toString());
        const requests = parseTraces(journey.traceItems.filter(tr => tr.transactionType === 'request'));
        const simulationName = `${journey.journeyName.replace(/\s/g, "")}`;
        const filename = `${simulationName}.scala`;
        const outputDir = path.resolve('./', 'output');

        const simulationContent = buildSimulation({
            simulationName,
            packageName,
            scenarioName: `${journey.journeyName} ${journey.kibanaVersion}`,
            baseUrl: journey.kibanaUrl,
            maxUsersCount: journey.maxUsersCount,
            requests: requests
        });

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir);
        }

        fs.writeFile(path.resolve(outputDir, filename), simulationContent, err => {
            if (err) {
                return console.error(`Error! Failed to save simulation file: ${err.message}.`);
            }
            console.log(`Gatling simulation '${filename}' was saved`);
        });
    })
}