/**
 * QUANTIS — Cartes de Visite Exécutives
 * Contrôleur interactif : Gestion des membres, physique 3D et exports HD
 */

// Données des membres exécutifs de Quantis
const MEMBERS_DATA = {
  kim: {
    id: 'kim',
    name: 'KIM JOSAPHAT YARGA',
    roleFr: 'CHEF EXECUTIF OFFICIER',
    roleEn: 'CHIEF EXECUTIVE OFFICER',
    phoneFormatted: '+226 65 18 92 61',
    phoneShort: '65189261',
    whatsappFormatted: '+226 53 96 75 34',
    whatsappShort: '53967534',
    email: 'quantis474@gmail.com',
    website: 'quantisbf.com'
  },
  michee: {
    id: 'michee',
    name: 'BARKWENDÉ MICHÉE OUEDRAOGO',
    roleFr: 'RESPONSABLE CLOUD & INFRASTRUCTURE',
    roleEn: 'HEAD OF CLOUD & INFRASTRUCTURE',
    phoneFormatted: '+226 65 48 33 73',
    phoneShort: '65483373',
    whatsappFormatted: '+226 65 48 33 73',
    whatsappShort: '65483373',
    email: 'quantis474@gmail.com',
    website: 'quantisbf.com'
  },
  abidine: {
    id: 'abidine',
    name: 'ABIDINE SAWADOGO',
    roleFr: 'CHEF DES OPÉRATIONS (COO)',
    roleEn: 'CHIEF OPERATING OFFICER',
    phoneFormatted: '+226 64 67 34 83',
    phoneShort: '64673483',
    whatsappFormatted: '+226 64 67 34 83',
    whatsappShort: '64673483',
    email: 'quantis474@gmail.com',
    website: 'quantisbf.com'
  }
};

// État courant de l'application
const state = {
  currentMember: 'kim',
  useCountryCode: true,
  includeWebsite: true,
  currentLanguage: 'fr', // 'fr' ou 'en'
  activeView: 'both' // 'both', 'light', 'dark'
};

document.addEventListener('DOMContentLoaded', () => {
  initMemberTabs();
  initToggleControls();
  initCard3DInteractivity();
  initExportButtons();
  initModalControls();
  updateCardsDisplay();
});

/**
 * Initialisation des onglets de sélection de membre
 */
function initMemberTabs() {
  const tabs = document.querySelectorAll('.member-tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.currentMember = tab.dataset.member;
      updateCardsDisplay();
    });
  });
}

/**
 * Contrôles de bascule (Format téléphone, Site web, Vue)
 */
function initToggleControls() {
  // Bascule préfixe international +226
  const togglePrefixBtn = document.getElementById('togglePrefixBtn');
  if (togglePrefixBtn) {
    togglePrefixBtn.addEventListener('click', () => {
      state.useCountryCode = !state.useCountryCode;
      togglePrefixBtn.classList.toggle('active', state.useCountryCode);
      togglePrefixBtn.textContent = state.useCountryCode ? 'Indicatif: +226 Actif' : 'Indicatif: Sans +226';
      updateCardsDisplay();
    });
  }

  // Bascule site web
  const toggleWebBtn = document.getElementById('toggleWebBtn');
  if (toggleWebBtn) {
    toggleWebBtn.addEventListener('click', () => {
      state.includeWebsite = !state.includeWebsite;
      toggleWebBtn.classList.toggle('active', state.includeWebsite);
      toggleWebBtn.textContent = state.includeWebsite ? 'Site Web: Affiché' : 'Site Web: Masqué';
      updateCardsDisplay();
    });
  }

  // Filtre d'affichage (Clair / Sombre / Les Deux)
  const viewBtns = document.querySelectorAll('[data-view-filter]');
  viewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      viewBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeView = btn.dataset.viewFilter;
      
      const lightCardUnit = document.getElementById('cardUnitLight');
      const darkCardUnit = document.getElementById('cardUnitDark');
      
      if (state.activeView === 'light') {
        lightCardUnit.style.display = 'flex';
        darkCardUnit.style.display = 'none';
      } else if (state.activeView === 'dark') {
        lightCardUnit.style.display = 'none';
        darkCardUnit.style.display = 'flex';
      } else {
        lightCardUnit.style.display = 'flex';
        darkCardUnit.style.display = 'flex';
      }
    });
  });
}

/**
 * Mise à jour dynamique du contenu textuel des deux cartes
 */
