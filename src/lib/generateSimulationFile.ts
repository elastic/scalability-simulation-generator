import fs from 'fs';
import path from 'path';

import { buildSimulation } from './buildSimulation';
import { cli } from './cli';
import { getHttpRequests } from './parseTraces';
import { Journey } from './types/journey';
import { Request } from './types/simulation';

export type SimulationParams = {
  readonly simulationName: string,
  readonly packageName: string,
  readonly scenarioName: string,
  readonly baseUrl: string,
  readonly maxUsersCount: number,
  readonly requests: ReadonlyArray<Request>,
}

export const generateSimulations = () => {
  const { baseUrl, dir, logs, packageName, errMessage } = cli();

  if (errMessage) {
    return console.error(`Error: ${errMessage}`);
  }

  const jsonInDir = fs.readdirSync(dir).filter(file => path.extname(file) === '.json');
  console.log(`Found ${jsonInDir.length} json files in path: ${jsonInDir}`);

  jsonInDir.forEach(file => {
    const journey: Journey = JSON.parse(fs.readFileSync(path.resolve(dir, file)).toString());
    // const requests = parseTraces(journey.traceItems.filter(tr => tr.transactionType === 'request'));

    if (!journey.traceItems || journey.traceItems.length === 0) {
      return console.error(`No 'traceItems' found in json`);
    }

    if (!journey.scalabilitySetup) {
      return console.error(`No 'scalabilitySetup' found in json`);
    }

    const requests = getHttpRequests(journey.traceItems);

    if (logs) {
      requests.forEach(req => console.log(`${req.date} ${req.transactionId} ${req.method} ${req.path}`))
    }

    const scalabilitySetup = journey.scalabilitySetup;
    const simulationName = `${journey.journeyName.replace(/\s/g, "")}`;
    const filename = `${simulationName}.scala`;
    const outputDir = path.resolve('output');
    const filePath = path.resolve(outputDir, filename);

    const simulationContent = buildSimulation({
      simulationName,
      packageName,
      scenarioName: `${journey.journeyName} ${journey.kibanaVersion}`,
      baseUrl: `${baseUrl.protocol}//${baseUrl.host}`,
      scalabilitySetup,
      requests
    });

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    const stream = fs.createWriteStream(filePath);
    stream.write(simulationContent);
    stream.end(() => console.log(`Gatling simulation '${filename}' was saved`));
  });
}
