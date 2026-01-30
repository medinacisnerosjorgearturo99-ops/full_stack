// =====================
// DATOS
// =====================
const tareas = [];
let tareaMenuId = null;      // cuál tarea abrió el menú
let menuTarea = null;        // se asigna cuando cargue el DOM

// =====================
// CREAR CARD
// =====================
function crearCardTarea(tarea) {
  const card = document.createElement("div");
  card.className = "task-card";
  card.dataset.id = tarea.id;

  card.innerHTML = `
    <div class="task-top">
      <input type="checkbox" class="task-check" ${tarea.completada ? "checked" : ""}>
      <h3 class="task-title">${tarea.titulo}</h3>
    </div>

    <div class="task-info">
      <p>Entrega: <span>${tarea.entrega}</span></p>
      <p>Estimado: <span>${tarea.estimado}</span></p>
    </div>

    <div class="task-actions">
      <button class="btn-edit" type="button">✏️</button>
      <button class="btn-more" type="button">⋯</button>
    </div>
  `;

  // checkbox
  const checkbox = card.querySelector(".task-check");
  checkbox.addEventListener("change", () => {
    tarea.completada = checkbox.checked;
  });

  // editar
  card.querySelector(".btn-edit").addEventListener("click", (e) => {
    e.stopPropagation();
    abrirEditarTarea(tarea);
  });

  // menu ⋮ (opciones)
  card.querySelector(".btn-more").addEventListener("click", (e) => {
    e.stopPropagation(); // para que no abra detalles
    abrirMenuTarea(e, tarea.id);
  });

  return card;
}

const grupos = [];
let grupoActivoId = null;

// =====================
// RENDER
// =====================
function renderTareas() {
  const contenedor = document.getElementById("contenedor_tareas");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  const filtradas = (grupoActivoId === null)
    ? tareas.filter(t => t.grupoId === null)          // GENERAL
    : tareas.filter(t => t.grupoId === grupoActivoId); // GRUPO

  filtradas.forEach(t => {
    contenedor.appendChild(crearCardTarea(t));
  });
}

function abrirMenuTarea(e, tareaId) {
  if (!menuTarea) return;

  tareaMenuId = tareaId;

  // posición cerca del botón ⋮
  const btn = e.target.closest(".btn-more");
  const r = btn.getBoundingClientRect();

  // por defecto abre hacia abajo; si no cabe, lo subimos
  const menuWidth = 190;
  const menuHeight = 140;

  let top = r.bottom + window.scrollY + 6;
  let left = r.right + window.scrollX - menuWidth;

  const maxTop = window.scrollY + window.innerHeight - menuHeight - 10;
  if (top > maxTop) top = r.top + window.scrollY - menuHeight - 6;

  // evitar que se vaya fuera a la izquierda
  if (left < 10) left = 10;

  menuTarea.style.top = `${top}px`;
  menuTarea.style.left = `${left}px`;
  menuTarea.classList.remove("oculto");
}

function cerrarMenuTarea() {
  if (!menuTarea) return;
  menuTarea.classList.add("oculto");
  tareaMenuId = null;
}

document.addEventListener("DOMContentLoaded", () => {
  menuTarea = document.getElementById("menuTarea");

  renderGrupos();
  renderTareas();

  // 🏠 Volver a vista GENERAL
  const btnHome = document.getElementById("btn_home");
  btnHome?.addEventListener("click", () => {
    grupoActivoId = null;   // general
    renderGrupos();         // para que quite el "activo" del grupo
    renderTareas();         // muestra solo tareas sin grupo
    cerrarMenuTarea();      // por si estaba abierto el menú ⋮
  });

  // Click afuera cierra
  document.addEventListener("click", (e) => {
    if (e.target.closest("#menuTarea")) return;
    if (e.target.closest(".btn-more")) return;
    cerrarMenuTarea();
  });

  // Click dentro del menú -> acciones
  menuTarea.addEventListener("click", (e) => {
    const item = e.target.closest("[data-action]");
    if (!item || tareaMenuId === null) return;

    const accion = item.dataset.action;
    const tarea = tareas.find(t => t.id === tareaMenuId);
    if (!tarea) return;

    // ✅ Mover a grupo por NOMBRE
    if (accion === "asignar-grupo") {
      if (grupos.length === 0) {
        alert("No hay grupos aún. Crea uno primero.");
        return;
      }

      const lista = grupos.map(g => `• ${g.nombre}`).join("\n");
      const res = prompt(
        "Escribe el NOMBRE del grupo exactamente como aparece:\n\n" + lista
      );
      if (!res) return;

      const nombre = res.trim().toLowerCase();
      const matches = grupos.filter(g => g.nombre.trim().toLowerCase() === nombre);

      if (matches.length === 0) {
        alert("No existe un grupo con ese nombre.");
        return;
      }

      if (matches.length > 1) {
        const opciones = matches.map(g => `${g.id} - ${g.nombre}`).join("\n");
        const pick = prompt(
          "Hay varios grupos con ese nombre. Escribe el ID del correcto:\n\n" + opciones
        );
        if (!pick) return;

        const id = Number(pick);
        const elegido = matches.find(g => g.id === id);
        if (!elegido) {
          alert("Ese ID no es válido.");
          return;
        }
        tarea.grupoId = elegido.id;
      } else {
        tarea.grupoId = matches[0].id;
      }

      renderTareas();
      cerrarMenuTarea();
      return;
    }

    // ✅ Sub-grupo (por ahora placeholder)
    if (accion === "asignar-subgrupo") {
      alert("Sub-grupos: siguiente paso 😎");
      cerrarMenuTarea();
      return;
    }

    // ✅ Eliminar tarea (ARREGLADO)
    if (accion === "eliminar-tarea") {
      if (!confirm("¿Eliminar esta tarea?")) return;

      const idx = tareas.findIndex(t => t.id === tareaMenuId);
      if (idx !== -1) tareas.splice(idx, 1); // <- NO reasignamos el const tareas

      renderTareas();
      cerrarMenuTarea();
      return;
    }
  });
});

