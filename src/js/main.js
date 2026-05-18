// Actualizar el año en el footer automáticamente
document.getElementById('year').textContent = new Date().getFullYear();

// Manejo básico del formulario de contacto
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    alert(`¡Gracias ${name}! Tu mensaje ha sido enviado a Musidactica. Te contactaremos pronto.`);
    contactForm.reset();
  });
}

console.log('Musidactica - Entorno inicializado');
