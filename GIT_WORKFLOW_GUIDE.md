# Guía de Flujo de Trabajo y Gestión de Ramas en Git

¡Felicitaciones! Has llegado a un punto estable y pulido de **Musidactica**. Para mantener el código organizado, limpio y libre de errores accidentales a medida que agregas nuevas características, utilizaremos un sistema de ramas (**Branches**) basado en las mejores prácticas de la industria (una versión simplificada de *GitFlow*).

Este documento te servirá como referencia para entender qué son las ramas, cuáles usaremos y cómo operar con ellas paso a paso.

---

## 1. ¿Por qué usar ramas (Branches)?

Imagina que tu proyecto es un árbol. El tronco principal (`main`) representa la versión estable y lista para que el público o tus alumnos la usen. 
* Si quieres probar una nueva idea, un nuevo juego o un cambio de diseño, y trabajas directamente sobre el tronco, corres el riesgo de romper algo que ya funcionaba bien.
* Las **ramas** te permiten crear "realidades alternativas" o copias de trabajo seguras. Puedes experimentar, romper cosas, arreglarlas, y solo cuando estés 100% seguro de que funcionan, las integras (fusionas o **merge**) de vuelta al tronco principal.

---

## 2. Nuestra Estructura de Ramas

Implementaremos un esquema profesional de dos ramas principales y ramas temporales de trabajo:

```
                  [ feature/nuevo-juego ]  <- Se trabaja la característica aquí
                         /          \
  develop  -------------*------------*----- <- Integración diaria de características
            \                               /
  main      *------------------------------*--------------------------------- <- Producción (Estable y Publicado)
```

### Ramas Permanentes (Nunca se eliminan)
1. **`main` (Producción)**:
   * Contiene **únicamente** código que ya ha sido probado y está completamente estable.
   * Es la rama que se conecta con Netlify, GitHub Pages o el servidor final.
   * **Regla de oro**: Nunca escribas código directamente en `main`.

2. **`develop` (Integración)**:
   * Es el corazón del desarrollo diario. Aquí se combinan todas las nuevas características que vas terminando.
   * Es un reflejo de lo que será la próxima versión estable.
   * *Ya la hemos creado y activado en tu repositorio local.*

### Ramas Temporales (Se crean para una tarea y se borran al terminar)
1. **`feature/nombre-de-tarea` (Nuevas Características)**:
   * Se crean siempre a partir de `develop`.
   * Se usan para crear un nuevo juego, agregar una sección, cambiar estilos, etc.
   * Ejemplos: `feature/juego-instrumentos`, `feature/perfil-usuario`, `feature/rediseño-home`.
2. **`bugfix/nombre-de-error` (Corrección de Errores)**:
   * Se usan para corregir pequeños problemas o bugs encontrados en la rama `develop`.
   * Ejemplo: `bugfix/audio-glitch`.

---

## 3. Guía de Comandos Rápidos

Aquí tienes los comandos de terminal esenciales para tu flujo de trabajo diario en Windows (PowerShell):

| Acción | Comando | Explicación |
| :--- | :--- | :--- |
| **Ver rama actual** | `git branch` o `git status` | Te dice en qué rama estás parado actualmente. |
| **Cambiar de rama** | `git checkout <nombre-rama>` | Salta a una rama existente. |
| **Crear y cambiar a rama nueva** | `git checkout -b <nombre-nueva-rama>` | Crea una rama desde donde estás parado y salta a ella. |
| **Guardar cambios** | `git add .`<br>`git commit -m "Mensaje"` | Guarda los cambios localmente con un mensaje descriptivo. |
| **Subir al servidor** | `git push origin <nombre-rama>` | Sube la rama y tus cambios a tu repositorio en la nube (GitHub). |
| **Traer cambios del servidor** | `git pull origin <nombre-rama>` | Descarga los últimos cambios que estén en la nube para esa rama. |
| **Fusionar ramas** | `git merge <rama-a-traer>` | Une los cambios de otra rama en tu rama activa actual. |

