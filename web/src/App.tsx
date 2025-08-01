/**
 * React dashboard shell.
 * The candidate will:
 *   • fetch /deals/summary on mount
 *   • render a table or list
 *   • open a modal with /deals/:id details on click
 */

import React, { useEffect, useRef, useState } from 'react';
import type { ContinentSummary, Deal } from '../../src/types';

export default function App() {
  const [summary, setSummary] = useState<ContinentSummary[]>([]);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const dealInputRef = useRef<HTMLInputElement>(null);

  // --- Load summary on mount ---------------------------------
  useEffect(() => {
    fetch('/deals/summary')
      .then(r => r.json())
      .then(setSummary)
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setActiveDeal(null);

    const inputEl = dealInputRef.current;
    const dealID = inputEl?.value.trim();
    console.log("Deal ID ", inputEl?.value);
    if (dealID) {
      fetch(`/deals/${dealID}`)
        .then(r => {
          const data = r.json()
          if(r.status !== 200){
            throw new Error(`Deal with ID ${dealID} not found!`)
          }

          return data
        })
        .then(setActiveDeal)
        .catch(err => console.error(err));
    }
  }

  return (
    <div style={{ padding: '1rem', fontFamily: 'sans-serif' }}>
      <h1>Deal-Pulse Dashboard</h1>

      {/* TODO: render summary table */}
      <table>
        <thead>
          <tr>
            <th>
              Continent
            </th>
            <th>
              Median Valuation
            </th>
            <th>
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          {
            summary.map((item, itemIdx) => <tr key={itemIdx}>
              <td>
                {item.continent}
              </td>
              <td>
                {item.median_valuation}
              </td>
              <td>
                {item.total}
              </td>
            </tr>)
          }
        </tbody>
      </table>
      {/* <pre>{JSON.stringify(summary, null, 2)}</pre> */}

      {/* TODO: modal for activeDeal */}
      <br />
      <br />
      <br />

      <div>
        <form onSubmit={handleSubmit}>
          <div>
            <input ref={dealInputRef} type="text" placeholder='Deal ID' />
          </div>
          <div>
            <button>Find Deal</button>
          </div>
        </form>
      </div>
      <br />

      {
        activeDeal && <pre>{JSON.stringify(activeDeal, null, 2)}</pre>
      }

    </div>
  );
}
