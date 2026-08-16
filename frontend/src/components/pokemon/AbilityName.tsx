import { getAbilityDescription } from '@services/dex';

interface AbilityNameProps {
  ability: string;
}

/**
 * An ability name that explains itself on hover.
 * Champions introduces abilities the dex has never heard of, so a name alone
 * tells the reader nothing.
 */
export const AbilityName = ({ ability }: AbilityNameProps) => {
  const description = getAbilityDescription(ability);

  if (!description) return <>{ability}</>;

  return (
    <abbr
      title={`${ability} — ${description}`}
      style={{
        textDecoration: 'underline dotted',
        textUnderlineOffset: '2px',
        cursor: 'help',
      }}
    >
      {ability}
    </abbr>
  );
};
