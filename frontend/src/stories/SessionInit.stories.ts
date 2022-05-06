import { Meta, Story, moduleMetadata } from '@storybook/angular';
import { MessageService } from 'primeng/api';
import { ScrumCookieService } from 'src/app/service/scrum-cookie.service';
import { MessageServiceMock } from './mocks/MessageServiceMock';
import { ScrumCookieServiceMock } from './mocks/SrcumCookieServiceMock';

import { SessionInitComponent } from '../app/components/session-init/session-init.component';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FormsModule } from '@angular/forms';

export default {
    title: 'Session Init Component',
    component: SessionInitComponent,
    decorators: [
        moduleMetadata({
            imports: [RadioButtonModule,FormsModule],
            providers: [
                {provide: ScrumCookieService, useClass: ScrumCookieServiceMock},
                {provide: MessageService, useClass: MessageServiceMock}
            ]
        })],
    argTypes: {
        selectedRadioButton: {
            options: ['new', 'existing'],
            control: { type: 'select' }
          }
    }
} as Meta

const Template: Story = (args) => ({
    props: args
});

export const NewSessionInitialization = Template.bind({});
NewSessionInitialization.args={
    sessionId: '',
    selectedRadioButton: 'new',
    disableSessionIdChange: false
};

export const ExistingSessionInitialization = Template.bind({});
ExistingSessionInitialization.args={
    sessionId: 'abcdefghij',
    selectedRadioButton: 'existing',
    disableSessionIdChange: true
};
