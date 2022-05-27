import { Meta, Story, moduleMetadata } from '@storybook/angular';
import { CardComponent } from '../app/components/planning-session/card/card.component';
import { CardService } from 'src/app/components/planning-session/card/card.service';

export default {
    title: 'Card Component',
    component: CardComponent,
    decorators: [
        moduleMetadata({
            providers: [
                CardService
            ]
        })],
    argTypes: {
        ngOnInit: {
            table: {
                disable: true,
            },
        },
        processCardClicked: {
            table: {
                disable: true,
            },
        },
        getId: {
            table: {
                disable: true,
            },
        },
    }

} as Meta

const Template: Story = (args) => ({
    props: args
});

export const Card = Template.bind({});
Card.args={};

