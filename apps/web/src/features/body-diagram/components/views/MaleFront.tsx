import type { OrganId } from '@soma/shared-types';
import { OrganPath } from '../OrganPath.js';
import type { OrganStateMap } from '../../types.js';

interface MaleFrontProps {
  organStates: OrganStateMap;
  highlightedOrganId: OrganId | null;
  onOrganHover: (organId: OrganId | null) => void;
  onOrganClick: (organId: OrganId) => void;
}

export function MaleFront({
  organStates,
  highlightedOrganId,
  onOrganHover,
  onOrganClick,
}: MaleFrontProps) {
  const renderOrgan = (organId: OrganId, d: string) => (
    <OrganPath
      key={organId}
      organId={organId}
      d={d}
      state={organStates.get(organId)}
      highlighted={highlightedOrganId === organId}
      onHover={onOrganHover}
      onClick={onOrganClick}
    />
  );

  return (
    <svg
      viewBox="0 0 400 800"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', maxHeight: '85vh' }}
    >
      {/* Body silhouette — semi-transparent fill, subtle stroke */}
      <path
        d="M 200 40
           C 180 40 165 55 165 80
           C 165 95 170 108 178 115
           L 175 130
           C 160 135 145 145 135 165
           L 125 200
           C 115 230 110 265 115 295
           L 120 340
           L 115 380
           C 113 420 115 460 120 500
           L 125 560
           L 130 620
           C 132 660 130 700 125 740
           L 130 760
           L 145 760
           L 155 720
           L 165 660
           L 175 600
           L 185 540
           L 195 540
           L 205 540
           L 215 540
           L 225 600
           L 235 660
           L 245 720
           L 255 760
           L 270 760
           L 275 740
           C 270 700 268 660 270 620
           L 275 560
           L 280 500
           C 285 460 287 420 285 380
           L 280 340
           L 285 295
           C 290 265 285 230 275 200
           L 265 165
           C 255 145 240 135 225 130
           L 222 115
           C 230 108 235 95 235 80
           C 235 55 220 40 200 40 Z"
        fill="rgba(240, 232, 218, 0.04)"
        stroke="var(--soma-border-default)"
        strokeWidth="1"
      />

      {/* Brain region — head outline guide */}
      <ellipse
        cx="200"
        cy="80"
        rx="35"
        ry="40"
        fill="rgba(240, 232, 218, 0.02)"
        stroke="var(--soma-border-subtle)"
        strokeWidth="0.5"
        strokeDasharray="2 2"
      />

      {/* Brain structures — clustered inside head */}
      {renderOrgan('brain-prefrontal-cortex',
        'M 188 60 C 188 55 195 52 200 52 C 205 52 212 55 212 60 L 212 70 L 188 70 Z')}
      {renderOrgan('brain-hippocampus',
        'M 185 78 C 185 75 190 73 195 75 L 195 85 C 190 87 185 85 185 82 Z')}
      {renderOrgan('brain-amygdala',
        'M 205 78 C 210 75 215 75 215 82 C 215 85 210 87 205 85 Z')}
      {renderOrgan('brain-vta',
        'M 195 90 C 195 88 200 87 205 88 L 205 95 C 200 96 195 94 195 92 Z')}
      {renderOrgan('brain-nucleus-accumbens',
        'M 192 100 C 192 98 198 97 202 98 L 208 100 L 208 105 L 192 105 Z')}

      {/* Lungs — left and right */}
      {renderOrgan('lungs',
        'M 165 180 C 155 185 148 200 145 220 L 142 260 C 142 275 148 285 158 285 L 175 280 L 175 195 Z M 235 180 C 245 185 252 200 255 220 L 258 260 C 258 275 252 285 242 285 L 225 280 L 225 195 Z')}

      {/* Bronchi — central airway */}
      {renderOrgan('bronchi',
        'M 195 170 L 195 195 L 188 220 L 195 225 L 200 220 L 205 225 L 212 220 L 205 195 L 205 170 Z')}

      {/* Heart */}
      {renderOrgan('heart',
        'M 195 240 C 188 235 178 238 178 248 C 178 258 195 275 200 280 C 205 275 222 258 222 248 C 222 238 212 235 205 240 C 202 242 200 245 200 245 C 200 245 198 242 195 240 Z')}

      {/* Liver */}
      {renderOrgan('liver',
        'M 165 295 C 165 290 175 288 195 290 L 230 295 C 240 297 245 305 240 315 L 220 325 L 180 322 L 165 315 Z')}

      {/* Stomach */}
      {renderOrgan('stomach',
        'M 175 320 C 175 315 180 312 190 312 L 215 315 C 222 318 225 328 220 335 L 200 340 L 180 335 Z')}

      {/* Pancreas — behind stomach, slightly visible */}
      {renderOrgan('pancreas',
        'M 175 340 C 175 338 185 336 200 338 L 220 340 L 218 348 L 200 348 L 178 346 Z')}

      {/* Kidneys — note: anatomically dorsal, projected here for front view */}
      {renderOrgan('kidneys',
        'M 165 355 C 162 355 160 365 162 380 C 164 392 170 395 175 392 L 175 358 Z M 235 355 C 238 355 240 365 238 380 C 236 392 230 395 225 392 L 225 358 Z')}

      {/* Testes (male only) */}
      {renderOrgan('testes',
        'M 188 575 C 184 575 182 580 184 588 C 186 593 190 595 192 593 L 192 578 Z M 212 575 C 216 575 218 580 216 588 C 214 593 210 595 208 593 L 208 578 Z')}

      {/* Skin — full body outline as a separate clickable layer.
          Rendered first conceptually but placed last so it doesn't
          eat clicks on inner organs. We use pointer-events: stroke
          on the outline itself. */}
      <path
        d="M 200 40
           C 180 40 165 55 165 80
           C 165 95 170 108 178 115
           L 175 130
           C 160 135 145 145 135 165
           L 125 200
           C 115 230 110 265 115 295
           L 120 340
           L 115 380
           C 113 420 115 460 120 500
           L 125 560
           L 130 620
           C 132 660 130 700 125 740
           L 130 760
           L 145 760
           L 155 720
           L 165 660
           L 175 600
           L 185 540
           L 195 540
           L 205 540
           L 215 540
           L 225 600
           L 235 660
           L 245 720
           L 255 760
           L 270 760
           L 275 740
           C 270 700 268 660 270 620
           L 275 560
           L 280 500
           C 285 460 287 420 285 380
           L 280 340
           L 285 295
           C 290 265 285 230 275 200
           L 265 165
           C 255 145 240 135 225 130
           L 222 115
           C 230 108 235 95 235 80
           C 235 55 220 40 200 40 Z"
        data-organ-id="skin"
        fill="transparent"
        stroke={highlightedOrganId === 'skin' ? 'var(--soma-accent-focus)' : 'transparent'}
        strokeWidth={highlightedOrganId === 'skin' ? 2 : 0}
        style={{
          cursor: organStates.get('skin')?.active ? 'pointer' : 'default',
          pointerEvents: 'stroke',
          transition: 'stroke 150ms ease',
        }}
        onMouseEnter={organStates.get('skin')?.active ? () => onOrganHover('skin') : undefined}
        onMouseLeave={organStates.get('skin')?.active ? () => onOrganHover(null) : undefined}
        onClick={organStates.get('skin')?.active ? () => onOrganClick('skin') : undefined}
      />
    </svg>
  );
}