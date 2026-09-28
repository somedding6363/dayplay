import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "@/shared/ui/button";
import { Kbd } from "./Kbd";

const meta = {
  title: "shared/Kbd",
  component: Kbd,
  args: { children: "Space" },
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// 버튼 안에서 단축키를 알려줄 때
export const InButton: Story = {
  render: () => (
    <div className="flex gap-3 p-8">
      <Button size="lg" variant="soft" aria-keyshortcuts="ArrowLeft">
        <Kbd>←</Kbd> 앞면
      </Button>
      <Button size="lg" aria-keyshortcuts="ArrowRight">
        뒷면 <Kbd>→</Kbd>
      </Button>
    </div>
  ),
};
