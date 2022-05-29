import { App } from "./app.js";
let data = document.querySelector('input[type="hidden"][name = "serverUrl"]');
const application = new App(data.value);
