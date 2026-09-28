import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CoinIcon } from "./CoinIcon";

const meta = {
  title: "shared/icons/CoinIcon",
  component: CoinIcon,
  args: { side: "heads", size: 144 },
  argTypes: { side: { control: "inline-radio", options: ["heads", "tails"] } },
  decorators: [
    (Story) => (
      <div className="p-8 text-faint">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CoinIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Heads: Story = {};

export const Tails: Story = { args: { side: "tails" } };
