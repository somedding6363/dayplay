import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./Button";

const meta = {
  title: "shared/Button",
  component: Button,
  args: { children: "로그인" },
  argTypes: {
    variant: { control: "inline-radio", options: ["primary", "soft"] },
    size: { control: "inline-radio", options: ["sm", "md"] },
    shape: { control: "inline-radio", options: ["pill", "rounded"] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const All: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6 p-8">
      {(["primary", "soft"] as const).map((variant) => (
        <div key={variant} className="flex flex-wrap items-center gap-4">
          <span className="w-16 text-caption text-muted">{variant}</span>
          {(["pill", "rounded"] as const).map((shape) =>
            (["sm", "md"] as const).map((size) => (
              <Button
                key={`${shape}-${size}`}
                {...args}
                variant={variant}
                shape={shape}
                size={size}
              >
                {shape} · {size}
              </Button>
            )),
          )}
        </div>
      ))}
    </div>
  ),
};
