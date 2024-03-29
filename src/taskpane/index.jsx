import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";
import { HashRouter } from "react-router-dom";

/* global document, Office, module, require */

const title = "Contoso Task Pane Add-in";
let isOfficeInitialized = false;

const rootElement = document.getElementById("container");
const root = createRoot(rootElement);

/* Render application after Office initializes */
Office.onReady(() => {
  isOfficeInitialized = true;
  root.render(
    <FluentProvider theme={webLightTheme}>
      <HashRouter>
          <App title={title} isOfficeInitialized={isOfficeInitialized} />
        </HashRouter>
    </FluentProvider>
  );
});

if (module.hot) {
  module.hot.accept("./components/App", () => {
    const NextApp = require("./components/App").default;
    root.render(NextApp);
  });
}
