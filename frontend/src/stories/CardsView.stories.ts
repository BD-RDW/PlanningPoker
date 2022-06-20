import { Meta, Story, moduleMetadata } from '@storybook/angular';
import { CardComponent } from '../app/components/planning-session/card/card.component';
import { CardService } from '../app/components/planning-session/card/card.service';
// import { MessageService } from 'primeng/api';
// import { ScrumCookieService } from 'src/app/service/scrum-cookie.service';
// import { MessageServiceMock } from './mocks/MessageServiceMock';
// import { ScrumCookieServiceMock } from './mocks/SrcumCookieServiceMock';

import { CardsViewComponent } from '../app/components/planning-session/cards-view/cards-view.component';
// import { FormsModule } from '@angular/forms';

export default {
    title: 'Cards view Component',
    component: CardsViewComponent,
    decorators: [
        moduleMetadata({
            imports: [CardComponent],
            providers: [
                CardService
            //     {provide: ScrumCookieService, useClass: ScrumCookieServiceMock},
            //     {provide: MessageService, useClass: MessageServiceMock}
            ]
        })],
    // argTypes: {
    //     selectedRadioButton: {
    //         options: ['new', 'existing'],
    //         control: { type: 'select' }
    //       }
    // }
} as Meta

const Template: Story = (args) => ({
    props: args
});

export const CardsView = Template.bind({});
CardsView.args={
    // cardNumbers: ['1', '2', '3'],
    // selectedRadioButton: 'new',
    // disableSessionIdChange: false
};

