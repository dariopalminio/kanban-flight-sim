export type StatusCategory = "TODO" | "IN_PROGRESS" | "DONE";
export type StreamType = "UPSTREAM" | "DOWNSTREAM";
export type WorkitemLevel = "L0" | "L1" | "L2";
export type HighlightMode = "none" | "stream" | "category" | "commitment" | "delivery";

export type Status = {
  id: string;
  name: string;
  order: number;
  streamType: StreamType;
  isCommitmentPoint: boolean;
  isDeliveryPoint: boolean;
  category: StatusCategory;
};

export type Workflow = {
  id: string;
  name: string;
  level: WorkitemLevel;
  workitemName: string;
  statuses: Status[];
};

export type Workitem = {
  id: string;
  level: WorkitemLevel;
  statusId: string;
  parentId?: string;
};

export type IdCounters = { L0: number; L1: number; L2: number };

export type SimState = {
  workitems: Workitem[];
  tick: number;
  idCounters: IdCounters;
};

export type Config = {
  workflows: { L2: Workflow; L1: Workflow; L0: Workflow };
  initialReleaseCount: number;
  advanceProbability: number;
  childrenPerParent: number;
};
