import { supabase } from '../js/supabaseClient.js';

// ── Elementos del DOM ──
var authLoading = document.getElementById('auth-loading');
var loginSection = document.getElementById('login-section');
var loginForm = document.getElementById('login-form');
var loginError = document.getElementById('login-error');
var loginEmail = document.getElementById('login-email');
var loginPassword = document.getElementById('login-password');

var dashboardSection = document.getElementById('dashboard-section');
var userEmailDisplay = document.getElementById('user-email-display');
var btnLogout = document.getElementById('btn-logout');

var activityForm = document.getElementById('activity-form');
var formFeedback = document.getElementById('form-feedback');
var actTitulo = document.getElementById('act-titulo');
var actNivel = document.getElementById('act-nivel');
var actEje = document.getElementById('act-eje');
var actResena = document.getElementById('act-resena');
var actPdf = document.getElementById('act-pdf');
var fileDropzone = document.getElementById('file-dropzone');
var dropzoneFilename = document.getElementById('dropzone-filename');
var btnSubmitActivity = document.getElementById('btn-submit-activity');

var listLoading = document.getElementById('list-loading');
var adminActividadesList = document.getElementById('admin-actividades-list');
var listEmpty = document.getElementById('list-empty');
var activityCount = document.getElementById('activity-count');

// Lista local
var loadedActividades = [];

// ── 1. Verificar configuración de Supabase ──
function isSupabaseConfigured() {
  try {
    var url = supabase.supabaseUrl || '';
    return url.length > 0 && url.indexOf('TU_SUPABASE_URL') === -1;
  } catch (e) {
    return false;
  }
}

if (!isSupabaseConfigured()) {
  authLoading.style.display = 'none';
  loginSection.removeAttribute('hidden');
  loginSection.innerHTML =
    '<div class="auth-card" style="max-width:600px;margin:2rem auto;">' +
      '<h2 style="color:#ef4444;">Supabase no configurado</h2>' +
      '<p>Configurá las credenciales en <code>src/docentes/js/supabaseClient.js</code></p>' +
    '</div>';
} else {
  initAuth();
}

// ── 2. Autenticación ──
function withTimeout(promise, ms) {
  return new Promise(function(resolve, reject) {
    var timer = setTimeout(function() {
      reject(new Error('La conexión con Supabase tardó demasiado. Verificá tu URL y Anon Key en supabaseClient.js'));
    }, ms);
    promise.then(function(val) {
      clearTimeout(timer);
      resolve(val);
    }).catch(function(err) {
      clearTimeout(timer);
      reject(err);
    });
  });
}

function initAuth() {
  withTimeout(supabase.auth.getSession(), 5000)
    .then(function(result) {
      handleAuthState(result.data.session);
    })
    .catch(function(err) {
      console.error('Error verificando sesión:', err);
      authLoading.style.display = 'none';
      loginSection.removeAttribute('hidden');
      loginError.textContent = err.message || 'Error al conectar con Supabase. Verificá la URL y la Anon Key.';
      loginError.removeAttribute('hidden');
    });

  supabase.auth.onAuthStateChange(function(_event, session) {
    handleAuthState(session);
  });
}

function handleAuthState(session) {
  authLoading.style.display = 'none';

  if (session) {
    loginSection.setAttribute('hidden', 'true');
    dashboardSection.removeAttribute('hidden');
    userEmailDisplay.textContent = session.user.email;
    loadActivitiesList();
  } else {
    dashboardSection.setAttribute('hidden', 'true');
    loginSection.removeAttribute('hidden');
    loginForm.reset();
  }
}

// ── Evento Login ──
loginForm.addEventListener('submit', function(e) {
  e.preventDefault();

  var email = loginEmail.value.trim();
  var password = loginPassword.value;

  var btnSubmit = document.getElementById('btn-login-submit');
  var originalText = btnSubmit.textContent;
  btnSubmit.disabled = true;
  btnSubmit.textContent = 'Ingresando...';
  loginError.setAttribute('hidden', 'true');

  supabase.auth.signInWithPassword({ email: email, password: password })
    .then(function(result) {
      if (result.error) throw result.error;
    })
    .catch(function(err) {
      console.error('Error de login:', err);
      loginError.textContent = translateAuthError(err.message);
      loginError.removeAttribute('hidden');
    })
    .finally(function() {
      btnSubmit.disabled = false;
      btnSubmit.textContent = originalText;
    });
});

// ── Evento Logout ──
btnLogout.addEventListener('click', function() {
  if (confirm('¿Cerrar sesión?')) {
    supabase.auth.signOut();
  }
});

function translateAuthError(msg) {
  if (msg.indexOf('Invalid login credentials') !== -1) {
    return 'Credenciales inválidas. Verificá email y contraseña.';
  }
  if (msg.indexOf('Email not confirmed') !== -1) {
    return 'El correo electrónico no fue verificado todavía.';
  }
  return msg;
}

// ── 3. Dropzone ──
fileDropzone.addEventListener('dragover', function(e) {
  e.preventDefault();
  fileDropzone.classList.add('dragover');
});
fileDropzone.addEventListener('dragleave', function() {
  fileDropzone.classList.remove('dragover');
});
fileDropzone.addEventListener('drop', function(e) {
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
    dropzoneFilename.textContent = 'Seleccionado: ' + actPdf.files[0].name;
  } else {
    dropzoneFilename.textContent = '';
  }
}

