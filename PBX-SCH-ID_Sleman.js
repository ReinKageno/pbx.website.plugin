// ==UserScript==
// @name         PBX SCH ID - Sleman
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Forces PBx SCH ID website into dark theme with custom things.
// @author       Kanade
// @match        https://*.app.pbx.sch.id/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=sch.id
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    const scriptVersion = 1.3;
    const scriptState = "Stable";

    const customCSS = `
/* Dark Mode: Apply your custom lighter text color */
[data-bs-theme="dark"] .card-body .text-muted {
    color: #C3C3D9 !important;
}

/* Light Mode: Fallback to Metronic's standard dark-muted text or a balanced dark gray for readability */
[data-bs-theme="light"] .card-body .text-muted,
:root:not([data-bs-theme="dark"]) .card-body .text-muted {
    color: #7e8299 !important;
}

/* Target the header flex container inside ANY wrapper div within card-body (with or without borders) */
.card-body > div > .d-flex.justify-content-between,
.card-body .border-bottom > .d-flex.justify-content-between {
    display: grid !important;
    grid-template-columns: 8fr 2fr !important;
    gap: 1rem !important;
    align-items: start !important;
}

/* Ensure children inside those rows respect the grid columns and don't overflow */
.card-body > div > .d-flex.justify-content-between > div,
.card-body .border-bottom > .d-flex.justify-content-between > div {
    width: 100% !important;
    flex: unset !important;
}

/* Keep the button container neatly right-aligned */
.card-body > div > .d-flex.justify-content-between > div.flex-shrink-0,
.card-body .border-bottom > .d-flex.justify-content-between > div.flex-shrink-0 {
    display: flex;
    justify-content: flex-end;
}

.card-body .d-flex.align-items-center.bg-light {
    display: flex !important;
    flex-wrap: wrap !important;
}

/* Main text column takes full width on the first line */
.card-body .d-flex.align-items-center.bg-light > div:first-child {
    flex: 1 1 100% !important;
    max-width: 100% !important;
    margin-bottom: 0.5rem !important;
}

/* Wrap badge and button together or style them to match dimensions */
.card-body .d-flex.align-items-center.bg-light > span.badge,
.card-body .d-flex.align-items-center.bg-light > button {
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    box-sizing: border-box !important;
    vertical-align: middle !important;
}

.card-body .d-flex.align-items-center.bg-light > span.badge {
    height: 24px !important; /* Matches typical compact button height */
    padding: 1.7rem 1.25rem !important;
    font-size: 0.75rem !important;
}

.card-body .cp-collapse-content.expanded {
    gap: 0.75rem !important; /* Forces Bootstrap gap-2 sizing equivalent */
}

/* Targets card descriptions, excluding anything inside #custom-summary-banner */
#kt_app_content .card:not(#custom-summary-banner) .card-body > div > div > div .text-muted.fs-7 {
    position: relative !important;
    max-height: 2.8em !important;
    overflow: hidden !important;
    transition: max-height 0.4s ease, opacity 0.3s ease !important;
    cursor: pointer;
}

/* Responsive gradient fade using CSS variables that adapt to Light and Dark mode */
#kt_app_content .card:not(#custom-summary-banner) .card-body > div > div > div .text-muted.fs-7::after {
    content: "" !important;
    position: absolute !important;
    bottom: 0 !important;
    left: 0 !important;
    width: 100% !important;
    height: 1.5em !important;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0), var(--bs-card-bg, #ffffff)) !important;
    pointer-events: none !important;
    transition: opacity 0.3s ease;
}

/* Expanded state on hover */
#kt_app_content .card:not(#custom-summary-banner) .card-body > div > div > div .text-muted.fs-7:hover {
    max-height: 200px !important;
}

#kt_app_content .card:not(#custom-summary-banner) .card-body > div > div > div .text-muted.fs-7:hover::after {
    opacity: 0 !important;
}

/* Collapsible container styling */
.cp-collapse-container {
    margin-top: 0.5rem;
}

.cp-collapse-toggle {
    cursor: pointer;
    user-select: none;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: #009ef7;
    background: transparent;
    border: none;
    padding: 0;
    margin-bottom: 0.5rem;
}

.cp-collapse-toggle:hover {
    color: #0095e8;
    text-decoration: underline;
}

.cp-collapse-content {
    display: none;
    flex-direction: column;
    gap: 0.5rem;
}

.cp-collapse-content.expanded {
    display: flex !important;
}

/* Custom modal overlay background */
#custom-settings-modal {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    z-index: 1099;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
}
#custom-settings-modal.active {
    opacity: 1;
}
/* Modal box container */
.custom-settings-dialog {
    background: var(--bs-body-bg, #ffffff);
    color: var(--bs-body-color, #3f4254);
    width: 100%;
    max-width: 450px;
    border-radius: 0.75rem;
    box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.15);
    transform: translateY(-20px);
    transition: transform 0.3s ease;
    overflow: hidden;
}
#custom-settings-modal.active .custom-settings-dialog {
    transform: translateY(0);
}
    `;

    // document-start can run before <head> exists.
    if (typeof GM_addStyle !== 'undefined') {
        GM_addStyle(customCSS);
    } else {
        const styleNode = document.createElement('style');
        styleNode.textContent = customCSS;
        const addStyle = () => (document.head || document.documentElement).appendChild(styleNode);
        if (document.head || document.documentElement) addStyle();
        else document.addEventListener('DOMContentLoaded', addStyle, { once: true });
    }

    // Safe wrapper to execute Metronic calls only when the library is fully loaded
    let metronicRetryCount = 0;
    function safeInitMetronic() {
        if (typeof KTMenu !== 'undefined' && typeof KTMenu.createInstances === 'function') {
            KTMenu.createInstances();
        } else if (metronicRetryCount < 50) {
            // Stop retrying after five seconds if the page does not load Metronic.
            metronicRetryCount++;
            setTimeout(safeInitMetronic, 100);
        }
    }

    // Logic to wrap sub-items into a collapsible section
    function setupCollapsibles() {
        const containers = document.querySelectorAll('.card-body .d-flex.flex-column.gap-1');

        containers.forEach(container => {
            let wrapper = container.querySelector(':scope > .cp-collapse-container');
            let toggleBtn, contentDiv;

            if (!wrapper) {
                wrapper = document.createElement('div');
                wrapper.className = 'cp-collapse-container';

                toggleBtn = document.createElement('button');
                toggleBtn.type = 'button';
                toggleBtn.className = 'cp-collapse-toggle';

                contentDiv = document.createElement('div');
                contentDiv.className = 'cp-collapse-content'; // collapsed by default

                wrapper.appendChild(toggleBtn);
                wrapper.appendChild(contentDiv);
                container.appendChild(wrapper);

                toggleBtn.addEventListener('click', () => {
                    const isExpanded = contentDiv.classList.toggle('expanded');
                    updateButtonText(isExpanded);
                });
            } else {
                toggleBtn = wrapper.querySelector('.cp-collapse-toggle');
                contentDiv = wrapper.querySelector('.cp-collapse-content');
            }

            const allItems = container.querySelectorAll('.d-flex.align-items-center.bg-light');
            if (allItems.length === 0) return;

            let hasMovedItems = false;
            allItems.forEach(item => {
                if (item.parentNode !== contentDiv) {
                    contentDiv.appendChild(item);
                    hasMovedItems = true;
                }
            });

            function updateButtonText(isExpanded) {
                toggleBtn.innerHTML = isExpanded
                    ? `<span>▲</span> Hide all ATP (${allItems.length})`
                    : `<span>▼</span> Show all ATP (${allItems.length})`;
            }

            // Set initial text if not already set
            if (hasMovedItems || !toggleBtn.textContent.includes('ATP')) {
                updateButtonText(contentDiv.classList.contains('expanded'));
            }
        });
    }

    setupCollapsibles();

    // Rewrite ATP labels
    function rewriteLabels() {
        // Retain source strings so repeated calls never add another custom prefix.
        const originalText = rewriteLabels.originalText || (rewriteLabels.originalText = new WeakMap());
        const originalAttrs = rewriteLabels.originalAttrs || (rewriteLabels.originalAttrs = new WeakMap());
        const getOriginalAttr = (element, name) => {
            let values = originalAttrs.get(element);
            if (!values) { values = new Map(); originalAttrs.set(element, values); }
            if (!values.has(name)) values.set(name, element.getAttribute(name));
            return values.get(name);
        };
        const mapelCards = document.querySelectorAll('.card[data-mapel-card]');

        mapelCards.forEach(card => {
            const headerTitleEl = card.querySelector('.card-header [data-buka-mapel], .card-header h3');
            if (!headerTitleEl) return;

            const rawTitle = headerTitleEl.getAttribute('data-buka-mapel') || headerTitleEl.textContent.trim();

            // Extract ONLY uppercase letters from the title (e.g., "Prakarya Budi Daya" -> "PBD")
            // If there are no explicit capitals, it falls back to grabbing initials of words.
            let mapelCode = (rawTitle.match(/[A-Z]/g) || []).join('');
            if (!mapelCode || mapelCode.length < 2) {
                mapelCode = rawTitle.split(/\s+/).map(word => word[0] ? word[0].toUpperCase() : '').join('');
            }

            const cpSections = card.querySelectorAll('.card-body > div.border-bottom, .card-body > div:not(.border-bottom)');

            cpSections.forEach((section, cpIndex) => {
                const cpAutoNum = cpIndex + 1;

                // Safely update CP heading text & capture old number
                const cpHeading = section.querySelector('h5.fw-bold');
                if (cpHeading) {
                    const walker = document.createTreeWalker(cpHeading, NodeFilter.SHOW_TEXT, null, false);
                    let node;
                    while (node = walker.nextNode()) {
                        if (!originalText.has(node)) originalText.set(node, node.nodeValue);
                        const sourceText = originalText.get(node);
                        if (sourceText.includes('CP')) {
                            // Extract the old number (e.g., 358 from CP358)
                            const match = sourceText.match(/CP(\d+)/);
                            const oldNum = match ? match[1] : '';

                            // Transform to: CP-PBD-1 [358]
                            node.nodeValue = sourceText.replace(/CP\d+/, `CP-${mapelCode}${cpAutoNum} [${oldNum}]`);
                        }
                    }
                }

                // Safely update CP Button attributes
                const cpButton = section.querySelector('.btn-open-submit[data-title*="CP"]');
                if (cpButton) {
                    let titleAttr = getOriginalAttr(cpButton, 'data-title');
                    let contextAttr = getOriginalAttr(cpButton, 'data-context');
                    let submitLabel = getOriginalAttr(cpButton, 'data-submit-label');

                    if (titleAttr) {
                        const match = titleAttr.match(/CP(\d+)/);
                        const oldNum = match ? match[1] : '';
                        cpButton.setAttribute('data-title', titleAttr.replace(/CP\d+/, `CP-${mapelCode}${cpAutoNum} [${oldNum}]`));
                    }
                    if (contextAttr) {
                        const match = contextAttr.match(/CP(\d+)/);
                        const oldNum = match ? match[1] : '';
                        cpButton.setAttribute('data-context', contextAttr.replace(/CP\d+/, `CP-${mapelCode}${cpAutoNum} [${oldNum}]`));
                    }
                    if (submitLabel) {
                        const match = submitLabel.match(/CP(\d+)/);
                        const oldNum = match ? match[1] : '';
                        cpButton.setAttribute('data-submit-label', submitLabel.replace(/CP\d+/, `CP-${mapelCode}${cpAutoNum} [${oldNum}]`));
                    }
                }

                // Safely update sub-item TPs
                const tpRows = section.querySelectorAll('.d-flex.align-items-center.bg-light');
                tpRows.forEach((tpRow, tpIndex) => {
                    const tpAutoNum = tpIndex + 1;
                    const tpButton = tpRow.querySelector('.btn-open-submit[data-title*="TP"]');

                    if (tpButton) {
                        let titleAttr = getOriginalAttr(tpButton, 'data-title');
                        let contextAttr = getOriginalAttr(tpButton, 'data-context');

                        if (titleAttr) {
                            const match = titleAttr.match(/TP(\d+\.\d+)/);
                            const oldNum = match ? match[1] : '';
                            tpButton.setAttribute('data-title', titleAttr.replace(/TP\d+\.\d+/, `TP-${mapelCode}${cpAutoNum}.${tpAutoNum} [${oldNum}]`));
                        }
                        if (contextAttr) {
                            const match = contextAttr.match(/TP(\d+\.\d+)/);
                            const oldNum = match ? match[1] : '';
                            tpButton.setAttribute('data-context', contextAttr.replace(/TP\d+\.\d+/, `TP-${mapelCode}${cpAutoNum}.${tpAutoNum} [${oldNum}]`));
                        }
                    }
                });
            });
        });
    }

    rewriteLabels();

    // Run after page load and ensure it sweeps elements cleanly
    window.addEventListener('load', () => {
        setTimeout(rewriteLabels, 300);
    });

    function insertDashboardSummaryCard() {
        // Only run if on the correct student route
        if (!window.location.pathname.includes('/siswa/atp')) return;

        const appContent = document.querySelector('#kt_app_content.app-content');
        if (!appContent) return;

        if (appContent.querySelector('#custom-summary-banner')) return;

        // Aggregate counts for T, TS, and SB
        let totalT = 0;
        let totalTS = 0;
        let totalSB = 0;

        // Read user preference from settings (defaults to 'cp')
        const countMode = localStorage.getItem('tampermonkey_count_mode') || 'cp';
        const mapelCards = document.querySelectorAll('.card[data-mapel-card]');

        mapelCards.forEach(card => {
            if (countMode === 'atp') {
                // ATP Mode: Seek inside the collapsible content containers using exact uppercase text
                const collapseContainers = card.querySelectorAll('.cp-collapse-content');
                collapseContainers.forEach(container => {
                    const spans = container.querySelectorAll('span.badge');
                    spans.forEach(span => {
                        const text = span.textContent.trim();
                        if (text === 'T') {
                            totalT++;
                        } else if (text === 'TS') {
                            totalTS++;
                        } else if (text === 'SB') {
                            totalSB++;
                        }
                    });
                });
            } else {
                // CP Mode: Your original proven header badge counting logic
                const badges = card.querySelectorAll('.badge.fs-8');
                badges.forEach(badge => {
                    const text = badge.textContent.trim();
                    if (text.includes('CP: T —') || text === 'T' || (text.includes('Tercapai') && !text.includes('Sebagian'))) {
                        totalT++;
                    }
                    if (text.includes('CP: TS') || text === 'TS') {
                        totalTS++;
                    }
                    if (text.includes('CP: SB') || text === 'SB') {
                        totalSB++;
                    }
                });
            }
        });
        const bannerDiv = document.createElement('div');
        bannerDiv.id = 'custom-summary-banner';
        bannerDiv.className = 'card mb-5 shadow-sm';

        bannerDiv.innerHTML = `
            <div class="card-body py-4 px-5">
                <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <div class="d-flex align-items-center">
                        <div class="symbol symbol-45px me-4">
                            <span class="symbol-label bg-light-primary text-primary fs-2 fw-bold">
                                <i class="ki-outline ki-chart-line-star fs-2x text-primary"></i>
                            </span>
                        </div>
                        <div>
                            <h4 class="fw-bold text-gray-800 mb-1">Learning Progress Statistics</h4>
                            <span class="text-muted fs-7">Accumulated overview of your current learning milestones.</span>
                        </div>
                    </div>

                    <div class="d-flex align-items-center gap-3 flex-wrap">
                        <!-- T Counter (New) -->
                        <div class="bg-light-success ps-3 pe-4 py-2 rounded-pill d-flex align-items-center">
                            <span class="badge badge-circle badge-success me-2">T</span>
                            <span class="text-gray-800 fw-bold fs-6 me-1">${totalT}</span>
                            <span class="text-muted fs-8">Tercapai</span>
                        </div>

                        <!-- TS Counter -->
                        <div class="bg-light-info ps-3 pe-4 py-2 rounded-pill d-flex align-items-center">
                            <span class="badge badge-circle badge-info me-2">TS</span>
                            <span class="text-gray-800 fw-bold fs-6 me-1">${totalTS}</span>
                            <span class="text-muted fs-8">Tercapai Sebagian</span>
                        </div>

                        <!-- SB Counter -->
                        <div class="bg-light-warning ps-3 pe-4 py-2 rounded-pill d-flex align-items-center">
                            <span class="badge badge-circle badge-warning me-2">SB</span>
                            <span class="text-gray-800 fw-bold fs-6 me-1">${totalSB}</span>
                            <span class="text-muted fs-8">Sedang Berjalan</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        appContent.insertBefore(bannerDiv, appContent.firstChild);
    }

    window.addEventListener('load', () => {
        setTimeout(insertDashboardSummaryCard, 600);
    });

    function initUserMenuEnhancements() {
        const userMenu = document.querySelector('.menu.menu-sub-dropdown');
        if (!userMenu) return;

        // Prevent duplicate insertion
        if (userMenu.querySelector('#custom-settings-trigger')) return;

        // Load saved theme preference on startup
        const savedTheme = localStorage.getItem('tampermonkey_theme_mode') || 'dark';
        document.documentElement.setAttribute('data-bs-theme', savedTheme);

        const logoutForm = userMenu.querySelector('form[action*="logout"]');
        if (!logoutForm) return;
        const logoutItem = logoutForm.closest('.menu-item');
        const logoutSeparator = logoutItem ? logoutItem.previousElementSibling : null;

        if (logoutSeparator) {
            const settingsItem = document.createElement('div');
            settingsItem.className = 'menu-item px-5';
            settingsItem.id = 'custom-settings-trigger';
            settingsItem.innerHTML = `
                <a href="#" class="menu-link px-5">
                    <span class="menu-icon"><i class="ki-outline ki-setting-2 fs-4"></i></span>
                    <span class="menu-title">Pengaturan Script</span>
                </a>
            `;
            userMenu.insertBefore(settingsItem, logoutSeparator);

            // Prevent third-party listeners (like Quill) from swallowing the click
            settingsItem.querySelector('a').addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                openSettingsModal();
            }, true);
        }

        // Build the Settings Modal Overlay DOM (hidden by default)
        if (!document.getElementById('custom-settings-modal')) {
            const modalWrapper = document.createElement('div');
            modalWrapper.id = 'custom-settings-modal';
            modalWrapper.innerHTML = `
                <div class="custom-settings-dialog">
                    <div class="card-header d-flex align-items-center justify-content-between p-4 border-bottom">
                        <h5 class="fw-bold m-0"><i class="ki-outline ki-setting-3 fs-2 me-2"></i> Pengaturan Dasbor</h5>
                        <button type="button" class="btn btn-sm btn-icon btn-light-danger" id="close-settings-modal">
                            <i class="ki-outline ki-cross fs-2"></i>
                        </button>
                    </div>
                    <div class="card-body p-5">
                        <div class="d-flex flex-column gap-4">
                            <!-- Theme Controller Option -->
                            <div style="display: grid; grid-template-columns: 8fr 2fr; align-items: center; gap: 1rem;">
                                <div style="min-width: 0;">
                                    <div class="fw-bold text-gray-800">Mode Tampilan (Theme)</div>
                                    <span class="text-muted fs-7">Pilih tema terang atau gelap untuk portal.</span>
                                </div>
                                <div style="display: flex; justify-content: flex-end;">
                                    <div class="btn-group w-100" role="group">
                                        <button type="button" class="btn btn-sm btn-light-primary ${savedTheme === 'light' ? 'active' : ''}" id="theme-light-btn">Terang</button>
                                        <button type="button" class="btn btn-sm btn-light-primary ${savedTheme === 'dark' ? 'active' : ''}" id="theme-dark-btn">Gelap</button>
                                    </div>
                                </div>
                            </div>

                            <!-- Counting Mode Controller (Strict 8:2 Ratio via CSS Grid) -->
                            <div style="display: grid; grid-template-columns: 8fr 2fr; align-items: center; gap: 1rem;">
                                <div style="min-width: 0;">
                                    <div class="fw-bold text-gray-800">Metode Hitung Statistik</div>
                                    <span class="text-muted fs-7">Hitung berdasarkan Level CP atau detail ATP.</span>
                                </div>
                                <div style="display: flex; justify-content: flex-end;">
                                    <div class="btn-group w-100" role="group">
                                        <button type="button" class="btn btn-sm btn-light-primary ${localStorage.getItem('tampermonkey_count_mode') !== 'atp' ? 'active' : ''}" id="count-cp-btn">CP</button>
                                        <button type="button" class="btn btn-sm btn-light-primary ${localStorage.getItem('tampermonkey_count_mode') === 'atp' ? 'active' : ''}" id="count-atp-btn">ATP</button>
                                    </div>
                                </div>
                            </div>

                            <div class="separator my-2"></div>

                            <!-- Script Version Info -->
                            <div style="display: grid; grid-template-columns: 8fr 2fr; align-items: center; gap: 1rem;">
                                <div style="min-width: 0;">
                                    <div class="fw-bold text-gray-800">Script Version</div>
                                    <span class="text-muted fs-7">PBxScripter v${scriptVersion} (Active)</span>
                                </div>
                                <div style="display: flex; justify-content: flex-end;">
                                    <span class="badge badge-light-success py-2 w-100 text-center d-block">${scriptState}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="card-footer d-flex justify-content-end p-3 border-top">
                        <button type="button" class="btn btn-sm btn-primary" id="save-settings-btn">Tutup & Simpan</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modalWrapper);

            // Modal Controls Logic
            const modal = document.getElementById('custom-settings-modal');
            const closeBtn = document.getElementById('close-settings-modal');
            const saveBtn = document.getElementById('save-settings-btn');
            const lightBtn = document.getElementById('theme-light-btn');
            const darkBtn = document.getElementById('theme-dark-btn');

            function closeModal() {
                modal.classList.remove('active');
                setTimeout(() => {
                    modal.style.display = 'none';
                }, 300);
            }

            closeBtn.addEventListener('click', closeModal);
            saveBtn.addEventListener('click', closeModal);
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });

            // Theme Switcher Handlers inside the Modal
            lightBtn.addEventListener('click', () => {
                document.documentElement.setAttribute('data-bs-theme', 'light');
                localStorage.setItem('tampermonkey_theme_mode', 'light');
                lightBtn.classList.add('active');
                darkBtn.classList.remove('active');
            });

            darkBtn.addEventListener('click', () => {
                document.documentElement.setAttribute('data-bs-theme', 'dark');
                localStorage.setItem('tampermonkey_theme_mode', 'dark');
                darkBtn.classList.add('active');
                lightBtn.classList.remove('active');
            });

            const countCpBtn = document.getElementById('count-cp-btn');
            const countAtpBtn = document.getElementById('count-atp-btn');

            countCpBtn.addEventListener('click', () => {
                localStorage.setItem('tampermonkey_count_mode', 'cp');
                countCpBtn.classList.add('active');
                countAtpBtn.classList.remove('active');
                // Re-run summary banner calculation if on the dashboard
                if (typeof insertDashboardSummaryCard === 'function') {
                    const existingBanner = document.getElementById('custom-summary-banner');
                    if (existingBanner) existingBanner.remove();
                    insertDashboardSummaryCard();
                }
            });

            countAtpBtn.addEventListener('click', () => {
                localStorage.setItem('tampermonkey_count_mode', 'atp');
                countAtpBtn.classList.add('active');
                countCpBtn.classList.remove('active');
                // Re-run summary banner calculation if on the dashboard
                if (typeof insertDashboardSummaryCard === 'function') {
                    const existingBanner = document.getElementById('custom-summary-banner');
                    if (existingBanner) existingBanner.remove();
                    insertDashboardSummaryCard();
                }
            });
        }
    }

    let timeoutId = null;
    let setup = false;

    // 1. Theme application on startup (runs immediately)
    const savedTheme = localStorage.getItem('tampermonkey_theme_mode') || 'dark';
    document.documentElement.setAttribute('data-bs-theme', savedTheme);

    // 2. Global click listener for profile menu (runs immediately)
    document.addEventListener('click', (e) => {
        if (e.target.closest('[data-kt-menu-trigger], .menu-sub-dropdown, .symbol')) {
            setTimeout(initUserMenuEnhancements, 50);
        }
    });

    // 3. Clean MutationObserver for DOM changes and collapsibles (no nested listeners)
    function observePage() {
      if (!document.body || setup) return;
      setup = true;
      const observer = new MutationObserver((mutations) => {
        const isTyping = mutations.some(m => m.target.tagName === 'INPUT' || m.target.tagName === 'TEXTAREA');
        if (isTyping) return;

        // Debounce setup collapsibles and label rewriting
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            setupCollapsibles();
            rewriteLabels();
        }, 250);

        if (mutations.some(m => [...m.addedNodes].some(node => node.nodeType === Node.ELEMENT_NODE &&
            (node.matches?.('.menu.menu-sub-dropdown') || node.querySelector?.('.menu.menu-sub-dropdown'))))) {
            setTimeout(initUserMenuEnhancements, 50);
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
    if (document.body) observePage();
    else document.addEventListener('DOMContentLoaded', observePage, { once: true });

    // Register once, outside the mutation callback, and also handle late script startup.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', safeInitMetronic, { once: true });
    } else {
        safeInitMetronic();
    }

    function closeModal() {
        const modal = document.getElementById('custom-settings-modal');
        if (!modal) return;

        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
            modal.style.pointerEvents = 'none';
        }, 300);
    }

    function openSettingsModal() {
        const modal = document.getElementById('custom-settings-modal');
        if (modal) {
            modal.style.display = 'flex';
            modal.style.pointerEvents = 'auto';
            setTimeout(() => {
                modal.classList.add('active');
            }, 10);
        }
    }
})();