function updateCardsDisplay() {
  const member = MEMBERS_DATA[state.currentMember];
  if (!member) return;

  const phoneText = state.useCountryCode ? member.phoneFormatted : member.phoneShort;
  const whatsappText = state.useCountryCode ? member.whatsappFormatted : member.whatsappShort;
  const roleText = state.currentLanguage === 'fr' ? member.roleFr : member.roleEn;

  // Mise à jour de la carte Claire
  updateCardFields('light', {
    name: member.name,
    role: roleText,
    phone: phoneText,
    whatsapp: whatsappText,
    email: member.email,
    website: member.website,
    showWeb: state.includeWebsite
  });

  // Mise à jour de la carte Sombre
  updateCardFields('dark', {
    name: member.name,
    role: roleText,
    phone: phoneText,
    whatsapp: whatsappText,
    email: member.email,
    website: member.website,
    showWeb: state.includeWebsite
  });
}

function updateCardFields(theme, data) {
  const card = document.querySelector(`.business-card.model-${theme}`);
  if (!card) return;

  const nameEl = card.querySelector('.member-name');
  const roleEl = card.querySelector('.member-role');
  const phoneEl = card.querySelector('.contact-row-phone .contact-text');
  const whatsappEl = card.querySelector('.contact-row-whatsapp .contact-text');
  const emailEl = card.querySelector('.contact-row-email .contact-text');
  const webRow = card.querySelector('.contact-row-web');
  const webEl = card.querySelector('.contact-row-web .contact-text');

  if (nameEl) nameEl.textContent = data.name;
  if (roleEl) roleEl.textContent = data.role;
  if (phoneEl) phoneEl.textContent = data.phone;
  if (whatsappEl) whatsappEl.textContent = data.whatsapp;
  if (emailEl) emailEl.textContent = data.email;
  if (webEl) webEl.textContent = data.website;

  if (webRow) {
    webRow.style.display = data.showWeb ? 'flex' : 'none';
  }
}

/**
 * Effet d'inclinaison 3D réaliste (Mouse Parallax & Dynamic Light Sheen)
 */
function initCard3DInteractivity() {
  const wrappers = document.querySelectorAll('.card-3d-wrapper');

  wrappers.forEach(wrapper => {
    const card = wrapper.querySelector('.business-card');
    const shadow = wrapper.querySelector('.card-shadow-plate');
    const sheen = wrapper.querySelector('.card-specular-sheen');

    wrapper.addEventListener('mousemove', (e) => {
      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Amplitude maximale d'inclinaison (degrés)
      const rotateX = ((y - centerY) / centerY) * -12;
      const rotateY = ((x - centerX) / centerX) * 14;

      wrapper.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

      // Déplacement de l'ombre au sol
      if (shadow) {
        shadow.style.transform = `translateX(${-rotateY * 1.5}px) translateY(${rotateX * 0.8}px) scale(${1 - Math.abs(rotateX) * 0.005})`;
      }

      // Déplacement du reflet lumineux
      if (sheen) {
        const sheenX = (x / rect.width) * 100;
        const sheenY = (y / rect.height) * 100;
        sheen.style.background = `radial-gradient(circle at ${sheenX}% ${sheenY}%, rgba(255, 255, 255, 0.35) 0%, transparent 60%)`;
      }
    });

    wrapper.addEventListener('mouseleave', () => {
      wrapper.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      if (shadow) {
        shadow.style.transform = 'translateX(0px) translateY(0px) scale(1)';
      }
      if (sheen) {
        sheen.style.background = 'transparent';
      }
    });
  });
}

/**
 * Boutons d'exportation (Téléchargement PNG 300 DPI, Impression)
 */
function initExportButtons() {
  // Export carte claire
  const btnExportLightPng = document.getElementById('btnExportLightPng');
  if (btnExportLightPng) {
    btnExportLightPng.addEventListener('click', () => {
      exportCardAsPng('light');
    });
  }

  // Export carte sombre
  const btnExportDarkPng = document.getElementById('btnExportDarkPng');
  if (btnExportDarkPng) {
    btnExportDarkPng.addEventListener('click', () => {
      exportCardAsPng('dark');
    });
  }

  // Impression de la page
  const btnPrintCards = document.getElementById('btnPrintCards');
  if (btnPrintCards) {
    btnPrintCards.addEventListener('click', () => {
      window.print();
    });
  }

  // Export de tous les membres
  const btnExportAll = document.getElementById('btnExportAll');
  if (btnExportAll) {
    btnExportAll.addEventListener('click', () => {
      openPrintSheetModal();
    });
  }
}

