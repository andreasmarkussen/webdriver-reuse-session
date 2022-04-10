import axios from "axios";
const wdBaseUrl = "http://localhost:4444";
import * as fs from "fs";

/**
 * This file must be moved to a separate repository,
 * since it can be used across protractor projects.
 *
 * There will be very few changes in this file going forward
 * The coding style also differs a lot.
 *
 * Improvements:
 * 1) move to separate NPM project
 * 2) stop the execution if the first is ok, don't iterate over all sessions.
 */

// tslint:disable: ter-arrow-body-style
axios.defaults.timeout = 250;

const wdUrl = (urlPath: string) => wdBaseUrl + urlPath;
const shouldBeHeadlessMode = false;

let logLevel = "INFO";

function levelStringToNumber(logLevelName: string): number {
  switch (logLevelName) {
    case 'ERROR':   return 0;
    case 'WARN':    return 1;
    case 'INFO':    return 2;
    case 'DEBUG':   return 3;
    case 'VERBOSE': return 4;
    default: throw new Error(`Unknown logLevelName '${logLevelName}' `);
  }
}

const logOut = (level: string, ...args: any[]) => {
  const logLevelId = levelStringToNumber(logLevel) + 1;
  const requestedLogLevelId = levelStringToNumber(level);
  // console.log(`Log levels ${logLevelId} and ${requestedLogLevelId} `)
  if (requestedLogLevelId < logLevelId) {
    // tslint:disable-next-line: no-console
    console.log(`[${level}]`, ...args);
  }
  else {
    // console.log("[Wont print]", level, ...args);
  }
};

//const logInfo = (...args: {}[]) => console.log("INFO", ...args);
const logInfo = (...args: any[]) => logOut("INFO", ...args);
const logError = (...args: any[]) => logOut("ERROR", ...args);
const logWarning = (...args: any[]) => logOut("WARN", ...args);
const logDebug = (...args: any[]) => logOut("DEBUG", ...args);
const logVerbose = (...args: any[]) => logOut("VERBOSE", ...args);

const isArgumentFound = (argName: string): boolean =>
  process.argv.filter(arg => arg.includes(argName)).length > 0


const directScript = process.argv.length > 1 && process.argv[1].includes('webdriver-reuse-session');
if (directScript) {
  const verboseMode = isArgumentFound('verbose')
//  const verbose = process.argv.filter(arg => arg.includes("verbose")).length;
  if (verboseMode) {
    logLevel = "VERBOSE";
    logVerbose("OK - Mode is set to verbose");
    logDebug("Direct Script", directScript);
  }
  logInfo("DirectScript is set to", directScript);
  logDebug(`Process ${process.execPath} ${process.argv} `);
}

const sessionIdFileName = "./.seleniumSessionId.txt";

/** Returns the sessionId from the file, if defined
 * If no file is found, or it is mallformed, it will return undefined
 */
export function getSessionIdFromFileSync() {
  try {
    const sessionId = fs.readFileSync(sessionIdFileName, "utf8");
    if (sessionId.length === 32) {
      return sessionId;
    }
    else {
      return undefined;
    }

  } catch (error) {
    return undefined;
  }
}

function setSessionIdToFileSync(sessionId: string) {
  logInfo(`Written session id '${sessionId}' to file: '${sessionIdFileName}' `);
  return fs.writeFileSync(sessionIdFileName, sessionId);
}

async function startChromeSessionAsync() {
  logDebug("About to start a new chrome...");
  const chromeOptions = {
    w3c: false,
    args: [
      "--no-sandbox",
      "--disable-infobars",
      "--log-level=3",
      "--disable-gpu",
      "--window-size=1024,800",
    ].concat(shouldBeHeadlessMode ? ["--headless"] : []),
  };

  const createSessionBody  = { desiredCapabilities: { browserName: "chrome", chromeOptions, w3c: false } };
  const res = await axios.post(wdUrl("/wd/hub/session"), createSessionBody, { timeout: 10000 });
  logDebug("Result of starting chrome", res.data);
  return res.data;
}

async function isWebdriverRunningAsync(): Promise<{ status: number, value: Array<{}> }> {
  return new Promise(async resolve => {
    try {
      const res = await axios.get(wdUrl("/wd/hub/sessions"));
      logDebug("Is WebDriver running response", res.statusText, res.data);
      if (res.data.value) {
        resolve(res.data);
      }
      resolve(res.data);
    } catch (error) {
      logError("Error checking webdriver", error);
      resolve({ status: -1, value: [] });
    }
  });
}

