# Scrum tooling

Scrum tooling is a simple application to assist during the retrospective and refinement.

In directory node-backend is a server. It can be started using: npm run startDev.
The server will be restart when files are updated.

In de root directory is the frontend that can be start using npm start

## Usage

First user start browser on http://localhost:4200, select the type of session (retrospective or planning) enter a name and click 'Create new session'

Click on the sessionId to copy an url to the clipboard, that url can be used by other users to join that session.

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
MergeNotes          (Retrospective) -> User informs server to merge 2 notes             ==> payload: NotesToMerge
UpdateNote          (Retrospective) <- Server updates note                              ==> payload: colId
DeleteNote          (Retrospective) <- Server informs User that the note 1s removed     ==> payload: RetrospectiveNote
UpdateMoodboard     (Retrospective) -> Scrummaster informs server that moodboard should be shown  ==> payload: MoodboardUpdate
StatusMoodboard     (Retrospective) <- Server informs User that moodboard should be shown         ==> payload: MoodboardStatus

ERROR               (any)           <- Server                                           ==> payload: errormessage
```
 
## Deployment

1. Bouw <project-dir>/frontend (met npm run build). Deze plaatst de bestanden in <project-dir>node-backend/dist/public
1. Bouw <project-dir>/backend (met npm run compile).
1. Run: vanuit <project-dir>/backend/dist: node server/server.js

## Rollout to OpenShift

- build application als described above
- from directory <project-dir>/backend
- oc login
- oc project wd-scrum-ont
- oc start-build nodejs --from-dir .
- open Openshift UI en select project wd-scrum-ont
- when deployment of nodejs is ready open the deployment descriptor
- copy the image sha
- place the new image sha in scrum-tooling-deploy\base\kustomization.yaml
- run scrum-tooling-deploy\deploy.sh

# Changes:
```
20220401 : Upgrade to Angular 13
20210615 : Fixed a handler mix-up
20210621 : Added Edit and delete for retrospective notes
20210622 : Added hearthbeat every minute
20210701 : Updated the messaging functionalty
20210702 : Added voting on retrospecting notes
20210704 : Added retrospective note export
20210816 : Added merging of retrospective notes using Drag'nDrop
20210817 : Fixed an error merging multiple times and added combining votes
20210819 : Added user and session cleanup in server
20210820 : Added version number to frontend
20210820 : Added server monitoring
20210822 : Updated poker result view
20210915 : Added: one click to copy
20210915 : Added: Retrospective note voting
20210921 : Session joining using an URL
20210923 : Added HashLocationStrategy
20210926 : Added cookie for user name and refactoring
20210930 : Fixed an issue with the retrospective session when switching tabs
20211010 : Replace auxilary button by a menu and added moodboard
20211010 : Fixed an issue on Chrome with empty retrospective notes being edited.
20211012 : Fixed an issue with Card 0 on Planningboard having no animation on select.
20211012 : Refactoring node-backend
20211015 : Restructured project. now the frontend has his own directory and doesn't contain the backend.
20211015 : Fixed error in planning board that the indication that a user has selected a card disappears when someone new joins the session. Also removed interface UserInfo in the frontend
```
# ToDo

- Added unittests
- perhaps add more moodboard types.
- Add the checks when new user is added on user panel op planning tab
- Add moving a message on retrospective panel


This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.0.5.

https://medium.com/factory-mind/websocket-node-js-express-step-by-step-using-typescript-725114ad5fe4

https://medium.com/factory-mind/angular-websocket-node-31f421c753ff

## Moving commit between repos

Export from repo

```
git format-patch --output-directory "../patches" FIRST_COMMIT_SHA1~..LAST_COMMIT_SHA1
// One commit only: git format-patch --output-directory .. -1 commit_sha
// last three commits: git format-patch --output-directory ".." -3
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
