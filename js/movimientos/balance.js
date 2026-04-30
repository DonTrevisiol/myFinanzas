/* ./myFinanzas/js/movimientos/balance.js */


/* =========================
   BALANCE / AHORROS
========================= */
import { buildQuery } from "./queryBuilder.js";
import { state } from "./state.js";
export async function calcularBalance(){

  let query = supabaseClient
    .from("movimientos")
    .select(`
      tipo,
      monto,
      moneda,
      descripcion,
      cuentas!inner(categoria)
    `);

  query = buildQuery(query);

  const { data, error } = await query;

  if(error){
    console.error(error);
    return;
  }

  if(!data || data.length === 0){
    document.getElementById("balanceMensual").innerHTML =
      `<div class="empty">Sin datos</div>`;
    return;
  }

  // =========================
  // 🔥 NORMALIZAR DATOS
  // =========================
  let totales = {};

  data.forEach(m => {

    if(!totales[m.moneda]){
      totales[m.moneda] = {
        ingresos: 0,
        gastos: 0,
        transferencias: 0,
        ahorros: 0
      };
    }

    // INGRESOS
    if(m.tipo === "ingreso"){
      totales[m.moneda].ingresos += m.monto;

      // si es cuenta ahorro → suma a AHORROS
      if(m.cuentas?.categoria === "ahorro"){
        totales[m.moneda].ahorros += m.monto;
      }
    }

    // GASTOS
    if(m.tipo === "gasto"){
      totales[m.moneda].gastos += m.monto;
    }

    // TRANSFERENCIAS
    if(m.tipo === "transferencia"){
      totales[m.moneda].transferencias += m.monto;

      // 👇 SI DESTINO ES AHORRO → suma a AHORROS
      const cuentaDestino = cuentasGlobal.find(c => c.id == m.descripcion);
      if(cuentaDestino?.categoria === "ahorro"){
        totales[m.moneda].ahorros += m.monto;
      }
    }

  });

  // =========================
  // 🎯 RENDER SEGÚN FILTRO
  // =========================
  
  let titulo = "BALANCE: ";
  
  if(state.filtroTipo === "ingreso")
  titulo = "INGRESOS: "
  if(state.filtroTipo === "gasto")
  titulo = "GASTOS: "
  if(state.filtroTipo === "transferencia")
  titulo = "TRANSFERENCIAS: "
  if(state.filtroTipo === "ahorro")
  titulo = "AHORROS: "
  let html = `
	<div style="font-weight:bold; margin-bottom:5px;">
	${titulo}
	</div>
  `;
  Object.keys(totales).forEach(moneda => {

    const t = totales[moneda];

    let valor = 0;
    let label = "";
    let color = "#000";

    switch(state.filtroTipo){

      case "ingreso":
        valor = t.ingresos;
        label = "INGRESOS";
        color = "#00c853";
        break;

      case "gasto":
        valor = t.gastos;
        label = "GASTOS";
        color = "#ff5252";
        break;

      case "transferencia":
        valor = t.transferencias;
        label = "TRANSFERENCIAS";
        color = "#0025f7"; // 🔵 azul
        break;

      case "ahorro":
        valor = t.ahorros;
        label = "AHORROS";
        color = "#00c853";
        break;

      default:
        const balance = t.ingresos - t.gastos;
        valor = balance;
        label = "BALANCE";

        if(balance > 0) color = "#00c853";
        else if(balance < 0) color = "#ff5252";
        break;
    }

    if(valor === 0) return;

    html += `
      <div style="color:${color}; font-weight:bold;">
        ${(valor / 100).toFixed(2)} ${moneda}
      </div>
    `;
  });

  document.getElementById("balanceMensual").innerHTML = html || "0";
}
