export type Header = {
    readonly name: string,
    readonly value: string
}

export type Http = {
    readonly request?: HttpRequest,
    readonly response?: HttpResponse,
}

export type HttpRequest = {
    readonly headers?: ReadonlyArray<Header>,
    readonly method?: string,
    readonly body?: string,
}

export type HttpResponse = {
    readonly headers?: ReadonlyArray<Header>,
    readonly status_code?: number
}