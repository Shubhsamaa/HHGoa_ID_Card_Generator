// Generates a fun "builder title" from the user's name and stack.
// Pure function, no network — instant.

const PREFIXES = [
  'Chief', 'Lead', 'Principal', 'Serial', 'Full-Stack', 'Prompt',
  'Vibe', 'Chaos', 'Midnight', 'Weekend', 'Open-Source', 'Ship-It',
  'Garage', 'Terminal', 'Pixel', 'Kernel', 'Cloud', 'Edge',
];

const ROLES = [
  'Builder', 'Architect', 'Tinkerer', 'Hacker', 'Maker', 'Engineer',
  'Craftsperson', 'Wizard', 'Mechanic', 'Operator', 'Dreamer', 'Shipper',
];

const SUFFIXES = [
  'of the Internet', 'in Residence', '(Self-Taught)', 'Goa Edition',
  'After Dark', 'Unlimited', 'Without Borders', 'Reloaded',
  'on Main', 'Goa 2026', 'Certified', 'Protoype',
];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function generateBuilderTitle(name: string, stack: string): string {
  const seed = hashStr((name || '') + (stack || '')) || Math.floor(Math.random() * 99999);
  const prefix = PREFIXES[seed % PREFIXES.length];
  const role = ROLES[(seed >> 3) % ROLES.length];
  const suffix = SUFFIXES[(seed >> 7) % SUFFIXES.length];
  return `${prefix} ${role} ${suffix}`;
}

export const SHARE_CAPTION = (format: 'pfp' | 'card', name?: string) => {
  const who = name ? `${name} is ` : '';
  if (format === 'pfp') {
    return `Repping at HH Goa 2026. New PFP, who dis? 🔥\n\nMake yours → `;
  }
  return `${who}officially checked in as a builder at HH Goa 2026. Badge secured. 🔥\n\nMake yours → `;
};

export const HASHTAG = '#FrameInGoa';
