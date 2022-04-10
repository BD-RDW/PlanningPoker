import { Meta, Story } from '@storybook/angular';
import { MessageService } from 'primeng/api';
import { ScrumCookieServiceService } from 'src/app/service/scrum-cookie-service.service';
import { MessageServiceMock } from './mocks/MessageServiceMock';
import { ScrumCookieServiceMock } from './mocks/SrcumCookieServiceMock';

import { SessionInitComponent } from '../app/components/session-init/session-init.component';

export default {
    title: 'Session Init Component',
    component: SessionInitComponent
} as Meta

const Template: Story = (args) => ({
    moduleMetadata:{
        providers: [
            {provide: ScrumCookieServiceService, useClass: ScrumCookieServiceMock},
            {provide: MessageService, useClass: MessageServiceMock}
        ]
    },
    props: args
});

export const NewSessionInitialization = Template.bind({});
NewSessionInitialization.args={
    sessionId: 'SomeSessionId'
};