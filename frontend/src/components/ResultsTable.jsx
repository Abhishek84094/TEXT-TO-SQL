import React from 'react';
import { Table } from 'lucide-react';

export default function ResultsTable({ results }) {
    if (!results || results.length === 0) return null;
    const headers = Object.keys(results[0]);

    return (
        <div className="overflow-x-auto glass-card rounded-xl">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-700/50">
                <Table className="h-3.5 w-3.5 text-gray-400" />
                <span className="text-xs text-gray-400 uppercase font-medium">Results ({results.length} rows)</span>
            </div>
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-800/50">
                        {headers.map(h => (
                            <th key={h} className="px-3 md:px-4 py-2.5 text-xs font-semibold text-gray-300 border-b border-gray-700/50 whitespace-nowrap">{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {results.slice(0, 50).map((row, i) => (
                        <tr key={i} className="hover:bg-gray-700/30 transition-smooth border-b border-gray-800/50 last:border-0">
                            {headers.map(h => (
                                <td key={h} className="px-3 md:px-4 py-2 text-xs md:text-sm text-gray-300 whitespace-nowrap">{row[h]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            {results.length > 50 && (
                <div className="px-4 py-2 text-xs text-gray-500 text-center border-t border-gray-700/50">
                    Showing 50 of {results.length} rows
                </div>
            )}
        </div>
    );
}
