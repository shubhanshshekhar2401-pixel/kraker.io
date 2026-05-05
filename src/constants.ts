import { LocationType } from './types';

export const QUESTIONNAIRE_TREE = {
  [LocationType.Wall]: [
    { id: 'loadBearing', label: 'First, help me understand the load: Is this specific wall load-bearing?', type: 'boolean' },
    { id: 'age', label: 'How long has it been since the structure was completed?', type: 'select', options: ['<1 Year', '1–5 Years', '>5 Years'] },
    { id: 'properCuring', label: 'To your knowledge, was the concrete properly cured during the initial build?', type: 'boolean' },
    { id: 'highTemp', label: 'Is this surface frequently exposed to extreme heat or direct, intense sunlight?', type: 'boolean' },
    { id: 'dampness', label: 'Are you noticing any moisture, damp patches, or active water leakage nearby?', type: 'boolean' },
    { id: 'increasing', label: 'Finally, has this crack been steadily growing or widening since you first noticed it?', type: 'boolean' },
  ],
  [LocationType.Beam]: [
    { id: 'nearSupports', label: 'Where exactly is the crack located on the beam?', type: 'select', options: ['Near support', 'Mid-span'] },
    { id: 'heavyLoad', label: 'Has there been any unusual or extremely heavy loading on this beam lately?', type: 'boolean' },
    { id: 'increasing', label: 'Does the crack seem to be expanding or changing rapidly?', type: 'boolean' },
    { id: 'age', label: 'Approximately how long has this beam been in service?', type: 'select', options: ['<1 Year', '1–5 Years', '>5 Years'] },
    { id: 'leakage', label: 'Are there any signs of moisture or active dripping near the compromised area?', type: 'boolean' },
  ],
  [LocationType.Column]: [
    { id: 'verticalAligned', label: 'Looking closely, does the crack follow a strictly vertical path?', type: 'boolean' },
    { id: 'structuralModification', label: 'Were there any recent modifications or shifts in the building’s layout?', type: 'boolean' },
    { id: 'widening', label: 'Is the crack opening up further as time passes?', type: 'boolean' },
    { id: 'age', label: 'How long ago was this column installed or put into service?', type: 'select', options: ['<1 Year', '1–5 Years', '>5 Years'] },
  ],
  [LocationType.Slab]: [
    { id: 'sunExposure', label: 'Is this slab directly exposed to the overhead sun or extreme weather?', type: 'boolean' },
    { id: 'leakage', label: 'Can you see any water stains or evidence of active liquid penetration?', type: 'boolean' },
    { id: 'weatherVariation', label: 'Has the area been through significant temperature swings recently?', type: 'boolean' },
    { id: 'age', label: 'What is the approximate age of this specific slab or ceiling?', type: 'select', options: ['<1 Year', '1–5 Years', '>5 Years'] },
    { id: 'increasing', label: 'Have you observed the crack pattern spreading or branching further?', type: 'boolean' },
  ],
  [LocationType.Floor]: [
    { id: 'newConstruction', label: 'Is the flooring part of a relatively new construction project?', type: 'boolean' },
    { id: 'sunExposure', label: 'Does this floor surface receive regular, direct heat from sunlight?', type: 'boolean' },
    { id: 'heavyLoad', label: 'Does the floor regularly bear the weight of heavy machinery or vehicles?', type: 'boolean' },
    { id: 'waterAccumulation', label: 'Have you noticed water pooling or staying in this area for long periods?', type: 'boolean' },
  ],
};
