import { JSX } from 'react';

export function unknownObjectRenderer(object: object): JSX.Element {
  function hasKnownType(value: unknown): boolean {
    return (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean' ||
      typeof value === 'undefined'
    );
  }

  return (
    <div className="bg-background w-full p-4 mt-4 border-2 border-border-primary border-b-0 text-black-secondary scroll-auto">
      {Object.entries(object).map((property) => {
        const Key = <p className="capitalize">{property[0]} :</p>;

        const Value = hasKnownType(property[1]) ? (
          <p className="font-mono">{`${property[1] as string}`}</p>
        ) : property[1] === null ? (
          <p className="text-on-disabled"> undefined </p>
        ) : (
          unknownObjectRenderer(property[1])
        );
        return (
          <div
            className="w-full flex flex-row flex-wrap items-center justify-between py-1 border-b-2 border-dashed border-border-primary hover:cursor-auto hover:bg-panel-light"
            key={property[0]}
          >
            {Key}
            {Value}
          </div>
        );
      })}
    </div>
  );
}
