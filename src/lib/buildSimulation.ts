import { Header } from './types/http';
import { Request, Simulation } from './types/simulation';

const AUTH_PATH = '/internal/security/login';
const B_SEARCH_PATH = '/internal/bsearch';

const buildHeaders = (headers: ReadonlyArray<Header>) => {
    return headers
        .map(header => `"${header.name}" -> ${JSON.stringify(header.name !== 'Cookie' ? header.value : '${Cookie}')}`)
        .join(',').replace(/^/, 'Map(') + ')';
}

const buildPayload = (body: string) => JSON.stringify(body).replace(/"/g, "\\\"");

export const buildSimulationFromTemplate = (
  packageName: string,
  simulationName: string,
  protocol: string,
  scenario: string,
  setup: string
  ) => {
return `package ${packageName}

import scala.concurrent.duration._

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import io.gatling.jdbc.Predef._

class ${simulationName} extends Simulation {
${protocol}

${scenario}

${setup}
}`
}

const buildExecAuthStep = (path: string, headers: string, payload: string) =>
`    .exec(
      http("${path}")
        .post("${path}")
        .body(StringBody("${payload}"))
        .asJson
        .headers(${headers})
        .check(headerRegex("set-cookie", ".+?(?=;)").saveAs("Cookie"))
    )`;

const buildExecBSearchStep = (path: string, headers: string, payload: string) =>
`    .exec(
       http("${path}")
         .post("${path}")
         .headers(${headers})
         .body(StringBody(${payload}))
         .asJson
         .check(status.is(200).saveAs("status"))
         .check(jsonPath("$.result.id").find.saveAs("requestId"))
         .check(jsonPath("$.result.isPartial").find.saveAs("isPartial"))
     )
     .exitHereIfFailed
     // First response might be “partial”. Then we continue to fetch for the results
     // using the request id returned from the first response
     .asLongAs(session =>
       session("status").as[Int] == 200
         && session("isPartial").as[Boolean]
     ) {
         exec(
           http("${path}")
             .post("${path}")
             .headers(${headers})
             .body(StringBody(${payload}))
             .asJson
             .check(status.is(200).saveAs("status"))
             .check(jsonPath("$.result.isPartial").saveAs("isPartial"))
         )
         .exitHereIfFailed
         .pause(1)
       }`;

const buildExecHttpStep = (path: string, method: string, headers: string) =>
`    .exec(
      http("${path}")
        .${method}("${path}")
        .headers(${headers})
    )`;

const buildExecHttpWithBodyStep = (path: string, method: string, headers: string, payload: string) =>
`    .exec(
      http("${path}")
        .${method}("${path}")
        .body(StringBody("${payload}"))
        .asJson
        .headers(${headers})
    )`;

export const buildPauseStep = (delay: number) =>
`    .pause(${delay}.milliseconds)`;

export const buildProtocol = (baseUrl: string) =>
`  val httpProtocol = http
    .baseUrl("${baseUrl}")
    .inferHtmlResources()
    .acceptHeader("*/*")
    .acceptEncodingHeader("gzip, deflate")
    .acceptLanguageHeader("en-US,en;q=0.9,ru;q=0.8,de;q=0.7")
    .userAgentHeader("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.83 Safari/537.36")`;

export const buildScenario = (scenarioName: string) =>
`  val scn = scenario("${scenarioName}")`;

export const buildSetup = (maxUsersCount: number) =>
`  setUp(scn.inject(atOnceUsers(${maxUsersCount}))).protocols(httpProtocol)`;

export const buildExecStep = (request: Request) => {
  const headers = buildHeaders(request.headers);
  const method = request.method.toLowerCase();
  if (!request.body) {
      return buildExecHttpStep(request.path, method, headers);
  } else if (request.path.includes(AUTH_PATH)) {
      return buildExecAuthStep(request.path, headers, buildPayload(request.body));
  } else if (request.path.includes(B_SEARCH_PATH)) {
      return buildExecBSearchStep(request.path, headers, buildPayload(request.body));
  } else {
      return buildExecHttpWithBodyStep(request.path, method, headers, buildPayload(request.body));
  }
}

const constructScenario = (scenarioName: string, requests: ReadonlyArray<Request>): string => {
  const start = buildScenario(scenarioName);
  // convert requests into array of Gatling exec http calls
  const execs = requests.map((request, index, reqArray) => {
    // construct Gatling exec http calls
    const exec = buildExecStep(request);
    // add delay before next request
    if (index < reqArray.length -1) {
      const delay = reqArray[index+1].timestamp - request.timestamp;
      if (delay > 0) {
        return exec + '\n' + buildPauseStep(delay);
      }
    }
    return exec;
  });
  return start + '\n' + execs.join('\n');
}

export const buildSimulation = (params: Simulation) => {
  const { simulationName, packageName, scenarioName, baseUrl, maxUsersCount, requests } = params;
  const protocol = buildProtocol(baseUrl);
  const scenario = constructScenario(scenarioName, requests);
  const setup = buildSetup(maxUsersCount);

  return buildSimulationFromTemplate(packageName, simulationName, protocol, scenario, setup);
}
