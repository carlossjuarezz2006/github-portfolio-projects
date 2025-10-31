# Instrucciones para Deploy del Portfolio

## Estado actual

✅ Portfolio creado con Next.js + Tailwind CSS
✅ CV generado en PDF
✅ Contenido para LinkedIn preparado
✅ Git inicializado con primer commit
✅ Scripts de automatización para Gmail, GitHub y LinkedIn ejecutándose

## Próximos pasos (requieren tu intervención)

### 1. Completar verificaciones 2FA

Los navegadores automatizados están abiertos esperando que completes:
- **Gmail**: Verificación 2FA si Google la solicita
- **GitHub**: Completar signup y verificar email
- **LinkedIn**: Completar signup y verificar email

### 2. Subir código a GitHub

Una vez que tengas la cuenta de GitHub activa:

```bash
cd /home/mike/Descargas/carlos-portfolio

# Agregar remote de GitHub (reemplaza con tu usuario)
git remote add origin https://github.com/carlosjuarez-dev/carlos-portfolio.git

# Push inicial
git branch -M main
git push -u origin main
```

### 3. Deploy en Netlify

**Opción A: Deploy automático desde GitHub**
1. Ve a https://app.netlify.com/
2. Crea cuenta con tu email (carlossjuarezz2006@gmail.com)
3. Click en "Add new site" → "Import an existing project"
4. Conecta tu cuenta de GitHub
5. Selecciona el repositorio `carlos-portfolio`
6. Netlify detectará Next.js automáticamente
7. Click en "Deploy site"

**Opción B: Deploy manual con Netlify CLI**
```bash
cd /home/mike/Descargas/carlos-portfolio

# Instalar Netlify CLI
npm install -g netlify-cli

# Login en Netlify
netlify login

# Deploy
netlify init
netlify deploy --prod
```

### 4. Actualizar LinkedIn con link del portfolio

Una vez desplegado, copia la URL de Netlify (ej: `carlos-juarez-dev.netlify.app`) y agrégala en:
- Sección "Featured" de LinkedIn
- Sección "Contact Info" → Website

### 5. Archivos importantes

- **CV PDF**: `/home/mike/Descargas/carlos-portfolio/CV-CarlosAlbertoJuarez.pdf`
- **Contenido LinkedIn**: `/home/mike/Descargas/carlos-portfolio/CONTENIDO-LINKEDIN.md`
- **Portfolio local**: http://localhost:3000 (ejecuta `npm run dev`)

## Verificación final

Antes de aplicar a trabajos, verifica:
- [ ] Portfolio desplegado y accesible
- [ ] LinkedIn completo con foto profesional
- [ ] GitHub con repositorio público del portfolio
- [ ] CV PDF descargado y listo para enviar
- [ ] Email de contacto verificado

## Contacto en el portfolio

El portfolio ya incluye:
- Botón de contacto que abre email: carlossjuarezz2006@gmail.com
- Oferta del primer proyecto gratis destacada
- Links a GitHub y LinkedIn (agregar cuando estén listos)

---

¡Todo listo para buscar trabajo! 🚀

