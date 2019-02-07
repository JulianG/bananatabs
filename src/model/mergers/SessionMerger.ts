import * as BT from '../core/CoreTypes';

export interface SessionMerger {
  merge(live: BT.Session, stored: BT.Session): BT.Session;
}
