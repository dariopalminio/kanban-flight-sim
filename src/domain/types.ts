export type StatusCategory = "TODO" | "IN_PROGRESS" | "DONE";
export type StreamType = "UPSTREAM" | "DOWNSTREAM";
export type WorkitemLevel = "L0" | "L1" | "L2" | "L3";
export type HighlightMode = "none" | "stream" | "category" | "commitment" | "delivery";
export type ViewMode = "portafolio" | "delivery" | "full" | "L3" | "L2" | "L1";

export type Status = {
  id: string;
  name: string; // Nombre del estado.
  order: number; // El orden de los estados dentro del workflow, de izquierda a derecha.
  streamType: StreamType; // Upstream o Downstream
  isBeforeCommitmentPoint: boolean; //es estado previo al punto de compromiso.
  isPosDeliveryPoint: boolean; //es un estado posterior al delivery point, es decir, que representa trabajo que ya fue entregado.
  statusCategory: StatusCategory;
  wipLimit?: number;
  hasReadySignal?: boolean; //Si tiene señal de ready significa que es una columna de procesamiento que solo puede avanzar workitems que estén listos (isReady = true).
  isBuffer?: boolean; // Si es un buffer, es una columna de cola de espera entre dos estados.
  description?: string; //Propósito del estado.
};

export type Workflow = {
  id: string;
  name: string; // Nombre del workflow.
  level: WorkitemLevel;
  workitemName: string; // Nombre del tipo de workitem manejado por este workflow.
  statuses: Status[];
};

export type Workitem = {
  id: string;
  level: WorkitemLevel;
  statusId: string;
  parentId?: string;
  isReady?: boolean;
  enteredAt: number;
  color: string;   // Usado como prioridad para cola FIFO, representa el tick en el que el workitem entró al sistema.
};

export type IdCounters = { L0: number; L1: number; L2: number; L3: number };

export type SimState = {
  workitems: Workitem[];
  tick: number;
  idCounters: IdCounters;
};

export type Config = {
  workflows: { L3: Workflow; L2: Workflow; L1: Workflow; L0: Workflow };
  initialReleaseCount: number;
  advanceProbability: number;
  childrenPerParent: number;
  demandInterval: number;
};
