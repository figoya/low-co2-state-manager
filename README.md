# Low CO2 State Manager
A low-CO2, event-driven, state-manager for front-end web applications and websites that use web components

## Why and when should you use it?

If you want a light-weight front end that can handle complex user interactions and their results in a graceful and intuitive way.

## Why is it low CO2?

The internet demands a lot of electricity. The transfer of data is a big part of this. Low CO2 State Manager is just 3K in size and can enable you to have a sophisticated front end without using a "single page application" which typically involves the transfer of a gratuitously-large amount of code for every user.

## Background

Front ends have become increasingly complex in recent years. The separation of concerns has improved. Back ends are now rightly UI agnostic and provide data through APIs. Front ends now take all the responsibiity for what is displayed. This can include managing complex state in addition to the URL. 

A solution to this has been the emergence of the "single page application" which provides a comlex layer of abstration on top of the front end in order to allow developers to manage complex UIs and state in an sensible way. 

One downside of the single page application is that the amount of code served can be enormous, which means that the speed of the website or web app will be significantly slower than it needs to be. With fast internet speeds often isn't a problem but when network conditions are less than ideal the UX starts to suffer. It also means that more elctricity is used to transfer and process the data, which causes CO2 emissions.

## Web components

The emergence of Web Components, which run natively in web browsers, solve some of the problems of building a complex front end but they lack the ability to manage complex state. Low CO2 State Manager fills this gap. It is tiny in size at just 3-4K works natively in browsers, and is easy to install and use. Low CO2 State Manage can work without Web Components but they are natural partners.

# Install

Note: Low CO2 State Manager is designed to be used in the browser, without a JavaScript bundler. Nor should it be used as part of an SPA framework.

There are a few approaches to installing and using Low CO2 State Manager. Over time, as browsers improve and browser market share changes, this may change.

As of 01/23 the options below cover the avilable options and their current limitations to the best of my knowledge.

## Recommended

It is an ES Module and, as such, can only easily be used inside another module using ```import```. 

Currently the best way is to use npm to install the package and then, to then use the full path and file name in the import.

1. ```npm install low-co2-state-manager```
2. In the ```<head></head>``` of each page add the module in which you wish to use it ```<script defer src="/js/my-script.js" type="module"></script>```
3. Inside ```"/js/my-script.js"``` add ```import { package-name } from '/node_modules/low-co2-state-manager/dist/index.min.js';```

## Alternative approaches

### Using an Import Map
1. `npm install low-co2-state-manager`
2. In the `<head></head>` of each page add the module in which you wish to use it 

```
<script async src="https://ga.jspm.io/npm:es-module-shims@1.6.3/dist/es-module-shims.js" integrity="sha384-R+gcUA3XvOcqevJ058aqe2+i0fMjGxEgXlstX2GcuHSwkr03d6+GPKDBbCTlt9pt" crossorigin="anonymous"></script>

<script type="importmap">
  {
    "imports": {
      "low-co2-state-manager": "/node_modules/low-co2-state-manager/dist/index.min.js"
    }
  }
</script>
```
3. Inside `"/js/my-script.js"` add 
```
import { package-name } from 'low-co2-state-manager';
```
Warning: Import Maps are a nice way to make your import addresses more tidy and managable but there isn't good browser support yet, which means that the 35K `es-module-shims` is required. This shim is around 35K, not a huge size but 10 times larger than low-co2-state-manager, making it higher in CO2 emissions. 

### Using an Import Map with a CDN

1. In the `<head></head>` of each page add the module in which you wish to use it 

```
<script type="importmap">
  {
    "imports": {
      "low-co2-state-manager": "https://cdn.jsdelivr.net/npm/low-co2-state-manager@0.3.1/dist/index.min.js"
    }
  }
</script>
```
2. Inside `"/js/my-script.js"` add 
```
import { package-name } from 'low-co2-state-manager';
```

Warning: This is convenient but 3rd party scripts fetched from a CDN SHOULD include an way of proving the integrity of the asset. As far as I know, there is currently no way to do this with an import map. See below for more info on "Subresource Integrity"

### Using a CDN

1. In the `<head></head>` of each page add the module in which you wish to use it 

```
<script src="https://cdn.jsdelivr.net/npm/low-co2-state-manager@0.3.1/dist/index.min.js" integrity="sha384-AXyWif9/WHQJE/h5oE5/03WfSfbnFx2xbS6h7a2R05KjdCFw/fnnSLrTCpNPJIby" crossorigin="anonymous"></script>
```
2. Make all the named exports of the module accessible globally accessible by making them properties of the window object.

No `import` needed because this effectively makes this module a non-module

> Warning: I am not even sure if this works. The only reason I have included it is because it is the ony way I know to use an ES Module using a CDN with "subresource integrity", which would potentially be a very convenient way to install and use 3rd party modules. If I find a full solution to this I will add it here later. I am aware that the use of CDNs for serving JS has its critics and need to look into this more too. My final point of confusion is why it seems hard to use this method and use it like a ES Module. Perhaps I need to blog about this whole topic.

## Subresource integrity 

This is a way of proving that an asset on the web has not been changed since its publication, thus preventing malicious alterations of an asset on a compramised source URL. This can be done easiy by adding the integrity and crossorignin attributes to a script element. Read more here: "https://www.srihash.org/. In short, the process involves creating a hash of your resource using openssl and adding that to the script element's integrity attribute. Together with HTTPS and its use of public key infrastructure, this guarantees 3rd party assets are authentic.

# How to use Low CO2 State Manager

Low CO2 State Manager works with events, a publish/subscribe pattern and state modifiers

The best way to understand how it works is by looking at the examples in the campanion demo app:

https://github.com/figoya/low-co2-state-manager-demo

Assuming you have node and npm installed you can:

```
$ git clone https://github.com/figoya/low-co2-state-manager-demo
$ cd low-co2-state-manager-demo
$ npm install
$ npm start
```


## Events

These are custom events that you create to indicate that something has happened

## Publish/Subscribe

You can publish events and subscribe to them. 

## Publish

You can publish events and optionally pass data to the state modifier. For example, you might fetch some product data, publish a "FETCH_PRODUCT_DATA_SUCCEEDED" event and add the fetch data.

## State modifiers

A state modifier listens for published events, and changes the state. This happens after publish and before any subscriptions are notified. 

State modifiers are optional. You can publish and subscribe to events without changing state at all.

In our example above, there may be a State Modiefier that listens for "FETCH_PRODUCT_DATA_SUCCEEDED" and adds the product data to state in whatever way is desired.

## Subscriptions

Subscriptions are actions that happen after an event is published, and after the state has been (optionally) changed by the state modifier. Like state modifiers, they 'listen' for events and do something when they happen.

In our example above, there may be one or more subscriptions to "FETCH_PRODUCT_DATA_SUCCEEDED" that take the product data stored in state, and add it to the DOM

## Scope

Scope is just a way of dividing things up into logically separate areas of work in the app. For example, if you think it's helpful to have all the events and state for the main menu scoped to "main-menu" you can do this. Other parts of the app can still publish or subscribe this scoped area. Scopes don't restrict what you can do or access, they just help to organise your app.

## Persistace 

State persists between page loads. You can make use of this by using the built in "DOM_CONTENT_LOADED" event which happens at "safe" time once all JS and loaded and the DOM is available.

For example, if you wanted the product data (in above examples) to be used in subsequent pages, you would create a subscription to "DOM_CONTENT_LOADED" that used the data already stored in the state to add the products to the DOM.

## Demo app

It's best to look at the examples in the demo app to see how to implement these concepts

