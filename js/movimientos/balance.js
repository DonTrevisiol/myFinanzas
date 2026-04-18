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

  let totales = {};

  data.forEach(m => {
    if(!totales[m.moneda]){
      totales[m.moneda] = { ingresos: 0, gastos: 0 };
    }

    if(m.tipo === "ingreso"){
      totales[m.moneda].ingresos += m.monto;
    }else{
      totales[m.moneda].gastos += m.monto;
    }
  });

  let html = "";

  Object.keys(totales).forEach(moneda => {

    const ingresos = totales[moneda].ingresos;
    const gastos = totales[moneda].gastos;
    const balance = ingresos - gastos;

    let color = "#000";
    if(balance > 0) color = "#00c853";
    if(balance < 0) color = "#ff5252";

    if(state.filtroTipo === "ahorro"){
      if(ingresos === 0) return;

      html += `
        <div style="color:${color}; font-weight:bold">
          Ahorros: ${(ingresos/100).toFixed(2)} ${moneda}
        </div>
      `;
    }else{
      html += `
        <div style="color:${color}; font-weight:bold">
          Balance: ${(balance/100).toFixed(2)} ${moneda}
        </div>
      `;
    }
  });

  document.getElementById("balanceMensual").innerHTML = html;
}
