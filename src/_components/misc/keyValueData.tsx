export default function KeyValueData({
  _key,
  value,
}: {
  _key: string;
  value?: string;
}) {
  return (
    <p className="inline-flex justify-between w-full border-b-2 border-border-primary border-dashed">
      {_key} :<span className="text-title-small ml-2">{value ?? '~'}</span>
    </p>
  );
}
