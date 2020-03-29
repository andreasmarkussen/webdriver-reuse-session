# webdriver-reuse-session
Manage Webdriver/Selenium/Chromedriver sessions and make sessions id's available for e.g. Protractor and other TDD and BBD tools. 

## Speed up your tests

Using this can take between 5-10 seconds of your start-up time, and sometimes even more. 
If you have an authentication step, then this can be added. 
I worked a case, where I could cut off 30 seconds of overhead, every time I wanted to run a 5 seconds test. 

### Other tips

Resist the temptation of using ts-node, unless you are doing it for the sake of debugging. 
Have a terminal running next to your other terminal with 'tsc -w'
This is so much faster

## Assumptions

1. The local selenium/webdriver host is always http://localhost:4444/wd/hub 
2. The way to control a [Web Driver](https://w3c.github.io/webdriver/) is best done using [webdriver-manager](https://www.npmjs.com/package/webdriver-manager). I assume that you have this installed
3. The best way to work with multiple browser types is [Protractor](https://www.protractortest.org/#/(https://w3c.github.io/webdriver/)

If you ... 
 * believe that my assumptions are flawed...
 * have found a bug...
 * need something else...

Make an issue or a pull request or reach out to me via email. 

## Installation

```sh
npm install webdriver-reuse-session
```

## Usage

### Start a browser or find a Chrome Browser

1. Start Webdriver-manager or a raw selenium

```sh
npm webdriver-manager start
```

2. Start the reuse sessions script

```sh
webdriver-reuse-session
```



```sh
webdriver-reuse-session
```

### From your test tool

1. Get the SessionID
  
    ```javascript
    const sessionId = fs.readFileSync('.seleniumSessionId.dat')
    ```

2. Use the SessionID
   
    ```javascript
    /** in your protractor.conf.js or similar config object*/

    directConnect: undefined,  // can be omitted, but just to show that directConnnect must not be set
    seleniumAddress: 'http://localhost:4444/wd/hub',
    seleniumSessionId: sessionIdFromFile,
    ```


## Feedback and Issues

This is my first package on NPMJS, so feel free to give me feedback and log issues on Github

With wishes of faster testing for all of us, 

br,

Andreas

