import type { Meta, StoryObj } from "@storybook/nextjs-vite";

const tokens = [
  { name: "board-label", className: "text-board-label", spec: "88px · 800 · 1 · -3.5px" },
  { name: "hero-display", className: "text-hero-display", spec: "56px · 600 · 1.07 · -0.28px" },
  { name: "display-lg", className: "text-display-lg", spec: "40px · 600 · 1.1 · 0" },
  { name: "display-md", className: "text-display-md", spec: "34px · 600 · 1.47 · -0.374px" },
  { name: "lead", className: "text-lead", spec: "28px · 400 · 1.14 · 0.196px" },
  { name: "lead-airy", className: "text-lead-airy", spec: "24px · 300 · 1.5 · 0" },
  { name: "tagline", className: "text-tagline", spec: "21px · 600 · 1.19 · 0.231px" },
  { name: "body-strong", className: "text-body-strong", spec: "17px · 600 · 1.24 · -0.374px" },
  { name: "body", className: "text-body", spec: "17px · 400 · 1.47 · -0.374px" },
  { name: "dense-link", className: "text-dense-link", spec: "17px · 400 · 2.41 · 0" },
  { name: "caption", className: "text-caption", spec: "14px · 400 · 1.43 · -0.224px" },
  {
    name: "caption-strong",
    className: "text-caption-strong",
    spec: "14px · 600 · 1.29 · -0.224px",
  },
  { name: "button-large", className: "text-button-large", spec: "18px · 300 · 1.2 · 0" },
  {
    name: "button-utility",
    className: "text-button-utility",
    spec: "14px · 400 · 1.29 · -0.224px",
  },
  { name: "fine-print", className: "text-fine-print", spec: "12px · 400 · 1.5 · -0.12px" },
  { name: "micro-legal", className: "text-micro-legal", spec: "10px · 400 · 1.3 · -0.08px" },
  { name: "nav-link", className: "text-nav-link", spec: "12px · 400 · 1.5 · -0.12px" },
];

function TypographyScale() {
  return (
    <dl className="flex flex-col gap-8 p-8">
      {tokens.map((token) => (
        <div key={token.name} className="flex flex-col gap-2">
          <dt className="text-caption text-neutral-600">
            {token.name} — {token.spec}
          </dt>
          <dd className={token.className}>안녕하세요. Dayplay 000ms</dd>
        </div>
      ))}
    </dl>
  );
}

const meta = {
  title: "Foundations/Typography",
  component: TypographyScale,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof TypographyScale>;

export default meta;

export const Scale: StoryObj<typeof meta> = {};
