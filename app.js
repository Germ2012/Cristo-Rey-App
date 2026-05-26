const STORAGE_KEY = "cristo_rey_state_v1";
const FORM_DRAFT_KEY = "cristo_rey_form_drafts_v1";

const views = [
  { id: "dashboard", label: "Inicio", icon: "IN", group: "Resumen", subtitle: "Resumen financiero, alertas y acciones frecuentes." },
  { id: "calendario", label: "Calendario", icon: "FE", group: "Resumen", subtitle: "Vencimientos, cobros, pagos y servicios." },
  { id: "morosos", label: "Morosos", icon: "MO", group: "Resumen", subtitle: "Atrasos, promesas de pago y cobranza." },
  { id: "socios", label: "Socios", icon: "SO", group: "Creditos", subtitle: "Registro, busqueda e historial de socios." },
  { id: "prestamos", label: "Prestamos", icon: "PR", group: "Creditos", subtitle: "Dinero prestado a socios y sus cuotas." },
  { id: "deuda", label: "Deuda general", icon: "DG", group: "Creditos", subtitle: "Prestamo grande tomado por el comite." },
  { id: "calculadora", label: "Calculadora", icon: "CA", group: "Creditos", subtitle: "Simulacion de cuotas antes de guardar." },
  { id: "maquinaria", label: "Maquinaria", icon: "MA", group: "Operacion", subtitle: "Servicios, combustible, mantenimiento y utilidad." },
  { id: "productos", label: "Productos y ventas", icon: "PV", group: "Operacion", subtitle: "Stock, ventas al contado y ventas fiadas." },
  { id: "caja", label: "Caja", icon: "CJ", group: "Control", subtitle: "Ingresos, egresos, saldo y cierres." },
  { id: "reportes", label: "Reportes", icon: "RE", group: "Control", subtitle: "Indicadores financieros por area." },
  { id: "backup", label: "Backup", icon: "BK", group: "Control", subtitle: "Exportar, restaurar y proteger datos locales." },
  { id: "config", label: "Configuracion", icon: "CF", group: "Control", subtitle: "Datos generales y tasas por defecto." }
];

const viewGroups = ["Resumen", "Creditos", "Operacion", "Control"];

const quickActions = [
  { label: "Nuevo socio", target: "socios", style: "button" },
  { label: "Nuevo prestamo", target: "prestamos", style: "ghost-button" },
  { label: "Registrar venta", target: "productos", style: "ghost-button" },
  { label: "Caja", target: "caja", style: "ghost-button" }
];

const ui = {
  view: "dashboard",
  selectedMemberId: null,
  selectedLoanId: null,
  selectedDebtId: null,
  search: "",
  calendarRange: "week",
  calculatorResult: null,
  calculatorInputs: null,
  menuOpen: false
};

const frequencyMonths = {
  mensual: 1,
  trimestral: 3,
  semestral: 6,
  anual: 12
};

const paymentSystems = {
  cuota_fija: "Cuota fija",
  interes_simple: "Interés simple",
  sobre_saldo: "Interés sobre saldo",
  interes_solo: "Pago solo de interés",
  manual: "Cuota manual"
};

let state = loadState() || seedState();
saveState();
render();
registerServiceWorker();

document.addEventListener("click", handleClick);
document.addEventListener("submit", handleSubmit);
document.addEventListener("input", handleInput);
document.addEventListener("change", handleChange);
window.addEventListener("beforeunload", handleBeforeUnload);
window.CristoReyHasUnsavedDrafts = () => hasFormDrafts();

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return normalizeState(JSON.parse(stored));
  } catch {
    return null;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeState(state)));
}

function normalizeState(input) {
  return {
    settings: {
      committeeName: "Comité de Productores Cristo Rey",
      locality: "Cristo Rey",
      defaultDebtAnnualRate: 18,
      defaultMemberAnnualRate: 24,
      lateFeeMonthlyRate: 3,
      backupFrequency: "manual",
      ...input.settings
    },
    members: input.members || [],
    committeeDebts: input.committeeDebts || [],
    memberLoans: input.memberLoans || [],
    machineryServices: input.machineryServices || [],
    products: input.products || [],
    sales: input.sales || [],
    cashMovements: input.cashMovements || [],
    collectionActions: input.collectionActions || [],
    audit: {
      createdAt: input.audit?.createdAt || todayISO(),
      updatedAt: todayISO(),
      lastBackupAt: input.audit?.lastBackupAt || null
    }
  };
}

function seedState() {
  const members = [
    {
      id: uid("soc"),
      name: "Juan Pérez",
      document: "3.456.789",
      phone: "0981 222 333",
      address: "Compañía Cristo Rey",
      joinDate: addDaysISO(todayISO(), -780),
      status: "activo",
      reference: "Rosa Pérez - 0981 444 555",
      notes: "Productor de mandioca y maíz."
    },
    {
      id: uid("soc"),
      name: "María Gómez",
      document: "4.120.221",
      phone: "0972 555 121",
      address: "Colonia San Miguel",
      joinDate: addDaysISO(todayISO(), -420),
      status: "activo",
      reference: "Luis Gómez - 0972 111 999",
      notes: "Usa maquinaria para preparación de suelo."
    },
    {
      id: uid("soc"),
      name: "Carlos Benítez",
      document: "2.998.001",
      phone: "0994 303 404",
      address: "Línea 8",
      joinDate: addDaysISO(todayISO(), -1030),
      status: "activo",
      reference: "Ana Benítez - 0994 505 606",
      notes: "Compra insumos al comité."
    }
  ];

  const debtSchedule = generateSchedule({
    amount: 100000000,
    rate: 18,
    rateType: "anual",
    installmentsCount: 36,
    frequency: "mensual",
    firstDueDate: addDaysISO(todayISO(), -45),
    system: "cuota_fija"
  });
  debtSchedule[0].paidAmount = debtSchedule[0].total;
  debtSchedule[1].paidAmount = Math.round(debtSchedule[1].total * 0.55);
  const committeeDebts = [
    {
      id: uid("deu"),
      entity: "Cooperativa Regional",
      amount: 100000000,
      disbursementDate: addDaysISO(todayISO(), -75),
      rate: 18,
      rateType: "anual",
      term: 36,
      installmentsCount: 36,
      frequency: "mensual",
      firstDueDate: addDaysISO(todayISO(), -45),
      system: "cuota_fija",
      adminFees: 850000,
      insurance: 420000,
      notes: "Préstamo base para capital operativo del comité.",
      installments: debtSchedule,
      payments: [
        { id: uid("pag"), date: addDaysISO(todayISO(), -44), amount: debtSchedule[0].total, note: "Primera cuota" },
        { id: uid("pag"), date: addDaysISO(todayISO(), -12), amount: Math.round(debtSchedule[1].total * 0.55), note: "Pago parcial" }
      ]
    }
  ];

  const loanAInstallments = generateSchedule({
    amount: 12000000,
    rate: 24,
    rateType: "anual",
    installmentsCount: 12,
    frequency: "mensual",
    firstDueDate: addDaysISO(todayISO(), -31),
    system: "cuota_fija"
  });
  loanAInstallments[0].paidAmount = loanAInstallments[0].total;

  const loanBInstallments = generateSchedule({
    amount: 8500000,
    rate: 24,
    rateType: "anual",
    installmentsCount: 10,
    frequency: "mensual",
    firstDueDate: addDaysISO(todayISO(), -10),
    system: "sobre_saldo"
  });

  const memberLoans = [
    {
      id: uid("pre"),
      memberId: members[0].id,
      amount: 12000000,
      date: addDaysISO(todayISO(), -62),
      rate: 24,
      rateType: "anual",
      term: 12,
      installmentsCount: 12,
      frequency: "mensual",
      firstDueDate: addDaysISO(todayISO(), -31),
      system: "cuota_fija",
      guarantee: "Pagaré firmado",
      purpose: "Producción agrícola",
      status: "activo",
      notes: "Crédito para preparación de suelo.",
      installments: loanAInstallments,
      payments: [{ id: uid("pag"), date: addDaysISO(todayISO(), -30), amount: loanAInstallments[0].total, note: "Pago en fecha" }]
    },
    {
      id: uid("pre"),
      memberId: members[2].id,
      amount: 8500000,
      date: addDaysISO(todayISO(), -41),
      rate: 24,
      rateType: "anual",
      term: 10,
      installmentsCount: 10,
      frequency: "mensual",
      firstDueDate: addDaysISO(todayISO(), -10),
      system: "sobre_saldo",
      guarantee: "Aval familiar",
      purpose: "Fertilizantes",
      status: "en_mora",
      notes: "Primera cuota pendiente.",
      installments: loanBInstallments,
      payments: []
    }
  ];

  const products = [
    {
      id: uid("pro"),
      name: "Semilla de maíz",
      category: "Semillas",
      unit: "Bolsa",
      buyPrice: 145000,
      salePrice: 175000,
      stock: 18,
      minStock: 5,
      supplier: "Agroinsumos del Este",
      expiryDate: addDaysISO(todayISO(), 230)
    },
    {
      id: uid("pro"),
      name: "Fertilizante 12-12-17",
      category: "Fertilizantes",
      unit: "Bolsa",
      buyPrice: 210000,
      salePrice: 248000,
      stock: 7,
      minStock: 8,
      supplier: "Campo Fértil",
      expiryDate: ""
    }
  ];

  return normalizeState({
    settings: {},
    members,
    committeeDebts,
    memberLoans,
    machineryServices: [
      {
        id: uid("maq"),
        memberId: members[1].id,
        clientName: "María Gómez",
        machineType: "Tractor",
        date: addDaysISO(todayISO(), -6),
        location: "San Miguel",
        hours: 5,
        hectares: 3,
        priceMode: "hora",
        unitPrice: 180000,
        operator: "Pedro Duarte",
        fuelLiters: 32,
        fuelCost: 230000,
        maintenanceCost: 60000,
        total: 900000,
        paymentStatus: "pagado",
        notes: "Preparación de suelo."
      },
      {
        id: uid("maq"),
        memberId: members[0].id,
        clientName: "Juan Pérez",
        machineType: "Sembradora",
        date: addDaysISO(todayISO(), 3),
        location: "Cristo Rey",
        hours: 0,
        hectares: 4,
        priceMode: "hectarea",
        unitPrice: 220000,
        operator: "A confirmar",
        fuelLiters: 0,
        fuelCost: 0,
        maintenanceCost: 0,
        total: 880000,
        paymentStatus: "pendiente",
        notes: "Servicio programado."
      }
    ],
    products,
    sales: [
      {
        id: uid("ven"),
        productId: products[0].id,
        memberId: members[2].id,
        clientName: "Carlos Benítez",
        quantity: 2,
        date: addDaysISO(todayISO(), -8),
        unitPrice: 175000,
        buyPrice: 145000,
        discount: 0,
        total: 350000,
        paidAmount: 0,
        paymentType: "fiado",
        status: "pendiente"
      }
    ],
    cashMovements: [
      {
        id: uid("mov"),
        date: addDaysISO(todayISO(), -75),
        type: "ingreso",
        category: "Desembolso deuda general",
        amount: 100000000,
        description: "Ingreso del préstamo tomado por el comité.",
        relatedType: "deuda_general",
        relatedId: committeeDebts[0].id
      },
      {
        id: uid("mov"),
        date: addDaysISO(todayISO(), -62),
        type: "egreso",
        category: "Préstamo a socio",
        amount: 12000000,
        description: "Crédito otorgado a Juan Pérez.",
        relatedType: "prestamo_socio",
        relatedId: memberLoans[0].id
      },
      {
        id: uid("mov"),
        date: addDaysISO(todayISO(), -41),
        type: "egreso",
        category: "Préstamo a socio",
        amount: 8500000,
        description: "Crédito otorgado a Carlos Benítez.",
        relatedType: "prestamo_socio",
        relatedId: memberLoans[1].id
      },
      {
        id: uid("mov"),
        date: addDaysISO(todayISO(), -30),
        type: "ingreso",
        category: "Pago de cuota de socio",
        amount: loanAInstallments[0].total,
        description: "Pago de primera cuota de Juan Pérez.",
        relatedType: "prestamo_socio",
        relatedId: memberLoans[0].id
      },
      {
        id: uid("mov"),
        date: addDaysISO(todayISO(), -6),
        type: "ingreso",
        category: "Servicio de maquinaria",
        amount: 900000,
        description: "Servicio de tractor a María Gómez.",
        relatedType: "maquinaria",
        relatedId: ""
      },
      {
        id: uid("mov"),
        date: addDaysISO(todayISO(), -44),
        type: "egreso",
        category: "Pago deuda general",
        amount: debtSchedule[0].total,
        description: "Primera cuota a Cooperativa Regional.",
        relatedType: "deuda_general",
        relatedId: committeeDebts[0].id
      }
    ],
    collectionActions: []
  });
}

function render() {
  const current = views.find((view) => view.id === ui.view) || views[0];
  document.title = `${current.label} - Cristo Rey`;
  const summaries = getGlobalSummary();
  document.getElementById("app").innerHTML = `
    <main class="main">
      ${renderTopbar(current, summaries)}
      <section class="view">${renderView()}</section>
    </main>
    ${renderFloatingMenu(current, summaries)}
  `;
  restoreFormDrafts();
}

function renderSidebar(current, summaries) {
  return `
    <div class="brand">
      <img src="assets/icon.svg" alt="">
      <div>
        <strong>${escapeHtml(state.settings.committeeName)}</strong>
        <span>${escapeHtml(state.settings.locality || "Cristo Rey")} · offline</span>
      </div>
    </div>
    <nav class="nav" aria-label="Modulos principales">
      ${viewGroups.map((group) => {
        const groupViews = views.filter((view) => view.group === group);
        return `
          <div class="nav-group">
            <span class="nav-group__label">${group}</span>
            ${groupViews.map((view) => `
              <button type="button" class="${view.id === current.id ? "active" : ""}" data-nav="${view.id}">
                <span class="nav__icon">${view.icon}</span>
                <span>${view.label}</span>
              </button>
            `).join("")}
          </div>
        `;
      }).join("")}
    </nav>
    <div class="sidebar__footer">
      <span>Saldo caja</span>
      <strong>${money(summaries.cashBalance)}</strong>
      <span>${summaries.overdueMembersCount} socios con mora</span>
    </div>
  `;
}

function renderTopbar(current, summaries) {
  return `
    <header class="topbar">
      <div class="topbar__identity">
        <img src="assets/icon.svg" alt="">
        <div class="topbar__title">
          <span class="eyebrow">${current.group}</span>
          <h1>${current.label}</h1>
          <p>${current.subtitle}</p>
        </div>
      </div>
      <div class="topbar__tools">
        <div class="status-strip">
          <span class="pill">${formatDate(todayISO())}</span>
          <span class="status status--info">${activeMembers().length} socios</span>
          <span class="status ${summaries.overdueTotal > 0 ? "status--overdue" : "status--paid"}">${money(summaries.overdueTotal)} en mora</span>
        </div>
      </div>
    </header>
  `;
}

