import React from 'react';
import './WarningOverlay.css';
import { SensorPosition } from '../../types';

interface WarningOverlayProps {
  activePositions: SensorPosition[];
  testMode?: boolean;
}

const WarningOverlay: React.FC<WarningOverlayProps> = ({ activePositions, testMode }) => {
  const positions: SensorPosition[] = ['FRONT_LEFT', 'FRONT_RIGHT', 'REAR_LEFT', 'REAR_RIGHT'];

  const simulated = testMode ? positions : [];

  return (
    <div className="warning-overlay">
      {positions.map((position) => (
        <div
          key={position}
          className={`warning-icon ${position.toLowerCase()} ${
            activePositions.includes(position) || simulated.includes(position) ? 'active' : ''
          }`}
        />
      ))}
    </div>
  );
};

export default WarningOverlay;
