export type AdminQueueState = "not-persisted" | "device-only";

export type AdminSnapshot = {
  resources: number;
  startups: number;
  playbookSteps: number;
  queues: {
    pendingListings: AdminQueueState;
    claims: AdminQueueState;
    leftoverWatches: AdminQueueState;
  };
};

export function buildAdminSnapshot(input: {
  resources: number;
  startups: number;
  playbookSteps: number;
}): AdminSnapshot {
  return {
    resources: input.resources,
    startups: input.startups,
    playbookSteps: input.playbookSteps,
    queues: {
      pendingListings: "not-persisted",
      claims: "not-persisted",
      leftoverWatches: "device-only",
    },
  };
}