function renderFloatingMenu(current, summaries) {
  return `
    <div class="floating-menu ${ui.menuOpen ? "is-open" : ""}">
      <button class="floating-menu__scrim" type="button" data-action="close-menu" aria-label="Cerrar menu"></button>
      <aside class="floating-menu__panel" aria-label="Menu de modulos">
        <div class="floating-menu__header">
          <div>
            <span class="eyebrow">Menu</span>
            <h2>${escapeHtml(state.settings.committeeName)}</h2>
            <p>${money(summaries.cashBalance)} en caja · ${summaries.overdueMembersCount} socios con mora</p>
          </div>
          <button class="icon-button" type="button" data-action="close-menu" aria-label="Cerrar">x</button>
        </div>
        <div class="floating-menu__actions">
          ${quickActions.map((action) => `<button class="${action.style}" type="button" data-nav="${action.target}">${escapeHtml(action.label)}</button>`).join("")}
        </div>
        <nav class="floating-menu__groups" aria-label="Modulos">
          ${viewGroups.map((group) => `
            <section>
              <span class="nav-group__label">${escapeHtml(group)}</span>
              <div class="floating-menu__list">
                ${views.filter((view) => view.group === group).map((view) => `
                  <button type="button" class="${view.id === current.id ? "active" : ""}" data-nav="${view.id}">
                    <span class="nav__icon">${escapeHtml(view.icon)}</span>
                    <span>
                      <strong>${escapeHtml(view.label)}</strong>
                      <small>${escapeHtml(view.subtitle)}</small>
                    </span>
                  </button>
                `).join("")}
              </div>
            </section>
          `).join("")}
        </nav>
      </aside>
      <button class="floating-menu__button" type="button" data-action="toggle-menu" aria-expanded="${ui.menuOpen ? "true" : "false"}">
        <span>${ui.menuOpen ? "Cerrar" : "Menu"}</span>
      </button>
    </div>
  `;
}

function renderView() {
  const renderers = {
    dashboard: renderHomeDashboard,
    socios: renderMembers,
    deuda: renderDebt,
    calculadora: renderCalculator,
    prestamos: renderLoans,
    calendario: renderCalendar,
    morosos: renderOverdue,
    maquinaria: renderMachinery,
    productos: renderProducts,
    caja: renderCash,
    reportes: renderReports,
    backup: renderBackup,
    config: renderConfig
  };
  return (renderers[ui.view] || renderDashboard)();
}

function renderDashboard() {
  const summary = getGlobalSummary();
  const debt = state.committeeDebts[0];
  const nextDebt = debt ? nextInstallment(debt.installments) : null;
  const upcomingCollections = getCalendarEvents()
    .filter((event) => event.kind === "loan" && daysBetween(todayISO(), event.date) >= 0)
    .sort(byDate)
    .slice(0, 5);
  const upcomingPayments = getCalendarEvents()
    .filter((event) => event.kind === "debt" && daysBetween(todayISO(), event.date) >= 0)
    .sort(byDate)
    .slice(0, 4);

  return `
    ${renderDashboardHero(summary, nextDebt)}
    <div class="grid grid--metrics">
      ${metric("Deuda general", money(summary.debtInitial), "Monto recibido por el comité", "blue")}
      ${metric("Pagado deuda", money(summary.debtPaid), `${percent(summary.debtPaid, summary.debtTotalToPay)} del total programado`, "green")}
      ${metric("Saldo pendiente", money(summary.debtPending), nextDebt ? `${daysLabel(nextDebt.dueDate)} para próxima cuota` : "Sin cuotas pendientes", summary.debtPending > 0 ? "amber" : "green")}
      ${metric("Caja disponible", money(summary.cashBalance), `${money(summary.monthIncome)} ingresos del mes`, summary.cashBalance >= 0 ? "green" : "red")}
      ${metric("Préstamos activos", summary.activeLoans, `${money(summary.memberLoanPrincipal)} prestado a socios`, "blue")}
      ${metric("Pendiente socios", money(summary.memberLoanPending), "Capital e intereses por cobrar", "amber")}
      ${metric("Total vencido", money(summary.overdueTotal), `${summary.overdueMembersCount} socios morosos`, summary.overdueTotal ? "red" : "green")}
      ${metric("Margen estimado", money(summary.estimatedMargin), "Interés socios menos costo deuda", summary.estimatedMargin >= 0 ? "green" : "red")}
    </div>

    <div class="grid grid--two">
      <section class="panel">
        <div class="panel__header">
          <div>
            <h2>Próximas cuotas a cobrar</h2>
            <p>Socios con vencimientos cercanos.</p>
          </div>
          <button class="ghost-button" type="button" data-nav="calendario">Ver calendario</button>
        </div>
        ${renderEventList(upcomingCollections, "No hay cuotas de socios próximas.")}
      </section>

      <section class="panel">
        <div class="panel__header">
          <div>
            <h2>Próximas cuotas a pagar</h2>
            <p>Compromisos de la deuda general.</p>
          </div>
          <button class="ghost-button" type="button" data-nav="deuda">Ver deuda</button>
        </div>
        ${renderEventList(upcomingPayments, "No hay pagos de deuda pendientes.")}
      </section>
    </div>

    <section class="panel">
      <div class="panel__header">
        <div>
          <h2>Estado rápido</h2>
          <p>Semáforo operativo del comité.</p>
        </div>
      </div>
      <div class="kpi-row">
        ${miniKpi("Pagos al día", summary.onTimeInstallments, "Verde")}
        ${miniKpi("Próximos 7 días", summary.soonInstallments, "Amarillo")}
        ${miniKpi("Atrasados", summary.overdueInstallments, "Rojo")}
        ${miniKpi("Ingresos menos egresos del mes", money(summary.monthIncome - summary.monthExpense), "Azul")}
      </div>
    </section>
  `;
}

function renderDashboardHero(summary, nextDebt) {
  return `
    <section class="dashboard-hero">
      <div class="dashboard-hero__copy">
        <span class="eyebrow">Panel operativo</span>
        <h2>${escapeHtml(state.settings.committeeName)}</h2>
        <p>Use este inicio para detectar mora, revisar caja y entrar rapido a las operaciones del dia.</p>
        <div class="hero-actions">
          <button class="button" type="button" data-nav="morosos">Revisar morosos</button>
          <button class="ghost-button" type="button" data-nav="calendario">Ver calendario</button>
          <button class="ghost-button" type="button" data-nav="reportes">Ver reportes</button>
        </div>
      </div>
      <div class="dashboard-hero__panel">
        <span class="mini-label">Caja disponible</span>
        <strong>${money(summary.cashBalance)}</strong>
        <span class="dashboard-hero__hint">${nextDebt ? `Proximo pago: ${formatDate(nextDebt.dueDate)} · ${money(nextDebt.total - nextDebt.paidAmount)}` : "Sin pagos generales pendientes"}</span>
      </div>
    </section>
  `;
}

function renderHomeDashboard() {
  const summary = getGlobalSummary();
  const debt = state.committeeDebts[0];
  const nextDebt = debt ? nextInstallment(debt.installments) : null;
  const upcomingCollections = getCalendarEvents()
    .filter((event) => event.kind === "loan" && daysBetween(todayISO(), event.date) >= 0)
    .sort(byDate)
    .slice(0, 5);
  const upcomingPayments = getCalendarEvents()
    .filter((event) => event.kind === "debt" && daysBetween(todayISO(), event.date) >= 0)
    .sort(byDate)
    .slice(0, 4);
  const alerts = getPriorityAlerts(summary, nextDebt, upcomingCollections, upcomingPayments);

  return `
    ${renderPolishedHomeHero(summary, nextDebt)}
    <section class="priority-board">
      <div class="section-heading">
        <div>
          <span class="eyebrow">Prioridad</span>
          <h2>Notificaciones importantes</h2>
        </div>
        <button class="ghost-button" type="button" data-nav="calendario">Ver agenda</button>
      </div>
      <div class="notification-grid">
        ${alerts.map(renderAlertCard).join("")}
      </div>
    </section>

    <section class="home-actions-panel">
      <div class="section-heading">
        <div>
          <span class="eyebrow">Acceso rapido</span>
          <h2>Operaciones frecuentes</h2>
        </div>
      </div>
      <div class="home-action-grid">
        ${homeActionCard("Cobranza", "Socios atrasados y registro de gestiones.", "morosos", "Revisar")}
        ${homeActionCard("Nuevo prestamo", "Cargar credito interno con cronograma.", "prestamos", "Abrir")}
        ${homeActionCard("Venta fiada", "Registrar productos vendidos a socios.", "productos", "Vender")}
        ${homeActionCard("Caja", "Ingresos, egresos y saldo disponible.", "caja", "Registrar")}
      </div>
    </section>

    <div class="grid grid--metrics compact-metrics">
      ${metric("Caja disponible", money(summary.cashBalance), `${money(summary.monthIncome)} ingresos del mes`, summary.cashBalance >= 0 ? "green" : "red")}
      ${metric("Total vencido", money(summary.overdueTotal), `${summary.overdueMembersCount} socios morosos`, summary.overdueTotal ? "red" : "green")}
      ${metric("Saldo deuda general", money(summary.debtPending), nextDebt ? `${daysLabel(nextDebt.dueDate)} para proxima cuota` : "Sin cuotas pendientes", summary.debtPending > 0 ? "amber" : "green")}
      ${metric("Margen estimado", money(summary.estimatedMargin), "Interes socios menos costo deuda", summary.estimatedMargin >= 0 ? "green" : "red")}
    </div>

    <div class="grid grid--two home-followup">
      <section class="panel panel--quiet">
        <div class="panel__header">
          <div>
            <h2>Proximas cuotas a cobrar</h2>
            <p>Socios con vencimientos cercanos.</p>
          </div>
          <button class="ghost-button" type="button" data-nav="calendario">Ver calendario</button>
        </div>
        ${renderEventList(upcomingCollections, "No hay cuotas de socios proximas.")}
      </section>

      <section class="panel panel--quiet">
        <div class="panel__header">
          <div>
            <h2>Proximas cuotas a pagar</h2>
            <p>Compromisos de la deuda general.</p>
          </div>
          <button class="ghost-button" type="button" data-nav="deuda">Ver deuda</button>
        </div>
        ${renderEventList(upcomingPayments, "No hay pagos de deuda pendientes.")}
      </section>
    </div>
  `;
}

function renderPolishedHomeHero(summary, nextDebt) {
  return `
    <section class="home-hero">
      <div class="home-hero__copy">
        <span class="eyebrow">Inicio operativo</span>
        <h2>${escapeHtml(state.settings.committeeName)}</h2>
        <p>Una portada simple para decidir que atender primero: caja, mora, proximos pagos y operaciones del dia.</p>
        <div class="home-hero__stats">
          ${miniKpi("Caja", money(summary.cashBalance), "Disponible")}
          ${miniKpi("Mora", money(summary.overdueTotal), `${summary.overdueMembersCount} socios`)}
          ${miniKpi("Prestamos", summary.activeLoans, "Activos")}
        </div>
      </div>
      <div class="home-hero__next">
        <span class="mini-label">Siguiente paso</span>
        <strong>${summary.overdueTotal > 0 ? "Cobranza" : "Control diario"}</strong>
        <p>${summary.overdueTotal > 0 ? `${money(summary.overdueTotal)} vencidos para revisar hoy.` : nextDebt ? `Proximo pago: ${formatDate(nextDebt.dueDate)} - ${money(nextDebt.total - nextDebt.paidAmount)}` : "Sin pagos generales pendientes."}</p>
        <button class="button" type="button" data-nav="${summary.overdueTotal > 0 ? "morosos" : "calendario"}">${summary.overdueTotal > 0 ? "Revisar mora" : "Ver agenda"}</button>
      </div>
    </section>
  `;
}

function getPriorityAlerts(summary, nextDebt, upcomingCollections, upcomingPayments) {
  const stockLow = state.products.filter((product) => Number(product.stock) <= Number(product.minStock)).length;
  const nextCollection = upcomingCollections[0];
  const nextPayment = upcomingPayments[0] || nextDebt;
  const alerts = [];

  if (summary.overdueTotal > 0) {
    alerts.push({
      tone: "red",
      title: "Cobranza pendiente",
      detail: `${summary.overdueMembersCount} socio(s) con ${money(summary.overdueTotal)} vencidos.`,
      target: "morosos",
      action: "Gestionar"
    });
  }

  if (nextPayment) {
    const amount = nextPayment.amount || Math.max(0, nextPayment.total - nextPayment.paidAmount);
    const dueDate = nextPayment.date || nextPayment.dueDate;
    alerts.push({
      tone: daysBetween(todayISO(), dueDate) <= 7 ? "amber" : "blue",
      title: "Pago general",
      detail: `${money(amount)} vence ${formatDate(dueDate)}.`,
      target: "deuda",
      action: "Ver deuda"
    });
  }

  if (nextCollection) {
    alerts.push({
      tone: "blue",
      title: "Cobro proximo",
      detail: `${nextCollection.title} - ${money(nextCollection.amount)} ${daysLabel(nextCollection.date)}.`,
      target: "calendario",
      action: "Agenda"
    });
  }

  if (stockLow > 0) {
    alerts.push({
      tone: "amber",
      title: "Stock bajo",
      detail: `${stockLow} producto(s) necesitan reposicion.`,
      target: "productos",
      action: "Revisar"
    });
  }

  if (!alerts.length) {
    alerts.push({
      tone: "green",
      title: "Todo bajo control",
      detail: "No hay alertas criticas para este momento.",
      target: "reportes",
      action: "Reportes"
    });
  }

  return alerts.slice(0, 4);
}

function renderAlertCard(alert) {
  return `
    <article class="notification-card tone-${escapeAttr(alert.tone)}">
      <span>${escapeHtml(alert.title)}</span>
      <p>${escapeHtml(alert.detail)}</p>
      <button class="ghost-button" type="button" data-nav="${escapeAttr(alert.target)}">${escapeHtml(alert.action)}</button>
    </article>
  `;
}

function homeActionCard(title, detail, target, action) {
  return `
    <button class="home-action-card" type="button" data-nav="${escapeAttr(target)}">
      <strong>${escapeHtml(title)}</strong>
      <span>${escapeHtml(detail)}</span>
      <em>${escapeHtml(action)}</em>
    </button>
  `;
}

