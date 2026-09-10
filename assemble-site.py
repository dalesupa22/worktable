from pathlib import Path
import json
p=Path(__file__).parent
s=p/'src';d=p/'dist'
js=(s/'nodo-v12-core.js').read_text()
for marker,name in [('DATA','data'),('DIRECTORY','directory'),('INBOX','inbox'),('CALENDAR','calendar'),('SCHEDULE','schedule')]:
 content=(s/f'nodo-v12-{name}.js').read_text()
 if marker=='DATA': content='const xertifyLogo='+json.dumps((s/'xertify-logo.txt').read_text())+';\n'+content
 js=js.replace('/*__'+marker+'__*/',content)
css='\n'.join((s/f'nodo-v12-{name}.css').read_text() for name in ['style','directory','theme','calendar','navigation','schedule','people','chrome','conversations'])+'\n'+(s/'standalone.css').read_text()
(d/'app.js').write_text(js)
(d/'app.css').write_text(css)
head='''<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="referrer" content="no-referrer">
<meta name="robots" content="noindex,nofollow">
<meta name="description" content="Prototipo privado de NODO. Conversaciones, personas y trabajo con tus equipos y empresas.">
<meta name="theme-color" content="#111113">
<title>NODO · Tu red de trabajo</title>
<link rel="stylesheet" href="/app.css">
<script src="/vendor/lucide.js" defer></script>
<script src="/app.js" defer></script>
</head>
<body>
'''
(d/'index.html').write_text(head+(s/'nodo-v12-shell.html').read_text()+'\n<noscript>Activa JavaScript para probar las conversaciones y la navegación de NODO.</noscript>\n</body>\n</html>\n')
print('Standalone ready')
