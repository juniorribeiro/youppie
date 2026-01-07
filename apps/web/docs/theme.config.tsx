import { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: <span>Youppie - Documentação</span>,
  project: {
    link: 'https://youppie.com.br'
  },
  docsRepositoryBase: 'https://github.com/seu-repo/youppie',
  footer: {
    text: 'Youppie - Documentação de Usuário © 2025'
  },
  sidebar: {
    defaultMenuCollapseLevel: 1,
  },
  primaryHue: 250,
  primarySaturation: 100,
}

export default config

