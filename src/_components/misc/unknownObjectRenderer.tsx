import { startCase } from 'lodash';
import { JSX } from 'react';

export function unknownObjectRenderer(
  object: object,
  title?: string,
): JSX.Element {
  function hasKnownType(value: unknown): boolean {
    return (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    );
  }

  return (
    <div className="bg-background w-full p-4 mt-4 border-2 border-border-primary rounded-default border-b-0 text-black-secondary dark:text-foreground scroll-auto">
      {title && (
        <h2 className="w-full text-title my-3 bg-panel-light p-2 border-b-default border-border-primary">
          {title}
        </h2>
      )}
      {Object.entries(object).map((property) => {
        const Key = <p>{startCase(property[0])} :</p>;

        const Value = hasKnownType(property[1]) ? (
          <p className="font-mono">{`${property[1] as string}`}</p>
        ) : property[1] === null || property[1] === undefined ? (
          <></>
        ) : (
          unknownObjectRenderer(property[1])
        );
        return (
          property[1] && (
            <div
              className="w-full flex flex-row flex-wrap items-center justify-between py-1 border-b-2 border-dashed border-border-primary hover:cursor-auto hover:bg-panel-light"
              key={property[0]}
            >
              {Key}
              {Value}
            </div>
          )
        );
      })}
    </div>
  );
}
