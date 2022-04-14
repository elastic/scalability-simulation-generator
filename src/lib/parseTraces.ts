/* eslint-disable functional/no-let */
/* eslint-disable functional/no-loop-statement */
/* eslint-disable functional/immutable-data */
/* eslint-disable prefer-const */
/* eslint functional/prefer-readonly-type: 0 */

import { Trace, TraceItem, Transaction } from './types/journey';
import { Request } from './types/simulation';

const methodRegEx = /GET|POST|PUT|DELETE|UPDATE/g;
const isValidHttpTrace = (trace: Trace) => trace?.url_path?.length > 1 && trace.http?.request?.headers && trace.http?.request?.method?.match(methodRegEx);

export const getHttpRequests = (traces: ReadonlyArray<TraceItem>): Array<Request> => {
    return traces.map(trace => {
        const timestamp = new Date(trace.timestamp).getTime();
        const date = trace.timestamp;
        const transactionId = trace.transaction.id;
        const method = trace.request.method || '';
        const path = trace.request.url.path;
        const _headers = trace.request.headers || {};
        const headers = Object.keys(_headers).map(key => ({ name: key, value: String(_headers[key].join('')) }));
        const body = trace.request.body
        return { timestamp, date, transactionId, method, path, headers, body }
    }).sort((a, b) => a.timestamp > b.timestamp ? 1 : -1);
}

export const parseTraces = (transactions:Array<Transaction>): Array<Request> => {
    let httpTraces = new Array<Trace>();
    for (const tr of transactions) {
        for (const trace of tr.traces) {
            if (isValidHttpTrace(trace)) {
                httpTraces.push(trace)
            }
            let childTraces = trace.children;
            let allChildTraces = new Array<Trace>();
            while (childTraces && childTraces.length > 0) {
                allChildTraces.push(...childTraces);
                const parentTraces = childTraces;
                childTraces = [];
                for (let parentTrace of parentTraces) {
                    childTraces.push(...(parentTrace.children || []));
                }
            }

            allChildTraces.forEach(childTrace => {
                if (isValidHttpTrace(childTrace)) {
                    httpTraces.push(childTrace);
                }
            });
        }
    }

    return httpTraces.map(trace => {
        const timestamp = new Date(trace['@timestamp']).getTime();
        const date = trace['@timestamp'];
        const transactionId = trace.transaction_id;
        const method = trace.http?.request?.method || '';
        const path = trace.url_path;
        const _headers = trace.http?.request?.headers || {};
        const headers = Object.keys(_headers).map(key => ({ name: key, value: String(_headers[key].join('')) }));
        const body = trace.http?.request?.body
        return { timestamp, date, transactionId, method, path, headers, body }
    }).sort((a, b) => a.timestamp > b.timestamp ? 1 : -1);
}