async function isTheChromeSessionAlive(sessionId: string) {
  return new Promise(async (resolve, reject) => {
    if (sessionId.length !== 32) {
      throw new Error("Chrome session id must be 32 chars " + sessionId);
    }
    try {
      logInfo("About to call " + wdUrl(`/wd/hub/session/${sessionId}/url`));
      const chromeResponse = await axios.get(wdUrl(`/wd/hub/session/${sessionId}/url`));
      logInfo("Chrome Responses session url ", chromeResponse.data);
      if (chromeResponse.data.state === "success" || chromeResponse.data.status === 0) {
        logDebug("Response from chrome session " + sessionId + "was" + chromeResponse.data);
        resolve(true);
      } else {
        logError("The chrome session did not reply success", chromeResponse.data);
        resolve(false);
      }
    } catch (err) {
      const error = err as Error;  
      logDebug(`Chrome alive check failed for session '${sessionId}' - ERROR: `, error.message);
      resolve(false);
    }
  });
}

async function extractStatusFromChromeSessionsAsync(webDriverResponse: { status: number; value: Array<{}>; }) {
  return Promise.all(webDriverResponse.value.map(async (session: any) => {
    const isAlive = await isTheChromeSessionAlive(session.id);
    logDebug(` - Is alive signal ${session.id} was ${isAlive} `);
    return { alive: isAlive, id: session.id };
  }));
}

async function extractLivingChromeSessionsAsync(webDriverResponse: { status: number; value: Array<{}>; }) {
  const chromeSessionStatus = await extractStatusFromChromeSessionsAsync(webDriverResponse);
  const livingChromeSessions = chromeSessionStatus.filter(session => session.alive);
  return livingChromeSessions;
}

async function killChromeSession(sessionId: string) {
  logInfo("Killing session " + sessionId);
  const res = axios.delete(wdUrl(`/wd/hub/session/${sessionId}`), { timeout: 30000 });
  logDebug(" - done killing session " + sessionId);
  return res;
}

async function killDeadChromeSessionsAsync(webDriverResponse: { status: number; value: Array<{}>; }) {
  const chromeSessionStatus = await Promise.all(webDriverResponse.value.map(async (session: any) => {
    const isAlive = await isTheChromeSessionAlive(session.id);
    logInfo(` - Is alive signal ${session.id} was ${isAlive} `);
    return { alive: isAlive, id: session.id };
  }));
  const livingChromeSessions = chromeSessionStatus.filter(session => !session.alive);
  return livingChromeSessions;
}
async function justTellMeTheChromeId() {
  const webDriverResponse = await isWebdriverRunningAsync();
  if (webDriverResponse.status === -1) {
    logError("Please start a webdriver-manager using webdriver-manager start");
    process.exit();
  }
  logDebug("Wd Status", webDriverResponse.status);
  if (webDriverResponse.value === undefined) {
    logWarning("No WebDriver Sessions");
    const res = await startChromeSessionAsync();
    logInfo("The response for starting a chrome session was", res);
    return true;
  }
  if (webDriverResponse.value.length > 0) {
    const livingChromeSessions = await extractLivingChromeSessionsAsync(webDriverResponse);
    if (livingChromeSessions && livingChromeSessions.length > 0) {
      logInfo("We found the following chrome sessions ", livingChromeSessions.reduce((session: any) => session.id));
      return livingChromeSessions[0].id;
    }
  }
  logInfo("Ok - lets start a new chrome session");
  const newSession = await startChromeSessionAsync();
  logDebug("Info - Chrome started", newSession);
  const webDriverResponse_2nd = await isWebdriverRunningAsync();

  const chromeSessionStatus = await extractStatusFromChromeSessionsAsync(webDriverResponse_2nd);
  const livingChromeSessions2nd = chromeSessionStatus.filter(session => session.alive);
  // const deadChromeSessions = chromeSessionStatus.filter(session => !session.alive);
  // await deadChromeSessions.forEach(async session => await killChromeSession(session.id));

  if (livingChromeSessions2nd.length > 0) {
    return livingChromeSessions2nd[0].id;
  }
  else {
    logError("No Chrome sessions are alive?", chromeSessionStatus);
  }
}

if (directScript) {
  const startTime = Date.now();
  justTellMeTheChromeId()
    .then(data => {
      setSessionIdToFileSync(data);
      logInfo("finally a chrome driver session id", data, "end time ", (Date.now() - startTime), "ms");
    })
    .catch(err => logError("Error", err));
}
export const getChromeSessionId = justTellMeTheChromeId;
