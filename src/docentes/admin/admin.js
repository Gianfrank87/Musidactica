import { supabase } from '../js/supabaseClient.js';

// Elementos del DOM
const authLoading = document.getElementById('auth-loading');
const loginSection = document.getElementById('login-section');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');

const dashboardSection = document.getElementById('dashboard-section');
const userEmailDisplay = document.getElementById('user-email-display');
const btnLogout = document.getElementById('btn-logout');

const activityForm = document.getElementById('activity-form');
const formFeedback = document.getElementById('form-feedback');
const actTitulo = document.getElementById('act-titulo');
const actNivel = document.getElementById('act-nivel');
const actEje = document.getElementById('act-eje');
const actResena = document.getElementById('act-resena');
const actPdf = document.getElementById('act-pdf');
const fileDropzone = document.getElementById('file-dropzone');
const dropzoneFilename = document.getElementById('dropzone-filename');
const btnSubmitActivity = document.getElementById('btn-submit-activity');

const listLoading = document.getElementById('list-loading');
const adminActividadesList = document.getElementById('admin-actividades-list');
const listEmpty = document.getElementById('list-empty');
const activityCount = document.getElementById('activity-count');

// Lista local para visualización y eliminación rápida
let loadedActividades = [];

// 1. Verificación de configuración inicial de Supabase
const isConfigured = supabase && 
                     supabase.supabaseUrl && 
                     !supabase.supabaseUrl.includes('TU_SUPABASE_URL') &&
                     supabase.supabaseUrl !== '';

if (!isConfigured) {
  authLoading.style.display = 'none';
  loginSection.removeAttribute('hidden');
  loginSection.style.display = 'block';
  loginSection.innerHTML = `
    <div class="auth-card" style="max-width: 600px; margin: 2rem auto;">
      <h2 style="color: #ef4444; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
        <span>⚠️</span> Supabase no configurado
      </h2>
      <p style="margin-bottom: 1rem; line-height: 1.6; color: #334155;">
        Para empezar a utilizar el panel de administración, primero debés configurar tus credenciales públicas en el archivo:
      </p>
      <div style="background: #f1f5f9; padding: 0.75rem 1rem; border-radius: 6px; font-family: monospace; font-size: 0.9rem; margin-bottom: 1.5rem; border-left: 4px solid #6366f1;">
        /src/docentes/js/supabaseClient.js
      </div>
      <p style="line-height: 1.6; color: #64748b; font-size: 0.95rem;">
        Reemplazá las constantes <code>SUPABASE_URL</code> y <code>SUPABASE_ANON_KEY</code> con los valores de tu proyecto (los encontrás en el panel de Supabase: <strong>Project Settings > API</strong>).
      </p>
    </div>
  `;
} else {
  // Si está configurado, iniciamos la escucha de sesión
  initAuth();
}

// 2. Control de Autenticación
function initAuth() {
  // Comprobar sesión actual
  supabase.auth.getSession().then(({ data: { session } }) => {
    handleAuthState(session);
  });

  // Escuchar cambios de sesión (login/logout)
  supabase.auth.onAuthStateChange((_event, session) => {
    handleAuthState(session);
  });
}

function handleAuthState(session) {
  authLoading.style.display = 'none';

  if (session) {
    // Sesión iniciada
    loginSection.setAttribute('hidden', 'true');
    loginSection.style.display = 'none';
    dashboardSection.removeAttribute('hidden');
    
    userEmailDisplay.textContent = session.user.email;
    loadActivitiesList();
  } else {
    // Sesión cerrada
    dashboardSection.setAttribute('hidden', 'true');
    loginSection.removeAttribute('hidden');
    loginSection.style.display = 'block';
    
    // Limpiar campos de login
    loginForm.reset();
  }
}