// ── 4. Publicar actividad ──
activityForm.addEventListener('submit', function(e) {
  e.preventDefault();

  var file = actPdf.files[0];
  if (!file) {
    showFormFeedback('Por favor, seleccioná un archivo PDF.', 'error');
    return;
  }
  if (file.type !== 'application/pdf') {
    showFormFeedback('El archivo debe ser un PDF.', 'error');
    return;
  }

  setFormLoadingState(true);
  showFormFeedback('Subiendo archivo PDF...', 'success');

  var fileExt = file.name.split('.').pop();
  var uniqueFileName = Date.now() + '-' + Math.random().toString(36).substring(2, 10) + '.' + fileExt;

  supabase.storage
    .from('actividades-pdfs')
    .upload(uniqueFileName, file, { cacheControl: '3600', upsert: false })
    .then(function(uploadResult) {
      if (uploadResult.error) throw uploadResult.error;

      var urlData = supabase.storage
        .from('actividades-pdfs')
        .getPublicUrl(uniqueFileName);

      var publicPdfUrl = urlData.data.publicUrl;

      showFormFeedback('Registrando actividad...', 'success');

      return supabase
        .from('actividades')
        .insert([{
          titulo: actTitulo.value.trim(),
          nivel: actNivel.value,
          eje: actEje.value,
          resena: actResena.value.trim(),
          pdf_url: publicPdfUrl
        }])
        .then(function(dbResult) {
          if (dbResult.error) {
            // Borrar el PDF si falla la inserción en la DB
            supabase.storage.from('actividades-pdfs').remove([uniqueFileName]);
            throw dbResult.error;
          }

          showFormFeedback('¡Actividad publicada con éxito!', 'success');
          activityForm.reset();
          dropzoneFilename.textContent = '';
          return loadActivitiesList();
        });
    })
    .catch(function(err) {
      console.error('Error al guardar actividad:', err);
      showFormFeedback('Error: ' + (err.message || 'No se pudo guardar la actividad'), 'error');
    })
    .finally(function() {
      setFormLoadingState(false);
    });
});

function showFormFeedback(msg, type) {
  formFeedback.textContent = msg;
  formFeedback.className = 'alert-message alert-' + type;
  formFeedback.removeAttribute('hidden');
}

function setFormLoadingState(isLoading) {
  var btnSpinner = btnSubmitActivity.querySelector('.btn-spinner');
  var btnText = btnSubmitActivity.querySelector('.btn-text');

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

// ── 5. Listado de actividades ──
function loadActivitiesList() {
  listLoading.style.display = 'flex';
  adminActividadesList.setAttribute('hidden', 'true');
  listEmpty.setAttribute('hidden', 'true');

  return supabase
    .from('actividades')
    .select('*')
    .order('created_at', { ascending: false })
    .then(function(result) {
      if (result.error) throw result.error;
      loadedActividades = result.data || [];
      renderAdminList();
    })
    .catch(function(err) {
      console.error('Error al listar actividades:', err);
      listLoading.style.display = 'none';
      listEmpty.querySelector('p').textContent = 'Error al cargar las actividades.';
      listEmpty.removeAttribute('hidden');
    });
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

  loadedActividades.forEach(function(act) {
    var item = document.createElement('div');
    item.className = 'admin-actividad-item';
    item.dataset.id = act.id;

    var info = document.createElement('div');
    info.className = 'item-info';

    var title = document.createElement('span');
    title.className = 'item-title';
    title.textContent = act.titulo;

    var tags = document.createElement('div');
    tags.className = 'item-tags';

    var tagLevel = document.createElement('span');
    tagLevel.className = 'item-tag item-tag-level';
    tagLevel.textContent = act.nivel + ' grado';

    var tagCat = document.createElement('span');
    tagCat.className = 'item-tag item-tag-category';
    tagCat.textContent = act.eje;

    tags.appendChild(tagLevel);
    tags.appendChild(tagCat);
    info.appendChild(title);
    info.appendChild(tags);

    var actions = document.createElement('div');
    actions.className = 'item-actions';

    var btnDel = document.createElement('button');
    btnDel.className = 'btn btn-danger btn-sm btn-delete';
    btnDel.textContent = 'Eliminar';
    btnDel.dataset.id = act.id;
    btnDel.dataset.pdf = act.pdf_url || '';

    actions.appendChild(btnDel);
    item.appendChild(info);
    item.appendChild(actions);
    adminActividadesList.appendChild(item);
  });

  adminActividadesList.removeAttribute('hidden');
  bindDeleteEvents();
}

function bindDeleteEvents() {
  var deleteButtons = adminActividadesList.querySelectorAll('.btn-delete');
  deleteButtons.forEach(function(btn) {
    btn.addEventListener('click', function() {
      var id = btn.dataset.id;
      var pdfUrl = btn.dataset.pdf;

      var act = loadedActividades.find(function(a) { return a.id === id; });
      if (!act) return;

      if (!confirm('¿Eliminar la actividad "' + act.titulo + '"? No se puede deshacer.')) return;

      btn.disabled = true;
      btn.textContent = 'Eliminando...';

      supabase
        .from('actividades')
        .delete()
        .eq('id', id)
        .then(function(result) {
          if (result.error) throw result.error;

          // Borrar PDF del storage
          if (pdfUrl) {
            var fileName = pdfUrl.split('/').pop();
            if (fileName) {
              supabase.storage.from('actividades-pdfs').remove([fileName]);
            }
          }

          loadedActividades = loadedActividades.filter(function(a) { return a.id !== id; });
          renderAdminList();
        })
        .catch(function(err) {
          console.error('Error al eliminar actividad:', err);
          alert('Error al eliminar: ' + err.message);
          btn.disabled = false;
          btn.textContent = 'Eliminar';
        });
    });
  });
}