---

## 4. Flujo de Trabajo en la Práctica: Creando una Nueva Característica

Sigue estos **5 pasos** cada vez que quieras programar algo nuevo:

### Paso 1: Asegurarse de tener lo último en `develop`
Antes de empezar a programar, sitúate en `develop` y descarga los cambios más recientes que tú o alguien más haya subido:
```powershell
# Cambias a develop
git checkout develop

# Traes lo último del servidor remoto
git pull origin develop
```

### Paso 2: Crear tu rama de trabajo (Feature)
Crea una rama específica para lo que vas a hacer. Por ejemplo, supongamos que vas a mejorar el juego de instrumentos:
```powershell
# El prefijo feature/ ayuda a categorizar tus ramas
git checkout -b feature/mejora-instrumentos
```
*¡Listo! Ahora estás trabajando en tu copia segura llamada `feature/mejora-instrumentos`.*

### Paso 3: Trabajar y hacer commits frecuentemente
Modifica los archivos que necesites en tu editor. Cuando completes una pequeña parte que funcione bien, haz un commit. No esperes a terminar todo para hacer un solo commit gigante.
```powershell
# Ver qué archivos modificaste
git status

# Agregar los cambios
git add .

# Guardar con un mensaje descriptivo y profesional (en inglés o español)
git commit -m "feat: agregar nuevos sonidos al juego de instrumentos"
```

### Paso 4: Fusionar los cambios en `develop`
Una vez que terminaste toda la mejora y la probaste localmente en el navegador y funciona genial:
```powershell
# 1. Vuelves a la rama de desarrollo
git checkout develop

# 2. Por seguridad, traes cambios recientes que se hayan subido mientras trabajabas
git pull origin develop

# 3. Fusionas tu trabajo de la rama feature en develop
git merge feature/mejora-instrumentos

# 4. Subes la rama develop actualizada al servidor (GitHub)
git push origin develop
```

### Paso 5: Limpieza (Opcional pero recomendado)
Una vez que la rama `feature/mejora-instrumentos` ya se fusionó a `develop`, ya no la necesitas localmente. Puedes borrarla para mantener tu lista de ramas limpia:
```powershell
git branch -d feature/mejora-instrumentos
```

---

## 5. El Gran Paso a Producción: De `develop` a `main`

Cuando ya has terminado varias características en `develop`, las has probado a fondo y estás listo para publicar una nueva versión estable de la página (lo que verán tus alumnos):

```powershell
# 1. Cambias a la rama principal (main)
git checkout main

# 2. Descargas lo último por seguridad
git pull origin main

# 3. Fusionas todo el desarrollo probado de develop en main
git merge develop

# 4. Subes a producción (esto activará los deploys en Netlify/GitHub Pages)
git push origin main

# 5. Regresas a develop para continuar trabajando en el día a día
git checkout develop
```

---

## 6. Buenas Prácticas Fundamentales

1. **Mantén tus ramas pequeñas y enfocadas**: No crees una rama llamada `feature/hacer-todo`. Crea mejor `feature/ajustar-botones-rhythm` o `feature/arreglar-audio`.
2. **Usa nombres de commits descriptivos**: 
   * *Malo*: `git commit -m "cambios"` o `git commit -m "arreglos"`
   * *Bueno*: `git commit -m "style: ajustar colores de fondo para modo oscuro"` o `git commit -m "fix: corregir error de carga de audio en Safari"`
   * Esto te ayudará en el futuro a saber exactamente qué hiciste en cada momento de la historia del proyecto.
3. **El archivo `.gitignore` es tu mejor amigo**:
   * *Ya lo hemos configurado.* Se encarga de que archivos pesados como `node_modules/` o carpetas de compilación como `dist/` nunca se suban a tus ramas por error, manteniendo tu repositorio ligero y rápido.