/**
 * Générateur de carte en haute résolution 300 DPI via HTML5 Canvas
 * Rendu à 2100 x 1260 px (Haute définition d'imprimerie)
 */
function exportCardAsPng(theme) {
  const member = MEMBERS_DATA[state.currentMember];
  const cardEl = document.querySelector(`.business-card.model-${theme}`);
  if (!cardEl || !member) return;

  // Création du canvas 300 DPI (Ratio 85x55mm -> 2100 x 1358 px)
  const canvas = document.createElement('canvas');
  const width = 2100;
  const height = 1358;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const phoneText = state.useCountryCode ? member.phoneFormatted : member.phoneShort;
  const whatsappText = state.useCountryCode ? member.whatsappFormatted : member.whatsappShort;
  const roleText = state.currentLanguage === 'fr' ? member.roleFr : member.roleEn;

  if (theme === 'light') {
    renderLightCardOnCanvas(ctx, width, height, member.name, roleText, phoneText, whatsappText, member.email, member.website);
  } else {
    renderDarkCardOnCanvas(ctx, width, height, member.name, roleText, phoneText, whatsappText, member.email, member.website);
  }

  // Déclenchement du téléchargement
  const link = document.createElement('a');
  const safeName = member.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  link.download = `carte_quantis_${safeName}_${theme}_300dpi.png`;
  link.href = canvas.toDataURL('image/png', 1.0);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Rendu Canvas HD du Modèle Clair
 */
function renderLightCardOnCanvas(ctx, w, h, name, role, phone, whatsapp, email, website) {
  // 1. Fond global ivoire
  ctx.fillStyle = '#faf7f0';
  ctx.fillRect(0, 0, w, h);

  // 2. Volet gauche (42% de w) avec fond et grille guillochée
  const leftW = w * 0.42;
  ctx.fillStyle = '#f5f0e6';
  ctx.fillRect(0, 0, leftW, h);

  // Grille géométrique élégante
  ctx.save();
  ctx.strokeStyle = '#dfd6c7';
  ctx.lineWidth = 1.5;
  const step = 45;
  for (let x = -h; x < leftW + h; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + h, h);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + h, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  ctx.restore();

  // Ligne de séparation verticale subtile
  ctx.strokeStyle = '#e2d8c7';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(leftW, 0);
  ctx.lineTo(leftW, h);
  ctx.stroke();

  // 3. Emblème Logo Quantis Gauche
  const crestX = leftW / 2;
  const crestY = h * 0.44;
  const radius = 175;

  // Double cercle concentrique bleu nuit
  ctx.strokeStyle = '#0e1c3d';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(crestX, crestY, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(crestX, crestY, radius - 15, 0, Math.PI * 2);
  ctx.stroke();

  // Pastille sphérique dorée à 6h (bas)
  ctx.fillStyle = '#c5a059';
  ctx.beginPath();
  ctx.arc(crestX, crestY + radius - 7.5, 9, 0, Math.PI * 2);
  ctx.fill();

  // Flèche diagonale dorée à 2h
  const arrowAngle = -Math.PI / 4;
  const arrowX = crestX + Math.cos(arrowAngle) * (radius - 7.5);
  const arrowY = crestY + Math.sin(arrowAngle) * (radius - 7.5);
  
  ctx.save();
  ctx.translate(arrowX, arrowY);
  ctx.rotate(arrowAngle + Math.PI / 2);
  ctx.fillStyle = '#c5a059';
  ctx.beginPath();
  ctx.moveTo(0, -18);
  ctx.lineTo(12, 10);
  ctx.lineTo(-12, 10);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Cercle plein intérieur ivoire
  ctx.fillStyle = '#faf7f0';
  ctx.beginPath();
  ctx.arc(crestX, crestY, radius - 28, 0, Math.PI * 2);
  ctx.fill();

  // Lettre "Q" majuscule navy
  ctx.fillStyle = '#0e1c3d';
  ctx.font = 'bold 190px Montserrat, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Q', crestX, crestY - 10);

  // Nom de la marque "QUANTIS" espacé sous le logo
  ctx.font = '800 52px Montserrat, sans-serif';
  ctx.letterSpacing = '0.35em';
  ctx.fillText('QUANTIS', crestX + 10, crestY + radius + 110);

  // 4. Volet droit : Typographie & Coordonnées
  const rightX = leftW + 140;
  let currentY = h * 0.28;

  // Nom complet
  ctx.fillStyle = '#0e1c3d';
  ctx.font = '800 64px Montserrat, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(name, rightX, currentY);

  // Rôle / Titre
  currentY += 55;
  ctx.fillStyle = '#1e2c4f';
  ctx.font = '600 36px Montserrat, sans-serif';
  ctx.fillText(role, rightX, currentY);

  // Ligne de séparation dorée
  currentY += 40;
  ctx.fillStyle = '#c5a059';
  ctx.fillRect(rightX, currentY, 150, 6);

  // Coordonnées de contact
  currentY += 95;
  const rowSpacing = 95;
  const badgeRadius = 38;

  const contacts = [
    { type: 'phone', text: phone },
    { type: 'whatsapp', text: whatsapp },
    { type: 'email', text: email }
  ];

  if (state.includeWebsite && website) {
    contacts.push({ type: 'web', text: website });
  }

  contacts.forEach(item => {
    // Médaillon circulaire doré
    const grad = ctx.createLinearGradient(rightX, currentY - badgeRadius, rightX + badgeRadius * 2, currentY + badgeRadius);
    grad.addColorStop(0, '#c5a059');
    grad.addColorStop(1, '#a88136');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(rightX + badgeRadius, currentY, badgeRadius, 0, Math.PI * 2);
    ctx.fill();

    // Pictogramme simple blanc dans le médaillon
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let iconChar = '📞';
    if (item.type === 'whatsapp') iconChar = '💬';
    else if (item.type === 'email') iconChar = '✉';
    else if (item.type === 'web') iconChar = '🌐';
    ctx.fillText(iconChar, rightX + badgeRadius, currentY);

    // Texte des coordonnées
    ctx.fillStyle = '#0e1c3d';
    ctx.font = '600 42px Montserrat, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.text, rightX + badgeRadius * 2 + 35, currentY);

    currentY += rowSpacing;
  });
}

/**
 * Rendu Canvas HD du Modèle Sombre Prestige (Bleu Nuit & Or Métallique 3D)
 */
function renderDarkCardOnCanvas(ctx, w, h, name, role, phone, whatsapp, email, website) {
  // 1. Fond bleu nuit profond en dégradé radial
  const bgGrad = ctx.createRadialGradient(w * 0.5, h * 0.4, 100, w * 0.5, h * 0.5, w * 0.8);
  bgGrad.addColorStop(0, '#112248');
  bgGrad.addColorStop(0.6, '#0c1834');
  bgGrad.addColorStop(1, '#060e22');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Grain tactile de surface
  ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
  for (let i = 0; i < 6000; i++) {
    const rx = Math.random() * w;
    const ry = Math.random() * h;
    ctx.fillRect(rx, ry, 2, 2);
  }

  // 2. Emblème Logo 3D Gauche
  const leftW = w * 0.42;
  const crestX = leftW / 2;
  const crestY = h * 0.44;
  const radius = 180;

  // Anneau extérieur avec gaufrage 3D
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetY = 15;

  // Anneau extérieur en biseau bleu
  ctx.strokeStyle = '#0b1632';
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.arc(crestX, crestY, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Filet d'or fin sur la tranche de l'anneau
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(crestX, crestY, radius - 8, 0, Math.PI * 2);
  ctx.stroke();

  // Flèche 3D dorée
  const arrowAngle = -Math.PI / 4;
  const arrowX = crestX + Math.cos(arrowAngle) * (radius - 8);
  const arrowY = crestY + Math.sin(arrowAngle) * (radius - 8);
  
  ctx.save();
  ctx.translate(arrowX, arrowY);
  ctx.rotate(arrowAngle + Math.PI / 2);
  const goldGrad = ctx.createLinearGradient(-15, -15, 15, 15);
  goldGrad.addColorStop(0, '#fff3ce');
  goldGrad.addColorStop(0.5, '#d4af37');
  goldGrad.addColorStop(1, '#7a5717');
  ctx.fillStyle = goldGrad;
  ctx.beginPath();
  ctx.moveTo(0, -20);
  ctx.lineTo(14, 12);
  ctx.lineTo(-14, 12);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Pastille d'or 3D à 6h
  ctx.fillStyle = goldGrad;
  ctx.beginPath();
  ctx.arc(crestX, crestY + radius - 8, 10, 0, Math.PI * 2);
  ctx.fill();

  // Cavité intérieure creusée
  const innerGrad = ctx.createRadialGradient(crestX - 20, crestY - 20, 20, crestX, crestY, radius - 20);
  innerGrad.addColorStop(0, '#0a142c');
  innerGrad.addColorStop(1, '#060d1e');
  ctx.fillStyle = innerGrad;
  ctx.beginPath();
  ctx.arc(crestX, crestY, radius - 20, 0, Math.PI * 2);
  ctx.fill();

  // Lettre "Q" gaufrée 3D
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 6;
  ctx.fillStyle = '#0f1d3e';
  ctx.font = 'bold 195px Montserrat, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Q', crestX, crestY - 10);
  ctx.restore();

  // Réhaut d'angle lumineux sur le "Q"
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1.5;
  ctx.strokeText('Q', crestX, crestY - 10);

  // Marque "QUANTIS" gravée en creux (Debossed)
  ctx.save();
  ctx.shadowColor = 'rgba(255, 255, 255, 0.12)';
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = '#071022';
  ctx.font = '800 52px Montserrat, sans-serif';
  ctx.letterSpacing = '0.35em';
  ctx.fillText('QUANTIS', crestX + 10, crestY + radius + 115);
  ctx.restore();

  // 3. Volet droit : Typographie Dorée Métallique
  const rightX = leftW + 140;
  let currentY = h * 0.28;

  // Nom en feuille d'or brossée
  const textGoldGrad = ctx.createLinearGradient(rightX, currentY - 50, rightX + 600, currentY);
  textGoldGrad.addColorStop(0, '#fff6d8');
  textGoldGrad.addColorStop(0.35, '#d8b266');
  textGoldGrad.addColorStop(0.7, '#9e7428');
  textGoldGrad.addColorStop(1, '#f5de9e');

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = textGoldGrad;
  ctx.font = '800 64px Montserrat, sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(name, rightX, currentY);
  ctx.restore();

  // Rôle en or champagne raffiné
  currentY += 55;
  ctx.fillStyle = '#d4af37';
  ctx.font = '600 36px Montserrat, sans-serif';
  ctx.fillText(role, rightX, currentY);

  // Ligne de séparation dorée métallique
  currentY += 40;
  const lineGrad = ctx.createLinearGradient(rightX, currentY, rightX + 160, currentY);
  lineGrad.addColorStop(0, '#d4af37');
  lineGrad.addColorStop(0.5, '#fff2c8');
  lineGrad.addColorStop(1, '#8c6a2e');
  ctx.fillStyle = lineGrad;
  ctx.fillRect(rightX, currentY, 150, 6);

  // Coordonnées en or
  currentY += 95;
  const rowSpacing = 95;
  const badgeRadius = 38;

  const contacts = [
    { type: 'phone', text: phone },
    { type: 'whatsapp', text: whatsapp },
    { type: 'email', text: email }
  ];

  if (state.includeWebsite && website) {
    contacts.push({ type: 'web', text: website });
  }

  contacts.forEach(item => {
    // Médaillon d'or 3D avec éclairage sphérique
    const medalGrad = ctx.createRadialGradient(
      rightX + badgeRadius * 0.7,
      currentY - badgeRadius * 0.3,
      5,
      rightX + badgeRadius,
      currentY,
      badgeRadius
    );
    medalGrad.addColorStop(0, '#fff6d8');
    medalGrad.addColorStop(0.45, '#d4af37');
    medalGrad.addColorStop(1, '#69470f');

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 5;
    ctx.fillStyle = medalGrad;
    ctx.beginPath();
    ctx.arc(rightX + badgeRadius, currentY, badgeRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Pictogramme gravé bronze foncé
    ctx.fillStyle = '#1c1305';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let iconChar = '📞';
    if (item.type === 'whatsapp') iconChar = '💬';
    else if (item.type === 'email') iconChar = '✉';
    else if (item.type === 'web') iconChar = '🌐';
    ctx.fillText(iconChar, rightX + badgeRadius, currentY);

    // Texte champagne lumineux
    ctx.fillStyle = '#ebd6ad';
    ctx.font = '600 42px Montserrat, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.text, rightX + badgeRadius * 2 + 35, currentY);

    currentY += rowSpacing;
  });
}

/**
 * Modale de prévisualisation et impression de planche A4
 */
function initModalControls() {
  const modal = document.getElementById('sheetModal');
  const closeBtn = document.getElementById('closeModalBtn');

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('open');
    });
  }

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('open');
    }
  });
}

function openPrintSheetModal() {
  const modal = document.getElementById('sheetModal');
  if (modal) {
    modal.classList.add('open');
  }
}
