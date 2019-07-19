import * as React from 'react';
import { CONFIG } from '../config';

type Props = { item: { id: number } };

export const DebugInfo: React.FC<Props> = ({ item }) => {
  return CONFIG.debug ? <span className="debug-info">{item.id}</span> : null;
};
