import {
  Scissors,
  Droplet,
  Settings,
  Car,
  Zap,
  Wrench,
  Cog,
  Fuel,
  Fan,
  Gauge,
  Cpu,
  Disc,
  CircleDot,
  Layers,
  Filter,
  Wind,
  Thermometer,
  Battery,
  CircuitBoard,
  Boxes,
  Tractor,
  Package,
  Hammer,
  Nut,
  Bolt,
} from 'lucide-react';

const SECTION_ICON_MAP = [
  { keywords: ['cutter', 'cut', 'blade', 'knife', 'header'], icon: Scissors },
  { keywords: ['hydraulic', 'fluid', 'oil', 'pump'], icon: Droplet },
  { keywords: ['powertrain', 'transmission', 'gear', 'gearbox'], icon: Cog },
  { keywords: ['engine', 'motor', 'diesel', 'fuel', 'combustion'], icon: Fuel },
  { keywords: ['chassis', 'body', 'frame', 'cab', 'cabin'], icon: Car },
  { keywords: ['electrical', 'electric', 'wiring', 'light', 'sensor'], icon: Zap },
  { keywords: ['battery', 'alternator', 'starter'], icon: Battery },
  { keywords: ['circuit', 'ecu', 'computer', 'control'], icon: CircuitBoard },
  { keywords: ['cooling', 'fan', 'radiator', 'thermal'], icon: Fan },
  { keywords: ['brake', 'disc', 'pad'], icon: Disc },
  { keywords: ['gauge', 'meter', 'instrument', 'display'], icon: Gauge },
  { keywords: ['conveyor', 'auger', 'elevator', 'grain'], icon: Boxes },
  { keywords: ['filter', 'strainer', 'screen'], icon: Filter },
  { keywords: ['air', 'ventilation', 'ac', 'climate'], icon: Wind },
  { keywords: ['temperatur', 'heat'], icon: Thermometer },
  { keywords: ['cpu', 'processor', 'module'], icon: Cpu },
  { keywords: ['wheel', 'tire', 'tyre', 'track'], icon: CircleDot },
  { keywords: ['spare', 'part', 'misc', 'other'], icon: Package },
  { keywords: ['tool', 'kit', 'accessory'], icon: Hammer },
  { keywords: ['nut', 'bolt', 'fastener', 'hardware'], icon: Bolt },
  { keywords: ['power', 'drive', 'shaft'], icon: Settings },
  { keywords: ['system', 'assembly', 'unit'], icon: Layers },
];

const DEFAULT_ICON = Wrench;

export function getSectionIcon(name) {
  if (!name) return DEFAULT_ICON;
  const lower = name.toLowerCase();
  for (const entry of SECTION_ICON_MAP) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.icon;
    }
  }
  return DEFAULT_ICON;
}

export { DEFAULT_ICON };
