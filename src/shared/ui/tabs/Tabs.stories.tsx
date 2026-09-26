import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { TabItem } from "./TabItem";
import { Tabs } from "./Tabs";

const meta = {
  title: "shared/Tabs",
  component: Tabs,
  args: { label: "게임 목록", children: null },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

function TabsDemo({ items, label }: { items: string[]; label: string }) {
  const [selected, setSelected] = useState(items[0]);

  return (
    <div className="max-w-xl p-8">
      <Tabs label={label}>
        {items.map((item) => (
          <TabItem key={item} selected={item === selected} onClick={() => setSelected(item)}>
            {item}
          </TabItem>
        ))}
      </Tabs>
    </div>
  );
}

export const Default: Story = {
  render: (args) => <TabsDemo label={args.label} items={["반응속도", "10초 맞추기"]} />,
};

// 폭을 넘으면 가로로 스크롤하고 오른쪽 끝이 흐려진다.
export const Overflow: Story = {
  render: (args) => (
    <TabsDemo
      label={args.label}
      items={[
        "반응속도",
        "10초 맞추기",
        "숫자 기억",
        "순서 기억",
        "색상 맞추기",
        "타이밍",
        "단어 기억",
        "계산하기",
        "패턴 찾기",
      ]}
    />
  ),
};
