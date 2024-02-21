import * as React from "react";
import PropTypes from "prop-types";
import { Switch, Route } from "react-router-dom";
import Login from "./page/login";
import Home from './page/home';
function App() {
  return (
    <main>
         <Switch>
          <Route exact path="/">
             <Login/>
          </Route>
          <Route exact path="/home">
             <Home/>
          </Route>
          
        </Switch>
    
    </main>
  );
}

export default App;

App.propTypes = {
  title: PropTypes.string,
  isOfficeInitialized: PropTypes.bool,
};