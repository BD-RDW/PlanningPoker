# PlanningSession

In directory node-backend is a server. It can be started using: npm start.
The server should be restart when files are updated, but that doesn't seem to be working.

The frontend can be start using npm start in the root of the project

## Usage

First user start browser on http://localhost:4200, select 'join session' enter a name and click 'Create new session'

Second user copy the sessionId from the first user.

Start browser on http://localhost:4200, select 'join session' enter a name, paste the sessionId into the field 'Session Id' and click 'Join existing session'

Both users are in the same chat-like session

## Websocket Client-Server actions
```
JoinSession         (Session)       -> User get added to the session                    ==> payload: <null>
UpdateRetroSession  (Session)       <- Server updates userlist                          ==> payload: userList
UpdatePlanSession   (Session)       <- Server updates userlist                          ==> payload: userList
AddMessage          (Session)       -> Usermessage received                             ==> payload: messageText
NewMessage          (Session)       <- Server distributes messageEntered                ==> payload: messageText
EnterVote           (Refinement)    -> User enters vote                                 ==> payload: vote
UpdateVotes         (Refinement)    <- Server updates user votes                        ==> payload: RefinementUserInfo[]
SwitchPhase         (Refinement)    -> Scrummaster switches phase                       ==> payload: phase  [voting - showResults]
UpdatePhase         (Refinement)    <- Server updates phase                             ==> payload: phase
InitRetrospective   (Retrospective) <- Server columns etc. to joined user               ==> payload: RetrospectiveColumn[]
AddNote             (Retrospective) -> User adds new note                               ==> payload: RetrospectiveNote
UpdateNote          (Retrospective) <- Server updates note                              ==> payload: colId
UpdateNote          (Retrospective) -> User informs Server of the updates to the note   ==> payload: RetrospectiveNote
EditNote            (Retrospective) -> User informs Server that the note gets changed   ==> payload: RetrospectiveNote
DeleteNote          (Retrospective) -> User informs Server that the note is removed     ==> payload: RetrospectiveNote
DeleteNote          (Retrospective) <- Server informs User that the note 1s removed     ==> payload: RetrospectiveNote
ERROR               (any)           <- Server                                           ==> payload: errormessage
```
 
## Deployment

1. Bouw frontend. Deze plaatst de bestanden in node-backend/dist/public
1. Bouw backend.
1. Run: vanuit node-backend/dist: node server/server.js

## Rollout to OpenShift

- build application als described above
- from directory node-backend
- oc login
- oc project wd-scrum-ont
- oc start-build nodejs --from-dir .
- Open Openshift UI en selecteer project wd-scrum-ont
- Als deployment van nodejs klaar is open de deployment descriptor
- Copy de image sha
- plaats de nieuwe image sha in scrum-tooling-deploy\overlays\ont\kustomization.yaml
- run scrum-tooling-deploy\deploy.sh

# Changes:
20210621 : Added [reconnecting-websocket](https://npm.io/package/reconnecting-websocket)

# ToDo

- Retro stemmen op berichten (Liken)
- Mergen van berichten
- Export
- Messages + \n

- Remove an interface called session (there are 2 of them)
- introduce the message interface in the server 
- introduce a refinment interface to hold the specific about de refinement session. So session can be used for only the session related stuff
- add regular connection checking to prune users and sessions that have disconnected.
- setTimeout(function, msec)
- new Date();
- current.toLocaleTimeString();
- current.toLocaleDateString();
- current.toLocaleString();

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.0.5.

https://medium.com/factory-mind/websocket-node-js-express-step-by-step-using-typescript-725114ad5fe4

https://medium.com/factory-mind/angular-websocket-node-31f421c753ff

## Moving commit between repos

Export from repo

```
git format-patch --output-directory "../patches" FIRST_COMMIT_SHA1~..LAST_COMMIT_SHA1
// One commit only: git format-patch --output-directory .. -1 commit_sha
```
Import into repo

```
git am 0001-Example-Patch-File.patch
git am *.patch
```

## protractor
```
npm install -g protractor
webdriver-manager update
webdriver-manager start
http://localhost:4444/wd/hub
npm install -D jasmine-reporters
```
## Run e2e tests

1. Start server (in node-backend)
1. Start webdriver (webdriver-manager start)
1. Run e2e tests (npm run e2e)

## Test text

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

## Styling for primeng components

styling for primeng components from src/styles.css

```
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
```
