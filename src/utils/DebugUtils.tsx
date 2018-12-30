import * as React from 'react';

export function createDebugInfo(item: { id: number }, keys: string[]) {
  return (
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
  );
}
