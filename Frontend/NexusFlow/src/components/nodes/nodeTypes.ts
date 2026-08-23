import type { NodeTypes } from '@xyflow/react';

/* Data Sources */
import {
  ApiSourceNode,
  DbSourceNode,
  FileSourceNode,
  TimerSourceNode,
} from './DataSourceNodes';

/* Math Operations */
import {
  AddNode,
  MultiplyNode,
  AverageNode,
  CompareNode,
} from './MathNodes';

import {
  EmailActionNode,
  WebhookActionNode,
  LogActionNode,
  SaveActionNode,
} from './ActionNodes';

/* AI Generation */
import { LlmGenerateNode } from './AiNodes';

/* Data Transformation */
import { FilterNode, MapNode } from './TransformNodes';

export const nodeTypes: NodeTypes = {
  /* --- Data Sources --- */
  apiSource: ApiSourceNode,
  dbSource: DbSourceNode,
  fileSource: FileSourceNode,
  timerSource: TimerSourceNode,

  /* --- Math Operations --- */
  mathAdd: AddNode,
  mathMultiply: MultiplyNode,
  mathAverage: AverageNode,
  mathCompare: CompareNode,

  /* --- Action Triggers --- */
  emailAction: EmailActionNode,
  webhookAction: WebhookActionNode,
  logAction: LogActionNode,
  saveAction: SaveActionNode,

  /* --- AI Models --- */
  aiLlm: LlmGenerateNode,

  /* --- Data Transformation --- */
  transformFilter: FilterNode,
  transformMap: MapNode,
};
