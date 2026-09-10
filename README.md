# NODO

Prototipo privado para explorar la comunicación con empresas, equipos y personas.

Incluye conversaciones directas y grupales, directorio, espacios de trabajo,
calendario, cronograma, tareas e interacciones de prueba con permisos propuestos.

Los cambios de la demostración viven en memoria y se reinician al recargar.
No envía mensajes, invita personas ni ejecuta firmas o pagos reales.
Las fuentes históricas del correo son visibles solo dentro del diseño privado;
las vistas de roles son simulaciones y no equivalen a controles de seguridad de una aplicación real.
El despliegue utiliza el acceso privado administrado por Sites.

Fuentes editables en `src/`; exportación con `python3 assemble-site.py`.
`dist/` contiene el sitio estático y se conserva en Git.
