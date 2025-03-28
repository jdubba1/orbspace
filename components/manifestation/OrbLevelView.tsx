import React from 'react';
import { OrbComponent } from '@/components/Orbs';
import { Orb } from '@/lib/manifestationData';

interface OrbLevelViewProps {
  orbs: Orb[];
  selectedOrb: number | null;
  isZooming: boolean;
  activeOrbId: number | null;
  hoveredOrbId: number | null;
  onOrbClick: (orbId: number) => void;
  onOrbHover: (orbId: number | null) => void;
}

export function OrbLevelView({
  orbs,
  selectedOrb,
  isZooming,
  activeOrbId,
  hoveredOrbId,
  onOrbClick,
  onOrbHover
}: OrbLevelViewProps) {
  return (
    <>
      {orbs.map((orb) => (
        <OrbComponent
          key={orb.id}
          orb={orb}
          isActive={activeOrbId === orb.id}
          isSelected={selectedOrb === orb.id}
          isHovered={hoveredOrbId === orb.id}
          hasChildren={!!orb.childLevelId}
          onClick={() => {
            if (isZooming) return;
            onOrbClick(orb.id);
          }}
          onHover={(hovered) => onOrbHover(hovered ? orb.id : null)}
        />
      ))}
    </>
  );
} 