/* ./myFinanzas/js/movimientos/historial.js */

import { buildQuery } from "./queryBuilder.js";
import { formatearFecha } from "./utils.js";
import { state } from "./state.js";

/* =========================
   HISTORIAL
========================= */
export async function cargarHistorial(){

  const desde = state.paginaActual * state.LIMITE;
  const hasta = desde + state.LIMITE;

  let hayMas = false;

  let query = supabaseClient
    .from("movimientos")
    .select(`
      id,
      tipo,
      monto,
      fecha,
      descripcion,
      moneda,
      cuentas!inner(nombre, categoria, tipo)
    `);

  // ===== FILTROS =====
  query = buildQuery(query);

  // ===== ORDEN =====
  if(state.filtroTiempo === "recientes"){
    query = query
      .order("created_at", { ascending: false })
      .order("id", { ascending: false });
  }else{
    query = query
      .order("fecha", { ascending: false })
      .order("id", { ascending: false });
  }

  // ===== PAGINACIÓN (pedimos 1 extra) =====
  const { data, error } = await query.range(desde, hasta);

  if(error){
    alert(error.message);
    return;
  }

  if(data.length === 0 && state.paginaActual > 0){
    state.paginaActual--;
    return cargarHistorial();
  }

  if(data.length > state.LIMITE){
    hayMas = true;
    data.pop();
  }else{
    hayMas = false;
  }

  state.ultimaPagina = !hayMas;

  // ===== RENDER =====
  let html = `
    <div class="header">
      <div class="col">Fecha</div>
      <div class="col">Tipo</div>
      <div class="col">Monto</div>
      <div class="col">Cuenta</div>
      <div class="col">Detalle</div>
    </div>
  `;

  if(data.length === 0){
    html += `<div class="empty">No hay movimientos</div>`;
  }else{
    data.forEach(m => {

      const fecha = formatearFecha(m.fecha);
      const cuenta = m.cuentas?.nombre || "-";
      const monto = (m.monto / 100).toFixed(2);

      const esIngreso = m.tipo === "ingreso";
      const montoFinal = `${esIngreso ? "+" : "-"}${monto} ${m.moneda}`;

      html += `
        <div class="movimiento ${m.tipo}">
          <span class="col">${fecha}</span>
          <span class="col">${m.tipo.toUpperCase()}</span>
          <span class="col">${montoFinal}</span>
          <span class="col">${cuenta}</span>
          <span class="col">${m.descripcion || ""}</span>
        </div>
      `;
    });
  }

  document.getElementById("historial").innerHTML = html;

  renderPaginacion();
}

/* =========================
   PAGINACIÓN
========================= */
export function renderPaginacion(){

  let html = "";

  if(state.paginaActual > 0){
    html += `<button id="prevPage">⬅️</button>`;
  }

  html += `<span> Página ${state.paginaActual + 1} </span>`;

  if(!state.ultimaPagina){
    html += `<button id="nextPage">➡️</button>`;
  }

  document.getElementById("paginacion").innerHTML = html;

  // ✅ eventos reales (no inline)
  document.getElementById("prevPage")
    ?.addEventListener("click", () => cambiarPagina(-1));

  document.getElementById("nextPage")
    ?.addEventListener("click", () => cambiarPagina(1));
}

export function cambiarPagina(direccion){
  state.paginaActual += direccion

  if(state.paginaActual < 0) state.paginaActual = 0

  cargarHistorial()
}