function renderMembers() {
  const filtered = activeMembers().filter((member) => {
    const text = `${member.name} ${member.document} ${member.phone}`.toLowerCase();
    return text.includes(ui.search.toLowerCase());
  });
  const selected = activeMembers().find((member) => member.id === (ui.selectedMemberId || filtered[0]?.id));
  ui.selectedMemberId = selected?.id || null;
  const totalMemberDebt = sumArray(filtered.map((member) => memberTotalPending(member.id)));
  const membersWithDebt = filtered.filter((member) => memberTotalPending(member.id) > 0).length;

  return `
    <div class="insight-strip">
      ${insightCard("Socios activos", filtered.length, "Registros visibles")}
      ${insightCard("Con saldo", membersWithDebt, "Socios con deuda activa")}
      ${insightCard("Deuda socios", money(totalMemberDebt), "Prestamos, ventas y servicios")}
      ${insightCard("Seleccionado", selected?.name || "Sin socio", "Detalle a la derecha")}
    </div>

    ${collapsiblePanel("Registrar socio", "Datos personales, estado y referencia familiar.", `
      <form class="form-grid" data-form="member">
        ${field("Nombre completo", "name", "text", "", true)}
        ${field("Número de cédula", "document", "text", "", true)}
        ${field("Teléfono", "phone", "tel", "", true)}
        ${field("Dirección o compañía", "address", "text")}
        ${field("Fecha de ingreso", "joinDate", "date", todayISO())}
        <label class="field">Estado
          <select name="status">
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="suspendido">Suspendido</option>
          </select>
        </label>
        ${field("Referencia familiar", "reference", "text")}
        <label class="field field--wide">Observaciones
          <textarea name="notes"></textarea>
        </label>
        <div class="field field--wide">
          <button class="button" type="submit">Crear socio</button>
        </div>
      </form>
    `)}

    <div class="grid grid--two">
      <section class="panel">
        <div class="panel__header">
          <div>
            <h2>Socios registrados</h2>
            <p>Buscar por nombre, cédula o teléfono.</p>
          </div>
        </div>
        <label class="field">
          <span class="sr-only">Buscar socio</span>
          <input type="search" value="${escapeAttr(ui.search)}" data-search placeholder="Buscar socio">
        </label>
        <div class="list" style="margin-top: 12px;">
          ${filtered.length ? filtered.map((member) => renderMemberRow(member)).join("") : empty("No hay socios con ese filtro.")}
        </div>
      </section>
      <section class="panel">
        <div class="panel__header">
          <div>
            <h2>Estado financiero del socio</h2>
            <p>Préstamos, pagos, servicios y compras.</p>
          </div>
        </div>
        ${selected ? renderMemberDetail(selected) : empty("Seleccione o registre un socio.")}
      </section>
    </div>
  `;
}

function renderMemberRow(member) {
  const totalDebt = memberTotalPending(member.id);
  const hasOverdue = memberOverdueTotal(member.id) > 0;
  return `
    <div class="list-item">
      <div>
        <strong>${escapeHtml(member.name)}</strong>
        <div class="list-item__meta">${escapeHtml(member.document)} · ${escapeHtml(member.phone)} · ${escapeHtml(member.status)}</div>
      </div>
      <div class="toolbar">
        <span class="status ${hasOverdue ? "status--overdue" : "status--paid"}">${money(totalDebt)}</span>
        ${actionMenu([
          menuButton("ghost-button", "Ver detalle", `data-action="select-member" data-id="${member.id}"`),
          menuButton("danger-button", "Eliminar socio", `data-action="member-delete-modal" data-member-id="${member.id}"`)
        ])}
      </div>
    </div>
  `;
}

