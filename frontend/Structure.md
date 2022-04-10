## Structure

``` 
AppComponent <app-root>
|   <p-tabMenu>
|   AppRoutingModule <router-outlet>
    | HomeComponent <app-home>
    | RetroSessionComponent <app-retro-session>
        | SessionInitComponent <app-session-init>
        | RetroColumnComponent <app-retro-column>
            | RetroMessageComponent <app-retro-message>
        | MessagesViewComponent <app-messages-view>
    | PlanningSessionComponent <app-planning-session>
        | SessionInitComponent <app-session-init>
        | CardsViewComponent <app-cards-view>
        | ResultViewComponent <app-result-view>
        | MessagesViewComponent <app-messages-view>
| StatusComponent <app-status>



```

https://storybook.js.org/
https://storybook.js.org/addons/msw-storybook-addon

```
$ npm in storybook
npm WARN deprecated source-map-url@0.4.1: See https://github.com/lydell/source-map-url#deprecated
npm WARN deprecated urix@0.1.0: Please see https://github.com/lydell/urix#deprecated
npm WARN deprecated source-map-resolve@0.5.3: See https://github.com/lydell/source-map-resolve#deprecated
npm WARN deprecated chokidar@2.1.8: Chokidar 2 does not receive security updates since 2019. Upgrade to chokidar 3 with 15x fewer dependencies
npm WARN deprecated resolve-url@0.2.1: https://github.com/lydell/resolve-url#deprecated
npm WARN deprecated querystring@0.2.0: The querystring API is considered Legacy. new code should use the URLSearchParams API instead.

added 977 packages, removed 1 package, and audited 2117 packages in 56s

194 packages are looking for funding
  run `npm fund` for details

13 high severity vulnerabilities

To address all issues, run:
  npm audit fix

Run `npm audit` for details.

```