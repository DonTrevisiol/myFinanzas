/* ./myFinanzas/js/cuentas/crud.js: */
// =========================
// 		CREATE
// =========================
export async function crearCuenta({ nombre, tipo, categoria, saldos }) {

  const { data: cuenta, error } = await supabaseClient
    .from("cuentas")
    .insert({ nombre, tipo, categoria })
    .select()
    .single();

  if(error){
    console.error(error);
    alert("Error creando cuenta");
    return;
  }

  // insertar saldos
  const saldosInsert = saldos.map(s => ({
    cuenta_id: cuenta.id,
    moneda: s.moneda,
    saldo: Math.round(s.saldo * 100)
  }));

  const { error: errSaldo } = await supabaseClient
    .from("saldos")
    .insert(saldosInsert);

  if(errSaldo){
    console.error(errSaldo);
    alert("Error creando saldos");
  }
}

// =========================
// 		UPDATE
// =========================
export async function actualizarCuenta(id, { nombre, tipo, categoria }) {

  const { error } = await supabaseClient
    .from("cuentas")
    .update({ nombre, tipo, categoria })
    .eq("id", id);

  if(error){
    console.error(error);
    alert("Error actualizando cuenta");
  }
}

export async function actualizarSaldo({ cuenta_id, moneda, saldo }) {

  const monto = Math.round(saldo * 100);

  const { data } = await supabaseClient
    .from("saldos")
    .select("*")
    .eq("cuenta_id", cuenta_id)
    .eq("moneda", moneda)
    .maybeSingle();

  if(data){
    // update
    await supabaseClient
      .from("saldos")
      .update({ saldo: monto })
      .eq("id", data.id);
  }else{
    // insert
    await supabaseClient
      .from("saldos")
      .insert({ cuenta_id, moneda, saldo: monto });
  }
}

// =========================
// 		DELETE
// =========================

export async function eliminarMoneda(cuenta_id, moneda){

  const { error } = await supabaseClient
    .from("saldos")
    .delete()
    .eq("cuenta_id", cuenta_id)
    .eq("moneda", moneda);

  if(error){
    console.error(error);
    alert("Error eliminando moneda");
  }
}

export async function eliminarCuenta(id){

  // borrar saldos primero
  await supabaseClient
    .from("saldos")
    .delete()
    .eq("cuenta_id", id);

  // borrar cuenta
  const { error } = await supabaseClient
    .from("cuentas")
    .delete()
    .eq("id", id);

  if(error){
    console.error(error);
    alert("Error eliminando cuenta");
  }
}
