# 🎵 Musidactica — Plataforma Digital de Educación Musical

<div align="center">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite Badge" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript Badge" />
  <img src="https://img.shields.io/badge/HTML5_Audio-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5 Badge" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3 Badge" />
  <img src="https://img.shields.io/badge/Status-Activo-success?style=for-the-badge" alt="Status Badge" />
</div>

<br />

> **Musidactica** es una plataforma educativa web de alto rendimiento, moderna y responsiva, diseñada específicamente para la enseñanza de la música en entornos escolares y académicos. Desarrollada con un enfoque "plug-and-play" pensado para netbooks y dispositivos escolares, ofrece una experiencia interactiva sin fricciones ni configuraciones complejas.

---

## 🌟 Características Destacadas

*   ⚡ **Rendimiento Ultraligero**: Construido sobre **Vite** y tecnologías web nativas (Vanilla JS y CSS) para garantizar una carga e interactividad instantáneas, incluso en netbooks escolares con recursos limitados.
*   🎮 **Hub de Juegos Didácticos**: Un conjunto interactivo de herramientas lúdicas para el entrenamiento rítmico, auditivo y de reconocimiento instrumental.
*   🎨 **Diseño Premium**: Interfaz moderna con animaciones sutiles, paleta de colores vibrante pero accesible, y adaptabilidad total (móvil, tablet y escritorio).
*   🌐 **100% Offline-Ready**: Ideal para aulas con conectividad a internet inestable o nula.

---

## 🕹️ Hub de Juegos Interactivos

Nuestra plataforma cuenta con módulos de juego especializados:

### 1. 🥁 Ritmograma (Entrenamiento Rítmico)
Un motor de ritmo dinámico de alto rendimiento con:
*   Generación de patrones rítmicos en tiempo real.
*   Retroalimentación visual mediante pulsos subliminales y explosiones de notas.
*   Interacción fluida mediante el teclado o controles táctiles.

### 2. 🎺 Explorador de Instrumentos
Un módulo visual y auditivo para el reconocimiento y exploración tímbrica de familias de instrumentos:
*   Muestras de audio de alta fidelidad.
*   Interactividad limpia con animaciones micro-interactivas.

### 3. 🎼 Dictado Melódico
Entrenamiento del oído interno y reconocimiento de alturas:
*   Generación dinámica de intervalos y melodías sencillas.
*   Interfaz intuitiva para responder e interactuar con el pentagrama digital.

### 4. 🎸 Aula de Guitarra
Una herramienta visual e interactiva para la práctica y el aprendizaje de acordes y notas en el diapasón de la guitarra de manera lúdica.

---

## 🛠️ Stack Tecnológico

*   **Core**: HTML5 semántico y JavaScript ES6+.
*   **Audio**: Web Audio API / HTML5 Audio para una latencia mínima y reproducción sincronizada de alta fidelidad.
*   **Renderizado**: Canvas 2D interactivo para los motores de juego de alta respuesta.
*   **Estilos**: Vanilla CSS con un sistema robusto de variables CSS para facilitar cambios temáticos rápidos y consistentes.
*   **Herramienta de Construcción (Bundler)**: Vite para un servidor de desarrollo ultra veloz y empaquetado optimizado en producción.

---

## 🚀 Inicio Rápido (Desarrollo Local)

Sigue estos sencillos pasos para poner en marcha el proyecto en tu máquina de desarrollo local:

### Requisitos Previos
Tener instalado [Node.js](https://nodejs.org/) (versión 16 o superior recomendada).

### 1. Clonar el repositorio
```bash
git clone https://github.com/Gianfrank87/Musidactica.git
cd Musidactica
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Iniciar el servidor de desarrollo local
```bash
npm run dev
```
Abre tu navegador en [http://localhost:5173](http://localhost:5173) y ¡listo!

### 4. Compilar para producción
Para generar la versión optimizada y lista para desplegar en la nube (Netlify, GitHub Pages, etc.):
```bash
npm run build
```

---

## 🌿 Flujo de Trabajo con Ramas (Git branching)

Para asegurar la calidad del código y mantener la plataforma 100% libre de errores en producción, seguimos un esquema de ramas organizado:

*   **`main`**: Contiene únicamente versiones estables y probadas que están en línea para los alumnos.
*   **`develop`**: Rama de integración diaria. Aquí se fusionan todas las nuevas características antes de pasar a `main`.
*   **`feature/`**: Ramas temporales creadas para desarrollar una tarea específica (ej. `feature/nuevo-juego`).

> 💡 **¿Quieres aprender más sobre cómo gestionar las ramas en este proyecto?** 
> Consulta nuestra guía interactiva interna: [GIT_WORKFLOW_GUIDE.md](./GIT_WORKFLOW_GUIDE.md)

---

## 🧑‍💻 Autor

Desarrollado y mantenido con pasión por **Gianfrank87**. Plataforma creada para potenciar la educación musical y llevar tecnología interactiva de calidad a las aulas de todo el mundo. 🎹