// =====================
// MENU +
// =====================
document.addEventListener("DOMContentLoaded", () => {
  const btnMas = document.getElementById("btn_mas");
  const menuMas = document.getElementById("menu_mas");

  btnMas.addEventListener("click", () => {
    menuMas.classList.toggle("abierto");
    btnMas.classList.toggle("abierto");
  });

  menuMas.addEventListener("click", (e) => {
    const item = e.target.closest(".menu_item");
    if (!item) return;

    if (item.dataset.action === "crear_tarea") {
      abrirCrearTarea();
    }

    if (item.dataset.action === "crear_grupo") {
    const nombre = prompt("Nombre del grupo");
    if (!nombre) return;

    const grupo = {
      id: Date.now(),
      nombre: nombre.trim()
    };

    const existe = grupos.some(g => g.nombre.trim().toLowerCase() === nombre.trim().toLowerCase());
    if (existe) {
      alert("Ya existe un grupo con ese nombre.");
      return;
    }

    grupos.push(grupo);

    // ✅ NO te muevas al grupo nuevo: quédate en "General"
    grupoActivoId = null;

    renderGrupos();
    renderTareas();
  }
    menuMas.classList.remove("abierto");
    btnMas.classList.remove("abierto");
  });
});

function renderGrupos() {
  const contenedor = document.getElementById("contenedor_grupos");
  if (!contenedor) return;

  contenedor.innerHTML = "";

  grupos.forEach(g => {
    const div = document.createElement("div");
    div.className = "grupo_item" + (g.id === grupoActivoId ? " activo" : "");
    div.textContent = g.nombre;

    div.addEventListener("click", () => {
      grupoActivoId = g.id;
      renderGrupos();
      renderTareas();
    });

    contenedor.appendChild(div);
  });
}


// =====================
// MODAL CREAR / EDITAR
// =====================
let editandoId = null;

const backdrop = document.getElementById("modal_backdrop");
const form = document.getElementById("form_crear_tarea");
const inpTitulo = document.getElementById("inp_titulo");
const inpDias = document.getElementById("inp_dias");
const inpEstimado = document.getElementById("inp_estimado");
const inpDetalles = document.getElementById("inp_detalles");
const modalTitulo = document.getElementById("modal_titulo");
const btnSubmit = document.getElementById("btn_submit_tarea");

function abrirCrearTarea() {
  editandoId = null;
  form.reset();
  modalTitulo.textContent = "Crear tarea";
  btnSubmit.textContent = "Crear";
  backdrop.classList.add("abierto");
}

function abrirEditarTarea(tarea) {
  editandoId = tarea.id;

  inpTitulo.value = tarea.titulo;
  inpEstimado.value = tarea.estimado;
  inpDetalles.value = tarea.detalles;

  const dias = tarea.entrega.match(/\d+/);
  inpDias.value = dias ? dias[0] : 0;

  modalTitulo.textContent = "Editar tarea";
  btnSubmit.textContent = "Guardar";
  backdrop.classList.add("abierto");
}

function cerrarModalTarea() {
  backdrop.classList.remove("abierto");
}

// cerrar modal
document.getElementById("btn_cerrar_modal").onclick = cerrarModalTarea;
document.getElementById("btn_cancelar_modal").onclick = cerrarModalTarea;
backdrop.addEventListener("click", e => {
  if (e.target === backdrop) cerrarModalTarea();
});

// submit
form.addEventListener("submit", e => {
  e.preventDefault();

  const titulo = inpTitulo.value.trim();
  if (!titulo) return;

  const dias = Number(inpDias.value);
  const entrega = `${dias} días`;

  if (editandoId === null) {
    tareas.push({
      id: Date.now(),
      titulo,
      entrega,
      estimado: inpEstimado.value,
      detalles: inpDetalles.value,
      completada: false,
      grupoId: null
  });
  } else {
    const t = tareas.find(x => x.id === editandoId);
    if (t) {
      t.titulo = titulo;
      t.entrega = entrega;
      t.estimado = inpEstimado.value;
      t.detalles = inpDetalles.value;
    }
  }

  renderTareas();
  cerrarModalTarea();
});

// =====================
// MODAL DETALLE
// =====================
document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById("contenedor_tareas");
  const backdrop = document.getElementById("modal_detalle_backdrop");

  const titulo = document.getElementById("modal_detalle_titulo");
  const entrega = document.getElementById("detalle_entrega");
  const estimado = document.getElementById("detalle_estimado");
  const estado = document.getElementById("detalle_estado");
  const texto = document.getElementById("detalle_texto");

  function abrirDetalle(t) {
    titulo.textContent = t.titulo;
    entrega.textContent = t.entrega;
    estimado.textContent = t.estimado;
    estado.textContent = t.completada ? "Completada" : "Pendiente";
    texto.textContent = t.detalles || "—";
    backdrop.classList.add("abierto");
  }

  function cerrarDetalle() {
    backdrop.classList.remove("abierto");
  }

  document.getElementById("btn_cerrar_detalle").onclick = cerrarDetalle;
  document.getElementById("btn_cerrar_detalle2").onclick = cerrarDetalle;

  contenedor.addEventListener("click", e => {
    if (e.target.closest("button") || e.target.closest("input")) return;

    const card = e.target.closest(".task-card");
    if (!card) return;

    const tarea = tareas.find(t => t.id == card.dataset.id);
    if (tarea) abrirDetalle(tarea);
  });
});
