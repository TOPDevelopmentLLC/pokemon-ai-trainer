/**
 * Pokemon Champions item data.
 *
 * The mainline dex carries hundreds of items that do not exist in Champions,
 * so the item picker and any item suggestion must come from this list rather
 * than from @pkmn/dex.
 */
import itemData from '@data/pokemon-champions-items.json';

export type ItemGroup = 'heldItem' | 'berry' | 'megaStone' | 'voucher';

export interface ChampionsItem {
  id: string;
  name: string;
  itemGroup: ItemGroup;
  category: string;
  effect: string;
  consumedOnUse: boolean;
  /** Species that may hold it, when the item is restricted. */
  speciesRestricted: string | null;
  /** Type a boosting or resisting item applies to, when relevant. */
  moveType?: string;
}

interface ItemFile {
  game: string;
  sourceNote: string;
  items: ChampionsItem[];
}

const data = itemData as ItemFile;

/**
 * Groups a Pokemon can actually hold in battle.
 *
 * Mega stones are excluded because a Mega Evolution occupies the item slot
 * itself — a Mega cannot also carry a held item. Vouchers are recruitment
 * tickets ("Increases the chance of encountering Normal-type Pokemon"), not
 * battle items at all.
 */
const HOLDABLE_GROUPS: ReadonlySet<ItemGroup> = new Set<ItemGroup>(['heldItem', 'berry']);

/** Every item in the Champions data, including mega stones and vouchers. */
export const ALL_CHAMPIONS_ITEMS: readonly ChampionsItem[] = data.items;

/** Items a Pokemon can hold, sorted for stable display. */
export const HOLDABLE_ITEMS: readonly ChampionsItem[] = data.items
  .filter(item => HOLDABLE_GROUPS.has(item.itemGroup))
  .sort((a, b) => a.name.localeCompare(b.name));

/** Holdable item names, for pickers. */
export const HOLDABLE_ITEM_NAMES: readonly string[] = HOLDABLE_ITEMS.map(item => item.name);

const HOLDABLE_BY_NAME = new Map(HOLDABLE_ITEMS.map(item => [item.name, item]));

/** Whether a Pokemon can hold this item in Champions. */
export function isHoldableItem(itemName: string): boolean {
  return HOLDABLE_BY_NAME.has(itemName);
}

/** Look up a holdable item, or null when it is not one. */
export function getHoldableItem(itemName: string): ChampionsItem | null {
  return HOLDABLE_BY_NAME.get(itemName) ?? null;
}

/** Description for an item, or null when it is not a Champions item. */
export function getItemEffect(itemName: string): string | null {
  return HOLDABLE_BY_NAME.get(itemName)?.effect ?? null;
}
