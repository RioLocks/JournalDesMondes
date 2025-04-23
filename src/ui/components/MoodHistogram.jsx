import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import './css/MoodHistogram.css';
import { getLabelFromEmoji } from '../utils/moods';

const MoodHistogram = ({ data }) => {
  return (
    <div className="histogram-wrapper chart-card">
      <h2 className="chart-title">📊 Histogramme des émotions</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, bottom: 40, left: 20 }}>
          <XAxis
            dataKey="emoji"
            tick={{ fontSize: 20 }}
            interval={0}
            height={50}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 14 }}
          />
          <Tooltip
            formatter={(value, name, props) => [`${value} fois`, `Apparaît`]}
            labelFormatter={(label) => `${label} ${getLabelFromEmoji(label)}`}
          />
          <Bar dataKey="count">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill="#7e57c2" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MoodHistogram;
