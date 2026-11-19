# Comisiones y pagos de comisión

Una **comisión** es el monto que gana un vendedor cuando se aprueba un contrato. La tasa depende del proyecto y del tipo de financiamiento del contrato.

## Tasas de comisión

Cada proyecto guarda tres tasas:

- **Directo** — financiamiento directo.
- **Banco** — financiamiento bancario.
- **Contado** — financiamiento de contado.

La comisión se calcula cuando se aprueba el contrato y se guarda en el contrato. Los cambios de tasa posteriores solo aplican a contratos nuevos.

Los administradores abren **Configurar tasas** desde la página de Comisiones. La hoja de reglas define la tasa global por defecto, la tasa sin vendedor y las excepciones por vendedor. Una excepción por vendedor reemplaza la tasa del proyecto/global para ese vendedor. Los registros históricos usan la excepción del vendedor si existe; de lo contrario, la tasa global por defecto.

## Página de comisiones del administrador

Abre **Comisiones** desde el menú del administrador. La página tiene:

- Filtros de **rango de fechas** y de **vendedor**.
- Tarjetas de resumen: comisión del periodo, monto por pagar y monto pagado, con leyendas para la tasa promedio y el conteo de pagos.
- Una tabla de detalle con contrato, vendedor, cliente, monto de venta, comisión y tasa, estado, fecha y una acción.
- **Exportar** para descargar el periodo en CSV.

Para una comisión pendiente, **Pagar** pide confirmación y marca la comisión como pagada. Escribe una entrada de auditoría y **no** cambia el saldo del contrato. Las comisiones pagadas muestran **Ver**, que abre un diálogo de detalle en solo lectura.

## Históricos por validar

La página de Comisiones tiene una pestaña **Por validar** con el número de registros históricos pendientes de revisión. Muestra los totales de pendientes, validados y rechazados; filtra por vendedor, estado y texto; y una tabla con cliente, vendedor, fecha de venta, precio, tasa, comisión, respaldo y estado.

Desde cada fila pendiente, el administrador puede:

- **Validar** el registro. Sale de la lista de pendientes y sigue siendo una venta histórica; no crea reserva ni bloquea lote.
- **Rechazar** el registro tras confirmar.
- **Editar** el cliente, la venta, la tasa o el monto de comisión antes de validar.

Los vendedores pueden editar sus propios registros pendientes desde **Mis clientes**; los validados son de solo lectura para ellos.

## Comisiones del vendedor

Los vendedores ven **Comisiones** en su espacio de trabajo, en solo lectura:

- Comisión de este mes.
- Comisión pendiente por pagar.
- Comisión pagada en el periodo.
- Una tabla con contrato, cliente, monto de venta, comisión y tasa, estado y fecha.

Los vendedores no pueden marcar una comisión como pagada ni cambiar tasas.

## Crédito de comisión por cancelación

Si cancelas un contrato cuya comisión ya se pagó, se genera un **crédito de comisión** a favor de Fintera para ese vendedor. Aparece en Comisiones como un crédito pendiente. El administrador puede **aplicarlo** (marcarlo como saldado) cuando corresponda. Si la comisión no se pagó, no se crea ningún crédito: la comisión simplemente deja de aparecer.

## Relacionado

- [Tipos de financiamiento: directo, banco y efectivo](/docs/financing-types)
- [Proyectos, precios y unidades de medida](/docs/projects-and-pricing)
- [Auditoría](/docs/audits)
