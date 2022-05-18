import {Header} from './http';
import { Setup } from './journey';

export type Request = {
    readonly timestamp: number,
    readonly date: string,
    readonly transactionId: string,
    readonly method: string,
    readonly path: string,
    readonly headers: ReadonlyArray<Header>,
    readonly body?: string,
}

export type Simulation = {
    readonly simulationName: string,
    readonly packageName: string,
    readonly scenarioName: string,
    readonly baseUrl: string,
    readonly scalabilitySetup: Setup,
    readonly requests: ReadonlyArray<Request>,
}
