import * as React from 'react';

type Props = { item: { id: number } };

export const DebugInfo: React.FC<Props> = ({ item }) => {
  return process.env.REACT_APP_DEBUG === 'info' ? (
    <span className="debug-info">{item.id}</span>
  ) : null;
};
