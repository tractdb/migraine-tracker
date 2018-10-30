# Goal-Directed migraine tracking app



## Setup

I'm on a mac, so setup/running might be different for windows.  Sorry!
I'm also trying to retrace steps after already having everything on my machine, so I might have missed a dependency or something.

- Install [Node.js](https://nodejs.org/en/)

- Install [ionic](https://ionicframework.com/docs/intro/installation/): 

> $ npm install -g ionic cordova 

- npm install 

Add ios platform:
> $ ionic cordova platform add ios

## Run

### In Chrome: 

Serving the app should automatically open a new chrome tab at [localhost:8100/](http://localhost:8100/).  Open the developer tools and select the "toggle device toolbar" in the upper left corner to make it look like a phone.

> $ ionic serve 



### In an Emulator: 
There's some bug that's causing it to fail on mac without that buildflag, on my machine at least.

> $ ionic cordova build ios

> $ ionic cordova emulate ios -l -c -- --buildFlag="-UseModernBuildSystem=0"
