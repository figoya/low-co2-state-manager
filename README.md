# Low Carbon State Manager
A low-carbon, event-driven, state-manager for front-end web applications and websites that use web components

## Why and when should you use it?

If you want a light-weight front end that can handle complex user interactions and their results in a graceful and intuitive way.

## Why is it low carbon?

The internet demands a lot of electricity. The transfer of data is a big part of this. Low Carbon State Manager is just 3K in size and can enable you to have a sophisticated front end without using a "single page application" which typically involves the transfer of a gratuitously-large amount of code for every user.

## Background

Front ends have become increasingly complex in recent years. The separation of concerns has improved. Back ends are now rightly UI agnostic and provide data through APIs. Front ends now take all the responsibiity for what is displayed. This can include managing complex state in addition to the URL. 

A solution to this has been the emergence of the "single page application" which provides a comlex layer of abstration on top of the front end in order to allow developers to manage complex UIs and state in an sensible way. 

One downside of the single page application is that the amount of code served can be enormous, which means that the speed of the website or web app will be significantly slower than it needs to be. With fast internet speeds often isn't a problem but when network conditions are less than ideal the UX starts to suffer. It also means that more elctricity is used to transfer and process the data, which causes CO2 emissions.

## Web components

The emergence of Web Components, which run natively in web browsers, solve some of the problems of building a complex front end but they lack the ability to manage complex state. Low Carbon State Manager fills this gap. It is tiny in size at just 3-4K works natively in browsers, and is easy to install and use. Low Carbon State Manage can work without Web Components but they are natural partners.

# Install

Note: Low Carbon State Manager is designed to be used in the browser, without a JavaScript bundler. Nor should it be used as part of an SPA framework.

There are a few approaches to installing and using Low Carbon State Manager. Over time, as browsers improve and browser market share changes, this may change.

As of 01/23 the options below cover the avilable options and their current limitations to the best of my knowledge.

## Recommended

It is an ES Module and, as such, can only easily be used inside another module using ```import```. 

Currently the best way is to use npm to install the package and then, to then use the full path and file name in the import.

1. ```npm install low-carbon-state-manager```
2. In the ```<head></head>``` of each page add the module in which you wish to use it ```<script defer src="/js/my-script.js" type="module"></script>```
3. Inside ```"/js/my-script.js"``` add ```import { package-name } from '/node_modules/low-carbon-state-manager/dist/index.min.js';```

## Alternative approaches

### Using an Import Map
1. `npm install low-carbon-state-manager`
2. In the `<head></head>` of each page add the module in which you wish to use it 

```
<script async src="https://ga.jspm.io/npm:es-module-shims@1.6.3/dist/es-module-shims.js" integrity="sha384-R+gcUA3XvOcqevJ058aqe2+i0fMjGxEgXlstX2GcuHSwkr03d6+GPKDBbCTlt9pt" crossorigin="anonymous"></script>

<script type="importmap">
  {
    "imports": {
      "low-carbon-state-manager": "/node_modules/low-carbon-state-manager/dist/index.min.js"
    }
  }
</script>
```
3. Inside `"/js/my-script.js"` add 
```
import { package-name } from 'low-carbon-state-manager';
```
Warning: Import Maps are a nice way to make your import addresses more tidy and managable but there isn't good browser support yet, which means that the 35K `es-module-shims` is required. This shim is around 35K, not a huge size but 10 times larger than low-carbon-state-manager, making it less low carbon. 

### Using an Import Map with a CDN

1. In the `<head></head>` of each page add the module in which you wish to use it 

```
<script type="importmap">
  {
    "imports": {
      "low-carbon-state-manager": "https://cdn.jsdelivr.net/npm/low-carbon-state-manager@0.3.1/dist/index.min.js"
    }
  }
</script>
```
2. Inside `"/js/my-script.js"` add 
```
import { package-name } from 'low-carbon-state-manager';
```

Warning: This is convenient but 3rd party scripts fetched from a CDN SHOULD include an way of proving the integrity of the asset. As far as I know, there is currently no way to do this with an import map. See below for more info on "Subresource Integrity"

### Using a CDN

1. In the `<head></head>` of each page add the module in which you wish to use it 

```
<script src="https://cdn.jsdelivr.net/npm/low-carbon-state-manager@0.3.1/dist/index.min.js" integrity="sha384-AXyWif9/WHQJE/h5oE5/03WfSfbnFx2xbS6h7a2R05KjdCFw/fnnSLrTCpNPJIby" crossorigin="anonymous"></script>
```
2. Make all the named exports of the module accessible globally accessible by making them properties of the window object.

No `import` needed because this effectively makes this module a non-module

> Warning: I am not even sure if this works. The only reason I have included it is because it is the ony way I know to use an ES Module using a CDN with "subresource integrity", which would potentially be a very convenient way to install and use 3rd party modules. If I find a full solution to this I will add it here later. I am aware that the use of CDNs for serving JS has its critics and need to look into this more too. My final point of confusion is why it seems hard to use this method and use it like a ES Module. Perhaps I need to blog about this whole topic.

## Subresource integrity 

This is a way of proving that an asset on the web has not been changed since its publication, thus preventing malicious alterations of an asset on a compramised source URL. This can be done easiy by adding the integrity and crossorignin attributes to a script element. Read more here: "https://www.srihash.org/. In short, the process involves creating a hash of your resource using openssl and adding that to the script element's integrity attribute. Together with HTTPS and its use of public key infrastructure, this guarantees 3rd party assets are authentic.

# How to use Low Carbon State Manager

Low Carbon State Manager works with events and a publish/subscribe pattern.

1. Subscribe to an event. The subscription has an 'action' which is a function which will be called when the event is published.
2. Publish an event
3. Optionally, add a state modifier. A state modifier will change the app state when the event is published and before the subscriber action is called. 

Data can be passed from the publisher to the state modifier and the subscriber-action has access to the state.

So, for example, you could

1. Subscribe to an event called 'SHOE_DATA_FETCHED'. Add an action that uses shoe data from state and creates some html based on it
2. Fetch some shoe data from an API. When it is complete, Publish the event 'SHOE_DATA_FETCHED' along with the shoe data
3. Create a state-modifier that will add the shoe data to the state whenever 'SHOE_DATA_FETCHED'
