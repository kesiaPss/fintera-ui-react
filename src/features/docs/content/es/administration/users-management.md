# Usuarios y roles

> **Solo administradores.** La entrada **Usuarios** no forma parte del espacio del vendedor.

## Lista de usuarios

La página de Usuarios lista a las personas que pueden iniciar sesión. Muestra:

- Una línea de resumen con el total de usuarios, administradores, vendedores y clientes.
- **Búsqueda** por nombre, correo o identidad.
- Chips de rol con conteos para **Todos**, **Administradores**, **Vendedores**, **Clientes** e **Históricos**.
- Un botón **Mostrar todos / Mostrar solo activos**.
- Una tabla con usuario, rol, cantidad de clientes, estado y acciones.
- Paginación.

Al seleccionar una fila se abre el panel del usuario con datos de contacto, rol, estado, cantidad de clientes, saldo y enlace al estado de cuenta para clientes, puntaje de crédito (cuando un administrador ve a un cliente), fechas de actividad y notas. El panel también ofrece **Editar**, **Desactivar/Activar**, **Invitar** (reenviar confirmación) y **Eliminar**.

## Clientes históricos

Los clientes históricos creados desde una venta migrada son cuentas de cliente reales (`role = Usuario`) marcadas con un chip **HISTÓRICO**. Usa el filtro **Históricos** para listar solo esas cuentas.

- Se pueden buscar y seleccionar como cliente existente en el asistente de reserva.
- Cuando el registro histórico no tenía correo, la cuenta usa un correo no entregable. La lista muestra **Sin correo** y la acción **Invitar** se oculta hasta que un administrador agregue un correo real desde el formulario de edición.
- Validar no crea ni modifica la cuenta; la cuenta se vincula al guardar o importar el registro histórico, o al ejecutarse el backfill de inicio.

Ver [Validar clientes históricos](/docs/historical-clients-validation) para la cola de validación.

## Crear un usuario

Abre **Usuarios** y selecciona **Agregar usuario**. El formulario tiene:

- **Información personal** — nombre completo, identidad, correo, teléfono, RTN, dirección y foto opcional.
- **Configuración de la cuenta** — rol (**Usuario**, **Vendedor** o **Administrador**) y creador.
- **Seguridad** — contraseña y confirmación opcionales.

Si la contraseña se deja vacía, el backend genera una contraseña temporal y la envía por correo. Cuando se escribe una contraseña, debe tener al menos **8 caracteres** y cumplir la lista de fortaleza (mayúscula, minúscula, número, carácter especial). La identidad debe tener 13 dígitos y el RTN 14 dígitos.

## Editar un usuario

El formulario de edición reutiliza las mismas secciones. Dejar la contraseña vacía mantiene la contraseña actual; escribir una nueva la restablece. Los administradores pueden cambiar el rol; los vendedores solo pueden editar su propio perfil y no pueden cambiar roles.

La acción **Ver perfil** abre el mismo panel del usuario en modo de solo lectura.

## Roles

- **Administrador** — acceso total, incluyendo aprobaciones, administración de proyectos, configuración y usuarios.
- **Vendedor** — espacio de ventas: Mi día, Mis clientes, Cobros, Comisiones, Documentos. No puede aprobar movimientos de dinero ni cambiar la configuración.
- **Usuario (cliente)** — cuenta de cliente; usa el portal de clientes.

## Estado

| Estado | Significado |
| --- | --- |
| Activo | Puede iniciar sesión. |
| Inactivo | No puede iniciar sesión. |

Usa **Desactivar** en lugar de eliminar cuando puedas necesitar el historial más adelante. No se puede eliminar un usuario con contratos activos; la página explica el motivo.

## Relacionado

- [Descripción general y roles](/docs/overview-and-roles)
- [Perfil y seguridad](/docs/profile-and-security)
- [Clientes y puntaje de crédito](/docs/customers-and-credit-score)