// Evento Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = loginEmail.value.trim();
  const password = loginPassword.value;
  
  // UI en carga
  const btnSubmit = document.getElementById('btn-login-submit');
  const originalText = btnSubmit.textContent;
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = `Ingresando... <div class="btn-spinner"></div>`;
  loginError.setAttribute('hidden', 'true');

  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  } catch (err) {
    console.error('Error de login:', err);
    loginError.textContent = translateAuthError(err.message);
    loginError.removeAttribute('hidden');
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.textContent = originalText;
  }
});

// Evento Logout
btnLogout.addEventListener('click', async () => {
  if (confirm('¿Estás seguro de que querés cerrar sesión?')) {
    await supabase.auth.signOut();
  }
});

// Traducir mensajes comunes de error
function translateAuthError(msg) {
  if (msg.includes('Invalid login credentials')) {
    return 'Credenciales inválidas. Por favor, verifica el email y la contraseña.';
  }
  if (msg.includes('Email not confirmed')) {
    return 'El correo electrónico no ha sido verificado todavía.';
  }
  return msg;
}

// 3. Gestión del Formulario y Dropzone
fileDropzone.addEventListener('dragover', (e) => {
  e.preventDefault();
  fileDropzone.classList.add('dragover');
});
fileDropzone.addEventListener('dragleave', () => {
  fileDropzone.classList.remove('dragover');
});
fileDropzone.addEventListener('drop', (e) => {
  e.preventDefault();
  fileDropzone.classList.remove('dragover');
  if (e.dataTransfer.files.length) {
    actPdf.files = e.dataTransfer.files;
    updateFilenameLabel();
  }
});
actPdf.addEventListener('change', updateFilenameLabel);

function updateFilenameLabel() {
  if (actPdf.files.length) {
    dropzoneFilename.textContent = `Seleccionado: ${actPdf.files[0].name}`;
  } else {
    dropzoneFilename.textContent = '';
  }
}

// Publicar actividad (Subida de PDF y registro en DB)
activityForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const file = actPdf.files[0];
  if (!file) {
    showFormFeedback('Por favor, selecciona un archivo PDF.', 'error');
    return;
  }

  if (file.type !== 'application/pdf') {
    showFormFeedback('El archivo debe ser un PDF.', 'error');
    return;
  }

  // Deshabilitar formulario y mostrar spinner
  setFormLoadingState(true);
  showFormFeedback('Subiendo archivo PDF a almacenamiento...', 'success');

  try {
    // A. Subir PDF a Supabase Storage
    const fileExt = file.name.split('.').pop();
    // Generar un nombre único de archivo para evitar colisiones
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('actividades-pdfs')
      .upload(uniqueFileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // B. Obtener URL pública del archivo
    const { data: urlData } = supabase.storage
      .from('actividades-pdfs')
      .getPublicUrl(uniqueFileName);
    
    const publicPdfUrl = urlData.publicUrl;

    // C. Guardar registro en la base de datos
    showFormFeedback('Registrando actividad en la base de datos...', 'success');
    
    const { error: dbError } = await supabase
      .from('actividades')
      .insert([
        {
          titulo: actTitulo.value.trim(),
          nivel: actNivel.value,
          eje: actEje.value,
          resena: actResena.value.trim(),
          pdf_url: publicPdfUrl
        }
      ]);

    if (dbError) {
      // Intentamos borrar el PDF subido si falla el registro en la DB
      await supabase.storage.from('actividades-pdfs').remove([uniqueFileName]);
      throw dbError;
    }

    // D. Éxito
    showFormFeedback('¡Actividad publicada con éxito!', 'success');
    activityForm.reset();
    dropzoneFilename.textContent = '';
    
    // Recargar listado
    await loadActivitiesList();

  } catch (err) {
    console.error('Error al guardar actividad:', err);
    showFormFeedback(`Error: ${err.message || 'No se pudo guardar la actividad'}`, 'error');
  } finally {
    setFormLoadingState(false);
  }
});

function showFormFeedback(msg, type) {
  formFeedback.textContent = msg;
  formFeedback.className = `alert-message alert-${type}`;
  formFeedback.removeAttribute('hidden');
}

