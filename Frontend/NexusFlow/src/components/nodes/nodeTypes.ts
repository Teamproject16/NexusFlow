import type { NodeTypes } from '@xyflow/react';

/* Data Sources */
import {
  TurbineSensorNode,
  TempSensorNode,
  PressureSensorNode,
} from './DataSourceNodes';

/* Math Operations & Filters */
import {
  MovingAverageNode,
  ThresholdNode,
  DataMergeNode,
} from './MathNodes';

/* Action Triggers */
import {
  SmsActionNode,
  EmailActionNode,
  WebhookActionNode,
} from './ActionNodes';

export const nodeTypes: NodeTypes = {
  /* --- Data Sources --- */
  sensorTurbine: TurbineSensorNode,
  sensorTemp: TempSensorNode,
  sensorPressure: PressureSensorNode,

  /* --- Math Operations & Filters --- */
  filterMovingAverage: MovingAverageNode,
  filterThreshold: ThresholdNode,
  filterMerge: DataMergeNode,

  /* --- Action Triggers --- */
  actionSms: SmsActionNode,
  actionEmail: EmailActionNode,
  actionWebhook: WebhookActionNode,
};