function renderMemberDetail(member) {
  const loans = state.memberLoans.filter((loan) => loan.memberId === member.id);
  const services = state.machineryServices.filter((service) => service.memberId === member.id);
  const sales = state.sales.filter((sale) => sale.memberId === member.id);
  const overdue = memberOverdueTotal(member.id);

  return `
    <div class="detail-stack">
      <div class="person-card">
        <div class="avatar">${initials(member.name)}</div>
        <strong>${escapeHtml(member.name)}</strong>
        <div class="list-item__meta">${escapeHtml(member.address || "Sin dirección")}</div>
        <p class="list-item__meta">${escapeHtml(member.reference || "Sin referencia familiar")}</p>
        <span class="status ${member.status === "activo" ? "status--paid" : "status--soon"}">${escapeHtml(member.status)}</span>
        <div class="toolbar person-card__actions">
          ${actionMenu([
            menuButton("ghost-button", "Eliminar deuda", `data-action="member-debt-modal" data-member-id="${member.id}"`),
            menuButton("danger-button", "Eliminar socio", `data-action="member-delete-modal" data-member-id="${member.id}"`)
          ], "Mas opciones")}
        </div>
      </div>
      <div class="grid">
        <div class="kpi-row">
          ${miniKpi("Deuda total", money(memberTotalPending(member.id)), "Préstamos y ventas fiadas")}
          ${miniKpi("Cuotas vencidas", money(overdue), overdue ? "Requiere seguimiento" : "Al día")}
          ${miniKpi("Préstamos", loans.length, "Historial crediticio")}
          ${miniKpi("Servicios", services.length, "Maquinaria usada")}
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Concepto</th><th>Detalle</th><th>Saldo</th></tr></thead>
            <tbody>
              ${loans.map((loan) => `<tr><td>Préstamo</td><td>${escapeHtml(loan.purpose)} · ${formatDate(loan.date)}${isLoanArchived(loan) ? " · deuda eliminada" : ""}</td><td>${isLoanArchived(loan) ? "Historial" : money(loanPending(loan))}</td></tr>`).join("")}
              ${services.map((service) => {
                const pending = serviceDebtPending(service);
                const status = isServiceDebtArchived(service) ? "Historial" : service.paymentStatus === "pagado" ? "Pagado" : money(pending);
                return `<tr><td>Maquinaria</td><td>${escapeHtml(service.machineType)} · ${formatDate(service.date)}${isServiceDebtArchived(service) ? " · deuda eliminada" : ""}</td><td>${status}</td></tr>`;
              }).join("")}
              ${sales.map((sale) => {
                const pending = saleDebtPending(sale);
                return `<tr><td>Venta</td><td>${escapeHtml(productName(sale.productId))} · ${formatDate(sale.date)}${isSaleDebtArchived(sale) ? " · deuda eliminada" : ""}</td><td>${isSaleDebtArchived(sale) ? "Historial" : money(pending)}</td></tr>`;
              }).join("")}
              ${!loans.length && !services.length && !sales.length ? `<tr><td colspan="3">Sin historial todavía.</td></tr>` : ""}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function renderDebt() {
  const debts = state.committeeDebts;
  const debtTotal = sumArray(debts.map((debt) => scheduledTotal(debt.installments)));
  const debtPaid = sumArray(debts.map((debt) => paidTotal(debt.installments)));
  const debtPending = Math.max(0, debtTotal - debtPaid);
  return `
    <div class="insight-strip">
      ${insightCard("Deudas cargadas", debts.length, "Registros generales")}
      ${insightCard("Total programado", money(debtTotal), "Capital e intereses")}
      ${insightCard("Pagado", money(debtPaid), percent(debtPaid, debtTotal))}
      ${insightCard("Saldo", money(debtPending), debtPending ? "Pendiente de pago" : "Sin saldo")}
    </div>

    ${debts.length ? debts.map(renderDebtDetail).join("") : empty("Aún no se cargó una deuda general.")}

    ${collapsiblePanel("Nueva deuda general", "Cargue las condiciones del prestamo grande tomado por el comite.", `
      <form class="form-grid" data-form="debt">
        ${field("Entidad financiera", "entity", "text", "", true)}
        ${field("Monto recibido", "amount", "number", "", true)}
        ${field("Fecha de desembolso", "disbursementDate", "date", todayISO(), true)}
        ${field("Tasa de interés", "rate", "number", state.settings.defaultDebtAnnualRate, true)}
        ${selectField("Tipo de interés", "rateType", [["anual", "Anual"], ["mensual", "Mensual"], ["fijo", "Fijo"]])}
        ${field("Cantidad de cuotas", "installmentsCount", "number", 36, true)}
        ${selectField("Frecuencia", "frequency", [["mensual", "Mensual"], ["trimestral", "Trimestral"], ["semestral", "Semestral"], ["anual", "Anual"]])}
        ${field("Primer vencimiento", "firstDueDate", "date", addMonthsISO(todayISO(), 1), true)}
        ${selectField("Sistema de pago", "system", Object.entries(paymentSystems).map(([value, label]) => [value, label]))}
        ${field("Gastos administrativos", "adminFees", "number", 0)}
        ${field("Seguro u otros cargos", "insurance", "number", 0)}
        ${field("Cuota manual", "manualAmount", "number", 0)}
        <label class="field field--wide">Observaciones
          <textarea name="notes"></textarea>
        </label>
        <div class="field field--wide">
          <button class="button" type="submit">Crear deuda general</button>
        </div>
      </form>
    `)}
  `;
}

function renderDebtDetail(debt) {
  const paid = paidTotal(debt.installments);
  const total = scheduledTotal(debt.installments);
  const pending = total - paid;
  const next = nextInstallment(debt.installments);
  return `
    <section class="panel">
      <div class="panel__header">
        <div>
          <h2>${escapeHtml(debt.entity)}</h2>
          <p>${money(debt.amount)} · ${debt.rate}% ${debt.rateType} · ${paymentSystems[debt.system]}</p>
        </div>
        <div class="toolbar">
          <span class="status ${pending > 0 ? "status--soon" : "status--paid"}">${pending > 0 ? money(pending) : "Pagado"}</span>
          ${actionMenu([
            menuButton("danger-button", "Eliminar registro", `data-action="debt-delete-modal" data-debt-id="${debt.id}"`)
          ])}
        </div>
      </div>
      <div class="kpi-row">
        ${miniKpi("Total programado", money(total), "Capital e interés")}
        ${miniKpi("Pagado", money(paid), percent(paid, total))}
        ${miniKpi("Saldo pendiente", money(pending), next ? daysLabel(next.dueDate) : "Sin vencimientos")}
        ${miniKpi("Interés total", money(sum(debt.installments, "interest")), "Costo financiero")}
      </div>
      <div class="progress" aria-label="Avance de pago"><span style="width:${Math.min(100, Number(percentNumber(paid, total)))}%"></span></div>
      ${renderScheduleTable(debt.installments, "debt", debt.id)}
    </section>
  `;
}

function renderCalculator() {
  const inputs = ui.calculatorInputs || {};
  const result = ui.calculatorResult;
  return `
    <section class="panel">
      <div class="panel__header">
        <div>
          <h2>Calculadora de cuotas</h2>
          <p>Simule cuota, interés total y saldo mes a mes antes de guardar.</p>
        </div>
      </div>
      <form class="form-grid" data-form="calculator">
        ${field("Monto", "amount", "number", inputs.amount || 100000000, true)}
        ${field("Interés", "rate", "number", inputs.rate || state.settings.defaultDebtAnnualRate, true)}
        ${selectField("Tipo de interés", "rateType", [["anual", "Anual"], ["mensual", "Mensual"], ["fijo", "Fijo"]], inputs.rateType || "anual")}
        ${field("Cantidad de cuotas", "installmentsCount", "number", inputs.installmentsCount || 36, true)}
        ${selectField("Frecuencia", "frequency", [["mensual", "Mensual"], ["trimestral", "Trimestral"], ["semestral", "Semestral"], ["anual", "Anual"]], inputs.frequency || "mensual")}
        ${field("Primer vencimiento", "firstDueDate", "date", inputs.firstDueDate || addMonthsISO(todayISO(), 1), true)}
        ${selectField("Sistema", "system", Object.entries(paymentSystems).map(([value, label]) => [value, label]), inputs.system || "cuota_fija")}
        ${field("Cuota manual", "manualAmount", "number", inputs.manualAmount || 0)}
        <div class="field">
          <button class="button" type="submit">Calcular</button>
        </div>
      </form>
    </section>
    ${result ? renderCalculatorResult(result) : ""}
  `;
}

function renderCalculatorResult(result) {
  const total = scheduledTotal(result.schedule);
  const interest = sum(result.schedule, "interest");
  return `
    <section class="panel">
      <div class="panel__header">
        <div>
          <h2>Resultado de simulación</h2>
          <p>Cuota aproximada: ${money(result.schedule[0]?.total || 0)}</p>
        </div>
      </div>
      <div class="kpi-row">
        ${miniKpi("Total a pagar", money(total), "Capital e intereses")}
        ${miniKpi("Total intereses", money(interest), "Costo del crédito")}
        ${miniKpi("Capital amortizado", money(sum(result.schedule, "principal")), "Monto base")}
        ${miniKpi("Último vencimiento", formatDate(result.schedule.at(-1)?.dueDate), "Calendario generado")}
      </div>
      ${renderSchedulePreview(result.schedule)}
    </section>
  `;
}

function renderLoans() {
  const activeLoans = state.memberLoans.filter((loan) => !isLoanArchived(loan));
  const pending = sumArray(activeLoans.map(loanPending));
  const overdue = sumArray(activeLoans.map(loanOverdueTotal));
  return `
    <div class="insight-strip">
      ${insightCard("Prestamos activos", activeLoans.length, "Con saldo o seguimiento")}
      ${insightCard("Pendiente", money(pending), "Total por cobrar")}
      ${insightCard("En mora", money(overdue), overdue ? "Requiere gestion" : "Al dia")}
      ${insightCard("Historial", state.memberLoans.length, "Prestamos registrados")}
    </div>

    ${collapsiblePanel("Nuevo prestamo a socio", "Simule y apruebe creditos internos con la tasa definida por el comite.", `
      <form class="form-grid" data-form="loan">
        ${selectField("Socio beneficiario", "memberId", activeMembers().map((member) => [member.id, member.name]))}
        ${field("Monto prestado", "amount", "number", "", true)}
        ${field("Fecha del préstamo", "date", "date", todayISO(), true)}
        ${field("Tasa de interés", "rate", "number", state.settings.defaultMemberAnnualRate, true)}
        ${selectField("Tipo de interés", "rateType", [["anual", "Anual"], ["mensual", "Mensual"], ["fijo", "Fijo"]])}
        ${field("Cantidad de cuotas", "installmentsCount", "number", 12, true)}
        ${selectField("Frecuencia", "frequency", [["mensual", "Mensual"], ["trimestral", "Trimestral"], ["semestral", "Semestral"], ["anual", "Anual"]])}
        ${field("Primer vencimiento", "firstDueDate", "date", addMonthsISO(todayISO(), 1), true)}
        ${selectField("Sistema", "system", Object.entries(paymentSystems).map(([value, label]) => [value, label]))}
        ${selectField("Destino", "purpose", [["Producción agrícola", "Producción agrícola"], ["Compra de semillas", "Compra de semillas"], ["Fertilizantes", "Fertilizantes"], ["Insumos", "Insumos"], ["Emergencia familiar", "Emergencia familiar"], ["Otro", "Otro"]])}
        ${field("Garantía", "guarantee", "text")}
        ${field("Cuota manual", "manualAmount", "number", 0)}
        <label class="field field--wide">Observaciones
          <textarea name="notes"></textarea>
        </label>
        <div class="field field--wide">
          <button class="button" type="submit">Aprobar préstamo</button>
        </div>
      </form>
    `)}
    <section class="panel">
      <div class="panel__header">
        <div>
          <h2>Préstamos vigentes</h2>
          <p>Saldo, mora, historial de pagos y utilidad estimada.</p>
        </div>
      </div>
      ${state.memberLoans.length ? state.memberLoans.map(renderLoanDetail).join("") : empty("Todavía no hay préstamos a socios.")}
    </section>
  `;
}

function renderLoanDetail(loan) {
  const member = memberById(loan.memberId);
  const pending = loanPending(loan);
  const rawPending = rawLoanPending(loan);
  const overdue = loanOverdueTotal(loan);
  const interest = sum(loan.installments, "interest");
  const paid = paidTotal(loan.installments);
  const archived = isLoanArchived(loan);
  return `
    <div class="list-item">
      <div>
        <strong>${escapeHtml(member?.name || "Socio eliminado")}</strong>
        <div class="list-item__meta">${escapeHtml(loan.purpose)} · ${money(loan.amount)} · ${loan.rate}% ${loan.rateType}${archived ? ` · deuda eliminada ${formatDate(loan.archivedDebtAt)}` : ""}</div>
      </div>
      <div class="toolbar">
        <span class="status ${archived ? "status--info" : overdue ? "status--overdue" : "status--paid"}">${overdue ? "En mora" : loanStatus(loan)}</span>
        ${actionMenu([
          menuButton("ghost-button", ui.selectedLoanId === loan.id ? "Ocultar detalle" : "Ver detalle", `data-action="toggle-loan" data-id="${loan.id}"`),
          !archived && rawPending > 0 ? menuButton("danger-button", "Eliminar deuda", `data-action="loan-archive-modal" data-loan-id="${loan.id}"`) : ""
        ])}
      </div>
    </div>
    ${ui.selectedLoanId === loan.id ? `
      <div class="inline-detail">
        <div class="kpi-row">
          ${miniKpi("Pendiente", archived ? "0 Gs" : money(pending), archived ? `Historial conservado: ${money(rawPending)}` : "Saldo por cobrar")}
          ${miniKpi("Vencido", archived ? "0 Gs" : money(overdue), archived ? "Sin mora activa" : overdue ? "Requiere gestión" : "Al día")}
          ${miniKpi("Pagado", money(paid), percent(paid, scheduledTotal(loan.installments)))}
          ${miniKpi("Interés estimado", money(interest), "Ingreso financiero")}
        </div>
        ${archived ? `<div class="notice warning" style="margin-top: 12px;">Esta deuda fue eliminada de los saldos activos para pruebas. Las cuotas, pagos y datos originales siguen disponibles para consulta.</div>` : ""}
        ${renderScheduleTable(loan.installments, "loan", loan.id, !archived)}
      </div>
    ` : ""}
  `;
}

function renderCalendar() {
  const events = filterCalendarEvents(getCalendarEvents(), ui.calendarRange);
  const grouped = groupBy(events.sort(byDate), "date");
  return `
    <section class="panel">
      <div class="panel__header">
        <div>
          <h2>Agenda de pagos y servicios</h2>
          <p>Vista diaria, semanal o mensual de actividades económicas.</p>
        </div>
        <div class="tabs">
          ${["day", "week", "month"].map((range) => `<button type="button" class="${ui.calendarRange === range ? "active" : ""}" data-action="calendar-range" data-range="${range}">${rangeLabel(range)}</button>`).join("")}
        </div>
      </div>
      <div class="calendar-list">
        ${Object.keys(grouped).length ? Object.entries(grouped).map(([date, dayEvents]) => `
          <div class="calendar-day">
            <div class="calendar-day__date">${formatDate(date)}</div>
            <div>${dayEvents.map(renderCalendarEvent).join("")}</div>
          </div>
        `).join("") : empty("No hay eventos para esta vista.")}
      </div>
    </section>
  `;
}

function renderCalendarEvent(event) {
  return `
    <div class="calendar-event">
      <div>
        <strong>${escapeHtml(event.title)}</strong>
        <div class="list-item__meta">${escapeHtml(event.detail)}</div>
      </div>
      <span class="status ${statusClass(event.status)}">${money(event.amount)}</span>
    </div>
  `;
}

function renderOverdue() {
  const overdueLoans = state.memberLoans
    .filter((loan) => !isLoanArchived(loan))
    .flatMap((loan) => loan.installments
      .filter((installment) => installmentStatus(installment) === "atrasado")
      .map((installment) => ({ loan, installment })));

  return `
    <section class="panel">
      <div class="panel__header">
        <div>
          <h2>Socios con cuotas vencidas</h2>
          <p>Control de atrasos, pagos parciales y promesas de pago.</p>
        </div>
      </div>
      ${overdueLoans.length ? `
        <div class="table-wrap">
          <table>
            <thead><tr><th>Socio</th><th>Monto vencido</th><th>Días</th><th>Último pago</th><th>Acciones</th></tr></thead>
            <tbody>
              ${overdueLoans.map(({ loan, installment }) => {
                const member = memberById(loan.memberId);
                const lastPayment = loan.payments.at(-1);
                return `<tr>
                  <td><strong>${escapeHtml(member?.name || "Socio")}</strong><br><span class="list-item__meta">${escapeHtml(member?.phone || "")}</span></td>
                  <td>${money(installment.total - installment.paidAmount)}<br><span class="list-item__meta">${installment.number} de ${loan.installments.length}</span></td>
                  <td>${Math.max(0, daysBetween(installment.dueDate, todayISO()))}</td>
                  <td>${lastPayment ? `${formatDate(lastPayment.date)} · ${money(lastPayment.amount)}` : "Sin pagos"}</td>
                  <td class="toolbar">
                    ${actionMenu([
                      menuButton("ghost-button", "Registrar pago", `data-action="loan-payment" data-loan-id="${loan.id}" data-installment-id="${installment.id}"`),
                      menuButton("ghost-button", "Gestion", `data-action="collection-modal" data-loan-id="${loan.id}" data-member-id="${loan.memberId}"`)
                    ])}
                  </td>
                </tr>`;
              }).join("")}
            </tbody>
          </table>
        </div>
      ` : empty("No hay cuotas vencidas de socios.")}
    </section>
    <section class="panel">
      <div class="panel__header">
        <div>
          <h2>Historial de gestión de cobranza</h2>
          <p>Contactos, respuestas y promesas de pago.</p>
        </div>
      </div>
      ${state.collectionActions.length ? `
        <div class="table-wrap">
          <table>
            <thead><tr><th>Fecha</th><th>Socio</th><th>Habló</th><th>Respuesta</th><th>Promesa</th></tr></thead>
            <tbody>
              ${state.collectionActions.map((action) => `<tr>
                <td>${formatDate(action.date)}</td>
                <td>${escapeHtml(memberById(action.memberId)?.name || "Socio")}</td>
                <td>${escapeHtml(action.contactBy)}</td>
                <td>${escapeHtml(action.response)}<br><span class="list-item__meta">${escapeHtml(action.notes || "")}</span></td>
                <td>${action.promiseDate ? formatDate(action.promiseDate) : "Sin fecha"}</td>
              </tr>`).join("")}
            </tbody>
          </table>
        </div>
      ` : empty("Aún no se registraron gestiones de cobranza.")}
    </section>
  `;
}

function renderMachinery() {
  const machineryIncome = sumArray(state.machineryServices.map((service) => service.total));
  const machineryCost = sumArray(state.machineryServices.map((service) => Number(service.fuelCost) + Number(service.maintenanceCost)));
  const pendingServices = sumArray(state.machineryServices.map(serviceDebtPending));
  return `
    <div class="insight-strip">
      ${insightCard("Servicios", state.machineryServices.length, "Trabajos registrados")}
      ${insightCard("Facturado", money(machineryIncome), "Total historico")}
      ${insightCard("Utilidad", money(machineryIncome - machineryCost), "Facturado menos costos")}
      ${insightCard("Pendiente", money(pendingServices), "Por cobrar")}
    </div>

    ${collapsiblePanel("Registrar servicio de maquinaria", "Controle horas, hectareas, combustible, mantenimiento y cobro.", `
      <form class="form-grid" data-form="machinery">
        ${selectField("Socio o cliente", "memberId", [["", "Cliente externo"], ...activeMembers().map((member) => [member.id, member.name])])}
        ${field("Nombre cliente externo", "clientName", "text")}
        ${selectField("Tipo de maquinaria", "machineType", [["Tractor", "Tractor"], ["Rastra", "Rastra"], ["Sembradora", "Sembradora"], ["Pulverizadora", "Pulverizadora"], ["Cosechadora", "Cosechadora"], ["Otra", "Otra"]])}
        ${field("Fecha del servicio", "date", "date", todayISO(), true)}
        ${field("Lugar del trabajo", "location", "text")}
        ${field("Horas", "hours", "number", 0)}
        ${field("Hectáreas", "hectares", "number", 0)}
        ${selectField("Cobro por", "priceMode", [["hora", "Hora"], ["hectarea", "Hectárea"], ["manual", "Manual"]])}
        ${field("Precio unitario", "unitPrice", "number", 0)}
        ${field("Operador", "operator", "text")}
        ${field("Combustible utilizado", "fuelLiters", "number", 0)}
        ${field("Costo combustible", "fuelCost", "number", 0)}
        ${field("Mantenimiento", "maintenanceCost", "number", 0)}
        ${field("Total manual", "manualTotal", "number", 0)}
        ${selectField("Estado de pago", "paymentStatus", [["pendiente", "Pendiente"], ["pagado", "Pagado"], ["parcial", "Parcial"], ["fiado", "Fiado"]])}
        <label class="field field--wide">Observaciones
          <textarea name="notes"></textarea>
        </label>
        <div class="field field--wide">
          <button class="button" type="submit">Registrar servicio</button>
        </div>
      </form>
    `)}
    <section class="panel">
      <div class="panel__header">
        <div>
          <h2>Historial de maquinaria</h2>
          <p>Servicios realizados y programados.</p>
        </div>
      </div>
      ${state.machineryServices.length ? `
        <div class="table-wrap">
          <table>
            <thead><tr><th>Fecha</th><th>Cliente</th><th>Maquinaria</th><th>Total</th><th>Utilidad</th><th>Estado</th></tr></thead>
            <tbody>
              ${state.machineryServices.map((service) => {
                const archived = isServiceDebtArchived(service);
                return `<tr>
                  <td>${formatDate(service.date)}</td>
                  <td>${escapeHtml(service.clientName)}</td>
                  <td>${escapeHtml(service.machineType)}<br><span class="list-item__meta">${service.hours} h · ${service.hectares} ha</span></td>
                  <td>${money(service.total)}</td>
                  <td>${money(service.total - service.fuelCost - service.maintenanceCost)}</td>
                  <td class="toolbar">
                    <span class="status ${archived ? "status--info" : service.paymentStatus === "pagado" ? "status--paid" : "status--soon"}">${archived ? "deuda eliminada" : escapeHtml(service.paymentStatus)}</span>
                    ${!archived && service.paymentStatus !== "pagado" ? actionMenu([
                      menuButton("ghost-button", "Cobrar", `data-action="pay-service" data-id="${service.id}"`)
                    ]) : ""}
                  </td>
                </tr>`;
              }).join("")}
            </tbody>
          </table>
        </div>
      ` : empty("No hay servicios registrados.")}
    </section>
  `;
}

function renderProducts() {
  const stockLow = state.products.filter((product) => Number(product.stock) <= Number(product.minStock)).length;
  const salesTotal = sumArray(state.sales.map((sale) => sale.total));
  const salesPending = sumArray(state.sales.map(saleDebtPending));
  return `
    <div class="insight-strip">
      ${insightCard("Productos", state.products.length, "Items cargados")}
      ${insightCard("Stock bajo", stockLow, "Revisar reposicion")}
      ${insightCard("Ventas", money(salesTotal), "Total historico")}
      ${insightCard("Fiado pendiente", money(salesPending), "Por cobrar")}
    </div>

    <div class="grid grid--two">
      ${collapsiblePanel("Registrar producto", "Stock, precios y alerta de minimo.", `
        <form class="form-grid" data-form="product">
          ${field("Nombre", "name", "text", "", true)}
          ${selectField("Categoría", "category", [["Semillas", "Semillas"], ["Fertilizantes", "Fertilizantes"], ["Defensivos agrícolas", "Defensivos agrícolas"], ["Herramientas", "Herramientas"], ["Balanceados", "Balanceados"], ["Productos del comité", "Productos del comité"], ["Otros insumos", "Otros insumos"]])}
          ${selectField("Unidad", "unit", [["Bolsa", "Bolsa"], ["Kilo", "Kilo"], ["Litro", "Litro"], ["Unidad", "Unidad"], ["Caja", "Caja"]])}
          ${field("Precio compra", "buyPrice", "number", 0)}
          ${field("Precio venta", "salePrice", "number", 0)}
          ${field("Stock actual", "stock", "number", 0)}
          ${field("Stock mínimo", "minStock", "number", 0)}
          ${field("Proveedor", "supplier", "text")}
          ${field("Vencimiento", "expiryDate", "date")}
          <div class="field field--wide">
            <button class="button" type="submit">Guardar producto</button>
          </div>
        </form>
      `)}
      ${collapsiblePanel("Registrar venta", "Ventas al contado o fiadas a socios.", `
        <form class="form-grid" data-form="sale">
          ${selectField("Producto", "productId", state.products.map((product) => [product.id, `${product.name} (${product.stock} ${product.unit})`]))}
          ${selectField("Socio", "memberId", [["", "Cliente externo"], ...activeMembers().map((member) => [member.id, member.name])])}
          ${field("Nombre externo", "clientName", "text")}
          ${field("Cantidad", "quantity", "number", 1)}
          ${field("Fecha", "date", "date", todayISO())}
          ${field("Precio unitario", "unitPrice", "number", 0)}
          ${field("Descuento", "discount", "number", 0)}
          ${selectField("Tipo de venta", "paymentType", [["contado", "Contado"], ["fiado", "Fiado al socio"], ["parcial", "Parcial"]])}
          ${field("Monto cobrado", "paidAmount", "number", 0)}
          <div class="field field--wide">
            <button class="button" type="submit">Registrar venta</button>
          </div>
        </form>
      `)}
    </div>
    <section class="panel">
      <div class="panel__header">
        <div>
          <h2>Productos en stock</h2>
          <p>Control de existencia y ganancia por producto.</p>
        </div>
      </div>
      ${state.products.length ? `
        <div class="table-wrap">
          <table>
            <thead><tr><th>Producto</th><th>Categoría</th><th>Stock</th><th>Precio venta</th><th>Ganancia unitaria</th></tr></thead>
            <tbody>
              ${state.products.map((product) => `<tr>
                <td><strong>${escapeHtml(product.name)}</strong><br><span class="list-item__meta">${escapeHtml(product.supplier || "Sin proveedor")}</span></td>
                <td>${escapeHtml(product.category)}</td>
                <td><span class="status ${Number(product.stock) <= Number(product.minStock) ? "status--overdue" : "status--paid"}">${product.stock} ${escapeHtml(product.unit)}</span></td>
                <td>${money(product.salePrice)}</td>
                <td>${money(product.salePrice - product.buyPrice)}</td>
              </tr>`).join("")}
            </tbody>
          </table>
        </div>
      ` : empty("No hay productos cargados.")}
    </section>
    <section class="panel">
      <div class="panel__header">
        <div>
          <h2>Ventas realizadas</h2>
          <p>Contado, parcial y fiado.</p>
        </div>
      </div>
      ${state.sales.length ? `
        <div class="table-wrap">
          <table>
            <thead><tr><th>Fecha</th><th>Cliente</th><th>Producto</th><th>Total</th><th>Estado</th></tr></thead>
            <tbody>
              ${state.sales.map((sale) => {
                const archived = isSaleDebtArchived(sale);
                return `<tr>
                  <td>${formatDate(sale.date)}</td>
                  <td>${escapeHtml(sale.clientName)}</td>
                  <td>${escapeHtml(productName(sale.productId))}<br><span class="list-item__meta">${sale.quantity} unidad(es)</span></td>
                  <td>${money(sale.total)}</td>
                  <td class="toolbar">
                    <span class="status ${archived ? "status--info" : sale.status === "pagado" ? "status--paid" : "status--soon"}">${archived ? "deuda eliminada" : escapeHtml(sale.status)}</span>
                    ${!archived && sale.status !== "pagado" ? actionMenu([
                      menuButton("ghost-button", "Cobrar", `data-action="pay-sale" data-id="${sale.id}"`)
                    ]) : ""}
                  </td>
                </tr>`;
              }).join("")}
            </tbody>
          </table>
        </div>
      ` : empty("Aún no hay ventas registradas.")}
    </section>
  `;
}

function renderCash() {
  const income = state.cashMovements.filter((movement) => movement.type === "ingreso");
  const expense = state.cashMovements.filter((movement) => movement.type === "egreso");
  const incomeTotal = sumArray(income.map((movement) => movement.amount));
  const expenseTotal = sumArray(expense.map((movement) => movement.amount));
  return `
    <div class="insight-strip">
      ${insightCard("Ingresos", money(incomeTotal), "Total historico")}
      ${insightCard("Egresos", money(expenseTotal), "Total historico")}
      ${insightCard("Saldo caja", money(cashBalance()), "Disponible")}
      ${insightCard("Movimientos", state.cashMovements.length, "Registros")}
    </div>

    ${collapsiblePanel("Movimiento de caja", "Registrar ingresos, egresos y asociarlos a operaciones.", `
      <form class="form-grid" data-form="cash">
        ${field("Fecha", "date", "date", todayISO())}
        ${selectField("Tipo", "type", [["ingreso", "Ingreso"], ["egreso", "Egreso"]])}
        ${selectField("Categoría", "category", [
          ["Pago de cuotas de socios", "Pago de cuotas de socios"],
          ["Intereses cobrados", "Intereses cobrados"],
          ["Servicios de maquinaria", "Servicios de maquinaria"],
          ["Venta de productos", "Venta de productos"],
          ["Aportes de socios", "Aportes de socios"],
          ["Donaciones", "Donaciones"],
          ["Pago de deuda general", "Pago de deuda general"],
          ["Compra de productos", "Compra de productos"],
          ["Combustible", "Combustible"],
          ["Mantenimiento de maquinaria", "Mantenimiento de maquinaria"],
          ["Gastos administrativos", "Gastos administrativos"],
          ["Honorarios", "Honorarios"],
          ["Viáticos", "Viáticos"],
          ["Gastos de reunión", "Gastos de reunión"],
          ["Otros", "Otros"]
        ])}
        ${field("Monto", "amount", "number", "", true)}
        <label class="field field--wide">Descripción
          <textarea name="description"></textarea>
        </label>
        <div class="field field--wide">
          <button class="button" type="submit">Registrar movimiento</button>
        </div>
      </form>
    `)}
    <section class="panel">
      <div class="panel__header">
        <div>
          <h2>Historial de caja</h2>
          <p>Saldo actual: ${money(cashBalance())}</p>
        </div>
      </div>
      <div class="kpi-row">
        ${miniKpi("Ingresos", money(incomeTotal), "Total histórico")}
        ${miniKpi("Egresos", money(expenseTotal), "Total histórico")}
        ${miniKpi("Saldo caja", money(cashBalance()), "Disponible")}
        ${miniKpi("Movimientos", state.cashMovements.length, "Registros")}
      </div>
      <div class="table-wrap" style="margin-top: 14px;">
        <table>
          <thead><tr><th>Fecha</th><th>Tipo</th><th>Categoría</th><th>Descripción</th><th>Monto</th></tr></thead>
          <tbody>
            ${state.cashMovements.slice().sort((a, b) => b.date.localeCompare(a.date)).map((movement) => `<tr>
              <td>${formatDate(movement.date)}</td>
              <td><span class="status ${movement.type === "ingreso" ? "status--paid" : "status--soon"}">${escapeHtml(movement.type)}</span></td>
              <td>${escapeHtml(movement.category)}</td>
              <td>${escapeHtml(movement.description || "")}</td>
              <td>${money(movement.amount)}</td>
            </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderReports() {
  const summary = getGlobalSummary();
  const machineryIncome = sumArray(state.machineryServices.map((service) => service.total));
  const machineryCost = sumArray(state.machineryServices.map((service) => Number(service.fuelCost) + Number(service.maintenanceCost)));
  const salesTotal = sumArray(state.sales.map((sale) => sale.total));
  const salesCost = sumArray(state.sales.map((sale) => Number(sale.buyPrice) * Number(sale.quantity)));
  const stockLow = state.products.filter((product) => Number(product.stock) <= Number(product.minStock)).length;
  return `
    <div class="grid grid--three">
      ${reportPanel("Reporte financiero general", [
        ["Total ingresado", money(summary.totalIncome)],
        ["Total egresado", money(summary.totalExpense)],
        ["Saldo actual", money(summary.cashBalance)],
        ["Total prestado", money(summary.memberLoanPrincipal)],
        ["Total vencido", money(summary.overdueTotal)],
        ["Intereses ganados estimados", money(summary.memberInterest)]
      ])}
      ${reportPanel("Reporte de préstamos", [
        ["Activos", summary.activeLoans],
        ["Pagados", state.memberLoans.filter((loan) => !isLoanArchived(loan) && loanStatus(loan) === "pagado").length],
        ["En mora", state.memberLoans.filter((loan) => !isLoanArchived(loan) && loanOverdueTotal(loan) > 0).length],
        ["Capital pendiente", money(summary.memberLoanPending)],
        ["Interés pendiente", money(summary.memberInterestPending)],
        ["Socios con mayor deuda", topDebtorName()]
      ])}
      ${reportPanel("Reporte deuda general", [
        ["Monto inicial", money(summary.debtInitial)],
        ["Pagos realizados", money(summary.debtPaid)],
        ["Saldo pendiente", money(summary.debtPending)],
        ["Próxima cuota", summary.nextDebtPayment ? money(summary.nextDebtPayment.total - summary.nextDebtPayment.paidAmount) : "Sin cuota"],
        ["Días restantes", summary.nextDebtPayment ? daysBetween(todayISO(), summary.nextDebtPayment.dueDate) : "0"],
        ["Avance de pago", percent(summary.debtPaid, summary.debtTotalToPay)]
      ])}
      ${reportPanel("Reporte de maquinaria", [
        ["Servicios realizados", state.machineryServices.length],
        ["Ingresos", money(machineryIncome)],
        ["Combustible y mantenimiento", money(machineryCost)],
        ["Utilidad neta", money(machineryIncome - machineryCost)],
        ["Máquina más utilizada", mostUsedMachine()],
        ["Pendiente de cobro", money(sumArray(state.machineryServices.map(serviceDebtPending)))]
      ])}
      ${reportPanel("Reporte de ventas", [
        ["Ventas totales", money(salesTotal)],
        ["Ganancia estimada", money(salesTotal - salesCost)],
        ["Productos más vendidos", topProductName()],
        ["Stock bajo", stockLow],
        ["Ventas fiadas pendientes", money(sumArray(state.sales.map(saleDebtPending)))],
        ["Productos cargados", state.products.length]
      ])}
      ${reportPanel("Margen financiero", [
        ["Costo dinero comité", money(summary.debtInterest)],
        ["Interés cobrado socios", money(summary.memberInterest)],
        ["Ganancia estimada", money(summary.estimatedMargin)],
        ["Riesgo por mora", money(summary.overdueTotal)],
        ["Capital recuperado", money(summary.memberLoanPaid)],
        ["Capital disponible", money(summary.cashBalance)]
      ])}
    </div>
  `;
}

function renderBackup() {
  return `
    <section class="panel">
      <div class="panel__header">
        <div>
          <h2>Backup local</h2>
          <p>El archivo incluye socios, préstamos, pagos, deuda general, maquinaria, ventas, productos, caja y configuración.</p>
        </div>
      </div>
      <div class="notice">
        Los datos se guardan localmente en este navegador/dispositivo. Para Android, instale la PWA o empaquete este proyecto con Capacitor y mantenga una rutina de respaldo externa.
      </div>
      <div class="toolbar" style="margin-top: 14px;">
        <button class="button" type="button" data-action="export-backup">Crear backup manual</button>
        <label class="ghost-button">
          Restaurar desde archivo
          <input class="sr-only" type="file" accept="application/json,.json" data-restore-file>
        </label>
        <button class="ghost-button" type="button" data-action="restore-demo">Cargar datos de ejemplo</button>
        <button class="danger-button" type="button" data-action="clear-data">Borrar datos locales</button>
      </div>
      <div class="kpi-row" style="margin-top: 14px;">
        ${miniKpi("Último backup", state.audit.lastBackupAt ? formatDate(state.audit.lastBackupAt) : "Sin registro", "Manual")}
        ${miniKpi("Frecuencia", state.settings.backupFrequency, "Configurable")}
        ${miniKpi("Registros", totalRecords(), "Elementos guardados")}
        ${miniKpi("Archivo sugerido", backupFilename(), "JSON")}
      </div>
    </section>
  `;
}

function renderConfig() {
  return `
    <section class="panel">
      <div class="panel__header">
        <div>
          <h2>Configuración general</h2>
          <p>Tasas por defecto, nombre del comité y preferencias de respaldo.</p>
        </div>
      </div>
      <form class="form-grid" data-form="settings">
        ${field("Nombre del comité", "committeeName", "text", state.settings.committeeName, true)}
        ${field("Localidad", "locality", "text", state.settings.locality)}
        ${field("Interés deuda general anual", "defaultDebtAnnualRate", "number", state.settings.defaultDebtAnnualRate)}
        ${field("Interés socio anual", "defaultMemberAnnualRate", "number", state.settings.defaultMemberAnnualRate)}
        ${field("Mora mensual sugerida", "lateFeeMonthlyRate", "number", state.settings.lateFeeMonthlyRate)}
        ${selectField("Backup automático", "backupFrequency", [["manual", "Manual"], ["diario", "Diario"], ["semanal", "Semanal"], ["mensual", "Mensual"]], state.settings.backupFrequency)}
        <div class="field field--wide">
          <button class="button" type="submit">Guardar configuración</button>
        </div>
      </form>
    </section>
  `;
}

function metric(label, value, hint, tone) {
  return `
    <article class="metric">
      <div class="metric__label"><span>${label}</span><span class="swatch ${tone}"></span></div>
      <div class="metric__value">${value}</div>
      <div class="metric__hint">${hint}</div>
    </article>
  `;
}

function miniKpi(label, value, hint) {
  return `<div class="mini-kpi"><span>${label}</span><strong>${value}</strong><span>${hint}</span></div>`;
}

function insightCard(label, value, hint) {
  return `
    <article class="insight-card">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <small>${escapeHtml(hint)}</small>
    </article>
  `;
}

function collapsiblePanel(title, description, content, open = false) {
  return `
    <details class="panel fold-panel" ${open ? "open" : ""}>
      <summary class="fold-panel__summary">
        <span>
          <strong>${escapeHtml(title)}</strong>
          <small>${escapeHtml(description)}</small>
        </span>
        <em>Desplegar</em>
      </summary>
      <div class="fold-panel__content">${content}</div>
    </details>
  `;
}

function actionMenu(items, label = "Acciones") {
  return `
    <details class="action-menu">
      <summary>${escapeHtml(label)}</summary>
      <div class="action-menu__panel">
        ${items.filter(Boolean).join("")}
      </div>
    </details>
  `;
}

function menuButton(className, text, attrs = "") {
  return `<button class="${escapeAttr(className)}" type="button" ${attrs}>${escapeHtml(text)}</button>`;
}

function loadFormDrafts() {
  try {
    return JSON.parse(localStorage.getItem(FORM_DRAFT_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveFormDrafts(drafts) {
  localStorage.setItem(FORM_DRAFT_KEY, JSON.stringify(drafts));
}

function formDraftKey(form) {
  const contextNames = ["kind", "itemId", "installmentId", "memberId", "loanId"];
  const context = contextNames
    .map((name) => {
      const field = form.querySelector(`input[type="hidden"][name="${name}"]`);
      return field ? `${name}:${field.value}` : "";
    })
    .filter(Boolean)
    .join("|");
  return `${ui.view}:${form.dataset.form}${context ? `:${context}` : ""}`;
}

function formDraftData(form) {
  const data = {};
  for (const field of form.elements) {
    if (!field.name || field.type === "file" || field.disabled) continue;
    if ((field.type === "checkbox" || field.type === "radio") && !field.checked) continue;
    data[field.name] = field.value;
  }
  return data;
}

function draftHasUserContent(data) {
  return Object.entries(data).some(([name, value]) => {
    if (["kind", "itemId", "installmentId", "memberId", "loanId"].includes(name)) return false;
    return String(value || "").trim() !== "";
  });
}

function saveFormDraft(form) {
  const key = formDraftKey(form);
  const data = formDraftData(form);
  const drafts = loadFormDrafts();

  if (draftHasUserContent(data)) {
    drafts[key] = {
      savedAt: new Date().toISOString(),
      data
    };
  } else {
    delete drafts[key];
  }

  saveFormDrafts(drafts);
  markDraftNotice(form, drafts[key] ? "Borrador guardado automaticamente." : "");
}

function restoreFormDrafts(root = document) {
  const drafts = loadFormDrafts();
  root.querySelectorAll("form[data-form]").forEach((form) => {
    const draft = drafts[formDraftKey(form)];
    if (!draft?.data) return;

    Object.entries(draft.data).forEach(([name, value]) => {
      const field = form.elements.namedItem(name);
      if (!field) return;
      if (typeof RadioNodeList !== "undefined" && field instanceof RadioNodeList) {
        [...field].forEach((item) => {
          if (item.value === value) item.checked = true;
        });
        return;
      }
      if (field.type === "checkbox") {
        field.checked = value === "on" || value === "true";
        return;
      }
      field.value = value;
    });

    markDraftNotice(form, "Borrador restaurado. Puede continuar donde quedo o enviar el formulario.");
  });
}

function markDraftNotice(form, message) {
  let notice = form.querySelector("[data-draft-notice]");
  if (!message) {
    notice?.remove();
    return;
  }

  if (!notice) {
    notice = document.createElement("div");
    notice.className = "draft-notice field--wide";
    notice.dataset.draftNotice = "true";
    form.prepend(notice);
  }

  notice.textContent = message;
}

function clearFormDraftByKey(key) {
  const drafts = loadFormDrafts();
  delete drafts[key];
  saveFormDrafts(drafts);
}

function hasFormDrafts(root = document) {
  const drafts = loadFormDrafts();
  if (!root || root === document) return Object.keys(drafts).length > 0;
  return [...root.querySelectorAll("form[data-form]")].some((form) => Boolean(drafts[formDraftKey(form)]));
}

function confirmLeavingDrafts(root = document) {
  if (!hasFormDrafts(root)) return true;
  return confirm("Hay datos cargados en un formulario. Se guardaron como borrador para no perderlos. Desea salir de esta pantalla?");
}

function reportPanel(title, rows) {
  return `
    <section class="panel">
      <div class="panel__header"><h2>${title}</h2></div>
      <table>
        <tbody>
          ${rows.map(([label, value]) => `<tr><td>${label}</td><td><strong>${value}</strong></td></tr>`).join("")}
        </tbody>
      </table>
    </section>
  `;
}

function renderEventList(events, emptyText) {
  return events.length ? `<div class="list">${events.map((event) => `
    <div class="list-item">
      <div>
        <strong>${escapeHtml(event.title)}</strong>
        <div class="list-item__meta">${formatDate(event.date)} · ${escapeHtml(event.detail)}</div>
      </div>
      <span class="status ${statusClass(event.status)}">${money(event.amount)}</span>
    </div>
  `).join("")}</div>` : empty(emptyText);
}

function renderScheduleTable(schedule, kind, ownerId, actionsEnabled = true) {
  return `
    <div class="table-wrap" style="margin-top:14px;">
      <table>
        <thead><tr><th>Nro.</th><th>Vencimiento</th><th>Capital</th><th>Interés</th><th>Cuota</th><th>Pagado</th><th>Estado</th><th>Acción</th></tr></thead>
        <tbody>
          ${schedule.map((installment) => {
            const status = installmentStatus(installment);
            const pending = Math.max(0, installment.total - installment.paidAmount);
            return `<tr>
              <td>${installment.number}</td>
              <td>${formatDate(installment.dueDate)}</td>
              <td>${money(installment.principal)}</td>
              <td>${money(installment.interest)}</td>
              <td>${money(installment.total)}</td>
              <td>${money(installment.paidAmount)}</td>
              <td><span class="status ${statusClass(status)}">${status}</span></td>
              <td>${actionsEnabled && pending > 0 ? `<button class="ghost-button" type="button" data-action="${kind}-payment" data-${kind}-id="${ownerId}" data-installment-id="${installment.id}">Pagar</button>` : ""}</td>
            </tr>`;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderSchedulePreview(schedule) {
  return `
    <div class="table-wrap" style="margin-top:14px;">
      <table>
        <thead><tr><th>Nro.</th><th>Vencimiento</th><th>Capital</th><th>Interés</th><th>Cuota</th><th>Saldo</th></tr></thead>
        <tbody>
          ${schedule.map((installment) => `<tr>
            <td>${installment.number}</td>
            <td>${formatDate(installment.dueDate)}</td>
            <td>${money(installment.principal)}</td>
            <td>${money(installment.interest)}</td>
            <td>${money(installment.total)}</td>
            <td>${money(installment.balance)}</td>
          </tr>`).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function field(label, name, type = "text", value = "", required = false) {
  return `
    <label class="field">${label}
      <input name="${name}" type="${type}" value="${escapeAttr(value ?? "")}" ${required ? "required" : ""}>
    </label>
  `;
}

function selectField(label, name, options, selected = "") {
  return `
    <label class="field">${label}
      <select name="${name}">
        ${options.map(([value, text]) => `<option value="${escapeAttr(value)}" ${String(value) === String(selected) ? "selected" : ""}>${escapeHtml(text)}</option>`).join("")}
      </select>
    </label>
  `;
}

function empty(text) {
  return `<div class="empty-state">${escapeHtml(text)}</div>`;
}

function handleClick(event) {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.nav) {
    if (!confirmLeavingDrafts()) return;
    ui.view = button.dataset.nav;
    ui.menuOpen = false;
    render();
    return;
  }

  const action = button.dataset.action;
  if (!action) return;

  if (action === "toggle-menu") {
    ui.menuOpen = !ui.menuOpen;
    render();
    return;
  }

  if (action === "close-menu") {
    ui.menuOpen = false;
    render();
    return;
  }

  if (action === "select-member") {
    ui.selectedMemberId = button.dataset.id;
    render();
  }

  if (action === "toggle-loan") {
    ui.selectedLoanId = ui.selectedLoanId === button.dataset.id ? null : button.dataset.id;
    render();
  }

  if (action === "calendar-range") {
    ui.calendarRange = button.dataset.range;
    render();
  }

  if (action === "loan-payment") {
    openPaymentModal("loan", button.dataset.loanId, button.dataset.installmentId);
  }

  if (action === "debt-payment") {
    openPaymentModal("debt", button.dataset.debtId, button.dataset.installmentId);
  }

  if (action === "collection-modal") {
    openCollectionModal(button.dataset.memberId, button.dataset.loanId);
  }

  if (action === "member-delete-modal") {
    openMemberDeleteModal(button.dataset.memberId);
  }

  if (action === "member-debt-modal") {
    openMemberDebtModal(button.dataset.memberId);
  }

  if (action === "loan-archive-modal") {
    openLoanArchiveModal(button.dataset.loanId);
  }

  if (action === "debt-delete-modal") {
    openDebtDeleteModal(button.dataset.debtId);
  }

  if (action === "pay-service") {
    markServicePaid(button.dataset.id);
  }

  if (action === "pay-sale") {
    markSalePaid(button.dataset.id);
  }

  if (action === "export-backup") {
    exportBackup();
  }

  if (action === "restore-demo") {
    openConfirmModal(
      "Cargar datos de ejemplo",
      "Se reemplazarán los datos actuales por registros de demostración.",
      "confirm-restore"
    );
  }

  if (action === "clear-data") {
    openConfirmModal(
      "Borrar datos locales",
      "Se eliminarán todos los registros guardados en este dispositivo.",
      "confirm-clear"
    );
  }

  if (action === "confirm-restore") {
    state = seedState();
    saveState();
    button.closest("dialog")?.close();
    render();
  }

  if (action === "confirm-clear") {
    state = normalizeState({});
    saveState();
    button.closest("dialog")?.close();
    render();
  }

  if (action === "confirm-delete-member") {
    archiveMember(button.dataset.memberId, false);
    button.closest("dialog")?.close();
    afterMutation("socios");
  }

  if (action === "confirm-delete-member-with-debt") {
    archiveMember(button.dataset.memberId, true);
    button.closest("dialog")?.close();
    afterMutation("socios");
  }

  if (action === "confirm-member-debt") {
    archiveMemberDebts(button.dataset.memberId, "Deuda eliminada manualmente durante pruebas.");
    button.closest("dialog")?.close();
    afterMutation("socios");
  }

  if (action === "confirm-loan-archive") {
    archiveLoanDebt(button.dataset.loanId, "Deuda eliminada manualmente durante pruebas.");
    button.closest("dialog")?.close();
    afterMutation("prestamos");
  }

  if (action === "confirm-delete-debt") {
    deleteCommitteeDebt(button.dataset.debtId);
    button.closest("dialog")?.close();
    afterMutation("deuda");
  }

  if (action === "close-modal") {
    if (!confirmLeavingDrafts(button.closest("dialog"))) return;
    button.closest("dialog")?.close();
  }
}

function handleInput(event) {
  const form = event.target.closest("form[data-form]");
  if (form) {
    saveFormDraft(form);
  }

  if (event.target.matches("[data-search]")) {
    ui.search = event.target.value;
    render();
  }
}

function handleChange(event) {
  const form = event.target.closest("form[data-form]");
  if (form) {
    saveFormDraft(form);
  }

  if (event.target.matches("[data-restore-file]")) {
    const file = event.target.files?.[0];
    if (file) restoreBackup(file);
  }
}

function handleBeforeUnload(event) {
  if (!hasFormDrafts()) return;
  event.preventDefault();
  event.returnValue = "";
}

function handleSubmit(event) {
  const form = event.target.closest("form[data-form]");
  if (!form) return;
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form).entries());
  const draftKey = formDraftKey(form);
  clearFormDraftByKey(draftKey);
  const handlers = {
    member: submitMember,
    debt: submitDebt,
    calculator: submitCalculator,
    loan: submitLoan,
    payment: submitPayment,
    collection: submitCollection,
    machinery: submitMachinery,
    product: submitProduct,
    sale: submitSale,
    cash: submitCash,
    settings: submitSettings
  };
  const result = handlers[form.dataset.form]?.(data, form);
  if (result === false) {
    saveFormDraft(form);
  }
}

function submitMember(data) {
  state.members.unshift({
    id: uid("soc"),
    name: clean(data.name),
    document: clean(data.document),
    phone: clean(data.phone),
    address: clean(data.address),
    joinDate: data.joinDate || todayISO(),
    status: data.status || "activo",
    reference: clean(data.reference),
    notes: clean(data.notes)
  });
  afterMutation("socios");
}

function submitDebt(data) {
  const amount = num(data.amount);
  const schedule = generateSchedule({
    amount,
    rate: num(data.rate),
    rateType: data.rateType,
    installmentsCount: num(data.installmentsCount),
    frequency: data.frequency,
    firstDueDate: data.firstDueDate,
    system: data.system,
    manualAmount: num(data.manualAmount)
  });
  const debt = {
    id: uid("deu"),
    entity: clean(data.entity),
    amount,
    disbursementDate: data.disbursementDate || todayISO(),
    rate: num(data.rate),
    rateType: data.rateType,
    term: num(data.installmentsCount),
    installmentsCount: num(data.installmentsCount),
    frequency: data.frequency,
    firstDueDate: data.firstDueDate,
    system: data.system,
    adminFees: num(data.adminFees),
    insurance: num(data.insurance),
    notes: clean(data.notes),
    installments: schedule,
    payments: []
  };
  state.committeeDebts.unshift(debt);
  addMovement("ingreso", "Desembolso deuda general", amount, `Desembolso de ${debt.entity}`, "deuda_general", debt.id, debt.disbursementDate);
  afterMutation("deuda");
}

function submitCalculator(data) {
  const inputs = {
    amount: num(data.amount),
    rate: num(data.rate),
    rateType: data.rateType,
    installmentsCount: num(data.installmentsCount),
    frequency: data.frequency,
    firstDueDate: data.firstDueDate,
    system: data.system,
    manualAmount: num(data.manualAmount)
  };
  ui.calculatorInputs = inputs;
  ui.calculatorResult = {
    inputs,
    schedule: generateSchedule(inputs)
  };
  render();
}

function submitLoan(data) {
  if (!data.memberId) {
    alert("Debe seleccionar un socio.");
    return false;
  }
  const amount = num(data.amount);
  const member = memberById(data.memberId);
  const schedule = generateSchedule({
    amount,
    rate: num(data.rate),
    rateType: data.rateType,
    installmentsCount: num(data.installmentsCount),
    frequency: data.frequency,
    firstDueDate: data.firstDueDate,
    system: data.system,
    manualAmount: num(data.manualAmount)
  });
  const loan = {
    id: uid("pre"),
    memberId: data.memberId,
    amount,
    date: data.date || todayISO(),
    rate: num(data.rate),
    rateType: data.rateType,
    term: num(data.installmentsCount),
    installmentsCount: num(data.installmentsCount),
    frequency: data.frequency,
    firstDueDate: data.firstDueDate,
    system: data.system,
    guarantee: clean(data.guarantee),
    purpose: data.purpose,
    status: "activo",
    notes: clean(data.notes),
    installments: schedule,
    payments: []
  };
  state.memberLoans.unshift(loan);
  addMovement("egreso", "Préstamo a socio", amount, `Crédito otorgado a ${member?.name || "socio"}`, "prestamo_socio", loan.id, loan.date);
  afterMutation("prestamos");
}

function submitPayment(data, form) {
  const kind = data.kind;
  const item = kind === "loan"
    ? state.memberLoans.find((loan) => loan.id === data.itemId)
    : state.committeeDebts.find((debt) => debt.id === data.itemId);
  if (!item) return false;
  if (kind === "loan" && isLoanArchived(item)) return false;
  const installment = item.installments.find((row) => row.id === data.installmentId);
  if (!installment) return false;
  const amount = Math.min(num(data.amount), Math.max(0, installment.total - installment.paidAmount));
  installment.paidAmount = roundGs(installment.paidAmount + amount);
  item.payments.push({ id: uid("pag"), date: data.date || todayISO(), amount, note: clean(data.note), installmentId: installment.id });
  if (kind === "loan") {
    const member = memberById(item.memberId);
    addMovement("ingreso", "Pago de cuota de socio", amount, `Pago de ${member?.name || "socio"} - cuota ${installment.number}`, "prestamo_socio", item.id, data.date);
  } else {
    addMovement("egreso", "Pago deuda general", amount, `Pago a ${item.entity} - cuota ${installment.number}`, "deuda_general", item.id, data.date);
  }
  form.closest("dialog")?.close();
  afterMutation();
}

function submitCollection(data, form) {
  state.collectionActions.unshift({
    id: uid("cob"),
    memberId: data.memberId,
    loanId: data.loanId,
    date: data.date || todayISO(),
    contactBy: clean(data.contactBy),
    response: clean(data.response),
    promiseDate: data.promiseDate || "",
    notes: clean(data.notes)
  });
  form.closest("dialog")?.close();
  afterMutation("morosos");
}

function submitMachinery(data) {
  const member = memberById(data.memberId);
  const hours = num(data.hours);
  const hectares = num(data.hectares);
  const unitPrice = num(data.unitPrice);
  const total = data.priceMode === "hora"
    ? hours * unitPrice
    : data.priceMode === "hectarea"
      ? hectares * unitPrice
      : num(data.manualTotal);
  const service = {
    id: uid("maq"),
    memberId: data.memberId || "",
    clientName: member?.name || clean(data.clientName) || "Cliente externo",
    machineType: data.machineType,
    date: data.date || todayISO(),
    location: clean(data.location),
    hours,
    hectares,
    priceMode: data.priceMode,
    unitPrice,
    operator: clean(data.operator),
    fuelLiters: num(data.fuelLiters),
    fuelCost: num(data.fuelCost),
    maintenanceCost: num(data.maintenanceCost),
    total: roundGs(total),
    paymentStatus: data.paymentStatus,
    notes: clean(data.notes)
  };
  state.machineryServices.unshift(service);
  if (service.paymentStatus === "pagado") {
    addMovement("ingreso", "Servicio de maquinaria", service.total, `Servicio de ${service.machineType} a ${service.clientName}`, "maquinaria", service.id, service.date);
  }
  if (service.fuelCost > 0) addMovement("egreso", "Combustible", service.fuelCost, `Combustible para ${service.machineType}`, "maquinaria", service.id, service.date);
  if (service.maintenanceCost > 0) addMovement("egreso", "Mantenimiento de maquinaria", service.maintenanceCost, `Mantenimiento asociado a ${service.machineType}`, "maquinaria", service.id, service.date);
  afterMutation("maquinaria");
}

function submitProduct(data) {
  state.products.unshift({
    id: uid("pro"),
    name: clean(data.name),
    category: data.category,
    unit: data.unit,
    buyPrice: num(data.buyPrice),
    salePrice: num(data.salePrice),
    stock: num(data.stock),
    minStock: num(data.minStock),
    supplier: clean(data.supplier),
    expiryDate: data.expiryDate || ""
  });
  if (num(data.buyPrice) * num(data.stock) > 0) {
    addMovement("egreso", "Compra de productos", num(data.buyPrice) * num(data.stock), `Carga inicial de ${data.name}`, "producto", "", todayISO());
  }
  afterMutation("productos");
}

function submitSale(data) {
  const product = state.products.find((item) => item.id === data.productId);
  if (!product) return false;
  const quantity = num(data.quantity);
  if (quantity > Number(product.stock)) {
    alert("No hay stock suficiente para esta venta.");
    return false;
  }
  const member = memberById(data.memberId);
  const unitPrice = num(data.unitPrice) || Number(product.salePrice);
  const discount = num(data.discount);
  const total = Math.max(0, quantity * unitPrice - discount);
  const paidAmount = data.paymentType === "contado" ? total : Math.min(num(data.paidAmount), total);
  const sale = {
    id: uid("ven"),
    productId: product.id,
    memberId: data.memberId || "",
    clientName: member?.name || clean(data.clientName) || "Cliente externo",
    quantity,
    date: data.date || todayISO(),
    unitPrice,
    buyPrice: Number(product.buyPrice),
    discount,
    total,
    paidAmount,
    paymentType: data.paymentType,
    status: paidAmount >= total ? "pagado" : "pendiente"
  };
  product.stock = Number(product.stock) - quantity;
  state.sales.unshift(sale);
  if (paidAmount > 0) {
    addMovement("ingreso", "Venta de productos", paidAmount, `Venta de ${product.name} a ${sale.clientName}`, "venta", sale.id, sale.date);
  }
  afterMutation("productos");
}

function submitCash(data) {
  addMovement(data.type, data.category, num(data.amount), clean(data.description), "manual", "", data.date || todayISO());
  afterMutation("caja");
}

function submitSettings(data) {
  state.settings = {
    ...state.settings,
    committeeName: clean(data.committeeName),
    locality: clean(data.locality),
    defaultDebtAnnualRate: num(data.defaultDebtAnnualRate),
    defaultMemberAnnualRate: num(data.defaultMemberAnnualRate),
    lateFeeMonthlyRate: num(data.lateFeeMonthlyRate),
    backupFrequency: data.backupFrequency
  };
  afterMutation("config");
}

function openPaymentModal(kind, itemId, installmentId) {
  const item = kind === "loan"
    ? state.memberLoans.find((loan) => loan.id === itemId)
    : state.committeeDebts.find((debt) => debt.id === itemId);
  const installment = item?.installments.find((row) => row.id === installmentId);
  if (!item || !installment) return;
  if (kind === "loan" && isLoanArchived(item)) {
    openModal("Deuda eliminada", `<div class="notice warning">Esta deuda ya fue eliminada de los saldos activos. El historial queda disponible solo para consulta.</div>`);
    return;
  }
  const pending = Math.max(0, installment.total - installment.paidAmount);
  const title = kind === "loan" ? "Registrar pago de socio" : "Registrar pago de deuda general";
  openModal(title, `
    <form class="form-grid" data-form="payment">
      <input type="hidden" name="kind" value="${kind}">
      <input type="hidden" name="itemId" value="${itemId}">
      <input type="hidden" name="installmentId" value="${installmentId}">
      ${field("Fecha de pago", "date", "date", todayISO())}
      ${field("Monto", "amount", "number", pending)}
      ${field("Saldo de la cuota", "pending", "text", money(pending))}
      <label class="field field--wide">Observación
        <textarea name="note"></textarea>
      </label>
      <div class="field field--wide">
        <button class="button" type="submit">Guardar pago</button>
      </div>
    </form>
  `);
}

function openCollectionModal(memberId, loanId) {
  openModal("Gestión de cobranza", `
    <form class="form-grid" data-form="collection">
      <input type="hidden" name="memberId" value="${memberId}">
      <input type="hidden" name="loanId" value="${loanId}">
      ${field("Fecha de contacto", "date", "date", todayISO())}
      ${field("Quién habló", "contactBy", "text", "", true)}
      ${field("Promesa de pago", "promiseDate", "date")}
      <label class="field field--wide">Respuesta del socio
        <textarea name="response" required></textarea>
      </label>
      <label class="field field--wide">Observaciones
        <textarea name="notes"></textarea>
      </label>
      <div class="field field--wide">
        <button class="button" type="submit">Guardar gestión</button>
      </div>
    </form>
  `);
}

function openMemberDeleteModal(memberId) {
  const member = memberById(memberId);
  if (!member) return;
  const pending = memberTotalPending(memberId);
  openModal("Eliminar socio", `
    <div class="notice warning">
      El socio ${escapeHtml(member.name)} se ocultara de las listas activas, pero su historial quedara disponible en prestamos, ventas, servicios y reportes. Tambien puede eliminar su deuda activa para pruebas sin borrar los movimientos existentes.
    </div>
    <div class="kpi-row" style="margin-top: 14px;">
      ${miniKpi("Deuda activa", money(pending), pending ? "Puede conservarse o eliminarse" : "Sin saldo activo")}
      ${miniKpi("Historial", "Conservado", "No se borran cuotas ni pagos")}
    </div>
    <div class="toolbar" style="margin-top: 14px;">
      <button class="danger-button" type="button" data-action="confirm-delete-member-with-debt" data-member-id="${memberId}">Eliminar socio y deuda</button>
      <button class="ghost-button" type="button" data-action="confirm-delete-member" data-member-id="${memberId}">Eliminar solo socio</button>
      <button class="ghost-button" type="button" data-action="close-modal">Cancelar</button>
    </div>
  `);
}

function openMemberDebtModal(memberId) {
  const member = memberById(memberId);
  if (!member) return;
  const pending = memberTotalPending(memberId);
  openModal("Eliminar deuda del socio", `
    <div class="notice warning">
      Esta accion deja en cero la deuda activa de ${escapeHtml(member.name)} y mantiene intacto el historial para futuras consultas. Es util para pruebas y correcciones de carga.
    </div>
    <div class="kpi-row" style="margin-top: 14px;">
      ${miniKpi("Saldo a quitar", money(pending), "Prestamos, ventas fiadas y servicios pendientes")}
      ${miniKpi("Historial", "Conservado", "Cuotas, pagos y operaciones siguen visibles")}
    </div>
    <div class="toolbar" style="margin-top: 14px;">
      <button class="danger-button" type="button" data-action="confirm-member-debt" data-member-id="${memberId}" ${pending <= 0 ? "disabled" : ""}>Eliminar deuda activa</button>
      <button class="ghost-button" type="button" data-action="close-modal">Cancelar</button>
    </div>
  `);
}

function openLoanArchiveModal(loanId) {
  const loan = state.memberLoans.find((item) => item.id === loanId);
  if (!loan) return;
  const member = memberById(loan.memberId);
  const pending = rawLoanPending(loan);
  openModal("Eliminar deuda del prestamo", `
    <div class="notice warning">
      Se quitara el saldo activo de este prestamo de ${escapeHtml(member?.name || "socio")}. El cronograma y los pagos registrados seguiran disponibles como historial.
    </div>
    <div class="kpi-row" style="margin-top: 14px;">
      ${miniKpi("Saldo a quitar", money(pending), escapeHtml(loan.purpose))}
      ${miniKpi("Historial", "Conservado", "No se borran cuotas")}
    </div>
    <div class="toolbar" style="margin-top: 14px;">
      <button class="danger-button" type="button" data-action="confirm-loan-archive" data-loan-id="${loanId}" ${pending <= 0 ? "disabled" : ""}>Eliminar deuda</button>
      <button class="ghost-button" type="button" data-action="close-modal">Cancelar</button>
    </div>
  `);
}

function openDebtDeleteModal(debtId) {
  const debt = state.committeeDebts.find((item) => item.id === debtId);
  if (!debt) return;
  const pending = Math.max(0, scheduledTotal(debt.installments) - paidTotal(debt.installments));
  openModal("Eliminar deuda general", `
    <div class="notice warning">
      Esta opcion borra la deuda general creada y sus movimientos de caja relacionados. Usela solo para pruebas o cargas incorrectas.
    </div>
    <div class="kpi-row" style="margin-top: 14px;">
      ${miniKpi("Entidad", escapeHtml(debt.entity), "Registro seleccionado")}
      ${miniKpi("Saldo", money(pending), "Se quitara del comite")}
    </div>
    <div class="toolbar" style="margin-top: 14px;">
      <button class="danger-button" type="button" data-action="confirm-delete-debt" data-debt-id="${debtId}">Eliminar deuda general</button>
      <button class="ghost-button" type="button" data-action="close-modal">Cancelar</button>
    </div>
  `);
}

function openConfirmModal(title, message, confirmAction) {
  openModal(title, `
    <div class="notice warning">${escapeHtml(message)}</div>
    <div class="toolbar" style="margin-top: 14px;">
      <button class="danger-button" type="button" data-action="${confirmAction}">Confirmar</button>
      <button class="ghost-button" type="button" data-action="close-modal">Cancelar</button>
    </div>
  `);
}

function openModal(title, content) {
  const dialog = document.createElement("dialog");
  dialog.className = "modal";
  dialog.innerHTML = `
    <div class="modal__box">
      <div class="modal__header">
        <h2>${escapeHtml(title)}</h2>
        <button class="icon-button" type="button" data-action="close-modal" aria-label="Cerrar">x</button>
      </div>
      <div class="modal__content">${content}</div>
    </div>
  `;
  document.body.append(dialog);
  dialog.addEventListener("close", () => dialog.remove(), { once: true });
  dialog.showModal();
  restoreFormDrafts(dialog);
}

function markServicePaid(id) {
  const service = state.machineryServices.find((item) => item.id === id);
  if (!service || isServiceDebtArchived(service)) return;
  service.paymentStatus = "pagado";
  addMovement("ingreso", "Servicio de maquinaria", service.total, `Cobro de ${service.machineType} a ${service.clientName}`, "maquinaria", service.id, todayISO());
  afterMutation("maquinaria");
}

function markSalePaid(id) {
  const sale = state.sales.find((item) => item.id === id);
  if (!sale || isSaleDebtArchived(sale)) return;
  const pending = Math.max(0, sale.total - sale.paidAmount);
  sale.paidAmount = sale.total;
  sale.status = "pagado";
  addMovement("ingreso", "Venta de productos", pending, `Cobro de venta a ${sale.clientName}`, "venta", sale.id, todayISO());
  afterMutation("productos");
}

function archiveMember(memberId, includeDebt = false) {
  const member = memberById(memberId);
  if (!member) return;
  if (includeDebt) {
    archiveMemberDebts(memberId, "Deuda eliminada al eliminar socio durante pruebas.");
  }
  member.deletedAt = todayISO();
  member.status = "eliminado";
  member.notes = appendNote(member.notes, `Eliminado para pruebas el ${formatDate(todayISO())}. Historial conservado.`);
  if (ui.selectedMemberId === memberId) ui.selectedMemberId = null;
}

function archiveMemberDebts(memberId, reason) {
  state.memberLoans
    .filter((loan) => loan.memberId === memberId && !isLoanArchived(loan) && rawLoanPending(loan) > 0)
    .forEach((loan) => archiveLoanDebt(loan.id, reason));

  state.sales
    .filter((sale) => sale.memberId === memberId && !isSaleDebtArchived(sale) && saleDebtPending(sale) > 0)
    .forEach((sale) => {
      sale.archivedDebtAt = todayISO();
      sale.archivedPendingAmount = saleDebtPending(sale);
      sale.archiveReason = reason;
      sale.status = "deuda_eliminada";
    });

  state.machineryServices
    .filter((service) => service.memberId === memberId && !isServiceDebtArchived(service) && serviceDebtPending(service) > 0)
    .forEach((service) => {
      service.archivedDebtAt = todayISO();
      service.archivedPendingAmount = serviceDebtPending(service);
      service.archiveReason = reason;
      service.paymentStatus = "deuda_eliminada";
    });
}

function archiveLoanDebt(loanId, reason) {
  const loan = state.memberLoans.find((item) => item.id === loanId);
  if (!loan || isLoanArchived(loan)) return;
  loan.archivedDebtAt = todayISO();
  loan.archivedPendingAmount = rawLoanPending(loan);
  loan.archiveReason = reason;
  loan.status = "deuda_eliminada";
}

function deleteCommitteeDebt(debtId) {
  state.committeeDebts = state.committeeDebts.filter((debt) => debt.id !== debtId);
  state.cashMovements = state.cashMovements.filter((movement) => !(movement.relatedType === "deuda_general" && movement.relatedId === debtId));
}

function appendNote(current, note) {
  return [current, note].filter(Boolean).join("\n");
}

function afterMutation(view = ui.view) {
  state.audit.updatedAt = todayISO();
  saveState();
  ui.view = view;
  render();
}

function addMovement(type, category, amount, description, relatedType, relatedId, date = todayISO()) {
  if (!amount) return;
  state.cashMovements.unshift({
    id: uid("mov"),
    date,
    type,
    category,
    amount: roundGs(amount),
    description,
    relatedType,
    relatedId
  });
}

function generateSchedule({ amount, rate, rateType = "anual", installmentsCount, frequency = "mensual", firstDueDate, system = "cuota_fija", manualAmount = 0 }) {
  const count = Math.max(1, Number(installmentsCount) || 1);
  const principalAmount = roundGs(Number(amount) || 0);
  const periodRate = periodicRate(rate, rateType, frequency, count);
  const months = frequencyMonths[frequency] || 1;
  const schedule = [];
  let balance = principalAmount;
  let fixedPayment = 0;

  if (system === "cuota_fija") {
    fixedPayment = periodRate > 0
      ? principalAmount * (periodRate / (1 - Math.pow(1 + periodRate, -count)))
      : principalAmount / count;
  }

  for (let index = 1; index <= count; index += 1) {
    let interest = 0;
    let principal = 0;
    let total = 0;

    if (system === "cuota_fija") {
      interest = balance * periodRate;
      principal = index === count ? balance : fixedPayment - interest;
      total = principal + interest;
    } else if (system === "interes_simple") {
      principal = principalAmount / count;
      interest = principalAmount * periodRate;
      total = principal + interest;
    } else if (system === "sobre_saldo") {
      principal = index === count ? balance : principalAmount / count;
      interest = balance * periodRate;
      total = principal + interest;
    } else if (system === "interes_solo") {
      interest = balance * periodRate;
      principal = index === count ? balance : 0;
      total = principal + interest;
    } else {
      total = Number(manualAmount) || principalAmount / count;
      interest = Math.max(0, total * periodRate);
      principal = index === count ? balance : Math.min(balance, total - interest);
    }

    principal = Math.min(balance, Math.max(0, principal));
    interest = Math.max(0, interest);
    total = Math.max(principal + interest, total);
    balance = Math.max(0, balance - principal);

    schedule.push({
      id: uid("cuo"),
      number: index,
      dueDate: addMonthsISO(firstDueDate || todayISO(), months * (index - 1)),
      principal: roundGs(principal),
      interest: roundGs(interest),
      total: roundGs(total),
      paidAmount: 0,
      balance: roundGs(balance)
    });
  }

  const principalDrift = principalAmount - sum(schedule, "principal");
  if (schedule.length && principalDrift !== 0) {
    const last = schedule.at(-1);
    last.principal = roundGs(last.principal + principalDrift);
    last.total = roundGs(last.principal + last.interest);
    last.balance = 0;
  }
  return schedule;
}

function periodicRate(rate, rateType, frequency, count) {
  const percentRate = (Number(rate) || 0) / 100;
  const months = frequencyMonths[frequency] || 1;
  if (rateType === "mensual") return percentRate * months;
  if (rateType === "fijo") return percentRate / Math.max(1, count);
  return percentRate * (months / 12);
}

function getGlobalSummary() {
  const activeMemberLoans = state.memberLoans.filter((loan) => !isLoanArchived(loan));
  const debtInitial = sumArray(state.committeeDebts.map((debt) => debt.amount));
  const debtTotalToPay = sumArray(state.committeeDebts.map((debt) => scheduledTotal(debt.installments)));
  const debtPaid = sumArray(state.committeeDebts.map((debt) => paidTotal(debt.installments)));
  const debtPending = Math.max(0, debtTotalToPay - debtPaid);
  const debtInterest = sumArray(state.committeeDebts.map((debt) => sum(debt.installments, "interest")));
  const memberLoanPrincipal = sumArray(state.memberLoans.map((loan) => loan.amount));
  const memberLoanTotal = sumArray(activeMemberLoans.map((loan) => scheduledTotal(loan.installments)));
  const memberLoanPaid = sumArray(activeMemberLoans.map((loan) => paidTotal(loan.installments)));
  const memberLoanPending = Math.max(0, memberLoanTotal - memberLoanPaid);
  const memberInterest = sumArray(state.memberLoans.map((loan) => sum(loan.installments, "interest")));
  const memberInterestPending = sumArray(activeMemberLoans.map((loan) => loan.installments.reduce((acc, row) => acc + (installmentStatus(row) === "pagado" ? 0 : row.interest), 0)));
  const overdueTotal = sumArray(activeMemberLoans.map(loanOverdueTotal));
  const overdueMemberIds = new Set(activeMemberLoans.filter((loan) => loanOverdueTotal(loan) > 0).map((loan) => loan.memberId));
  const activeLoans = activeMemberLoans.filter((loan) => loanStatus(loan) !== "pagado").length;
  const totalIncome = sumArray(state.cashMovements.filter((movement) => movement.type === "ingreso").map((movement) => movement.amount));
  const totalExpense = sumArray(state.cashMovements.filter((movement) => movement.type === "egreso").map((movement) => movement.amount));
  const monthIncome = monthMovementTotal("ingreso");
  const monthExpense = monthMovementTotal("egreso");
  const allInstallments = [
    ...activeMemberLoans.flatMap((loan) => loan.installments),
    ...state.committeeDebts.flatMap((debt) => debt.installments)
  ];
  return {
    debtInitial,
    debtTotalToPay,
    debtPaid,
    debtPending,
    debtInterest,
    nextDebtPayment: nextInstallment(state.committeeDebts.flatMap((debt) => debt.installments)),
    memberLoanPrincipal,
    memberLoanTotal,
    memberLoanPaid,
    memberLoanPending,
    memberInterest,
    memberInterestPending,
    overdueTotal,
    overdueMembersCount: overdueMemberIds.size,
    activeLoans,
    totalIncome,
    totalExpense,
    cashBalance: totalIncome - totalExpense,
    monthIncome,
    monthExpense,
    estimatedMargin: memberInterest - debtInterest,
    onTimeInstallments: allInstallments.filter((row) => installmentStatus(row) === "pendiente").length,
    soonInstallments: allInstallments.filter((row) => installmentStatus(row) === "por vencer").length,
    overdueInstallments: allInstallments.filter((row) => installmentStatus(row) === "atrasado").length
  };
}

function getCalendarEvents() {
  const loanEvents = state.memberLoans.filter((loan) => !isLoanArchived(loan)).flatMap((loan) => {
    const member = memberById(loan.memberId);
    return loan.installments
      .filter((installment) => installmentStatus(installment) !== "pagado")
      .map((installment) => ({
        date: installment.dueDate,
        title: member?.name || "Socio",
        detail: `Cuota préstamo ${installment.number}/${loan.installments.length}`,
        amount: installment.total - installment.paidAmount,
        status: installmentStatus(installment),
        kind: "loan"
      }));
  });
  const debtEvents = state.committeeDebts.flatMap((debt) =>
    debt.installments
      .filter((installment) => installmentStatus(installment) !== "pagado")
      .map((installment) => ({
        date: installment.dueDate,
        title: `Deuda general - ${debt.entity}`,
        detail: `Cuota banco ${installment.number}/${debt.installments.length}`,
        amount: installment.total - installment.paidAmount,
        status: installmentStatus(installment),
        kind: "debt"
      }))
  );
  const services = state.machineryServices.filter((service) => !isServiceDebtArchived(service)).map((service) => ({
    date: service.date,
    title: `${service.machineType} - ${service.clientName}`,
    detail: `Servicio de maquinaria · ${service.location || "Sin lugar"}`,
    amount: service.total,
    status: service.paymentStatus === "pagado" ? "pagado" : daysBetween(todayISO(), service.date) < 0 ? "atrasado" : "pendiente",
    kind: "machinery"
  }));
  return [...loanEvents, ...debtEvents, ...services];
}

function filterCalendarEvents(events, range) {
  return events.filter((event) => {
    const diff = daysBetween(todayISO(), event.date);
    if (range === "day") return diff === 0;
    if (range === "week") return diff >= -7 && diff <= 7;
    return sameMonth(event.date, todayISO());
  });
}

function activeMembers() {
  return state.members.filter((member) => !member.deletedAt && member.status !== "eliminado");
}

function isLoanArchived(loan) {
  return Boolean(loan?.archivedDebtAt) || loan?.status === "deuda_eliminada";
}

function isSaleDebtArchived(sale) {
  return Boolean(sale?.archivedDebtAt) || sale?.status === "deuda_eliminada";
}

function isServiceDebtArchived(service) {
  return Boolean(service?.archivedDebtAt) || service?.paymentStatus === "deuda_eliminada";
}

function rawLoanPending(loan) {
  return Math.max(0, scheduledTotal(loan.installments) - paidTotal(loan.installments));
}

function saleDebtPending(sale) {
  if (isSaleDebtArchived(sale)) return 0;
  return Math.max(0, Number(sale.total) - Number(sale.paidAmount));
}

function serviceDebtPending(service) {
  if (isServiceDebtArchived(service) || service.paymentStatus === "pagado") return 0;
  return Math.max(0, Number(service.total) || 0);
}

function memberTotalPending(memberId) {
  const loanPendingTotal = sumArray(state.memberLoans.filter((loan) => loan.memberId === memberId).map(loanPending));
  const salesPending = sumArray(state.sales.filter((sale) => sale.memberId === memberId).map(saleDebtPending));
  const servicePending = sumArray(state.machineryServices.filter((service) => service.memberId === memberId).map(serviceDebtPending));
  return loanPendingTotal + salesPending + servicePending;
}

function memberOverdueTotal(memberId) {
  return sumArray(state.memberLoans.filter((loan) => loan.memberId === memberId).map(loanOverdueTotal));
}

function loanPending(loan) {
  return isLoanArchived(loan) ? 0 : rawLoanPending(loan);
}

function loanOverdueTotal(loan) {
  if (isLoanArchived(loan)) return 0;
  return sumArray(loan.installments
    .filter((installment) => installmentStatus(installment) === "atrasado")
    .map((installment) => Math.max(0, installment.total - installment.paidAmount)));
}

function loanStatus(loan) {
  if (isLoanArchived(loan)) return "deuda eliminada";
  if (loan.installments.every((installment) => installmentStatus(installment) === "pagado")) return "pagado";
  if (loanOverdueTotal(loan) > 0) return "en mora";
  return loan.status || "activo";
}

function installmentStatus(installment) {
  if (Number(installment.paidAmount) >= Number(installment.total)) return "pagado";
  const diff = daysBetween(todayISO(), installment.dueDate);
  if (diff < 0) return "atrasado";
  if (diff <= 7) return "por vencer";
  return "pendiente";
}

function statusClass(status) {
  if (status === "pagado") return "status--paid";
  if (status === "atrasado" || status === "en mora") return "status--overdue";
  if (status === "por vencer" || status === "pendiente" || status === "parcial" || status === "fiado") return "status--soon";
  return "status--info";
}

function nextInstallment(scheduleOrInstallments) {
  const rows = Array.isArray(scheduleOrInstallments) ? scheduleOrInstallments : [];
  return rows
    .filter((installment) => installmentStatus(installment) !== "pagado")
    .sort(byDate)[0] || null;
}

function paidTotal(schedule) {
  return sumArray(schedule.map((installment) => Number(installment.paidAmount) || 0));
}

function scheduledTotal(schedule) {
  return sum(schedule, "total");
}

function cashBalance() {
  return getGlobalSummary().cashBalance;
}

function monthMovementTotal(type) {
  const current = todayISO().slice(0, 7);
  return sumArray(state.cashMovements
    .filter((movement) => movement.type === type && movement.date.slice(0, 7) === current)
    .map((movement) => movement.amount));
}

function topDebtorName() {
  const sorted = activeMembers()
    .map((member) => ({ name: member.name, total: memberTotalPending(member.id) }))
    .sort((a, b) => b.total - a.total);
  return sorted[0]?.total ? sorted[0].name : "Sin deuda";
}

function mostUsedMachine() {
  const counts = groupBy(state.machineryServices, "machineType");
  return Object.entries(counts).sort((a, b) => b[1].length - a[1].length)[0]?.[0] || "Sin datos";
}

function topProductName() {
  const totals = {};
  for (const sale of state.sales) totals[sale.productId] = (totals[sale.productId] || 0) + Number(sale.quantity);
  const top = Object.entries(totals).sort((a, b) => b[1] - a[1])[0]?.[0];
  return top ? productName(top) : "Sin ventas";
}

function productName(id) {
  return state.products.find((product) => product.id === id)?.name || "Producto";
}

function memberById(id) {
  return state.members.find((member) => member.id === id);
}

function totalRecords() {
  return [
    state.members,
    state.committeeDebts,
    state.memberLoans,
    state.machineryServices,
    state.products,
    state.sales,
    state.cashMovements,
    state.collectionActions
  ].reduce((acc, array) => acc + array.length, 0);
}

function exportBackup() {
  state.audit.lastBackupAt = todayISO();
  saveState();
  const payload = JSON.stringify(state, null, 2);
  const filename = backupFilename();

  if (window.CristoReyAndroid?.saveBackup) {
    window.CristoReyAndroid.saveBackup(filename, payload);
    render();
    return;
  }

  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  render();
}

function restoreBackup(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      state = normalizeState(JSON.parse(String(reader.result)));
      saveState();
      render();
    } catch {
      alert("No se pudo restaurar el archivo de backup.");
    }
  };
  reader.readAsText(file);
}

function backupFilename() {
  return `backup_cristo_rey_${todayISO().replaceAll("-", "_")}.json`;
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  }
}

function money(value) {
  const rounded = roundGs(value);
  return `${rounded.toLocaleString("es-PY")} Gs`;
}

function formatDate(iso) {
  if (!iso) return "Sin fecha";
  const [year, month, day] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("es-PY", { day: "2-digit", month: "short", year: "numeric" })
    .format(new Date(year, month - 1, day));
}

function todayISO() {
  return toISO(new Date());
}

function toISO(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDaysISO(iso, days) {
  const date = parseISO(iso);
  date.setDate(date.getDate() + days);
  return toISO(date);
}

function addMonthsISO(iso, months) {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(year, month - 1 + months, 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(day, lastDay));
  return toISO(date);
}

function parseISO(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function daysBetween(startISO, endISO) {
  const ms = parseISO(endISO) - parseISO(startISO);
  return Math.round(ms / 86400000);
}

function daysLabel(iso) {
  const diff = daysBetween(todayISO(), iso);
  if (diff < 0) return `${Math.abs(diff)} día(s) de atraso`;
  if (diff === 0) return "vence hoy";
  return `faltan ${diff} día(s)`;
}

function sameMonth(a, b) {
  return a.slice(0, 7) === b.slice(0, 7);
}

function rangeLabel(range) {
  return { day: "Día", week: "Semana", month: "Mes" }[range] || range;
}

function byDate(a, b) {
  return (a.date || a.dueDate || "").localeCompare(b.date || b.dueDate || "");
}

function groupBy(array, key) {
  return array.reduce((acc, item) => {
    const value = item[key];
    acc[value] = acc[value] || [];
    acc[value].push(item);
    return acc;
  }, {});
}

function sum(array, fieldName) {
  return sumArray(array.map((item) => Number(item[fieldName]) || 0));
}

function sumArray(values) {
  return roundGs(values.reduce((acc, value) => acc + (Number(value) || 0), 0));
}

function percent(value, total) {
  return `${percentNumber(value, total)}%`;
}

function percentNumber(value, total) {
  return total ? ((Number(value) || 0) / total * 100).toFixed(1) : "0.0";
}

function num(value) {
  if (typeof value === "number") return value;
  const normalized = String(value || "").replace(/\./g, "").replace(",", ".");
  return Number(normalized) || 0;
}

function roundGs(value) {
  return Math.round(Number(value) || 0);
}

function clean(value) {
  return String(value || "").trim();
}

function initials(name) {
  return clean(name).split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() || "").join("");
}

function uid(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}
