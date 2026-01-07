# SEO - Youppie

## Imagem Open Graph

A imagem Open Graph está configurada para usar `/logo-grande.png`. 

Para uma otimização ideal, recomenda-se criar uma imagem específica de **1200x630px** com:
- Logo do Youppie
- Texto "Criador de Quizzes Interativos"
- Design atrativo para compartilhamento em redes sociais

**Como atualizar:**
1. Crie a imagem `opengraph-image.png` (1200x630px) na pasta `public/`
2. Atualize o metadata em `app/layout.tsx` e `app/page.tsx` para usar `/opengraph-image.png`

Ou use o sistema de Image Generation do Next.js 14 criando `app/opengraph-image.tsx`.

## Variáveis de Ambiente

Adicione ao `.env`:
```
NEXT_PUBLIC_SITE_URL=https://youppie.com.br
GOOGLE_SITE_VERIFICATION=seu-codigo-verificacao-google
```

## Verificação

- [ ] Google Search Console configurado
- [ ] Bing Webmaster Tools configurado
- [ ] Sitemap.xml acessível em `/sitemap.xml`
- [ ] Robots.txt acessível em `/robots.txt`
- [ ] Open Graph testado (Facebook Sharing Debugger)
- [ ] Twitter Card testado (Twitter Card Validator)

