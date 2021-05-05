# Scrum poker

In directory node-backend is a server. It can be started using: npm start.
The server should be restart when files are updated, but that doesn't seem to be working.

The frontend can be start using npm start in the root of the project

## Description

The poker view consists of 3 screen areas. The left part will show all the users that are in the poker session. The right area will 
show the user name and the session id of the current session. The center area will show the voting cards or the results of the 
voting session depending on the phase that the session is in.

## Usage

### First user

First user start browser on http://localhost:4200, select the tab 'Poker' enter a name and click 'Create new session'

This user is now the scrummaster during the session and is the only one that can change the phase of the session.

There are 2 phase: voting and showResults

The first phase allows uses to enter their vote. When a user has entered a vote a chack will be shown after his name in the user list.

The second phase shows the results of the voting in a graph

### Second ..n users

Other users neede the session id of the session they will join. The scrummaster will know that id.

Start browser on http://localhost:4200, select the tab 'Poker' enter a name, enter the sessionId into the field 'Session Id' and click 'Join existing session'

All users that use the same sessionId are in the same poker-voting session.

### Voting

All users can enter their vote by selecting a card. Votes can be changed during the 'voting' phase. After the users have entered their 
vote the scrummaster can end the voting phase and switch to the showResults phase where a graph will show the votes.

The scrummaster can switch to another voting phase and the cycle starts over. 

When a user enters the session it will be moved to the same phase as the rest of the users in the session. So if the session phase is showResults 
and a new users enters the session it will see the results of a voting that he did not participate in.

## Disclaimer

This is only a very rudimentary implementation and needs lot of security and other features.


This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.0.5.

https://medium.com/factory-mind/websocket-node-js-express-step-by-step-using-typescript-725114ad5fe4

https://medium.com/factory-mind/angular-websocket-node-31f421c753ff


PrimeNG styles:
./                       bootstrap4-light-purple/  mdc-light-indigo/     saga-blue/
../                                                md-dark-deeppurple/   saga-green/
arya-blue/               luna-amber/               md-dark-indigo/       saga-orange/
arya-green/              luna-blue/                md-light-deeppurple/  saga-purple/
arya-orange/             luna-green/               md-light-indigo/      vela-blue/
                         luna-pink/                nova/                 vela-green/
bootstrap4-dark-blue/    mdc-dark-deeppurple/      nova-accent/          vela-orange/
bootstrap4-dark-purple/  mdc-dark-indigo/          nova-alt/             vela-purple/
bootstrap4-light-blue/   mdc-light-deeppurple/     rhea/

dark:
arya-purple/             

light:
fluent-light/             


Styling tabview:
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
