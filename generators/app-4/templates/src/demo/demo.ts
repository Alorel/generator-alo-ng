import 'reflect-metadata';
import 'zone.js';
import {platformBrowserDynamic} from "@angular/platform-browser-dynamic";
import {DemoModule} from "./DemoModule";

platformBrowserDynamic().bootstrapModule(DemoModule);