import {instantiateApp4} from "./instantiate-generator";
import * as yo from 'yeoman-test';
import {get4appPrompts} from "./get4appPrompts";
import {ConfigKey} from "../../util/ConfigKey";

const app = instantiateApp4();
const prompts = get4appPrompts();
prompts[ConfigKey.installDeps] = true;

yo.mockPrompt(app, prompts);

app.run((e: Error) => {
  if (e) {
    console.error(e);
    process.exit(1);
  }
});