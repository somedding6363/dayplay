interface SettingRowProps {
  label: string;
  value: string;
}

export function SettingRow({ label, value }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-hairline py-4">
      <dt className="text-caption text-muted">{label}</dt>
      <dd className="truncate text-body">{value}</dd>
    </div>
  );
}
