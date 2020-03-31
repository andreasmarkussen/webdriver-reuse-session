# WebDriver Reuse Session

## TL;DR

1) run 'webdriver-reuse-browser' - get the session id from a browser that can be reused
2) insert the session id in the config file or via the command line

## The Why?

*If you want better, faster and more enjoyable test, then this is the place to be*

 * **Better** - because the more times you run your test, the more bugs you can find
 * **Faster** - because browser start-up time, cache warm-up (loading of images and static JS), authentication and similar is removed or reduced
 * **More Enjoyable** - because slow test and long feedback times, is the oposite of [Flow and Programmer Happiness](https://www.youtube.com/watch?v=AJ7u_Z-TS-A&feature=youtu.be&t=116). 

Protractor is a nice an well-behaving tool, so it closes the browsers it creates, but sometimes you want to keep it open for debugging purposes or for speeding up the next test. 

And Protractor actually supports attaching to browsers, but it needs some manual to start the browser. 

This tool can.. 

Start Webdriver, Selenium or ChromeDriver sessions and make sessions id's available for [Protractor](https://www.protractortest.org) and similar Web Browser Test Automation Frameworks

## Speed up your tests

The normal approach is that every test run starts a new browser, which often takes between 5 to 10 seconds. 
Using [webdriver-reuse-session]()
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

Make an [issue](https://github.com/andreasmarkussen/webdriver-reuse-session/issues/new) or a [pull request](https://github.com/andreasmarkussen/webdriver-reuse-session/compare) or reach out to me via email - andreas@markussen.dk . 

## Installation

```sh
npm install webdriver-reuse-session
```

## Usage

The 'webdriver-reuse-session' script can be used both in a manual mode and in an automatic mode.

### Manual Approach

#### Start a browser or find a Chrome Browser, in the manual approach

1. Start Webdriver-manager or a raw selenium instance

```sh
npm webdriver-manager start
```

2. Start the reuse sessions script

```sh
webdriver-reuse-session
```

3. Take a note of the session id

#### From your test tool

1. Setup your script to use a local host Selenium
  
    ```javascript
    /** in your protractor.conf.js or similar config object*/
    directConnect: undefined,  // can be omitted, but just to show that directConnect must not be set
    seleniumAddress: 'http://localhost:4444/wd/hub',
    ```

2. Use the SessionID in the command line

    protractor --seleniumSessionId=6aec0d5861daa54d0b9be17ec47bea70
   
    
### The automatic approach

1. Get the SessionID
  
    ```javascript
    const sessionIdFromFile = fs.readFileSync('.seleniumSessionId.txt')
    ```

2. Use the SessionID
   
    ```javascript
    /** in your protractor.conf.js or similar config object*/

    directConnect: undefined,  // can be omitted, but just to show that directConnnect must not be set
    seleniumAddress: 'http://localhost:4444/wd/hub',
    seleniumSessionId: sessionIdFromFile,
    ```


## Questions and Answers

### What Test runners will this work with

It is independent of the test runner, it depends on how you define your Selenium Session ID. 

### Does this work with Cucumber

You can use this with Cucumber, Mocha, Jest and other test automation frameworks

## Feedback and Issues

This is my first package on NPMJS, so feel free to give me feedback and log issues on Github

With wishes of faster testing for all of us,

Andreas M

