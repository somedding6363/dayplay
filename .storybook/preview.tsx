import type { Preview } from "@storybook/nextjs-vite";
import { suit } from "../src/app/fonts/suit";
import "../src/app/styles/globals.css";

const preview: Preview = {
  decorators: [
    (Story) => (
      <div className={`${suit.variable} font-sans antialiased`}>
        <Story />
      </div>
    ),
  ],
};

export default preview;
