export const defaultLanguage = 'en-US'
export const languages = [
  {id: 'fr-FR', name: 'Français'},
  {id: 'en-US', name: 'English (US)'},
]

export const languagesById = {}

languages.forEach(l => {
  languagesById[l.id] = l
})
