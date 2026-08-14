export type AlertWatch = {
  id: string;
  deadline: string | null;
};

export function alertWatchesFromCards(
  cards: Array<{ opportunity: { id: string; deadline: string | null } }>,
): AlertWatch[] {
  return cards.map((card) => ({
    id: card.opportunity.id,
    deadline: card.opportunity.deadline,
  }));
}

export function toggleAlertWatch(
  watches: AlertWatch[],
  watch: AlertWatch,
): AlertWatch[] {
  const exists = watches.some((item) => item.id === watch.id);
  if (exists) return watches.filter((item) => item.id !== watch.id);
  return [...watches, watch];
}
