import { setCompodocJson } from "@storybook/addon-docs/angular";
import docJson from "../documentation.json";
import { initialize, mswDecorator } from 'msw-storybook-addon';

setCompodocJson(docJson);

// Initialize MSW
initialize();

// Provide the MSW addon decorator globally
export const decorators = [mswDecorator];

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  docs: { inlineStories: true },
}