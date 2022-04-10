#Example project for Webdriver-reuse-session

## Create a project

    npm init -y

Install the prerequisites

    npm install webdriver-manager webdriver-reuse-session 

## Update Webdriver and start a session
Start a special terminal for webdriver-manager

    node_modules\.bin\webdriver-manager update

    node_modules\.bin\webdriver-manager start

## Run and repeat

    node_modules\.bin\webdriver-reuse-session

The first time, this creates a session 

    [INFO] DirectScript is set to true
    [INFO] Ok - lets start a new chrome session
    [INFO] About to call http://localhost:4444/wd/hub/session/077b44f8b99a8ebc3dff1305c718bcd5/url[INFO] Chrome Responses session url  {
    sessionId: '077b44f8b99a8ebc3dff1305c718bcd5',
    status: 0,
    value: 'data:,'
    }
    [INFO] Written session id '077b44f8b99a8ebc3dff1305c718bcd5' to file: './.seleniumSessionId.txt' 
    [INFO] finally a chrome driver session id 077b44f8b99a8ebc3dff1305c718bcd5 end time  2060 ms  

The second time we run this we reuse the same session

    [INFO] DirectScript is set to true
    [INFO] About to call http://localhost:4444/wd/hub/session/077b44f8b99a8ebc3dff1305c718bcd5/url[INFO] Chrome Responses session url  {
    sessionId: '077b44f8b99a8ebc3dff1305c718bcd5',
    status: 0,
    value: 'data:,'
    }
    [INFO] We found the following chrome sessions  { alive: true, id: '077b44f8b99a8ebc3dff1305c718bcd5' }
    [INFO] Written session id '077b44f8b99a8ebc3dff1305c718bcd5' to file: './.seleniumSessionId.txt'
    [INFO] finally a chrome driver session id 077b44f8b99a8ebc3dff1305c718bcd5 end time  55 ms  

Notice two things

    1) Webdriver session was ready in 55 ms vs 2060 ms
    2) The webdriver session id was to the standard output, and written in a file for reuse

What should be done now is to.. 

    1) Run webdriver-reuse-session in your npm script before your test
    2) Load the content of the .seleniumSessionId.txt before loading Protractor or similar
    3) Use the session id in your UI Test framework (e.g Protractor)

Hope this helps 

    For simplicity I have created a prepare and a start script in package.json