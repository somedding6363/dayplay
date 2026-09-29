import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DodgerIcon } from "./DodgerIcon";
import { PoopIcon } from "./PoopIcon";

const meta = {
  title: "shared/icons/PoopIcon",
  component: PoopIcon,
  args: { size: 144 },
  decorators: [
    (Story) => (
      <div className="flex items-end gap-8 p-8 text-muted">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PoopIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// 똥피하기에서 함께 쓰는 캐릭터
export const WithDodger: Story = {
  render: (args) => (
    <>
      <PoopIcon {...args} />
      <DodgerIcon size={args.size} className="text-ink" />
      <DodgerIcon size={args.size} className="text-ink" hit />
    </>
  ),
};
