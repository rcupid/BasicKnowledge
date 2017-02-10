/**
 * @license RequireJS domReady 2.0.1 Copyright (c) 2010-2012, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/requirejs/domReady for details
 */

define("domReady",[],function(){"use strict";function e(e){var n;for(n=0;n<e.length;n+=1)e[n](a)}function n(){var n=l;c&&n.length&&(l=[],e(n))}function o(){c||(c=!0,d&&clearInterval(d),n())}function r(e){return c?e(a):l.push(e),r}var t,i,d,u="undefined"!=typeof window&&window.document,c=!u,a=u?document:null,l=[];if(u){if(document.addEventListener)document.addEventListener("DOMContentLoaded",o,!1),window.addEventListener("load",o,!1);else if(window.attachEvent){window.attachEvent("onload",o),i=document.createElement("div");try{t=null===window.frameElement}catch(e){}i.doScroll&&t&&window.external&&(d=setInterval(function(){try{i.doScroll(),o()}catch(e){}},30))}"complete"===document.readyState&&o()}return r.version="2.0.1",r.load=function(e,n,o,t){t.isBuild?o(null):r(o)},r}),require.config({baseUrl:"../js/lib",paths:{jquery:"jquery-1.7.2",sotre:"store",underscore:"underscore",common:"common",a:"a",b:"b",domReady:"domReady",carinfo:"../index/carinfo"},shim:{sotre:{deps:["jquery","underscore"]}},config:{a:{size:"large"},b:{color:"blue"}}}),require(["domReady"],function(e){e(function(){console.log("domReady"),require(["jquery","carinfo"],function(e,n){console.log(e().jquery),n.showName()})})}),require.onError=function(e){throw console.log(e.requireType),"timeout"===e.requireType&&console.log("modules: "+e.requireModules),e},define("main",function(){});