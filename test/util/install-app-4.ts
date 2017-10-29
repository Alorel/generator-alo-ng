import {instantiateApp4} from "./instantiate-generator";
import * as yo from 'yeoman-test';
import {get4appPrompts} from "./get4appPrompts";

const app = instantiateApp4();

yo.mockPrompt(app, get4appPrompts());

app.run((e: Error) => {
  if (e) {
    console.error(e);
    process.exit(1);
  }
});