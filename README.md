# PlanningSession

In directory node-backend is a server. It can be started using: npm start.
The server should be restart when files are updated, but that doesn't seem to be working.

The frontend can be start using npm start in the root of the project

## Usage

First user start browser on http://localhost:4200, select 'join session' enter a name and click 'Create new session'

Second user copy the sessionId from the first user.

Start browser on http://localhost:4200, select 'join session' enter a name, paste the sessionId into the field 'Session Id' and click 'Join existing session'

Both users are in the same chat-like session


This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.0.5.

https://medium.com/factory-mind/websocket-node-js-express-step-by-step-using-typescript-725114ad5fe4

https://medium.com/factory-mind/angular-websocket-node-31f421c753ff


.p-tabview .p-tabview-nav {
  background: #ffffff;
  border: 0 none;
  border-width: 0 0 2px 0;
}
.p-tabview .p-tabview-nav li {
  margin-right: 0;
}
.p-tabview .p-tabview-nav li .p-tabview-nav-link {
  border: solid #a19f9d;
  border-width: 0 0 2px 0;
  border-color: transparent transparent transparent transparent;
  background: #ffffff;
  color: #605e5c;
  padding: 1rem;
  font-weight: 600;
  border-top-right-radius: 2px;
  border-top-left-radius: 2px;
  transition: box-shadow 0.2s;
  margin: 0 0.5rem -2px 0;
}
.p-tabview .p-tabview-nav li .p-tabview-nav-link:not(.p-disabled):focus {
  outline: 0 none;
  outline-offset: 0;
  box-shadow: inset 0 0 0 1px #605e5c;
}
.p-tabview .p-tabview-nav li:not(.p-highlight):not(.p-disabled):hover .p-tabview-nav-link {
  background: #f3f2f1;
  border-color: transparent;
  color: #605e5c;
}
.p-tabview .p-tabview-nav li.p-highlight .p-tabview-nav-link {
  background: #ffffff;
  border-color: #0078d4;
  color: #323130;
}
.p-tabview .p-tabview-left-icon {
  margin-right: 0.5rem;
}
.p-tabview .p-tabview-right-icon {
  margin-left: 0.5rem;
}
.p-tabview .p-tabview-close {
  margin-left: 0.5rem;
}
.p-tabview .p-tabview-panels {
  background: #ffffff;
  padding: 1rem;
  border: 0 none;
  color: #323130;
  border-bottom-right-radius: 2px;
  border-bottom-left-radius: 2px;
}
