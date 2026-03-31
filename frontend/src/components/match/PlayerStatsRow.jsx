import React from "react";
import { Form } from "react-bootstrap";

export default function PlayerStatsRow({ player, statFields, onChange }) {
  return (
    <tr>
      <td className="fw-medium">
        <div className="text-truncate" style={{ maxWidth: '180px' }} title={player.name}>
          {player.name}
        </div>
      </td>
      <td>
        <Form.Control 
          type="number" 
          min="0" 
          max="120"
          value={player.minutesPlayed}
          onChange={(e) => onChange(player.playerId, "minutesPlayed", e.target.value)}
          className="text-center form-control-sm"
        />
      </td>
      <td>
        <Form.Control 
          type="number" 
          min="1" 
          max="10"
          step="0.5"
          value={player.rating}
          onChange={(e) => onChange(player.playerId, "rating", e.target.value)}
          className="text-center form-control-sm"
        />
      </td>
      
      {/* Dynamic fields */}
      {statFields.map(sf => (
        <td key={sf}>
          <Form.Control 
            type="number" 
            min="0"
            value={player.stats[sf] || 0}
            onChange={(e) => onChange(player.playerId, sf, e.target.value, true)}
            className="text-center form-control-sm"
          />
        </td>
      ))}
    </tr>
  );
}
