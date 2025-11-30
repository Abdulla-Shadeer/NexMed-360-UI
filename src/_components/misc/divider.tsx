interface DividerProps {
  tw_width: string;
}

export default function Divider({ tw_width = '' }: DividerProps) {
  return (
    <hr
      className={`border-t-2 border-border-primary ${tw_width}`}
      aria-hidden="true"
    />
  );
}
