import * as React from 'react';
import { CONFIG } from '../config';

type Props = { item: { id: number }; keys: string[] };

export const DebugInfo = ({ item, keys }: Props) => {
  return CONFIG.debug ? (
    <table className="debug-info">
      <tbody>
        {keys.map(key => {
          return (
            <tr key={item.id + key}>
              <td>{key}:</td>
              <td>{JSON.stringify(item[key])}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  ) : null;
};
