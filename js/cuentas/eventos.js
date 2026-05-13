// ./js/cuentas/eventos.js

export function bindSelectorMoneda(cuentasGlobal){

  document.querySelectorAll(".selectorMoneda")
    .forEach(select => {

      select.addEventListener("change", () => {

        const cuentaId = select.dataset.id
        const moneda = select.value

        const cuenta = cuentasGlobal.find(
          c => c.id == cuentaId
        )

        const saldo = cuenta.saldos.find(
          s => s.moneda === moneda
        )

        document.getElementById(`saldo-${cuentaId}`).innerText =
          (saldo.saldo / 100).toFixed(2)
      })
    })
}
