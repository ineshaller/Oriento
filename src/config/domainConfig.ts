import {
  GraduationCap,
  Code,
  Heart,
  Palette,
  Building,
  Briefcase,
  FlaskConical
} from 'lucide-react';

export const domainConfig: Record<string, {
  icon: any;
  color: string;
}> = {
  Informatique: {
    icon: Code,
    color: 'from-blue-400 to-blue-500'
  },
  Santé: {
    icon: Heart,
    color: 'from-red-400 to-red-500'
  },
  Création: {
    icon: Palette,
    color: 'from-pink-400 to-pink-500'
  },
  Ingénierie: {
    icon: FlaskConical,
    color: 'from-indigo-400 to-indigo-500'
  },
  Bâtiment: {
    icon: Building,
    color: 'from-gray-400 to-gray-500'
  },
  Commerce: {
    icon: Briefcase,
    color: 'from-orange-400 to-orange-500'
  },
  Général: {
    icon: GraduationCap,
    color: 'from-green-400 to-green-500'
  }
};
