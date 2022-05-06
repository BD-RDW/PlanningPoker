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