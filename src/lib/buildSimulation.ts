import template from 'es6-template-string';


import { getExec, getTemplates, TemplateName } from './templates';
import { Header } from './types/http';
import { Request, Simulation } from './types/simulation';

const buildHeaders = (headers: ReadonlyArray<Header>) => {
    return headers
        .map(header => `"${header.name}" -> ${JSON.stringify(header.name !== 'Cookie' ? header.value : '${Cookie}')}`)
        .join(',').replace(/^/, 'Map(') + ')';
}

const buildScenario = (scenarioName: string, requests: ReadonlyArray<Request>, templates: ReadonlyMap<string, string>): string => {
    const start = template(templates.get(TemplateName.SCENARIO), { scenarioName });
    // convert requests into array of Gatling exec http calls
    const execs = requests.map((req, index, reqArray) => {
        const method = req.method.toLowerCase();
        const templateStr = getExec(templates, req);
        const templateArgs = !req.body
            ? { path: req.path, method, headers: buildHeaders(req.headers) }
            : { path: req.path, method, headers: buildHeaders(req.headers), payload: JSON.stringify(req.body).replace(/"/g, "\\\"") }
        // construct Gatling exec http calls 
        const exec = template(templateStr, templateArgs);
        // add delay before next request
        if (index < reqArray.length -1) {
            const delay = reqArray[index+1].timestamp - req.timestamp;
            if (delay > 0) {
                return exec + '\n' + template(templates.get(TemplateName.PAUSE), {delay})
            }
        }
        
        return exec;
    });

    return start + '\n' + execs.join('\n');
}

export const buildSimulation = (params: Simulation) => {
    const { simulationName, packageName, scenarioName, baseUrl, maxUsersCount, requests } = params;
    const templates = getTemplates();
    const protocol = template(templates.get(TemplateName.PROTOCOL), { baseUrl })
    const scenario = buildScenario(scenarioName, requests, templates);
    const setup = template(templates.get(TemplateName.SETUP), { maxUsersCount })
    return template(
        templates.get(TemplateName.SIMULATION),
        {
            packageName,
            protocol,
            simulationName,
            scenario,
            setup
        }
    );
}