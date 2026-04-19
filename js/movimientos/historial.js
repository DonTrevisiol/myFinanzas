/* ./myFinanzas/js/movimientos/historial.js */

import { buildQuery } from "./queryBuilder.js";
import { formatearFecha } from "./utils.js";
import { state } from "./state.js";
import { abrirModal, cargarMonedasPorCuenta } from "./modal.js";
import { calcularBalance } from "./balance.js";

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
  const asc = state.ordenAscendente;

  if(state.filtroTiempo === "recientes"){
    query = query
      .order("created_at", { ascending: asc })
      .order("id", { ascending: asc });
  }else{
    query = query
      .order("fecha", { ascending: asc })
      .order("id", { ascending: asc });
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
			<div>
				<button class="btnEdit" data-id="${m.id}">✏️</button>
				<button class="btnDelete" data-id="${m.id}">🗑️</button>
			</div>
			
		</div>
		`;
    });
  }

  document.getElementById("historial").innerHTML = html;
  // eventos EDIT
  document.querySelectorAll(".btnEdit").forEach(btn => {
    btn.addEventListener("click", () => editarMovimiento(btn.dataset.id));
  });

  // eventos DELETE
  document.querySelectorAll(".btnDelete").forEach(btn => {
    btn.addEventListener("click", () => eliminarMovimiento(btn.dataset.id));
  });

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

/* =========================
   EDICIÓN
========================= */
async function editarMovimiento(id){

  const { data: mov } = await supabaseClient
    .from("movimientos")
    .select("*")
    .eq("id", id)
    .single();

  state.editandoId = id;
  state.tipoActual = mov.tipo;

  abrirModal(mov.tipo);

  document.getElementById("cuenta").value = mov.cuenta_id;
  document.getElementById("monto").value = mov.monto / 100;
  document.getElementById("descripcion").value = mov.descripcion || "";
  document.getElementById("fecha").value = mov.fecha;

  cargarMonedasPorCuenta();
  document.getElementById("moneda").value = mov.moneda;
}

/* =========================
   ELIMINACIÓN
========================= */
async function eliminarMovimiento(id){
	
  const ok = confirm("¿ELIMINAR MOVIMIENTO?");
  if(!ok) return;

  const { data: mov } = await supabaseClient
    .from("movimientos")
    .select("*")
    .eq("id", id)
    .single();

  if(!mov){
    alert("Error");
    return;
  }

  // revertir saldo
  const rpc = mov.tipo === "ingreso" ? "restar_saldo" : "sumar_saldo";

  await supabaseClient.rpc(rpc, {
    id_cuenta: mov.cuenta_id,
    monto: mov.monto,
    moneda_param: mov.moneda
  });

  // borrar
  await supabaseClient
    .from("movimientos")
    .delete()
    .eq("id", id);

  cargarHistorial();
  calcularBalance();
  cargarCuentas();
}

