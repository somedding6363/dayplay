import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { CSSProperties } from "react";
import { GameBoard } from "./GameBoard";

type GameColorVars = CSSProperties & Record<`--game-${string}`, string>;

const colors: Record<"coral" | "blue", GameColorVars> = {
  coral: {
    "--game-color": "#E4704F",
    "--game-soft": "#FBE6DD",
    "--game-mid": "#F3C3B1",
    "--game-ink": "#8A3A22",
  },
  blue: {
    "--game-color": "#4F7FD6",
    "--game-soft": "#E3ECFB",
    "--game-mid": "#B9CDF1",
    "--game-ink": "#22467A",
  },
};

const meta = {
  title: "entities/GameBoard",
  component: GameBoard,
  args: {
    label: "시작",
    description: "색이 바뀌면 누르세요.",
    inputs: ["click", "touch", "space"],
  },
  decorators: [
    (Story, context) => (
      <div
        style={colors[context.parameters.gameColor === "blue" ? "blue" : "coral"]}
        className="max-w-2xl p-8"
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GameBoard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Blue: Story = {
  parameters: { gameColor: "blue" },
  args: { description: "정확히 10초에 멈추세요." },
};

export const WithoutInputs: Story = {
  args: { inputs: undefined },
};

// 최소 폭(280px)에서도 라벨과 안내가 잘리지 않는지 본다.
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div className="w-70">
        <Story />
      </div>
    ),
  ],
};

// 반응해야 하는 순간. 판 전체가 게임 색으로 바뀐다.
export const Signal: Story = {
  args: { tone: "signal", label: "지금!", description: "누르세요." },
};

export const Result: Story = {
  args: { label: "187ms", description: "다시 하려면 누르세요." },
};

export const InvalidResult: Story = {
  args: { label: "-", description: "다시 하려면 누르세요." },
};
