/**
 * Configuration centralisée des couleurs de l'application
 * Modifiez cette fichier pour changer rapidement la palette de couleurs globale
 */

export const colors = {
  // Couleur principale - Utilisée pour les gradients, boutons, titres principaux
  // Options: 'blue', 'purple', 'indigo', 'pink', 'red', 'orange', 'green'
  primary: 'blue',

  // Générique
  primary50: 'primary-50',
  primary100: 'primary-100',
  primary200: 'primary-200',
  primary400: 'primary-400',
  primary500: 'primary-500',
  primary600: 'primary-600',
  primary700: 'primary-700',
  primary900: 'primary-900',

  // Gradients
  gradientFrom: 'from-primary-500',
  gradientTo: 'to-primary-600',
  gradientFromLight: 'from-primary-100',
  gradientToLight: 'to-primary-50',

  // Utilitaires
  white: 'white',
  gray50: 'gray-50',
  gray200: 'gray-200',
  gray500: 'gray-500',
  gray700: 'gray-700',
  gray800: 'gray-800',
  gray900: 'gray-900',
};

/**
 * Fonction utilitaire pour générer les classes Tailwind avec la couleur primaire
 */
export const getPrimaryColor = (intensity: 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 = 500) => {
  const base = colors.primary;
  return `${base}-${intensity}`;
};

/**
 * Ensemble de classes préconfigurées pour les éléments courants
 */
export const colorSchemes = {
  // Bouton principal
  primaryButton: `bg-gradient-to-r ${colors.gradientFrom} ${colors.gradientTo} text-white shadow-lg hover:shadow-xl transition-shadow`,
  
  // Bouton secondaire
  secondaryButton: `bg-${colors.primary50} text-${colors.primary700}`,
  
  // Barre de progression
  progressBar: `bg-gradient-to-r ${colors.gradientFrom} ${colors.gradientTo}`,
  
  // Fond principal
  mainBackground: `bg-gradient-to-br ${colors.gradientFromLight} via-white ${colors.gradientToLight}`,
  
  // Boîte d'information
  infoBox: `bg-${colors.primary50} border-${colors.primary100}`,
};