function setFormLoadingState(isLoading) {
  const btnSpinner = btnSubmitActivity.querySelector('.btn-spinner');
  const btnText = btnSubmitActivity.querySelector('.btn-text');

  if (isLoading) {
    btnSubmitActivity.disabled = true;
    btnSpinner.removeAttribute('hidden');
    btnText.textContent = 'Procesando...';
  } else {
    btnSubmitActivity.disabled = false;
    btnSpinner.setAttribute('hidden', 'true');
    btnText.textContent = 'Publicar Actividad';
  }
}

// 4. Gestión del listado
async function loadActivitiesList() {
  listLoading.style.display = 'flex';
  adminActividadesList.setAttribute('hidden', 'true');
  listEmpty.setAttribute('hidden', 'true');

  try {
    const { data, error } = await supabase
      .from('actividades')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    loadedActividades = data || [];
    renderAdminList();

  } catch (err) {
    console.error('Error al listar actividades:', err);
    listLoading.style.display = 'none';
    listEmpty.querySelector('p').textContent = 'Error al cargar las actividades.';
    listEmpty.removeAttribute('hidden');
  }
}

function renderAdminList() {
  listLoading.style.display = 'none';
  activityCount.textContent = loadedActividades.length;

  if (loadedActividades.length === 0) {
    listEmpty.removeAttribute('hidden');
    adminActividadesList.setAttribute('hidden', 'true');
    return;
  }

  listEmpty.setAttribute('hidden', 'true');
  adminActividadesList.replaceChildren();

  loadedActividades.forEach(act => {
    const item = document.createElement('div');
    item.className = 'admin-actividad-item';
    item.dataset.id = act.id;

    item.innerHTML = `
      <div class="item-info">
        <span class="item-title">${act.titulo}</span>
        <div class="item-tags">
          <span class="item-tag item-tag-level">${act.nivel} grado</span>
          <span class="item-tag item-tag-category">${act.eje}</span>
        </div>
      </div>
      <div class="item-actions">
        <button class="btn btn-danger btn-sm btn-delete" data-id="${act.id}" data-pdf="${act.pdf_url}">
          Eliminar
        </button>
      </div>
    `;

    adminActividadesList.appendChild(item);
  });

  adminActividadesList.removeAttribute('hidden');
  bindDeleteEvents();
}

function bindDeleteEvents() {
  const deleteButtons = adminActividadesList.querySelectorAll('.btn-delete');
  deleteButtons.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = btn.dataset.id;
      const pdfUrl = btn.dataset.pdf;
      
      const act = loadedActividades.find(a => a.id === id);
      if (!act) return;

      if (confirm(`¿Estás seguro de que querés eliminar la actividad "${act.titulo}"? Esta acción no se puede deshacer.`)) {
        btn.disabled = true;
        btn.textContent = 'Eliminando...';

        try {
          // A. Eliminar registro de la base de datos
          const { error: dbError } = await supabase
            .from('actividades')
            .delete()
            .eq('id', id);

          if (dbError) throw dbError;

          // B. Eliminar el archivo del Storage
          if (pdfUrl) {
            // Extraer el nombre de archivo de la URL
            // Ejemplo URL: https://.../storage/v1/object/public/actividades-pdfs/171624021-test.pdf
            const fileName = pdfUrl.split('/').pop();
            if (fileName) {
              await supabase.storage
                .from('actividades-pdfs')
                .remove([fileName]);
            }
          }

          // C. Éxito: Remover del listado local y re-renderizar
          loadedActividades = loadedActividades.filter(a => a.id !== id);
          renderAdminList();

        } catch (err) {
          console.error('Error al eliminar actividad:', err);
          alert(`Error al eliminar actividad: ${err.message}`);
          btn.disabled = false;
          btn.textContent = 'Eliminar';
        }
      }
    });
  });
}
