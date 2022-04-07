import fs from 'fs';

import { Request } from './buildSimulation';

export enum TemplateName {
    SIMULATION = 'simulation',
    PROTOCOL = 'protocol',
    SCENARIO = 'scenario',
    SETUP = 'setup',
    HTTP = 'exec_http',
    HTTP_BODY = 'exec_http_body',
    AUTH = 'exec_auth',
    BSEARCH = 'exec_bsearch',
    PAUSE = 'pause',
}
const AUTH_PATH = '/internal/security/login';
const BSEARCH_PATH = '/internal/bsearch';

export const getTemplates = () => {
    return new Map<string, string>(Object.values(TemplateName).map(filename => (
        [filename, fs.readFileSync(`./gatling_template/${filename}`).toString()]
    )));
};

export const getExec = (templates: ReadonlyMap<string, string>, request: Request) => {
    if (!request.body) {
        return templates.get(TemplateName.HTTP);
    } else if (request.path.includes(AUTH_PATH)) {
        return templates.get(TemplateName.AUTH);
    } else if (request.path.includes(BSEARCH_PATH)) {
        return templates.get(TemplateName.BSEARCH);
    } else {
        return templates.get(TemplateName.HTTP_BODY);
    }
}