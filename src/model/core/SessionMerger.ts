import * as BT from './CoreTypes';

export interface SessionMerger {
  merge(live: BT.Session, stored: BT.Session): BT.Session;
}
