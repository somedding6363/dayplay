import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Avatar } from "./Avatar";

const meta = {
  title: "shared/Avatar",
  component: Avatar,
  args: { name: "두야" },
  decorators: [
    (Story) => (
      <div className="p-8">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Avatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Initial: Story = {};

export const LatinInitial: Story = { args: { name: "dayplay" } };

// 사진을 불러오지 못하면 첫 글자로 바뀐다.
export const BrokenImage: Story = {
  args: { image: "https://lh3.googleusercontent.com/not-found" },
};
