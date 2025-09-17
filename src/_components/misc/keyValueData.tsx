export default function KeyValueData({
  _key,
  value,
}: {
  _key: string;
  value?: string;
}) {
  return (
    <p>
      {_key} :<span className="text-title-small ml-2">{value ?? '~'}</span>
    </p>
  );
}
