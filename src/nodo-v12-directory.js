function n8Directory(api) {
  const { esc, icon, button, avatar, companyName } = api;
  const uniq = xs => [...new Set(xs)];
  const fold = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const filter = { context: '', company: '', area: '', query: '', limit: 8 };
  const isAreaContact = id => id === 'pagos' || id === 'seguro';
  const allSpaces = () => api.spaces || [];
  const memberSpaces = id => allSpaces().filter(s => (s.members || []).includes(id));
  const allowedIds = () => uniq([...allSpaces().flatMap(s => s.members || []), ...(api.directContactIds || [])]).filter(id => api.people[id]);
  const areaOf = p => p.area || 'Área por confirmar';
  const roleOf = (id, p) => id === 'andres' ? 'Participa en la revisión por correo' : p.role || 'Función por confirmar';
  const isContact = id => typeof api.canDM === 'function' && api.canDM(id);

  function sync() {
    const context = [api.state.viewer, api.state.peopleCompany || 'all'].join(':');
    if (context !== filter.context) Object.assign(filter, { context, company: '', area: '', query: '', limit: 8 });
    const options = uniq(allowedIds().map(id => api.people[id].org || '__personal'));
    if (filter.company && !options.includes(filter.company)) filter.company = '';
  }
  function companyIds() {
    const org = api.state.peopleCompany || filter.company;
    return allowedIds().filter(id => !org || (org === '__personal' ? api.people[id].kind === 'natural' : api.people[id].org === org));
  }
  function matches(id) {
    const p = api.people[id];
    return (!filter.area || areaOf(p) === filter.area) && (!filter.query || fold([p.name, p.role, p.area, companyName(p.org), ...memberSpaces(id).map(s => s.name)].join(' ')).includes(fold(filter.query)));
  }
  function ordered(ids) {
    const alphabetical = ids.slice().sort((a, b) => api.people[a].name.localeCompare(api.people[b].name, 'es'));
    const contacts = alphabetical.filter(id => isContact(id) && id !== api.state.viewer);
    const remaining = alphabetical.filter(id => !contacts.includes(id));
    const orgs = uniq(remaining.map(id => api.people[id].org));
    const queues = orgs.map(org => remaining.filter(id => api.people[id].org === org));
    const mixed = [];
    while (queues.some(q => q.length)) queues.forEach(q => { if (q.length) mixed.push(q.shift()); });
    return [...contacts, ...mixed];
  }
  function refresh(focusId) {
    api.renderApp();
    if (focusId) requestAnimationFrame(() => {
      const target = api.root.querySelector('#' + focusId);
      target?.focus();
      if (target?.type === 'search') target.setSelectionRange(target.value.length, target.value.length);
    });
  }
  function personCard(id) {
    const p = api.people[id], shared = memberSpaces(id);
    const first = shared.slice().sort((a, b) => Number(b.lead === id) - Number(a.lead === id)).slice(0, 2);
    return `<article class="n11-person-card">
      <button type="button" class="n11-person-identity" data-action="dir-person-${esc(id)}" aria-label="Ver perfil de ${esc(p.name)}">
        <span class="n11-person-avatar" aria-hidden="true">${avatar(id)}</span>
        <span class="n11-person-name">${esc(p.name)}${id === api.state.viewer ? '<small>Tú</small>' : ''}</span>
      </button>
      <span class="n11-person-company">${api.brand ? api.brand(p.org) : ''}<span>${esc(companyName(p.org))}</span></span>
      <p class="n11-person-role">${esc(roleOf(id, p))}</p><p class="n11-person-area">${esc(areaOf(p))}</p>
      <div class="n11-shared-spaces">${first.map(s => `<button type="button" data-action="open-space-${esc(s.id)}">${icon(s.lead === id ? 'flag' : 'hash')}<span>${esc(s.name)}${s.lead === id ? '<small>Referente del espacio</small>' : ''}</span></button>`).join('')}${shared.length > 2 ? `<button type="button" class="n11-more-spaces" data-action="dir-person-${esc(id)}">+${shared.length - 2} espacios compartidos</button>` : ''}</div>
      <footer>${button('Ver perfil', 'dir-person-' + id, 'n11-profile-button')}${isContact(id) ? button('Mensaje', 'dir-message-' + id, 'n11-message-button', 'message-circle') : ''}</footer>
    </article>`;
  }
  function areaContact(id) {
    const p = api.people[id];
    return `<article class="n11-area-contact"><span class="n11-contact-icon">${icon(id === 'pagos' ? 'mail' : 'building-2')}</span><div><strong>${esc(p.name)}</strong><span>${esc(companyName(p.org))} · ${id === 'pagos' ? 'Buzón de Tesorería' : 'Contacto ilustrativo'}</span></div>${button('Ver contacto', 'dir-person-' + id, 'n8-quiet', 'arrow-up-right')}</article>`;
  }
  function render() {
    sync();
    const companyOptions = uniq(allowedIds().map(id => api.people[id].org).filter(Boolean)).sort((a, b) => companyName(a).localeCompare(companyName(b), 'es')); if(allowedIds().some(id=>api.people[id].kind==='natural'))companyOptions.push('__personal');
    const base = companyIds();
    const areas = uniq(base.map(id => areaOf(api.people[id]))).sort((a, b) => a.localeCompare(b, 'es'));
    if (filter.area && !areas.includes(filter.area)) filter.area = '';
    const ids = ordered(base.filter(id => !isAreaContact(id) && matches(id)));
    const contacts = base.filter(id => isAreaContact(id) && matches(id));
    const visible = ids.slice(0, filter.limit);
    return `<section class="n11-people" aria-label="Directorio de personas">
      <form class="n11-person-search" data-n11-search><label for="n11-people-query">Buscar una persona</label><div class="n11-search-row"><span class="n11-search-input">${icon('search')}<input type="search" id="n11-people-query" name="person" placeholder="Nombre, función, área o espacio" value="${esc(filter.query)}"></span>${button('Buscar', 'dir-search', 'n8-primary')}</div></form>
      <div class="n11-filters">${!api.state.peopleCompany && companyOptions.length > 1 ? `<label for="n11-people-company">Empresa o vínculo<select id="n11-people-company" data-n11-filter="company"><option value="">Todas las personas</option>${companyOptions.map(org => `<option value="${esc(org)}"${filter.company === org ? ' selected' : ''}>${org==='__personal'?'A título personal':esc(companyName(org))}</option>`).join('')}</select></label>` : ''}${areas.length > 1 ? `<label for="n11-people-area">Área<select id="n11-people-area" data-n11-filter="area"><option value="">Todas las áreas</option>${areas.map(area => `<option value="${esc(area)}"${filter.area === area ? ' selected' : ''}>${esc(area)}</option>`).join('')}</select></label>` : ''}${filter.query || filter.area || filter.company ? button('Limpiar', 'dir-reset', 'n8-quiet', 'x') : ''}</div>
      <div class="n11-result-line" aria-live="polite"><span>${ids.length} ${ids.length === 1 ? 'persona' : 'personas'}${filter.query ? ` para “${esc(filter.query)}”` : ''}</span>${ids.length > visible.length ? `<span>Mostrando ${visible.length}</span>` : ''}</div>
      ${visible.length ? `<div class="n11-people-grid">${visible.map(personCard).join('')}</div>` : `<div class="n11-people-empty">${icon('search')}<p>No encontramos personas con estos filtros.</p>${button('Ver todas las personas', 'dir-reset', 'n8-quiet')}</div>`}
      ${ids.length > visible.length ? `<div class="n11-more-people">${button(`Ver ${Math.min(8, ids.length - visible.length)} personas más`, 'dir-more', '', 'chevron-down')}</div>` : ''}
      ${contacts.length ? `<section class="n11-area-contacts"><h2>Contactos de área</h2>${contacts.map(areaContact).join('')}</section>` : ''}
    </section>`;
  }
  function openPerson(id) {
    if (!allowedIds().includes(id)) return;
    const p = api.people[id], shared = memberSpaces(id), contact = isAreaContact(id);
    const provenance = p.kind === 'natural' ? 'Persona ficticia para explorar la atención directa de una empresa a una persona natural. No representa a ninguna empresa.' : id === 'seguro' ? 'Contacto ficticio para explorar una participación puntual de una aseguradora.' : id === 'pagos' ? 'Buzón de un área observado en correo. No corresponde a una identidad personal.' : id === 'andres' ? p.role + '. La coincidencia con un alias de WhatsApp está pendiente de vinculación.' : p.verifiedRole ? 'Cargo observado en la firma de un correo. Esto no valida por sí solo su identidad, vínculo actual ni facultades.' : 'Función observada en las conversaciones revisadas; no corresponde a un cargo institucional verificado.';
    api.openModal(contact ? 'Contacto de área' : 'Perfil', `<section class="n8-dir-profile n11-person-profile">
      <header class="n8-dir-profile-header"><span class="n8-dir-profile-avatar" aria-hidden="true">${contact ? icon(id === 'pagos' ? 'mail' : 'building-2') : avatar(id)}</span><div><span class="n8-dir-modal-kicker">${esc(companyName(p.org))}</span><h2>${esc(p.name)}</h2><p>${esc(roleOf(id, p))}</p></div></header>
      <p class="n11-profile-area">${icon('building-2')}${esc(areaOf(p))}</p>
      ${isContact(id) ? `<div class="n11-profile-actions">${button('Mensaje directo', 'dir-message-' + id, 'n8-primary', 'message-circle')}</div>` : ''}
      <div class="n8-dir-profile-spaces"><h3>Espacios compartidos</h3>${shared.map(s => `<div class="n8-dir-space-row"><div><strong>${esc(s.name)}</strong><span>${esc(s.companies.map(companyName).join(' · '))}${s.lead === id ? ' · Referente del espacio' : ''}</span></div>${button('Abrir', 'open-space-' + s.id, 'n8-dir-open-space', 'arrow-up-right')}</div>`).join('') || '<p class="n8-note">Contacto directo, sin espacios compartidos. El DM no le da acceso a los grupos de tu empresa.</p>'}</div>
      <details class="n11-person-source"><summary>Sobre estos datos</summary><p>${esc(provenance)}</p><p>Se muestran los espacios disponibles para tu perfil. Cada conversación conserva sus propios participantes y permisos.</p></details>
    </section>`);
  }
  function search() {
    filter.query = api.root.querySelector('#n11-people-query')?.value.trim() || '';
    filter.limit = 8;
    refresh('n11-people-query');
  }
  api.root.addEventListener('change', event => {
    const target = event.target;
    if (!target.matches('[data-n11-filter]')) return;
    filter[target.dataset.n11Filter] = target.value;
    if (target.dataset.n11Filter === 'company') filter.area = '';
    filter.limit = 8;
    refresh(target.id);
  });
  api.root.addEventListener('submit', event => {
    if (!event.target.matches('[data-n11-search]')) return;
    event.preventDefault(); search();
  });
  function handle(action) {
    if (action.startsWith('dir-person-')) { openPerson(action.slice(11)); return true; }
    if (action.startsWith('dir-message-')) { const id = action.slice(12); if (allowedIds().includes(id) && isContact(id)) { api.closeModal(); api.showDM(id); } return true; }
    if (action === 'dir-search') { search(); return true; }
    if (action === 'dir-reset') { Object.assign(filter, { company: '', area: '', query: '', limit: 8 }); refresh('n11-people-query'); return true; }
    if (action === 'dir-more') { filter.limit += 8; refresh(); return true; }
    if (action.startsWith('open-space-')) {
      const id = action.slice(11);
      if (!allSpaces().some(s => s.id === id)) return true;
      api.closeModal(); api.openSpace(id); return true;
    }
    return false;
  }
  return { render, handle };
}
