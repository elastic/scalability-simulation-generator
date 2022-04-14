import { Http } from './http';

export type Journey = {
    readonly journeyName: string,
    readonly kibanaUrl: string,
    readonly kibanaVersion: string,
    readonly maxUsersCount: number,
    readonly traceItems: ReadonlyArray<TraceItem>,
}

export type Transaction = {
    readonly transactionName: string,
    readonly transactionType: string,
    readonly service: string,
    readonly traces: ReadonlyArray<Trace>
}

export type Trace = {
    readonly '@timestamp': string,
    readonly transaction_id: string,
    readonly url_path: string,
    readonly url_base: string,
    readonly span_id?: string,
    readonly http?: Http,
    // eslint-disable-next-line functional/prefer-readonly-type
    readonly children?: Array<Trace>,
}
export type Headers = {
    readonly [key: string]: ReadonlyArray<string>;
}

export type Request = {
    readonly url: {
        readonly path: string;
    },
    readonly headers: Headers;
    readonly method: string;
    readonly body?: string;
}

export type TransactionItem = {
    readonly id: string;
    readonly name: string;
    readonly type: string;
}

export type TraceItem = {
    readonly traceId: string;
    readonly timestamp: string;
    readonly request: Request;
    readonly response: {
        readonly status: string;
    }
    readonly transaction: TransactionItem; 
}