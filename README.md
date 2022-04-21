# scalability-simulation-generator

Generates simulations from APM parser output

## How to use

Build project

```
yarn install && yarn run build
```

Put json files from APM parser (each json file should contain requests for a single journey) into some directory, e.g. `sample`

Run script:

```
node scripts/generate_simulations.js --dir ./sample --packageName org.kibanaLoadTest --url "http://localhost:5620"
```

Check `output` directory for .scala files.

Generated simulation example:

```
package org.kibanaLoadTest

import scala.concurrent.duration._

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import io.gatling.jdbc.Predef._

class SampleJourneyName extends Simulation {
  val httpProtocol = http
    .baseUrl("http://localhost:5620")
    .inferHtmlResources()
    .acceptHeader("*/*")
    .acceptEncodingHeader("gzip, deflate")
    .acceptLanguageHeader("en-US,en;q=0.9,ru;q=0.8,de;q=0.7")
    .userAgentHeader("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.83 Safari/537.36")

  val scn = scenario("Sample Journey Name v7.17.1")
    .exec(
      http("/9007199254740991/bundles/core/core.chunk.1.js")
        .get("/9007199254740991/bundles/core/core.chunk.1.js")
        .headers(Map("Cookie" -> "${Cookie}","Sec-Ch-Ua" -> "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"98\"","Accept" -> "*/*","Sec-Ch-Ua-Platform" -> "\"macOS\"","User-Agent" -> "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4695.0 Safari/537.36","Referer" -> "http://localhost:5620/app/home","Connection" -> "keep-alive","Sec-Fetch-Dest" -> "script","Sec-Fetch-Site" -> "same-origin","Host" -> "localhost:5620","Accept-Encoding" -> "gzip, deflate, br","Pragma" -> "no-cache","Sec-Fetch-Mode" -> "no-cors","Cache-Control" -> "no-cache","Accept-Language" -> "en-GB,en;q=0.9","Sec-Ch-Ua-Mobile" -> "?0"))
    )
    .pause(622.milliseconds)
    .exec(
      http("/9007199254740991/bundles/plugin/charts/kibana/charts.chunk.0.js")
        .get("/9007199254740991/bundles/plugin/charts/kibana/charts.chunk.0.js")
        .headers(Map("Cookie" -> "${Cookie}","Sec-Ch-Ua" -> "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"98\"","Accept" -> "*/*","Sec-Ch-Ua-Platform" -> "\"macOS\"","User-Agent" -> "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4695.0 Safari/537.36","Connection" -> "keep-alive","Referer" -> "http://localhost:5620/app/home","Sec-Fetch-Dest" -> "script","Sec-Fetch-Site" -> "same-origin","Host" -> "localhost:5620","Pragma" -> "no-cache","Accept-Encoding" -> "gzip, deflate, br","Sec-Fetch-Mode" -> "no-cors","Cache-Control" -> "no-cache","Accept-Language" -> "en-GB,en;q=0.9","Sec-Ch-Ua-Mobile" -> "?0"))
    )
    .pause(497.milliseconds)
    .exec(
      http("/9007199254740991/bundles/plugin/security/8.0.0/security.chunk.8.js")
        .get("/9007199254740991/bundles/plugin/security/8.0.0/security.chunk.8.js")
        .headers(Map("Cookie" -> "${Cookie}","Sec-Ch-Ua" -> "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"98\"","Accept" -> "*/*","Sec-Ch-Ua-Platform" -> "\"macOS\"","Referer" -> "http://localhost:5620/app/home","Connection" -> "keep-alive","User-Agent" -> "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4695.0 Safari/537.36","Sec-Fetch-Site" -> "same-origin","Sec-Fetch-Dest" -> "script","Host" -> "localhost:5620","Accept-Encoding" -> "gzip, deflate, br","Pragma" -> "no-cache","Sec-Fetch-Mode" -> "no-cors","Cache-Control" -> "no-cache","Accept-Language" -> "en-GB,en;q=0.9","Sec-Ch-Ua-Mobile" -> "?0"))
    )

  setUp(scn.inject(atOnceUsers(1))).protocols(httpProtocol)
}

```
