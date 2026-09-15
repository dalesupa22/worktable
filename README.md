# NODO

Prototipo interactivo para explorar la comunicación con empresas, equipos y personas.

Incluye conversaciones directas y grupales, directorio, espacios de trabajo,
calendario, cronograma, tareas e interacciones de prueba con permisos propuestos.

Los mensajes directos se abren como chats dentro de la pantalla de conversaciones,
con el listado al lado y borradores independientes para cada conversación.

Los cambios de la demostración viven en memoria y se reinician al recargar.
No envía mensajes, invita personas ni ejecuta firmas o pagos reales.
Las vistas de roles y permisos son simulaciones; no hay un backend de autenticación
o mensajería. El prototipo publicado en Sites tiene acceso público.

## Ejecutar localmente

Requiere Python 3. No necesita instalar paquetes de npm.

```sh
python3 assemble-site.py
python3 -m http.server 8000 --directory dist
```

Abre <http://localhost:8000>. Después de editar `src/`, vuelve a ejecutar
`python3 assemble-site.py` y recarga la página.

## Estructura

Fuentes editables en `src/`; exportación con `python3 assemble-site.py`.
`dist/` contiene el sitio estático y se conserva en Git.
Los iconos Lucide están incluidos en `dist/vendor/`.
`.openai/hosting.json` conserva la configuración del despliegue existente en Sites.

Demo pública: <https://nodo-entreempresas-danny.xertify-inc-8513.chatgpt.site/>.
