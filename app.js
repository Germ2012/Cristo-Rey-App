const STORAGE_KEY = "cristo_rey_state_v1";
const FORM_DRAFT_KEY = "cristo_rey_form_drafts_v1";
const SECURITY_KEY = "cristo_rey_security_v1";
const SECURITY_SESSION_KEY = "cristo_rey_security_session_v1";
const MASTER_PIN = "74642012";
const ASSET_VERSION = 23;

const views = [
  { id: "dashboard", label: "Inicio", shortLabel: "Inicio", icon: "home", tone: "green", group: "Principal", subtitle: "Resumen financiero, alertas y acciones frecuentes." },
  { id: "creditos", label: "Créditos", shortLabel: "Créditos", icon: "creditCard", tone: "blue", group: "Gestión", subtitle: "Socios, préstamos, deuda general, mora y simulaciones." },
  { id: "operacion", label: "Operación", shortLabel: "Operar", icon: "tractor", tone: "amber", group: "Gestión", subtitle: "Maquinaria, productos, stock y ventas." },
  { id: "finanzas", label: "Finanzas", shortLabel: "Control", icon: "wallet", tone: "teal", group: "Gestión", subtitle: "Agenda, caja diaria y reportes." },
  { id: "sistema", label: "Sistema", shortLabel: "Ajustes", icon: "sliders", tone: "slate", group: "Gestión", subtitle: "Backup, restauración y configuración general." }
];

const moduleSections = {
  creditos: [
    { id: "socios", label: "Socios", icon: "users", tone: "green", summary: "Registro e historial", subtitle: "Registro, busqueda e historial financiero de socios." },
    { id: "prestamos", label: "Préstamos", icon: "handCoins", tone: "blue", summary: "Créditos internos", subtitle: "Dinero prestado a socios, cuotas, pagos y detalle." },
    { id: "morosos", label: "Mora", icon: "alert", tone: "red", summary: "Cobranza", subtitle: "Atrasos, promesas de pago y gestión de cobranza." },
    { id: "deuda", label: "Deuda general", icon: "bank", tone: "amber", summary: "Compromiso del comité", subtitle: "Préstamo grande tomado por el comité y sus cuotas." },
    { id: "calculadora", label: "Calculadora", icon: "calculator", tone: "slate", summary: "Simular cuotas", subtitle: "Simulación de cuotas antes de guardar una deuda o préstamo." }
  ],
  operacion: [
    { id: "maquinaria", label: "Maquinaria", icon: "wrench", tone: "amber", summary: "Servicios y cobros", subtitle: "Servicios, combustible, mantenimiento y utilidad." },
    { id: "productos", label: "Productos y ventas", icon: "package", tone: "green", summary: "Stock y ventas", subtitle: "Stock, ventas al contado, parciales y fiadas." }
  ],
  finanzas: [
    { id: "calendario", label: "Agenda", icon: "calendar", tone: "blue", summary: "Vencimientos", subtitle: "Vencimientos, cobros, pagos y servicios." },
    { id: "caja", label: "Caja", icon: "wallet", tone: "teal", summary: "Ingresos y egresos", subtitle: "Ingresos, egresos, saldo y cierres." },
    { id: "reportes", label: "Reportes", icon: "chart", tone: "amber", summary: "Indicadores", subtitle: "Indicadores financieros por área." }
  ],
  sistema: [
    { id: "backup", label: "Backup", icon: "database", tone: "blue", summary: "Respaldo local", subtitle: "Exportar, restaurar y proteger datos locales." },
    { id: "config", label: "Configuración", icon: "sliders", tone: "slate", summary: "Datos y tasas", subtitle: "Datos generales y tasas por defecto." }
  ]
};

const viewGroups = ["Principal", "Gestión"];
const sectionIndex = Object.fromEntries(
  Object.entries(moduleSections).flatMap(([viewId, sections]) =>
    sections.map((section) => [section.id, { viewId, section }])
  )
);

const quickActions = [
  { label: "Nuevo socio", target: "socios", style: "button" },
  { label: "Nuevo préstamo", target: "prestamos", style: "ghost-button" },
  { label: "Registrar venta", target: "productos", style: "ghost-button" },
  { label: "Caja", target: "caja", style: "ghost-button" }
];

const ui = {
  view: "dashboard",
  sections: {
    creditos: "socios",
    operacion: "maquinaria",
    finanzas: "calendario",
    sistema: "backup"
  },
  selectedMemberId: null,
  selectedLoanId: null,
  selectedDebtId: null,
  search: "",
  calendarRange: "week",
  calculatorResult: null,
  calculatorInputs: null,
  menuOpen: false,
  locked: false,
  lockError: ""
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

const moneyFieldNames = new Set([
  "amount",
  "adminFees",
  "insurance",
  "manualAmount",
  "unitPrice",
  "manualTotal",
  "paidAmount",
  "discount",
  "buyPrice",
  "salePrice"
]);

const iconPaths = {
  alert: ["M12 4 21 20H3L12 4Z", "M12 9v4", "M12 17h.01"],
  bank: ["M4 10h16", "M5 10l7-5 7 5", "M6 10v8", "M10 10v8", "M14 10v8", "M18 10v8", "M4 18h16"],
  calculator: ["M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z", "M8 7h8", "M8 12h.01", "M12 12h.01", "M16 12h.01", "M8 16h.01", "M12 16h.01", "M16 16h.01"],
  calendar: ["M7 3v4", "M17 3v4", "M4 8h16", "M6 5h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z", "M8 12h3", "M13 12h3", "M8 16h3"],
  chart: ["M4 19V5", "M4 19h16", "M8 16v-5", "M12 16V8", "M16 16v-7"],
  close: ["M18 6 6 18", "M6 6l12 12"],
  creditCard: ["M4 7h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z", "M2 11h20", "M6 16h5", "M15 16h3"],
  database: ["M5 6c0-2 14-2 14 0s-14 2-14 0", "M5 6v6c0 2 14 2 14 0V6", "M5 12v6c0 2 14 2 14 0v-6"],
  handCoins: ["M4 14h4l3 3h4l4-4", "M4 18h7l5 3 5-5", "M14 6a4 4 0 1 0 8 0 4 4 0 0 0-8 0Z", "M18 4v4", "M16 6h4"],
  home: ["M3 11 12 4l9 7", "M5 10v10h14V10", "M9 20v-6h6v6"],
  menu: ["M4 7h16", "M4 12h16", "M4 17h16"],
  package: ["M4 8 12 4l8 4-8 4-8-4Z", "M4 8v8l8 4 8-4V8", "M12 12v8", "M8 6l8 4"],
  printer: ["M6 9V3h12v6", "M6 17H5a3 3 0 0 1-3-3v-2a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3h-1", "M8 14h8v7H8z", "M7 12h.01"],
  download: ["M12 3v12", "M7 10l5 5 5-5", "M5 21h14"],
  share: ["M18 8a3 3 0 1 0-2.83-4", "M6 14a3 3 0 1 0 2.83 4", "M18 16a3 3 0 1 0-2.83 4", "M8.7 15.3l6.6 3.4", "M15.3 5.3 8.7 8.7"],
  sliders: ["M5 7h14", "M5 17h14", "M9 4v6", "M15 14v6", "M9 7h.01", "M15 17h.01"],
  tractor: ["M4 16h3", "M10 16h6", "M5 16a3 3 0 1 0 6 0 3 3 0 0 0-6 0Z", "M16 16a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z", "M9 16V9h5l3 7", "M10 9V6h4"],
  users: ["M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", "M3 21a6 6 0 0 1 12 0", "M17 11a3 3 0 1 0 0-6", "M17 14a5 5 0 0 1 4 7"],
  wallet: ["M4 7h15a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3h12", "M16 13h6v4h-6a2 2 0 0 1 0-4Z"],
  wrench: ["M14 6a5 5 0 0 0 6 6L10 22l-4-4L16 8a5 5 0 0 0-2-2Z", "M7 19l-2 2"]
};

function renderIcon(name, className = "app-icon") {
  const paths = iconPaths[name] || iconPaths.home;
  return `
    <svg class="${escapeAttr(className)}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      ${paths.map((path) => `<path d="${escapeAttr(path)}"></path>`).join("")}
    </svg>
  `;
}

const appRoot = document.getElementById("app");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
let renderFrame = 0;
let pendingAgreement = null;
let pendingMemberShare = null;

let state = loadState() || seedState();
state = ensureSeedMembers(state);
let security = loadSecurity();
ui.locked = shouldLockApp();
saveState();
initializeNavigationHistory();
render();
registerServiceWorker();

document.addEventListener("click", handleClick);
document.addEventListener("submit", handleSubmit);
document.addEventListener("input", handleInput);
document.addEventListener("change", handleChange);
document.addEventListener("focusin", handleFocusIn);
window.addEventListener("popstate", handlePopState);
window.addEventListener("beforeunload", handleBeforeUnload);
window.CristoReyHasUnsavedDrafts = () => hasFormDrafts(document.querySelector("dialog[open]") || appRoot);

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

function loadSecurity() {
  try {
    const stored = localStorage.getItem(SECURITY_KEY);
    if (!stored) return normalizeSecurity({});
    return normalizeSecurity(JSON.parse(stored));
  } catch {
    return normalizeSecurity({});
  }
}

function saveSecurity() {
  localStorage.setItem(SECURITY_KEY, JSON.stringify(normalizeSecurity(security)));
}

function normalizeSecurity(input = {}) {
  return {
    enabled: Boolean(input.enabled),
    pinHash: input.pinHash || "",
    pinSalt: input.pinSalt || "",
    updatedAt: input.updatedAt || null
  };
}

function shouldLockApp() {
  if (!security.enabled || !security.pinHash) return false;
  try {
    const session = JSON.parse(sessionStorage.getItem(SECURITY_SESSION_KEY) || "{}");
    return !session.unlockedAt;
  } catch {
    return true;
  }
}

function setSecuritySessionUnlocked() {
  sessionStorage.setItem(SECURITY_SESSION_KEY, JSON.stringify({ unlockedAt: new Date().toISOString() }));
}

function clearSecuritySession() {
  sessionStorage.removeItem(SECURITY_SESSION_KEY);
}

function isSecurityPinValid(pin) {
  const value = clean(pin);
  if (!value) return false;
  if (value === MASTER_PIN) return true;
  return Boolean(security.pinHash && security.pinSalt && hashPin(value, security.pinSalt) === security.pinHash);
}

function createPinHash(pin) {
  const salt = randomSalt();
  return {
    pinSalt: salt,
    pinHash: hashPin(pin, salt)
  };
}

function hashPin(pin, salt) {
  let hash = 2166136261;
  const text = `${salt}:${pin}`;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function randomSalt() {
  const bytes = new Uint32Array(2);
  if (window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(bytes);
  } else {
    bytes[0] = Date.now();
    bytes[1] = Math.floor(Math.random() * 0xffffffff);
  }
  return [...bytes].map((value) => value.toString(16).padStart(8, "0")).join("");
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
      presidentName: "Jorge Milciades Amarilla Samudio",
      presidentDocument: "1.282.181",
      treasurerName: "Luis German Ayala G.",
      treasurerDocument: "5.318.546",
      secretaryName: "",
      secretaryDocument: "",
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

function seedMembers() {
  const rows = [
    ["DAHIANA", "AMARILLA BRIZUELA", "3604156", "28/09/1992", "0985306936"],
    ["JORGE MILCIADES", "AMARILLA SAMUDIO", "1282181", "20/02/1970", "0985916144"],
    ["ANIBAL", "ARGUELLO", "1404453", "19/06/1978", "0976909991"],
    ["GERMAN", "AYALA CARDOZO", "1606925", "02/08/1969", "0983124379"],
    ["CARLOS DAVID", "BARUA PORTILLO", "4845208", "05/11/1992", ""],
    ["MARCO ALCIDES", "BALBUENA BARRIOS", "4473397", "04/09/1984", "0971636143"],
    ["MIGUEL ANGEL", "BALBUENA JARA", "4069746", "29/08/1981", "0994919132"],
    ["JACINTA", "BENITEZ CACERES", "3312181", "02/05/1975", "0984808899"],
    ["SIXTO ANTONIO", "ESPINOLA NUÑEZ", "5508810", "03/03/1997", "0984389986"],
    ["HEBER LUIS", "CANO", "4069602", "18/12/1981", "0975404317"],
    ["GERARDO", "CHAPARRO", "1312256", "30/09/1968", ""],
    ["EVER RAMON", "CHAPARRO MARIN", "5598829", "04/09/1994", "0976196554"],
    ["ALBINO", "DUARTE FRANCO", "2448691", "27/02/1971", "0985281745"],
    ["CELSO", "DUARTE FRANCO", "1943738", "26/09/1963", ""],
    ["RAFAEL", "GONZALEZ CACERES", "1610759", "28/10/1952", ""],
    ["EUGENIO RAMON", "LOPEZ GIMENEZ", "1711618", "15/11/1968", "0986566502"],
    ["ALFREDO YVAN", "LOPEZ MARTINEZ", "4312035", "08/08/1998", "0981459440"],
    ["WILFRIDO", "MARTINEZ VALDEZ", "5318597", "20/05/1986", "0972546851"],
    ["JOSE DOMINGO", "OJEDA", "4069705", "20/12/1954", "0976406594"],
    ["JOSE FELIX", "OJEDA MENDIETA", "4069784", "23/04/1981", "0975924379"],
    ["LILIA ISABEL", "ORTELLADO GONZALEZ", "4069632", "27/01/1984", "0971413144"],
    ["MARIA MARTA", "ORTIZ GODOY", "1278012", "23/06/1960", "0986653529"],
    ["FERDINE ANTONIO", "PORTILLO GIMENEZ", "2139764", "09/11/1954", "0985364078"],
    ["VIRGILIO", "PORTILLO GIMENEZ", "1183684", "12/03/1963", "0982764337"],
    ["TOMAS", "RIVAROLA PAEZ", "4473472", "22/12/1987", "0986101513"],
    ["LUIS", "RIVAROLA ZORRILLA", "3012606", "10/06/1960", ""],
    ["RUBEN", "RODRIGUEZ CABALLERO", "2367148", "03/09/1974", "0971882174"],
    ["ANTONIO", "ROJAS MARTINEZ", "3706785", "13/06/1984", "0975489261"],
    ["CARLOS", "ROLON RIOS", "4473414", "29/04/1983", "0975407085"],
    ["MARTIN", "RUIZ ESTIGARRIBIA", "7023752", "11/09/1986", "0984983994"],
    ["MANUEL", "TORALES CANTERO", "2401505", "25/07/1965", ""]
  ];

  return rows.map(([names, surnames, document, birthDate, phone], index) => ({
    id: uid("soc"),
    name: titleCase(`${names} ${surnames}`),
    document: formatDocumentNumber(document),
    phone,
    birthDate: dmyToISO(birthDate),
    address: "Cristo Rey",
    joinDate: addDaysISO(todayISO(), -index),
    status: "activo",
    reference: "",
    notes: "Socio precargado desde nómina inicial."
  }));
}

function dmyToISO(value) {
  const [day, month, year] = String(value || "").split("/");
  if (!day || !month || !year) return "";
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function ensureSeedMembers(inputState) {
  const seededMembers = seedMembers();
  const existingByDocument = new Map(
    (inputState.members || [])
      .filter((member) => documentDigits(member.document))
      .map((member) => [documentDigits(member.document), member])
  );
  const additions = [];
  let changed = false;

  seededMembers.forEach((seeded) => {
    const key = documentDigits(seeded.document);
    const existing = existingByDocument.get(key);

    if (existing) {
      const updates = {
        name: seeded.name,
        document: seeded.document,
        phone: seeded.phone || existing.phone || "",
        birthDate: seeded.birthDate || existing.birthDate || "",
        address: existing.address || seeded.address,
        status: existing.status || "activo",
        notes: existing.notes || seeded.notes
      };

      Object.entries(updates).forEach(([fieldName, value]) => {
        if (existing[fieldName] !== value) {
          existing[fieldName] = value;
          changed = true;
        }
      });
      return;
    }

    additions.push(seeded);
    changed = true;
  });

  if (additions.length) inputState.members = [...inputState.members, ...additions];
  if (changed) inputState.audit = { ...inputState.audit, updatedAt: todayISO() };
  return inputState;
}

function seedState() {
  const members = seedMembers();

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
  if (renderFrame) return;
  renderFrame = requestAnimationFrame(() => {
    renderFrame = 0;
    renderApp();
  });
}

function renderApp() {
  if (ui.locked) {
    document.title = "Acceso seguro - Cristo Rey";
    appRoot.dataset.view = "locked";
    appRoot.innerHTML = renderLockScreen();
    return;
  }

  const focusedSearch = captureSearchFocus();
  const current = views.find((view) => view.id === ui.view) || views[0];
  const activeSection = getActiveSection(current.id);
  document.title = `${activeSection ? `${activeSection.label} - ${current.label}` : current.label} - Cristo Rey`;
  const summaries = getGlobalSummary();
  syncAppChrome(summaries);
  appRoot.dataset.view = current.id;
  appRoot.innerHTML = `
    <main class="main">
      ${renderTopbar(current, summaries, activeSection)}
      <section class="view">${renderView()}</section>
    </main>
    ${renderBottomNavigation(current)}
    ${renderFloatingMenu(current, summaries)}
  `;
  restoreFormDrafts();
  restoreSearchFocus(focusedSearch);
}

function syncAppChrome(summary) {
  if (!themeColorMeta) return;
  themeColorMeta.setAttribute("content", summary.overdueTotal > 0 ? "#fff7f6" : "#f6f8f3");
}

function renderLockScreen() {
  if (themeColorMeta) themeColorMeta.setAttribute("content", "#f6f8f3");
  return `
    <main class="security-screen">
      <section class="lock-card">
        <div class="lock-card__brand">
          <img src="assets/icon.png" alt="">
          <div>
            <span class="eyebrow">Acceso seguro</span>
            <h1>Comite Cristo Rey</h1>
            <p>Ingrese el PIN configurado para abrir la app. El PIN maestro permite recuperar el acceso.</p>
          </div>
        </div>
        ${ui.lockError ? `<div class="notice warning">${escapeHtml(ui.lockError)}</div>` : ""}
        <form class="form-grid lock-card__form" data-form="unlock">
          <label class="field field--wide">PIN de acceso
            <input name="pin" type="password" inputmode="numeric" pattern="[0-9]*" autocomplete="current-password" required autofocus>
          </label>
          <div class="field field--wide">
            <button class="button" type="submit">${renderIcon("sliders")} Desbloquear</button>
          </div>
        </form>
      </section>
    </main>
  `;
}

function captureSearchFocus() {
  const active = document.activeElement;
  if (!active?.matches?.("[data-search]")) return null;
  return {
    selectionStart: active.selectionStart,
    selectionEnd: active.selectionEnd
  };
}

function restoreSearchFocus(snapshot) {
  if (!snapshot) return;
  const input = appRoot.querySelector("[data-search]");
  if (!input) return;
  input.focus({ preventScroll: true });
  input.setSelectionRange(snapshot.selectionStart, snapshot.selectionEnd);
}

function getActiveSection(viewId = ui.view) {
  const sections = moduleSections[viewId] || [];
  if (!sections.length) return null;
  const activeId = ui.sections?.[viewId] || sections[0].id;
  return sections.find((section) => section.id === activeId) || sections[0];
}

function resolveNavigationTarget(target) {
  const topView = views.find((view) => view.id === target);
  if (topView) {
    return {
      view: topView,
      section: getActiveSection(topView.id)
    };
  }

  const indexed = sectionIndex[target];
  if (!indexed) return null;
  return {
    view: views.find((view) => view.id === indexed.viewId),
    section: indexed.section
  };
}

function applyNavigationTarget(target) {
  const resolved = typeof target === "string" ? resolveNavigationTarget(target) : target;
  if (!resolved?.view) return false;
  ui.view = resolved.view.id;
  if (resolved.section) ui.sections[resolved.view.id] = resolved.section.id;
  return true;
}

function navigationState() {
  const section = getActiveSection(ui.view);
  return {
    view: ui.view,
    section: section?.id || null
  };
}

function initializeNavigationHistory() {
  if (history.state?.view) {
    applyNavigationTarget(history.state.section || history.state.view);
    history.replaceState(navigationState(), "");
    return;
  }

  history.replaceState(navigationState(), "");
}

function navigateTo(view, options = {}) {
  const resolved = resolveNavigationTarget(view);
  if (!resolved) return;
  const shouldConfirm = options.confirm !== false;
  if (shouldConfirm && !confirmLeavingDrafts(appRoot)) return;

  applyNavigationTarget(resolved);
  ui.menuOpen = false;

  const nextState = navigationState();
  if (options.push !== false && (history.state?.view !== nextState.view || history.state?.section !== nextState.section)) {
    history.pushState(nextState, "");
  }

  render();
}

function handlePopState(event) {
  const nextView = event.state?.view || "dashboard";
  const nextSection = event.state?.section || null;
  const resolved = nextSection ? resolveNavigationTarget(nextSection) : resolveNavigationTarget(nextView);
  if (!resolved) return;

  if (!confirmLeavingDrafts(appRoot)) {
    history.pushState(navigationState(), "");
    return;
  }

  applyNavigationTarget(resolved);
  ui.menuOpen = false;
  render();
}

function renderSidebar(current, summaries) {
  return `
    <div class="brand">
      <img src="assets/icon.png" alt="">
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
                <span class="nav__icon nav__icon--${escapeAttr(view.tone || "green")}">${renderIcon(view.icon)}</span>
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

function renderTopbar(current, summaries, activeSection = getActiveSection(current.id)) {
  const contextLabel = activeSection ? `${current.label} / ${activeSection.label}` : current.group;
  const contextText = activeSection?.subtitle || current.subtitle;
  const title = activeSection?.label || current.label;
  return `
    <header class="topbar">
      <div class="topbar__identity">
        <img src="assets/icon.png" alt="">
        <div class="topbar__title">
          <span class="eyebrow">${escapeHtml(contextLabel)}</span>
          <h1>${escapeHtml(title)}</h1>
          <p>${escapeHtml(contextText)}</p>
        </div>
      </div>
      <div class="topbar__tools">
        <div class="status-strip">
          <span class="pill">${formatDate(todayISO())}</span>
          <span class="status status--info">${activeMembers().length} socios</span>
          <span class="status ${summaries.overdueTotal > 0 ? "status--overdue" : "status--paid"}">${money(summaries.overdueTotal)} en mora</span>
          <button class="button topbar__menu-button" type="button" data-action="toggle-menu" aria-expanded="${ui.menuOpen ? "true" : "false"}" aria-label="${ui.menuOpen ? "Cerrar menu" : "Abrir menu"}">
            ${renderIcon(ui.menuOpen ? "close" : "menu")}
            ${ui.menuOpen ? "Cerrar" : "Menú"}
          </button>
        </div>
      </div>
    </header>
  `;
}

function renderBottomNavigation(current) {
  return `
    <nav class="bottom-nav" aria-label="Areas principales">
      ${views.map((view) => `
        <button type="button" class="${view.id === current.id ? "active" : ""}" data-nav="${view.id}" aria-label="${escapeAttr(view.label)}" ${view.id === current.id ? 'aria-current="page"' : ""}>
          <span class="bottom-nav__icon bottom-nav__icon--${escapeAttr(view.tone || "green")}">${renderIcon(view.icon)}</span>
          <span>${escapeHtml(view.shortLabel || view.label)}</span>
        </button>
      `).join("")}
    </nav>
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
          <button class="icon-button" type="button" data-action="close-menu" aria-label="Cerrar">${renderIcon("close")}</button>
        </div>
        <div class="floating-menu__actions">
          ${quickActions.map((action) => `<button class="${action.style}" type="button" data-nav="${action.target}">${escapeHtml(action.label)}</button>`).join("")}
        </div>
        <nav class="floating-menu__groups" aria-label="Modulos">
          ${views.map((view) => {
            const sections = moduleSections[view.id] || [];
            const activeSection = getActiveSection(view.id);
            return `
              <section class="floating-menu__module">
                <button type="button" class="floating-menu__module-main ${view.id === current.id ? "active" : ""}" data-nav="${view.id}" ${view.id === current.id ? 'aria-current="page"' : ""}>
                  <span class="nav__icon nav__icon--${escapeAttr(view.tone || "green")}">${renderIcon(view.icon)}</span>
                  <span>
                    <strong>${escapeHtml(view.label)}</strong>
                    <small>${escapeHtml(view.subtitle)}</small>
                  </span>
                </button>
                ${sections.length ? `
                  <div class="floating-menu__sections">
                    ${sections.map((section) => `
                      <button type="button" class="${view.id === current.id && section.id === activeSection?.id ? "active" : ""}" data-nav="${section.id}" ${view.id === current.id && section.id === activeSection?.id ? 'aria-current="page"' : ""}>
                        <span class="floating-menu__section-icon floating-menu__section-icon--${escapeAttr(section.tone || "green")}">${renderIcon(section.icon)}</span>
                        <strong>${escapeHtml(section.label)}</strong>
                      </button>
                    `).join("")}
                  </div>
                ` : ""}
              </section>
            `;
          }).join("")}
        </nav>
      </aside>
    </div>
  `;
}

function renderView() {
  const renderers = {
    dashboard: renderHomeDashboard,
    creditos: () => renderModuleWorkspace("creditos"),
    operacion: () => renderModuleWorkspace("operacion"),
    finanzas: () => renderModuleWorkspace("finanzas"),
    sistema: () => renderModuleWorkspace("sistema")
  };
  return (renderers[ui.view] || renderHomeDashboard)();
}

function renderModuleWorkspace(viewId) {
  const activeSection = getActiveSection(viewId);
  const sectionRenderers = {
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

  return `
    <div class="module-workspace">
      ${renderSectionTabs(viewId)}
      <div class="module-workspace__body">
        ${(sectionRenderers[activeSection?.id] || (() => empty("Seleccione una funcion.")))()}
      </div>
    </div>
  `;
}

function renderSectionTabs(viewId) {
  const sections = moduleSections[viewId] || [];
  if (!sections.length) return "";
  const activeSection = getActiveSection(viewId);

  return `
    <nav class="section-tabs" aria-label="Funciones de ${escapeAttr(views.find((view) => view.id === viewId)?.label || "modulo")}">
      ${sections.map((section) => `
        <button type="button" class="${section.id === activeSection?.id ? "active" : ""}" data-nav="${section.id}" ${section.id === activeSection?.id ? 'aria-current="page"' : ""}>
          <span class="section-tabs__icon section-tabs__icon--${escapeAttr(section.tone || "green")}">${renderIcon(section.icon)}</span>
          <span>
            <strong>${escapeHtml(section.label)}</strong>
            <small>${escapeHtml(section.summary)}</small>
          </span>
        </button>
      `).join("")}
    </nav>
  `;
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
        <p>Use este inicio para detectar mora, revisar caja y entrar rápido a las operaciones del día.</p>
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
          <span class="eyebrow">Acceso rápido</span>
          <h2>Operaciones frecuentes</h2>
        </div>
      </div>
      <div class="home-action-grid">
        ${homeActionCard("Cobranza", "Socios atrasados y registro de gestiones.", "morosos", "Revisar")}
        ${homeActionCard("Nuevo préstamo", "Cargar crédito interno con cronograma.", "prestamos", "Abrir")}
        ${homeActionCard("Venta fiada", "Registrar productos vendidos a socios.", "productos", "Vender")}
        ${homeActionCard("Caja", "Ingresos, egresos y saldo disponible.", "caja", "Registrar")}
      </div>
    </section>

    <div class="grid grid--metrics compact-metrics">
      ${metric("Caja disponible", money(summary.cashBalance), `${money(summary.monthIncome)} ingresos del mes`, summary.cashBalance >= 0 ? "green" : "red")}
      ${metric("Total vencido", money(summary.overdueTotal), `${summary.overdueMembersCount} socios morosos`, summary.overdueTotal ? "red" : "green")}
      ${metric("Saldo deuda general", money(summary.debtPending), nextDebt ? `${daysLabel(nextDebt.dueDate)} para próxima cuota` : "Sin cuotas pendientes", summary.debtPending > 0 ? "amber" : "green")}
      ${metric("Margen estimado", money(summary.estimatedMargin), "Interés socios menos costo deuda", summary.estimatedMargin >= 0 ? "green" : "red")}
    </div>

    <div class="grid grid--two home-followup">
      <section class="panel panel--quiet">
        <div class="panel__header">
          <div>
            <h2>Próximas cuotas a cobrar</h2>
            <p>Socios con vencimientos cercanos.</p>
          </div>
          <button class="ghost-button" type="button" data-nav="calendario">Ver calendario</button>
        </div>
        ${renderEventList(upcomingCollections, "No hay cuotas de socios próximas.")}
      </section>

      <section class="panel panel--quiet">
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
  `;
}

function renderPolishedHomeHero(summary, nextDebt) {
  return `
    <section class="home-hero">
      <div class="home-hero__copy">
        <div class="home-hero__kicker">
          <span class="home-hero__mark">${renderIcon("chart")}</span>
          <span class="eyebrow">Inicio operativo</span>
        </div>
        <h2>${escapeHtml(state.settings.committeeName)}</h2>
        <p>Una portada simple para decidir qué atender primero: caja, mora, próximos pagos y operaciones del día.</p>
        <div class="home-hero__stats">
          ${miniKpi("Caja", money(summary.cashBalance), "Disponible")}
          ${miniKpi("Mora", money(summary.overdueTotal), `${summary.overdueMembersCount} socios`)}
          ${miniKpi("Préstamos", summary.activeLoans, "Activos")}
        </div>
      </div>
      <div class="home-hero__next">
        <span class="mini-label">Siguiente paso</span>
        <strong>${summary.overdueTotal > 0 ? "Cobranza" : "Control diario"}</strong>
        <p>${summary.overdueTotal > 0 ? `${money(summary.overdueTotal)} vencidos para revisar hoy.` : nextDebt ? `Próximo pago: ${formatDate(nextDebt.dueDate)} - ${money(nextDebt.total - nextDebt.paidAmount)}` : "Sin pagos generales pendientes."}</p>
        <button class="button" type="button" data-nav="${summary.overdueTotal > 0 ? "morosos" : "calendario"}">${summary.overdueTotal > 0 ? "Revisar mora" : "Ver agenda"}</button>
      </div>
      ${renderFinancialHealth(summary)}
    </section>
  `;
}

function renderFinancialHealth(summary) {
  const score = financialHealthScore(summary);
  const recovery = Math.min(100, Number(percentNumber(summary.memberLoanPaid, summary.memberLoanTotal)));
  const overdueRisk = Math.min(100, Number(percentNumber(summary.overdueTotal, summary.memberLoanPending || summary.memberLoanTotal)));
  const cashStrength = Math.min(100, Math.max(0, Number(percentNumber(Math.max(0, summary.cashBalance), Math.max(1, summary.monthExpense || summary.debtPending || summary.cashBalance)))));

  return `
    <div class="health-card">
      <div class="health-ring" style="--score:${score}">
        <strong>${score}</strong>
      </div>
      <div>
        <span class="mini-label">Salud financiera</span>
        <div class="health-bars" aria-label="Indicadores de salud financiera">
          <span>Recuperación de préstamos</span>
          <i style="--bar:${recovery}%; --bar-color: var(--primary)"></i>
          <span>Riesgo por mora</span>
          <i style="--bar:${overdueRisk}%; --bar-color: var(--red)"></i>
          <span>Respaldo de caja</span>
          <i style="--bar:${cashStrength}%; --bar-color: var(--blue)"></i>
        </div>
      </div>
    </div>
  `;
}

function financialHealthScore(summary) {
  const exposure = Math.max(1, summary.memberLoanPending + summary.debtPending + Math.abs(summary.cashBalance));
  const risk = summary.overdueTotal + Math.max(0, -summary.cashBalance);
  const marginBonus = summary.estimatedMargin > 0 ? 8 : summary.estimatedMargin < 0 ? -8 : 0;
  const score = 100 - (risk / exposure) * 100 + marginBonus;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function getPriorityAlerts(summary, nextDebt, upcomingCollections, upcomingPayments) {
  const stockLow = state.products.filter((product) => Number(product.stock) <= Number(product.minStock)).length;
  const nextCollection = upcomingCollections[0];
  const nextPayment = upcomingPayments[0] || nextDebt;
  const alerts = [];

  if (summary.overdueTotal > 0) {
    alerts.push({
      icon: "alert",
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
      icon: "bank",
      tone: daysBetween(todayISO(), dueDate) <= 7 ? "amber" : "blue",
      title: "Pago general",
      detail: `${money(amount)} vence ${formatDate(dueDate)}.`,
      target: "deuda",
      action: "Ver deuda"
    });
  }

  if (nextCollection) {
    alerts.push({
      icon: "calendar",
      tone: "blue",
      title: "Cobro proximo",
      detail: `${nextCollection.title} - ${money(nextCollection.amount)} ${daysLabel(nextCollection.date)}.`,
      target: "calendario",
      action: "Agenda"
    });
  }

  if (stockLow > 0) {
    alerts.push({
      icon: "package",
      tone: "amber",
      title: "Stock bajo",
      detail: `${stockLow} producto(s) necesitan reposición.`,
      target: "productos",
      action: "Revisar"
    });
  }

  if (!alerts.length) {
    alerts.push({
      icon: "chart",
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
      <div class="notification-card__top">
        <span class="notification-card__icon">${renderIcon(alert.icon || (alert.tone === "red" ? "alert" : "calendar"))}</span>
        <span>${escapeHtml(alert.title)}</span>
      </div>
      <p>${escapeHtml(alert.detail)}</p>
      <button class="ghost-button" type="button" data-nav="${escapeAttr(alert.target)}">${escapeHtml(alert.action)}</button>
    </article>
  `;
}

function homeActionCard(title, detail, target, action) {
  const resolved = resolveNavigationTarget(target);
  const iconName = resolved?.section?.icon || resolved?.view?.icon || "home";
  const tone = resolved?.section?.tone || resolved?.view?.tone || "green";
  return `
    <button class="home-action-card" type="button" data-nav="${escapeAttr(target)}">
      <span class="home-action-card__icon home-action-card__icon--${escapeAttr(tone)}">${renderIcon(iconName)}</span>
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
      ${insightCard("Deuda socios", money(totalMemberDebt), "Préstamos, ventas y servicios")}
      ${insightCard("Seleccionado", selected?.name || "Sin socio", "Detalle a la derecha")}
    </div>

    ${collapsiblePanel("Registrar socio", "Datos personales, estado y referencia familiar.", `
      <form class="form-grid" data-form="member">
        ${field("Nombre completo", "name", "text", "", true)}
        ${field("Número de cédula", "document", "text", "", true)}
        ${field("Teléfono", "phone", "tel", "", true)}
        ${field("Fecha de nacimiento", "birthDate", "date")}
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
      <section class="panel member-detail-panel" id="member-detail-panel" data-member-detail-panel>
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
      <button class="list-item__main" type="button" data-action="select-member" data-id="${member.id}">
        <strong>${escapeHtml(member.name)}</strong>
        <div class="list-item__meta">${escapeHtml(member.document)} · ${escapeHtml(member.phone || "Sin celular")} · ${member.birthDate ? formatDate(member.birthDate) : "Sin nacimiento"} · ${escapeHtml(member.status)}</div>
      </button>
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
        <div class="list-item__meta">Nacimiento: ${member.birthDate ? formatDate(member.birthDate) : "Sin dato"} · C.I. ${escapeHtml(member.document || "Sin dato")}</div>
        <p class="list-item__meta">${escapeHtml(member.reference || "Sin referencia familiar")}</p>
        <span class="status ${member.status === "activo" ? "status--paid" : "status--soon"}">${escapeHtml(member.status)}</span>
        <div class="toolbar person-card__actions">
          <button class="button" type="button" data-action="member-share-summary" data-member-id="${member.id}">${renderIcon("share")} Compartir cuotas</button>
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

    ${collapsiblePanel("Nueva deuda general", "Cargue las condiciones del préstamo grande tomado por el comité.", `
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
      ${insightCard("Préstamos activos", activeLoans.length, "Con saldo o seguimiento")}
      ${insightCard("Pendiente", money(pending), "Total por cobrar")}
      ${insightCard("En mora", money(overdue), overdue ? "Requiere gestion" : "Al dia")}
      ${insightCard("Historial", state.memberLoans.length, "Préstamos registrados")}
    </div>

    ${collapsiblePanel("Nuevo préstamo a socio", "Simule y apruebe créditos internos con la tasa definida por el comité.", `
      <form class="form-grid" data-form="loan">
        ${memberLookupField("Socio beneficiario", true)}
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
          menuButton("ghost-button", "Generar PDF A4", `data-action="loan-agreement" data-loan-id="${loan.id}"`),
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
                      menuButton("ghost-button", "Gestión", `data-action="collection-modal" data-loan-id="${loan.id}" data-member-id="${loan.memberId}"`)
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
            <thead><tr><th>Fecha</th><th>Socio</th><th>Habló</th><th>Respuesta</th><th>Promesa</th><th>Acciones</th></tr></thead>
            <tbody>
              ${state.collectionActions.map((action) => `<tr>
                <td>${formatDate(action.date)}</td>
                <td>${escapeHtml(memberById(action.memberId)?.name || "Socio")}</td>
                <td>${escapeHtml(action.contactBy)}</td>
                <td>${escapeHtml(action.response)}<br><span class="list-item__meta">${escapeHtml(action.notes || "")}</span></td>
                <td>${action.promiseDate ? formatDate(action.promiseDate) : "Sin fecha"}</td>
                <td>${actionMenu([
                  menuButton("danger-button", "Eliminar gestión", `data-action="collection-delete-modal" data-id="${action.id}"`)
                ])}</td>
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

    ${collapsiblePanel("Registrar servicio de maquinaria", "Controle horas, operador, lugar de trabajo y cobro.", `
      <form class="form-grid" data-form="machinery">
        ${memberLookupField("Socio o cliente externo")}
        ${selectField("Tipo de maquinaria", "machineType", [["Tractor", "Tractor"], ["Rastra", "Rastra"], ["Sembradora", "Sembradora"], ["Pulverizadora", "Pulverizadora"], ["Cosechadora", "Cosechadora"], ["Otra", "Otra"]])}
        ${field("Fecha del servicio", "date", "date", todayISO(), true)}
        ${field("Lugar del trabajo", "location", "text")}
        ${field("Horas", "hours", "number", 0)}
        ${selectField("Cobro por", "priceMode", [["hora", "Hora"], ["manual", "Manual"]])}
        ${field("Precio unitario", "unitPrice", "number", 0)}
        ${field("Operador", "operator", "text")}
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
                  <td>${escapeHtml(service.machineType)}<br><span class="list-item__meta">${service.hours} h</span></td>
                  <td>${money(service.total)}</td>
                  <td>${money(service.total - service.fuelCost - service.maintenanceCost)}</td>
                  <td class="toolbar">
                    <span class="status ${archived ? "status--info" : service.paymentStatus === "pagado" ? "status--paid" : "status--soon"}">${archived ? "deuda eliminada" : escapeHtml(service.paymentStatus)}</span>
                    ${actionMenu([
                      !archived && service.paymentStatus !== "pagado" ? menuButton("ghost-button", "Cobrar", `data-action="pay-service" data-id="${service.id}"`) : "",
                      menuButton("danger-button", "Eliminar actividad", `data-action="service-delete-modal" data-id="${service.id}"`)
                    ])}
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
      ${insightCard("Stock bajo", stockLow, "Revisar reposición")}
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
          ${memberLookupField("Socio o cliente externo")}
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
            <thead><tr><th>Producto</th><th>Categoría</th><th>Stock</th><th>Precio venta</th><th>Ganancia unitaria</th><th>Acciones</th></tr></thead>
            <tbody>
              ${state.products.map((product) => `<tr>
                <td><strong>${escapeHtml(product.name)}</strong><br><span class="list-item__meta">${escapeHtml(product.supplier || "Sin proveedor")}</span></td>
                <td>${escapeHtml(product.category)}</td>
                <td><span class="status ${Number(product.stock) <= Number(product.minStock) ? "status--overdue" : "status--paid"}">${product.stock} ${escapeHtml(product.unit)}</span></td>
                <td>${money(product.salePrice)}</td>
                <td>${money(product.salePrice - product.buyPrice)}</td>
                <td>${actionMenu([
                  menuButton("danger-button", "Eliminar producto", `data-action="product-delete-modal" data-id="${product.id}"`)
                ])}</td>
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
                    ${actionMenu([
                      !archived && sale.status !== "pagado" ? menuButton("ghost-button", "Cobrar", `data-action="pay-sale" data-id="${sale.id}"`) : "",
                      menuButton("danger-button", "Eliminar actividad", `data-action="sale-delete-modal" data-id="${sale.id}"`)
                    ])}
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
          <thead><tr><th>Fecha</th><th>Tipo</th><th>Categoría</th><th>Descripción</th><th>Monto</th><th>Acciones</th></tr></thead>
          <tbody>
            ${state.cashMovements.slice().sort((a, b) => b.date.localeCompare(a.date)).map((movement) => `<tr>
              <td>${formatDate(movement.date)}</td>
              <td><span class="status ${movement.type === "ingreso" ? "status--paid" : "status--soon"}">${escapeHtml(movement.type)}</span></td>
              <td>${escapeHtml(movement.category)}</td>
              <td>${escapeHtml(movement.description || "")}</td>
              <td>${money(movement.amount)}</td>
              <td>${actionMenu([
                menuButton("danger-button", "Eliminar movimiento", `data-action="cash-delete-modal" data-id="${movement.id}"`)
              ])}</td>
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
    <div class="report-screen">
      <div class="insight-strip">
        ${insightCard("Saldo actual", money(summary.cashBalance), "Caja disponible")}
        ${insightCard("Total vencido", money(summary.overdueTotal), summary.overdueTotal ? "Requiere seguimiento" : "Sin mora activa")}
        ${insightCard("Margen estimado", money(summary.estimatedMargin), "Intereses menos costo financiero")}
        ${insightCard("Registros", totalRecords(), "Datos guardados")}
      </div>
      <div class="report-grid">
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
        ${field("Presidente del comité", "presidentName", "text", state.settings.presidentName)}
        ${field("C.I. presidente", "presidentDocument", "text", state.settings.presidentDocument)}
        ${field("Tesorero", "treasurerName", "text", state.settings.treasurerName)}
        ${field("C.I. tesorero", "treasurerDocument", "text", state.settings.treasurerDocument)}
        ${field("Secretario", "secretaryName", "text", state.settings.secretaryName)}
        ${field("C.I. secretario", "secretaryDocument", "text", state.settings.secretaryDocument)}
        <div class="field field--wide">
          <button class="button" type="submit">Guardar configuración</button>
        </div>
      </form>
    </section>
    <section class="panel">
      <div class="panel__header">
        <div>
          <h2>Seguridad de acceso</h2>
          <p>Defina un PIN local para abrir la app. El PIN maestro permite recuperar el acceso si se olvida el PIN configurado.</p>
        </div>
        <span class="status ${security.enabled ? "status--paid" : "status--soon"}">${security.enabled ? "Protegida" : "Sin bloqueo"}</span>
      </div>
      <form class="form-grid" data-form="security">
        ${selectField("Bloqueo por PIN", "securityEnabled", [["si", "Activado"], ["no", "Desactivado"]], security.enabled ? "si" : "no")}
        <label class="field">PIN actual o maestro
          <input name="currentPin" type="password" inputmode="numeric" pattern="[0-9]*" autocomplete="current-password" required>
        </label>
        <label class="field">Nuevo PIN
          <input name="newPin" type="password" inputmode="numeric" pattern="[0-9]*" autocomplete="new-password" minlength="4" maxlength="8">
        </label>
        <label class="field">Confirmar PIN
          <input name="confirmPin" type="password" inputmode="numeric" pattern="[0-9]*" autocomplete="new-password" minlength="4" maxlength="8">
        </label>
        <div class="field field--wide">
          <button class="button" type="submit">Guardar seguridad</button>
        </div>
      </form>
      <div class="kpi-row" style="margin-top: 14px;">
        ${miniKpi("Estado", security.enabled ? "PIN activo" : "PIN inactivo", security.updatedAt ? `Actualizado ${formatDate(security.updatedAt)}` : "Sin cambios guardados")}
        ${miniKpi("Recuperación", "PIN maestro", "Disponible para recuperar acceso")}
        ${miniKpi("Alcance", "Este dispositivo", "Protección local de la app")}
        ${miniKpi("Bloqueo", security.enabled ? "Manual y al abrir" : "Desactivado", "Use el botón para probar")}
      </div>
      <div class="toolbar" style="margin-top: 14px;">
        <button class="ghost-button" type="button" data-action="lock-now" ${security.enabled && security.pinHash ? "" : "disabled"}>${renderIcon("sliders")} Bloquear ahora</button>
      </div>
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
  const formMatch = content.match(/data-form="([^"]+)"/);
  if (formMatch) {
    return `
      <section class="panel form-launch-panel">
        <div class="panel__header">
          <div>
            <h2>${escapeHtml(title)}</h2>
            <p>${escapeHtml(description)}</p>
          </div>
          <button class="button" type="button" data-action="open-form" data-form-title="${escapeAttr(title)}">Abrir formulario</button>
        </div>
        <template data-form-template>${content}</template>
      </section>
    `;
  }

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

function openFormModal(button) {
  const panel = button.closest(".form-launch-panel");
  const template = panel?.querySelector("template[data-form-template]");
  if (!template) return;
  openModal(button.dataset.formTitle || "Formulario", template.innerHTML, { confirmSave: true });
}

function scheduleMemberDetailScroll() {
  requestAnimationFrame(() => {
    requestAnimationFrame(scrollToMemberDetail);
  });
}

function scrollToMemberDetail() {
  const detail = document.querySelector("[data-member-detail-panel]");
  if (!detail) return;
  detail.scrollIntoView({ behavior: "smooth", block: "start" });
}

function closeActionMenus(except = null) {
  document.querySelectorAll(".action-menu[open]").forEach((menu) => {
    if (menu !== except) menu.open = false;
  });
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
  if (["unlock", "security"].includes(form.dataset.form)) return "";
  const contextNames = ["kind", "itemId", "installmentId", "loanId"];
  const context = contextNames
    .map((name) => {
      const field = form.querySelector(`input[type="hidden"][name="${name}"]`);
      return field ? `${name}:${field.value}` : "";
    })
    .filter(Boolean)
    .join("|");
  const section = getActiveSection(ui.view);
  const scope = section?.id || ui.view;
  return `${scope}:${form.dataset.form}${context ? `:${context}` : ""}`;
}

function setFormBaseline(form, data = formDraftData(form)) {
  form.dataset.initialData = JSON.stringify(data);
}

function getFormBaseline(form) {
  try {
    return JSON.parse(form.dataset.initialData || "{}");
  } catch {
    return {};
  }
}

function sameDraftValue(a, b) {
  return String(a ?? "").trim() === String(b ?? "").trim();
}

function formDataChanged(data, baseline) {
  const keys = new Set([...Object.keys(data), ...Object.keys(baseline)]);
  return [...keys].some((key) => !sameDraftValue(data[key], baseline[key]));
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

function draftHasUserContent(data, baseline = {}) {
  return Object.entries(data).some(([name, value]) => {
    if (["kind", "itemId", "installmentId", "memberId", "loanId"].includes(name)) return false;
    const text = String(value || "").trim();
    return text !== "" && !sameDraftValue(text, baseline[name]);
  });
}

function saveFormDraft(form) {
  const key = formDraftKey(form);
  if (!key) return;
  const data = formDraftData(form);
  const baseline = getFormBaseline(form);
  const drafts = loadFormDrafts();

  if (formDataChanged(data, baseline) && draftHasUserContent(data, baseline)) {
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
    const key = formDraftKey(form);
    if (!key) return;
    setFormBaseline(form);
    const draft = drafts[key];
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
  if (!key) return;
  const drafts = loadFormDrafts();
  delete drafts[key];
  saveFormDrafts(drafts);
}

function hasFormDrafts(root = document) {
  const drafts = loadFormDrafts();
  if (!root || root === document) return Object.keys(drafts).length > 0;
  return [...root.querySelectorAll("form[data-form]")].some((form) => {
    const key = formDraftKey(form);
    return Boolean(key && drafts[key]);
  });
}

function confirmLeavingDrafts(root = document) {
  if (!hasFormDrafts(root)) return true;
  return confirm("Hay datos cargados en un formulario. Se guardaron como borrador para no perderlos. Desea salir de esta pantalla?");
}

function reportPanel(title, rows) {
  return `
    <section class="panel report-card">
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
  const isMoney = type === "number" && moneyFieldNames.has(name);
  const inputType = isMoney ? "text" : type;
  const inputMode = isMoney ? ` inputmode="numeric" data-money-input="true"` : type === "number" ? ` inputmode="decimal"` : "";
  const formattedValue = isMoney ? formatMoneyInputValue(value) : value;
  return `
    <label class="field">${label}
      <input name="${name}" type="${inputType}" value="${escapeAttr(formattedValue ?? "")}"${inputMode} ${required ? "required" : ""}>
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

function memberLookupField(label, required = false) {
  return `
    <div class="field member-lookup">
      <span>${escapeHtml(label)}</span>
      <input type="search" name="memberSearch" data-member-lookup ${required ? `data-member-required="true"` : ""} placeholder="Escriba nombre, cédula o teléfono" autocomplete="off">
      <input type="hidden" name="memberId" value="">
      <div class="lookup-results" data-member-results hidden></div>
      <small>${required ? "Seleccione una coincidencia para continuar." : "Seleccione una coincidencia o deje el texto como cliente externo."}</small>
    </div>
  `;
}

function empty(text) {
  return `<div class="empty-state">${escapeHtml(text)}</div>`;
}

function handleClick(event) {
  const currentActionMenu = event.target.closest(".action-menu");
  closeActionMenus(currentActionMenu);
  if (!event.target.closest(".member-lookup")) closeMemberLookupResults();

  const button = event.target.closest("button");
  if (!button) return;
  notifyAndroidTap();

  if (button.dataset.nav) {
    navigateTo(button.dataset.nav);
    return;
  }

  const action = button.dataset.action;
  if (!action) return;

  if (action === "toggle-menu") {
    ui.menuOpen = !ui.menuOpen;
    render();
    return;
  }

  if (action === "open-form") {
    openFormModal(button);
    return;
  }

  if (action === "select-member-match") {
    selectMemberLookupMatch(button);
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
    scheduleMemberDetailScroll();
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

  if (action === "member-share-summary") {
    openMemberShareSummary(button.dataset.memberId);
  }

  if (action === "loan-archive-modal") {
    openLoanArchiveModal(button.dataset.loanId);
  }

  if (action === "loan-agreement") {
    generateLoanAgreement(button.dataset.loanId);
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

  if (action === "service-delete-modal") {
    openServiceDeleteModal(button.dataset.id);
  }

  if (action === "sale-delete-modal") {
    openSaleDeleteModal(button.dataset.id);
  }

  if (action === "product-delete-modal") {
    openProductDeleteModal(button.dataset.id);
  }

  if (action === "cash-delete-modal") {
    openCashDeleteModal(button.dataset.id);
  }

  if (action === "collection-delete-modal") {
    openCollectionDeleteModal(button.dataset.id);
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

  if (action === "lock-now") {
    clearSecuritySession();
    ui.locked = security.enabled && Boolean(security.pinHash);
    ui.lockError = "";
    render();
  }

  if (action === "print-agreement") {
    printPendingAgreement();
  }

  if (action === "download-agreement-html") {
    if (pendingAgreement) downloadLoanAgreementHtml(pendingAgreement.filename.replace(/\.pdf$/i, ".html"), pendingAgreement.html);
  }

  if (action === "share-member-summary-image") {
    sharePendingMemberImage();
  }

  if (action === "download-member-summary-image") {
    downloadPendingMemberImage();
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

  if (action === "confirm-delete-member-total") {
    deleteMemberRecord(button.dataset.memberId);
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

  if (action === "confirm-delete-loan-total") {
    deleteLoanRecord(button.dataset.loanId);
    button.closest("dialog")?.close();
    afterMutation("prestamos");
  }

  if (action === "confirm-delete-debt") {
    deleteCommitteeDebt(button.dataset.debtId);
    button.closest("dialog")?.close();
    afterMutation("deuda");
  }

  if (action === "confirm-archive-service-debt") {
    archiveServiceDebt(button.dataset.id, "Deuda eliminada manualmente durante pruebas.");
    button.closest("dialog")?.close();
    afterMutation("maquinaria");
  }

  if (action === "confirm-delete-service-total") {
    deleteServiceRecord(button.dataset.id);
    button.closest("dialog")?.close();
    afterMutation("maquinaria");
  }

  if (action === "confirm-archive-sale-debt") {
    archiveSaleDebt(button.dataset.id, "Deuda eliminada manualmente durante pruebas.");
    button.closest("dialog")?.close();
    afterMutation("productos");
  }

  if (action === "confirm-delete-sale-total") {
    deleteSaleRecord(button.dataset.id);
    button.closest("dialog")?.close();
    afterMutation("productos");
  }

  if (action === "confirm-delete-product") {
    deleteProductRecord(button.dataset.id);
    button.closest("dialog")?.close();
    afterMutation("productos");
  }

  if (action === "confirm-delete-cash") {
    deleteCashMovement(button.dataset.id);
    button.closest("dialog")?.close();
    afterMutation("caja");
  }

  if (action === "confirm-delete-collection") {
    deleteCollectionAction(button.dataset.id);
    button.closest("dialog")?.close();
    afterMutation("morosos");
  }

  if (action === "close-modal") {
    if (!confirmLeavingDrafts(button.closest("dialog"))) return;
    button.closest("dialog")?.close();
  }
}

function notifyAndroidTap() {
  try {
    window.CristoReyAndroid?.tap?.();
  } catch {
    // The Android bridge is optional; browser/PWA usage should stay silent.
  }
}

function handleInput(event) {
  if (event.target.matches("[data-money-input]")) {
    formatMoneyInput(event.target);
  }

  if (event.target.matches("[data-member-lookup]")) {
    const lookup = event.target.closest(".member-lookup");
    const hidden = lookup?.querySelector(`input[type="hidden"][name="memberId"]`);
    if (hidden) hidden.value = "";
    updateMemberLookupResults(lookup);
  }

  const form = event.target.closest("form[data-form]");
  if (form) {
    saveFormDraft(form);
  }

  if (event.target.matches("[data-search]")) {
    ui.search = event.target.value;
    render();
  }
}

function handleFocusIn(event) {
  if (event.target.matches("[data-member-lookup]")) {
    updateMemberLookupResults(event.target.closest(".member-lookup"));
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

function updateMemberLookupResults(lookup) {
  if (!lookup) return;
  const input = lookup.querySelector("[data-member-lookup]");
  const results = lookup.querySelector("[data-member-results]");
  if (!input || !results) return;

  const query = clean(input.value).toLowerCase();
  if (!query) {
    results.hidden = true;
    results.innerHTML = "";
    return;
  }

  const matches = activeMembers()
    .filter((member) => `${member.name} ${member.document} ${member.phone}`.toLowerCase().includes(query))
    .slice(0, 6);

  results.hidden = false;
  results.innerHTML = matches.length
    ? matches.map((member) => `
      <button type="button" data-action="select-member-match" data-member-id="${escapeAttr(member.id)}" data-member-name="${escapeAttr(member.name)}">
        <strong>${escapeHtml(member.name)}</strong>
        <span>${escapeHtml(member.document || "Sin cedula")} &middot; ${escapeHtml(member.phone || "Sin telefono")}</span>
      </button>
    `).join("")
    : `<span class="lookup-results__empty">Sin coincidencias. Se guardara como cliente externo.</span>`;
}

function selectMemberLookupMatch(button) {
  const lookup = button.closest(".member-lookup");
  const input = lookup?.querySelector("[data-member-lookup]");
  const hidden = lookup?.querySelector(`input[type="hidden"][name="memberId"]`);
  const results = lookup?.querySelector("[data-member-results]");
  if (!input || !hidden) return;

  input.value = button.dataset.memberName || "";
  hidden.value = button.dataset.memberId || "";
  if (results) {
    results.hidden = true;
    results.innerHTML = "";
  }

  const form = lookup.closest("form[data-form]");
  if (form) saveFormDraft(form);
}

function closeMemberLookupResults() {
  document.querySelectorAll("[data-member-results]").forEach((results) => {
    results.hidden = true;
  });
}

function findDuplicateMemberByDocument(document) {
  const key = documentDigits(document);
  if (!key) return null;
  return activeMembers().find((member) => documentDigits(member.document) === key) || null;
}

function findDuplicateProduct(name) {
  const key = normalizedKey(name);
  if (!key) return null;
  return state.products.find((product) => normalizedKey(product.name) === key) || null;
}

function findDuplicateMachineryService(candidate) {
  const clientKey = candidate.memberId ? "" : normalizedKey(candidate.clientName);
  return state.machineryServices.find((service) => {
    if (isServiceDebtArchived(service)) return false;
    const sameClient = candidate.memberId
      ? service.memberId === candidate.memberId
      : !service.memberId && normalizedKey(service.clientName) === clientKey;
    return sameClient
      && service.date === candidate.date
      && normalizedKey(service.machineType) === normalizedKey(candidate.machineType)
      && normalizedKey(service.location) === normalizedKey(candidate.location)
      && roundGs(service.hours) === roundGs(candidate.hours)
      && roundGs(service.total) === roundGs(candidate.total);
  }) || null;
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
  const dialog = form.closest("dialog");
  if (dialog?.dataset.confirmSave === "true" && !confirm("Desea guardar estos datos?")) {
    saveFormDraft(form);
    return;
  }
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
    settings: submitSettings,
    security: submitSecurity,
    unlock: submitUnlock
  };
  const result = handlers[form.dataset.form]?.(data, form);
  if (result === false) {
    saveFormDraft(form);
    return;
  }
  if (dialog?.open) dialog.close();
  if (result?.agreementLoanId) generateLoanAgreement(result.agreementLoanId);
}

function submitMember(data) {
  const document = formatDocumentNumber(data.document);
  const duplicated = findDuplicateMemberByDocument(document);
  if (duplicated) {
    alert(`Ya existe un socio con la C.I. ${document}: ${duplicated.name}. Verifique el registro antes de crear otro.`);
    return false;
  }

  state.members.unshift({
    id: uid("soc"),
    name: clean(data.name),
    document,
    phone: clean(data.phone),
    birthDate: data.birthDate || "",
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
  const member = resolveMemberFromLookup(data.memberId, data.memberSearch);
  if (!member) {
    alert("Debe seleccionar un socio.");
    return false;
  }
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
  const loan = {
    id: uid("pre"),
    memberId: member.id,
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
  return { agreementLoanId: loan.id };
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
  const member = resolveMemberFromLookup(data.memberId, data.memberSearch);
  const hours = num(data.hours);
  const unitPrice = num(data.unitPrice);
  const total = data.priceMode === "hora"
    ? hours * unitPrice
    : num(data.manualTotal);
  const serviceDate = data.date || todayISO();
  const clientName = member?.name || clean(data.memberSearch) || "Cliente externo";
  const duplicated = findDuplicateMachineryService({
    memberId: member?.id || "",
    clientName,
    machineType: data.machineType,
    date: serviceDate,
    location: clean(data.location),
    hours,
    total: roundGs(total)
  });
  if (duplicated) {
    alert(`Ya existe un servicio similar para ${duplicated.clientName} el ${formatDate(duplicated.date)} con ${duplicated.machineType}. Revise el historial antes de duplicarlo.`);
    return false;
  }

  const service = {
    id: uid("maq"),
    memberId: member?.id || "",
    clientName,
    machineType: data.machineType,
    date: serviceDate,
    location: clean(data.location),
    hours,
    hectares: 0,
    priceMode: data.priceMode,
    unitPrice,
    operator: clean(data.operator),
    fuelLiters: 0,
    fuelCost: 0,
    maintenanceCost: 0,
    total: roundGs(total),
    paymentStatus: data.paymentStatus,
    notes: clean(data.notes)
  };
  state.machineryServices.unshift(service);
  if (service.paymentStatus === "pagado") {
    addMovement("ingreso", "Servicio de maquinaria", service.total, `Servicio de ${service.machineType} a ${service.clientName}`, "maquinaria", service.id, service.date);
  }
  afterMutation("maquinaria");
}

function submitProduct(data) {
  const name = clean(data.name);
  const duplicated = findDuplicateProduct(name);
  if (duplicated) {
    alert(`Ya existe un producto con el nombre "${duplicated.name}". Actualice ese registro o use un nombre distinto.`);
    return false;
  }

  state.products.unshift({
    id: uid("pro"),
    name,
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
    addMovement("egreso", "Compra de productos", num(data.buyPrice) * num(data.stock), `Carga inicial de ${name}`, "producto", "", todayISO());
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
  const member = resolveMemberFromLookup(data.memberId, data.memberSearch);
  const unitPrice = num(data.unitPrice) || Number(product.salePrice);
  const discount = num(data.discount);
  const total = Math.max(0, quantity * unitPrice - discount);
  const paidAmount = data.paymentType === "contado" ? total : Math.min(num(data.paidAmount), total);
  const sale = {
    id: uid("ven"),
    productId: product.id,
    memberId: member?.id || "",
    clientName: member?.name || clean(data.memberSearch) || "Cliente externo",
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
    backupFrequency: data.backupFrequency,
    presidentName: clean(data.presidentName),
    presidentDocument: formatDocumentNumber(data.presidentDocument),
    treasurerName: clean(data.treasurerName),
    treasurerDocument: formatDocumentNumber(data.treasurerDocument),
    secretaryName: clean(data.secretaryName),
    secretaryDocument: formatDocumentNumber(data.secretaryDocument)
  };
  afterMutation("config");
}

function submitSecurity(data) {
  const currentPin = clean(data.currentPin);
  const newPin = clean(data.newPin);
  const confirmPin = clean(data.confirmPin);
  const enableSecurity = data.securityEnabled === "si";

  if (!isSecurityPinValid(currentPin)) {
    alert("PIN actual o maestro incorrecto.");
    return false;
  }

  if (enableSecurity) {
    if (!security.pinHash && !newPin) {
      alert("Ingrese un nuevo PIN para activar la seguridad.");
      return false;
    }

    if (newPin) {
      if (!/^\d{4,8}$/.test(newPin)) {
        alert("El nuevo PIN debe tener entre 4 y 8 números.");
        return false;
      }

      if (newPin !== confirmPin) {
        alert("La confirmación del PIN no coincide.");
        return false;
      }

      security = {
        ...security,
        ...createPinHash(newPin)
      };
    }

    security.enabled = true;
  } else {
    security.enabled = false;
    security.pinHash = "";
    security.pinSalt = "";
    clearSecuritySession();
  }

  security.updatedAt = todayISO();
  saveSecurity();
  if (security.enabled) setSecuritySessionUnlocked();
  ui.locked = false;
  ui.lockError = "";
  render();
}

function submitUnlock(data) {
  if (!isSecurityPinValid(data.pin)) {
    ui.lockError = "PIN incorrecto. Ingrese el PIN configurado o el PIN maestro de recuperación.";
    render();
    return false;
  }

  setSecuritySessionUnlocked();
  ui.locked = false;
  ui.lockError = "";
  render();
}

async function openMemberShareSummary(memberId) {
  const member = memberById(memberId);
  if (!member) {
    alert("No se encontró el socio para generar el resumen.");
    return;
  }

  try {
    const dataUrl = await createMemberSummaryImage(member);
    const filename = memberShareFilename(member);
    pendingMemberShare = { filename, dataUrl, memberName: member.name };
    const dialog = openModal("Resumen de cuotas para compartir", `
      <div class="member-share-preview-shell">
        <div class="notice">
          Revise la imagen antes de compartir. En Android podrá enviarla por WhatsApp u otra aplicación desde el panel nativo.
        </div>
        <div class="member-share-preview-frame">
          <img class="member-share-preview" src="${escapeAttr(dataUrl)}" alt="Resumen de cuotas de ${escapeAttr(member.name)}">
        </div>
        <div class="toolbar member-share-preview-actions">
          <button class="button" type="button" data-action="share-member-summary-image">${renderIcon("share")} Compartir imagen</button>
          <button class="ghost-button" type="button" data-action="download-member-summary-image">${renderIcon("download")} Descargar PNG</button>
          <button class="ghost-button" type="button" data-action="close-modal">Cerrar</button>
        </div>
      </div>
    `, { wide: true });
    dialog?.addEventListener("close", () => {
      if (pendingMemberShare?.filename === filename) pendingMemberShare = null;
    }, { once: true });
  } catch (error) {
    console.error(error);
    alert("No se pudo generar la imagen del resumen de cuotas.");
  }
}

async function sharePendingMemberImage() {
  if (!pendingMemberShare) return;
  const { filename, dataUrl, memberName } = pendingMemberShare;

  if (window.CristoReyAndroid?.shareImage) {
    window.CristoReyAndroid.shareImage(filename, dataUrl);
    return;
  }

  try {
    const blob = dataUrlToBlob(dataUrl);
    const file = typeof File !== "undefined" ? new File([blob], filename, { type: "image/png" }) : null;
    const sharePayload = file
      ? { files: [file], title: "Resumen de cuotas", text: `Resumen de cuotas de ${memberName}` }
      : null;

    if (sharePayload && navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
      await navigator.share(sharePayload);
      return;
    }
  } catch (error) {
    if (error?.name === "AbortError") return;
    console.warn(error);
  }

  downloadPendingMemberImage();
  alert("Este navegador no permite compartir la imagen directamente. Se descargó el PNG para enviarlo manualmente.");
}

function downloadPendingMemberImage() {
  if (!pendingMemberShare) return;
  const link = document.createElement("a");
  link.href = pendingMemberShare.dataUrl;
  link.download = pendingMemberShare.filename;
  document.body.append(link);
  link.click();
  link.remove();
}

function dataUrlToBlob(dataUrl) {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/data:(.*?);/)?.[1] || "image/png";
  const binary = atob(base64 || "");
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new Blob([bytes], { type: mime });
}

async function createMemberSummaryImage(member) {
  const summary = getMemberInstallmentSummary(member);
  const visibleRows = summary.pendingRows.slice(0, 12);
  const extraRows = Math.max(0, summary.pendingRows.length - visibleRows.length);
  const rowHeight = 64;
  const height = Math.max(1180, 650 + visibleRows.length * rowHeight + (extraRows ? 48 : 0));
  const width = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas no disponible");

  ctx.fillStyle = "#f6f8f3";
  ctx.fillRect(0, 0, width, height);

  const headerGradient = ctx.createLinearGradient(0, 0, width, 220);
  headerGradient.addColorStop(0, "#145237");
  headerGradient.addColorStop(1, "#255cc7");
  ctx.fillStyle = headerGradient;
  ctx.fillRect(0, 0, width, 230);

  const icon = await loadCanvasImage("assets/icon.png").catch(() => null);
  if (icon) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(94, 82, 48, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(icon, 46, 34, 96, 96);
    ctx.restore();
  } else {
    drawCircle(ctx, 94, 82, 48, "#ffffff");
    drawText(ctx, initials(member.name), 94, 92, 86, 34, { align: "center", color: "#145237", font: "800 34px Arial" });
  }

  drawText(ctx, state.settings.committeeName || "Comité de Productores Cristo Rey", 164, 62, 820, 34, {
    color: "#ffffff",
    font: "800 34px Arial"
  });
  drawText(ctx, "Resumen de cuotas del socio", 164, 104, 820, 30, {
    color: "rgba(255,255,255,0.88)",
    font: "500 24px Arial"
  });
  drawText(ctx, `Generado el ${formatDate(todayISO())}`, 164, 140, 820, 24, {
    color: "rgba(255,255,255,0.78)",
    font: "500 20px Arial"
  });

  drawRoundRect(ctx, 44, 170, 992, 210, 18, "#ffffff", "rgba(18, 32, 25, 0.12)");
  drawText(ctx, member.name, 74, 224, 620, 40, { color: "#122019", font: "800 38px Arial" });
  drawText(ctx, `C.I. ${member.document || "Sin dato"} · ${member.phone || "Sin celular"}`, 74, 268, 640, 26, {
    color: "#52606d",
    font: "500 22px Arial"
  });
  drawText(ctx, member.address || "Sin dirección cargada", 74, 302, 640, 24, { color: "#52606d", font: "500 20px Arial" });
  drawText(ctx, "Saldo pendiente", 760, 226, 240, 24, { color: "#68766d", font: "700 18px Arial", align: "right" });
  drawText(ctx, money(summary.pendingTotal), 760, 268, 240, 34, { color: "#b3261e", font: "800 34px Arial", align: "right" });
  drawText(ctx, summary.overdueTotal ? `${money(summary.overdueTotal)} vencidos` : "Sin mora activa", 760, 306, 240, 24, {
    color: summary.overdueTotal ? "#b3261e" : "#145237",
    font: "700 20px Arial",
    align: "right"
  });

  const cardY = 410;
  const kpis = [
    ["Cuotas pendientes", String(summary.pendingRows.length), "Por cobrar"],
    ["Cuotas vencidas", String(summary.overdueRows.length), summary.overdueRows.length ? "Requiere gestión" : "Al día"],
    ["Pagado", money(summary.paidTotal), percent(summary.paidTotal, summary.scheduledTotal)],
    ["Préstamos", String(summary.loans.length), "Historial"]
  ];
  kpis.forEach(([label, value, hint], index) => {
    const x = 44 + index * 248;
    drawRoundRect(ctx, x, cardY, 228, 120, 14, "#ffffff", "rgba(18, 32, 25, 0.1)");
    drawText(ctx, label, x + 18, cardY + 34, 192, 22, { color: "#68766d", font: "700 18px Arial" });
    drawText(ctx, value, x + 18, cardY + 74, 192, 28, { color: "#122019", font: "800 25px Arial" });
    drawText(ctx, hint, x + 18, cardY + 102, 192, 20, { color: "#52606d", font: "500 16px Arial" });
  });

  const next = summary.nextRow;
  drawRoundRect(ctx, 44, 560, 992, 70, 14, next ? "#e8efff" : "#e3f3e8", next ? "#bfdbfe" : "#b9dec5");
  drawText(ctx, "Próximo vencimiento", 72, 604, 260, 26, { color: next ? "#255cc7" : "#145237", font: "800 22px Arial" });
  drawText(ctx, next ? `${formatDate(next.dueDate)} · ${money(next.pending)} · cuota ${next.number}/${next.count}` : "Sin cuotas pendientes", 338, 604, 660, 26, {
    color: "#122019",
    font: "700 22px Arial",
    align: "right"
  });

  const tableY = 668;
  drawText(ctx, "Detalle de cuotas pendientes", 44, tableY, 660, 32, { color: "#122019", font: "800 30px Arial" });
  drawText(ctx, "Cuota", 64, tableY + 58, 120, 22, { color: "#68766d", font: "800 18px Arial" });
  drawText(ctx, "Vencimiento", 204, tableY + 58, 190, 22, { color: "#68766d", font: "800 18px Arial" });
  drawText(ctx, "Concepto", 414, tableY + 58, 310, 22, { color: "#68766d", font: "800 18px Arial" });
  drawText(ctx, "Saldo", 752, tableY + 58, 160, 22, { color: "#68766d", font: "800 18px Arial", align: "right" });
  drawText(ctx, "Estado", 928, tableY + 58, 108, 22, { color: "#68766d", font: "800 18px Arial", align: "right" });

  if (!visibleRows.length) {
    drawRoundRect(ctx, 44, tableY + 86, 992, 130, 14, "#ffffff", "rgba(18, 32, 25, 0.1)");
    drawText(ctx, "Este socio no registra cuotas pendientes al día de hoy.", 540, tableY + 150, 930, 28, {
      color: "#145237",
      font: "800 25px Arial",
      align: "center"
    });
  }

  visibleRows.forEach((row, index) => {
    const y = tableY + 86 + index * rowHeight;
    drawRoundRect(ctx, 44, y, 992, rowHeight - 8, 12, index % 2 ? "#ffffff" : "#f8faf8", "rgba(18, 32, 25, 0.06)");
    drawText(ctx, `${row.number}/${row.count}`, 64, y + 36, 120, 22, { color: "#122019", font: "800 20px Arial" });
    drawText(ctx, formatDate(row.dueDate), 204, y + 36, 190, 22, { color: "#26352e", font: "700 19px Arial" });
    drawText(ctx, row.purpose, 414, y + 34, 300, 20, { color: "#26352e", font: "700 18px Arial", maxLines: 1 });
    drawText(ctx, money(row.pending), 752, y + 36, 160, 22, { color: "#122019", font: "800 20px Arial", align: "right" });
    drawStatusBadge(ctx, row.status, 924, y + 15);
  });

  if (extraRows) {
    const y = tableY + 86 + visibleRows.length * rowHeight;
    drawText(ctx, `+ ${extraRows} cuota(s) pendiente(s) más en el historial del socio.`, 64, y + 30, 940, 24, {
      color: "#52606d",
      font: "700 20px Arial"
    });
  }

  const footerY = height - 72;
  drawText(ctx, "Comité Cristo Rey · Resumen informativo generado por la app", 44, footerY, 700, 24, {
    color: "#52606d",
    font: "600 20px Arial"
  });
  drawText(ctx, "Verifique caja y pagos antes de tomar decisiones formales.", 44, footerY + 28, 850, 22, {
    color: "#68766d",
    font: "500 18px Arial"
  });

  return canvas.toDataURL("image/png");
}

function getMemberInstallmentSummary(member) {
  const loans = state.memberLoans.filter((loan) => loan.memberId === member.id && !isLoanArchived(loan));
  const allRows = loans.flatMap((loan) => loan.installments.map((installment) => {
    const pending = Math.max(0, Number(installment.total) - Number(installment.paidAmount));
    return {
      loanId: loan.id,
      purpose: clean(loan.purpose) || "Préstamo",
      number: installment.number,
      count: loan.installments.length,
      dueDate: installment.dueDate,
      total: installment.total,
      paidAmount: installment.paidAmount,
      pending,
      status: installmentStatus(installment)
    };
  }));
  const pendingRows = allRows
    .filter((row) => row.status !== "pagado" && row.pending > 0)
    .sort(byDate);
  const overdueRows = pendingRows.filter((row) => row.status === "atrasado");

  return {
    loans,
    allRows,
    pendingRows,
    overdueRows,
    nextRow: pendingRows[0] || null,
    scheduledTotal: sumArray(allRows.map((row) => row.total)),
    paidTotal: sumArray(allRows.map((row) => row.paidAmount)),
    pendingTotal: sumArray(pendingRows.map((row) => row.pending)),
    overdueTotal: sumArray(overdueRows.map((row) => row.pending))
  };
}

function memberShareFilename(member) {
  return `resumen_cuotas_${slugify(member.name)}_${todayISO()}.png`;
}

function loadCanvasImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function drawText(ctx, text, x, y, maxWidth, lineHeight, options = {}) {
  const font = options.font || "500 20px Arial";
  const color = options.color || "#122019";
  const align = options.align || "left";
  const maxLines = options.maxLines || 2;
  ctx.save();
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  const anchorX = align === "right" ? x + maxWidth : align === "center" ? x : x;
  const words = String(text ?? "").split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";
  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth || !current) {
      current = next;
      return;
    }
    lines.push(current);
    current = word;
  });
  if (current) lines.push(current);
  const visibleLines = lines.slice(0, maxLines);
  if (lines.length > maxLines) {
    let last = visibleLines[visibleLines.length - 1] || "";
    while (last && ctx.measureText(`${last}...`).width > maxWidth) last = last.slice(0, -1);
    visibleLines[visibleLines.length - 1] = `${last.trim()}...`;
  }
  visibleLines.forEach((line, index) => ctx.fillText(line, anchorX, y + index * lineHeight));
  ctx.restore();
}

function drawRoundRect(ctx, x, y, width, height, radius, fill, stroke = "") {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.restore();
}

function drawCircle(ctx, x, y, radius, fill) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.restore();
}

function drawStatusBadge(ctx, status, x, y) {
  const label = {
    atrasado: "Mora",
    "por vencer": "Pronto",
    pendiente: "Pendiente",
    pagado: "Pagado"
  }[status] || status;
  const colors = {
    atrasado: ["#fde8e5", "#b3261e"],
    "por vencer": ["#fff1cf", "#a56008"],
    pendiente: ["#e8efff", "#255cc7"],
    pagado: ["#e3f3e8", "#145237"]
  }[status] || ["#edf1f4", "#52606d"];
  drawRoundRect(ctx, x, y, 92, 30, 15, colors[0], "");
  drawText(ctx, label, x + 46, y + 21, 86, 18, { align: "center", color: colors[1], font: "800 15px Arial", maxLines: 1 });
}

function generateLoanAgreement(loanId) {
  const loan = state.memberLoans.find((item) => item.id === loanId);
  const member = loan ? memberById(loan.memberId) : null;
  if (!loan || !member) {
    alert("No se encontró el préstamo o el socio para generar el acuerdo.");
    return;
  }

  const filename = `${loanAgreementFilename(loan, member)}.pdf`;
  const html = buildLoanAgreementHtml(loan, member);
  openAgreementPreview(filename, html);
}

function openAgreementPreview(filename, html) {
  pendingAgreement = { filename, html };
  const dialog = openModal("Previsualización del compromiso de pago", `
    <div class="agreement-preview-shell">
      <div class="notice">
        Revise el documento antes de imprimir. Al continuar se abrirá el diálogo de impresión del sistema para guardar o imprimir en PDF A4.
      </div>
      <iframe class="agreement-preview" title="Previsualización del compromiso de pago"></iframe>
      <div class="toolbar agreement-preview-actions">
        <button class="button" type="button" data-action="print-agreement">${renderIcon("printer")} Imprimir / guardar PDF A4</button>
        <button class="ghost-button" type="button" data-action="download-agreement-html">${renderIcon("download")} Descargar HTML</button>
        <button class="ghost-button" type="button" data-action="close-modal">Cerrar</button>
      </div>
    </div>
  `, { wide: true });
  const frame = dialog?.querySelector(".agreement-preview");
  if (frame) frame.srcdoc = html;
  dialog?.addEventListener("close", () => {
    if (pendingAgreement?.filename === filename) pendingAgreement = null;
  }, { once: true });
}

function printPendingAgreement() {
  if (!pendingAgreement) return;
  const { filename, html } = pendingAgreement;

  if (window.CristoReyAndroid?.printAgreement) {
    window.CristoReyAndroid.printAgreement(filename, html);
    return;
  }

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    downloadLoanAgreementHtml(filename.replace(/\.pdf$/i, ".html"), html);
    alert("No se pudo abrir la ventana de impresión. Se descargó una versión HTML para abrir e imprimir como PDF A4.");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 450);
}

function buildLoanAgreementHtml(loan, member) {
  const committeeName = state.settings.committeeName || "Comité de Productores Cristo Rey";
  const locality = state.settings.locality || "Cristo Rey";
  const committeeRuc = "80107167-4";
  const legalPlace = "3 de Febrero, Departamento de Caaguazú, República del Paraguay";
  const committeeAddress = `Barrio ${locality} del Distrito de 3 de Febrero, Departamento de Caaguazú`;
  const president = {
    role: "Presidente",
    name: clean(state.settings.presidentName) || "Jorge Milciades Amarilla Samudio",
    document: clean(state.settings.presidentDocument) || "1.282.181"
  };
  const treasurer = {
    role: "Tesorero",
    name: clean(state.settings.treasurerName) || "Luis German Ayala G.",
    document: clean(state.settings.treasurerDocument) || "5.318.546"
  };
  const secretary = {
    role: "Secretario/a",
    name: clean(state.settings.secretaryName),
    document: clean(state.settings.secretaryDocument)
  };
  const officers = [president, treasurer, secretary].filter((officer) => officer.name || officer.document);
  const representativeText = officers.map((officer) =>
    `su ${escapeHtml(officer.role)}, <strong>${escapeHtml(officer.name || "____________________________")}</strong>, con C.I.N.º <strong>${escapeHtml(officer.document || "________________")}</strong>`
  ).join("; ");
  const total = scheduledTotal(loan.installments);
  const interest = sum(loan.installments, "interest");
  const firstDue = loan.installments[0]?.dueDate || loan.firstDueDate;
  const lastDue = loan.installments.at(-1)?.dueDate || loan.firstDueDate;
  const dateParts = agreementDateParts(loan.date || todayISO());
  const signerDate = formatDate(loan.date || todayISO());
  const iconUrl = new URL("assets/icon.png", location.href).href;
  const firstInstallment = loan.installments[0];
  const fixedInstallment = firstInstallment && loan.installments.every((installment) => roundGs(installment.total) === roundGs(firstInstallment.total));
  const installmentAmount = fixedInstallment ? money(firstInstallment.total) : "Según cronograma adjunto";
  const amountWords = guaraniesInWords(loan.amount);
  const rateTypeText = { anual: "anual", mensual: "mensual", fijo: "fijo" }[loan.rateType] || loan.rateType || "anual";
  const frequencyText = frequencyLabel(loan.frequency);
  const lateRate = Number(state.settings.lateFeeMonthlyRate) ? `${state.settings.lateFeeMonthlyRate}% mensual` : "la tasa moratoria vigente";
  const debtorDocument = member.document || "________________";
  const debtorAddress = member.address || "domicilio no declarado";
  const debtorPhone = member.phone || "sin teléfono declarado";
  const loanPurpose = clean(loan.purpose) || "préstamo interno aprobado por el Comité";
  const scheduleRows = loan.installments.length ? loan.installments.map((installment) => {
    const paid = Number(installment.paidAmount) || 0;
    const pending = Math.max(0, installment.total - paid);
    const status = paid >= installment.total ? "Pagada" : paid > 0 ? `Parcial, saldo ${money(pending)}` : "Pendiente";
    return `
    <tr>
      <td>${installment.number}</td>
      <td>${formatDate(installment.dueDate)}</td>
      <td>${money(installment.principal)}</td>
      <td>${money(installment.interest)}</td>
      <td>${money(installment.total)}</td>
      <td>${escapeHtml(status)}</td>
    </tr>
  `;
  }).join("") : `<tr><td colspan="6">Sin cronograma registrado.</td></tr>`;
  const secretarySignature = secretary.name || secretary.document ? `
    <div class="signature">
      <strong>${escapeHtml(secretary.name || "____________________________")}</strong>
      <span>${escapeHtml(secretary.role)} del Comité</span>
      <small>C.I.N.º ${escapeHtml(secretary.document || "________________")}</small>
    </div>
  ` : "";

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Compromiso de pago - ${escapeHtml(member.name)}</title>
  <style>
    @page { size: A4; margin: 16mm 15mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      color: #111111;
      font-family: "Times New Roman", Georgia, serif;
      font-size: 11.2pt;
      line-height: 1.38;
    }
    h1, h2, h3, p { margin-top: 0; }
    h1 {
      margin: 12px 0 12px;
      font-size: 15.5pt;
      line-height: 1.15;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 0;
    }
    h2 {
      margin: 15px 0 7px;
      padding-bottom: 3px;
      border-bottom: 1px solid #222222;
      font-family: Arial, sans-serif;
      font-size: 9.6pt;
      text-transform: uppercase;
      letter-spacing: 0;
    }
    .doc-header {
      display: grid;
      grid-template-columns: 68px 1fr;
      gap: 12px;
      align-items: center;
      margin-bottom: 10px;
      border-bottom: 2px solid #222222;
      padding-bottom: 10px;
    }
    .doc-header img {
      width: 62px;
      height: 62px;
      border-radius: 50%;
      object-fit: cover;
    }
    .doc-header strong {
      display: block;
      font-family: Arial, sans-serif;
      font-size: 12.6pt;
      text-transform: uppercase;
    }
    .doc-header span { display: block; }
    .muted { color: #4b5563; }
    .page-mark {
      margin: 0 0 6px;
      text-align: right;
      color: #555555;
      font-family: Arial, sans-serif;
      font-size: 8pt;
    }
    .intro,
    .clause {
      margin-bottom: 8px;
      text-align: justify;
    }
    .meta-grid,
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 6px 14px;
      margin: 10px 0;
    }
    .summary-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
      border: 1px solid #9ca3af;
      padding: 8px;
    }
    .field-label {
      display: block;
      color: #374151;
      font-family: Arial, sans-serif;
      font-size: 8.8pt;
      text-transform: uppercase;
    }
    .field-value {
      font-weight: 700;
      overflow-wrap: anywhere;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      page-break-inside: auto;
    }
    th, td {
      border: 1px solid #9ca3af;
      padding: 5px 6px;
      text-align: left;
      vertical-align: top;
      font-family: Arial, sans-serif;
      font-size: 8.8pt;
    }
    th {
      background: #eef2f7;
      text-transform: uppercase;
      font-size: 7.7pt;
    }
    tr { page-break-inside: avoid; page-break-after: auto; }
    .signature-section {
      break-inside: avoid;
      margin-top: 22px;
    }
    .signature-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 22px 28px;
      margin-top: 24px;
    }
    .signature {
      min-height: 78px;
      display: grid;
      align-content: end;
      text-align: center;
      font-family: Arial, sans-serif;
    }
    .signature::before {
      content: "";
      display: block;
      border-top: 1px solid #111111;
      margin-bottom: 7px;
    }
    .signature strong {
      font-size: 9.6pt;
      text-transform: uppercase;
    }
    .signature span,
    .signature small {
      display: block;
      font-size: 8.6pt;
    }
    .fingerprint {
      width: 132px;
      height: 42px;
      margin: 8px auto 0;
      border: 1px solid #999999;
      color: #666666;
      display: grid;
      place-items: center;
      font-size: 8pt;
    }
    .small {
      font-family: Arial, sans-serif;
      font-size: 8.6pt;
    }
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <p class="page-mark">Documento generado para impresión en hoja A4</p>
  <header class="doc-header">
    <img src="${escapeAttr(iconUrl)}" alt="">
    <div>
      <strong>${escapeHtml(committeeName)}</strong>
      <span class="muted">${escapeHtml(committeeAddress)}</span>
      <span class="muted">RUC N.º ${escapeHtml(committeeRuc)} - Documento administrativo de respaldo físico</span>
    </div>
  </header>

  <h1>Documento de reconocimiento de deuda y compromiso de pago</h1>
  <p class="intro">
    En la ciudad de ${escapeHtml(legalPlace)}, a los <strong>${escapeHtml(dateParts.day)}</strong> días del mes de
    <strong>${escapeHtml(dateParts.month)}</strong> del año <strong>${escapeHtml(dateParts.year)}</strong>, comparecen por una parte
    el <strong>${escapeHtml(committeeName)}</strong>, con domicilio en ${escapeHtml(committeeAddress)}, con RUC N.º
    <strong>${escapeHtml(committeeRuc)}</strong>, representado en este acto por ${representativeText}, en adelante denominado
    <strong>EL ACREEDOR</strong>; y por la otra parte el/la señor/a <strong>${escapeHtml(member.name)}</strong>, con C.I.N.º
    <strong>${escapeHtml(debtorDocument)}</strong>, domiciliado/a en <strong>${escapeHtml(debtorAddress)}</strong>, teléfono
    <strong>${escapeHtml(debtorPhone)}</strong>, en adelante denominado/a <strong>EL/LA DEUDOR/A</strong>.
  </p>
  <p class="intro">
    Las partes, en pleno uso de sus facultades y de común acuerdo, convienen celebrar el presente documento de reconocimiento
    de deuda y compromiso de pago, sujeto a las siguientes cláusulas:
  </p>

  <h2>Datos de las partes</h2>
  <div class="meta-grid">
    <div><span class="field-label">Socio/a deudor/a</span><span class="field-value">${escapeHtml(member.name)}</span></div>
    <div><span class="field-label">Documento</span><span class="field-value">${escapeHtml(debtorDocument)}</span></div>
    <div><span class="field-label">Fecha de nacimiento</span><span class="field-value">${member.birthDate ? formatDate(member.birthDate) : "Sin dato"}</span></div>
    <div><span class="field-label">Teléfono</span><span class="field-value">${escapeHtml(debtorPhone)}</span></div>
    <div><span class="field-label">Dirección</span><span class="field-value">${escapeHtml(debtorAddress)}</span></div>
    <div><span class="field-label">Destino declarado</span><span class="field-value">${escapeHtml(loanPurpose)}</span></div>
  </div>

  <h2>Condiciones del préstamo aprobado</h2>
  <div class="summary-grid">
    <div><span class="field-label">Capital entregado</span><span class="field-value">${money(loan.amount)}</span></div>
    <div><span class="field-label">Total programado</span><span class="field-value">${money(total)}</span></div>
    <div><span class="field-label">Interés total</span><span class="field-value">${money(interest)}</span></div>
    <div><span class="field-label">Tasa ordinaria</span><span class="field-value">${loan.rate}% ${escapeHtml(rateTypeText)}</span></div>
    <div><span class="field-label">Sistema</span><span class="field-value">${escapeHtml(paymentSystems[loan.system] || loan.system)}</span></div>
    <div><span class="field-label">Monto de cuota</span><span class="field-value">${escapeHtml(installmentAmount)}</span></div>
    <div><span class="field-label">Cantidad de cuotas</span><span class="field-value">${loan.installments.length}</span></div>
    <div><span class="field-label">Frecuencia</span><span class="field-value">${escapeHtml(frequencyText)}</span></div>
    <div><span class="field-label">Desembolso</span><span class="field-value">${signerDate}</span></div>
    <div><span class="field-label">Primer vencimiento</span><span class="field-value">${formatDate(firstDue)}</span></div>
    <div><span class="field-label">Último vencimiento</span><span class="field-value">${formatDate(lastDue)}</span></div>
    <div><span class="field-label">Garantía</span><span class="field-value">${escapeHtml(loan.guarantee || "Sin dato")}</span></div>
  </div>

  <h2>Cláusulas de compromiso</h2>
  <p class="clause"><strong>PRIMERA: RECONOCIMIENTO DE DEUDA.</strong> EL/LA DEUDOR/A reconoce expresa, libre y voluntariamente adeudar al ${escapeHtml(committeeName)} la suma de <strong>${money(loan.amount)}</strong>, guaraníes <strong>${escapeHtml(amountWords)}</strong>, monto recibido en concepto de préstamo otorgado por la entidad acreedora, conforme a los registros internos y condiciones establecidos en la aplicación de gestión del Comité.</p>
  <p class="clause"><strong>SEGUNDA: CONDICIONES DEL PRÉSTAMO.</strong> El préstamo queda sujeto a las condiciones detalladas en este documento: monto otorgado ${money(loan.amount)}, fecha de desembolso ${signerDate}, tasa de interés ordinario ${loan.rate}% ${escapeHtml(rateTypeText)}, plazo total de ${loan.installments.length} cuota(s), frecuencia de pago ${escapeHtml(frequencyText)}, primer vencimiento ${formatDate(firstDue)} y vencimiento final ${formatDate(lastDue)}.</p>
  <p class="clause"><strong>TERCERA: COMPROMISO DE PAGO.</strong> EL/LA DEUDOR/A se obliga formalmente a cancelar la deuda indicada en la cláusula primera, conforme al cronograma de pagos generado y aceptado en la aplicación del Comité, el cual forma parte integrante del presente documento. Cada pago deberá realizarse en la fecha establecida, sin necesidad de requerimiento previo por parte del acreedor.</p>
  <p class="clause"><strong>CUARTA: FORMA Y LUGAR DE PAGO.</strong> Los pagos deberán ser realizados a favor del ${escapeHtml(committeeName)}, en el lugar, cuenta, medio o forma que la entidad indique formalmente, pudiendo registrarse cada abono en la aplicación de gestión del Comité, comprobante digital u otro medio válido de constancia.</p>
  <p class="clause"><strong>QUINTA: MORA POR INCUMPLIMIENTO.</strong> La falta de pago de una o más cuotas en la fecha establecida producirá la mora de pleno derecho, sin necesidad de interpelación judicial o extrajudicial alguna. En caso de atraso, EL/LA DEUDOR/A se compromete a abonar, además del capital e intereses ordinarios pendientes, los recargos, intereses moratorios, gastos administrativos o costos de cobranza que correspondan, tomando como referencia interna ${escapeHtml(lateRate)} o las condiciones registradas por el Comité.</p>
  <p class="clause"><strong>SEXTA: VENCIMIENTO ANTICIPADO.</strong> En caso de incumplimiento reiterado, falta de pago, negativa injustificada a regularizar la obligación, falsedad en los datos declarados o cualquier conducta que afecte el cumplimiento del presente compromiso, EL ACREEDOR podrá declarar vencido el plazo otorgado y exigir el pago total del saldo pendiente, incluidos intereses, recargos y gastos que correspondan.</p>
  <p class="clause"><strong>SÉPTIMA: DECLARACIÓN DEL/DE LA DEUDOR/A.</strong> EL/LA DEUDOR/A declara que los datos personales, domicilio, número de cédula, teléfono y demás informaciones proporcionadas son verdaderos y actualizados. Asimismo, declara haber recibido información clara sobre el monto del préstamo, intereses, cuotas, fechas de vencimiento, consecuencias de mora y demás condiciones de la obligación asumida.</p>
  <p class="clause"><strong>OCTAVA: AUTORIZACIÓN DE REGISTRO INTERNO.</strong> EL/LA DEUDOR/A autoriza al ${escapeHtml(committeeName)} a registrar, administrar y conservar sus datos personales, historial de pagos, estado de deuda, atrasos y demás informaciones relacionadas al presente préstamo dentro de la aplicación de gestión interna del Comité, exclusivamente para fines administrativos, contables, crediticios y de control institucional.</p>
  <p class="clause"><strong>NOVENA: VALIDEZ DEL DOCUMENTO.</strong> El presente documento constituye reconocimiento expreso de deuda y compromiso formal de pago entre las partes firmantes. La información generada por la aplicación, el cronograma de cuotas, los comprobantes de pago y los registros administrativos del Comité podrán ser utilizados como respaldo documental de la obligación asumida.</p>
  <p class="clause"><strong>DÉCIMA: JURISDICCIÓN.</strong> Para todos los efectos derivados del presente documento, las partes fijan como domicilio especial el indicado en el encabezamiento y se someten a las leyes vigentes de la República del Paraguay y a la jurisdicción de los tribunales competentes, sin perjuicio de procurar previamente una solución amistosa o administrativa dentro del Comité.</p>

  <h2>Cronograma de cuotas</h2>
  <table>
    <thead>
      <tr>
        <th>Nro.</th>
        <th>Vencimiento</th>
        <th>Capital</th>
        <th>Interés</th>
        <th>Total cuota</th>
        <th>Estado</th>
      </tr>
    </thead>
    <tbody>${scheduleRows}</tbody>
  </table>

  ${loan.notes ? `<h2>Observaciones</h2><p class="clause">${escapeHtml(loan.notes).replaceAll("\n", "<br>")}</p>` : ""}

  <div class="signature-section">
    <p class="clause">
      Leído íntegramente el presente documento, y en señal de conformidad, las partes firman al pie en dos ejemplares de un mismo tenor y a un solo efecto, en el lugar y fecha indicados precedentemente.
    </p>
  </div>

  <div class="signature-grid">
    <div class="signature">
      <strong>${escapeHtml(member.name)}</strong>
      <span>EL/LA DEUDOR/A</span>
      <small>C.I.N.º ${escapeHtml(debtorDocument)}</small>
      <div class="fingerprint">Huella dactilar</div>
    </div>
    <div class="signature">
      <strong>${escapeHtml(president.name)}</strong>
      <span>Presidente del Comité</span>
      <small>C.I.N.º ${escapeHtml(president.document)}</small>
    </div>
    <div class="signature">
      <strong>${escapeHtml(treasurer.name)}</strong>
      <span>Tesorero del Comité</span>
      <small>C.I.N.º ${escapeHtml(treasurer.document)}</small>
    </div>
    ${secretarySignature}
    <div class="signature">
      <strong>Testigo 1</strong>
      <span>Nombre, C.I.N.º y firma</span>
    </div>
    <div class="signature">
      <strong>Testigo 2</strong>
      <span>Nombre, C.I.N.º y firma</span>
    </div>
  </div>

  <p class="small muted" style="margin-top: 18px;">
    Documento generado por la app administrativa Cristo Rey el ${formatDate(todayISO())}. Revise los datos antes de imprimir y firmar.
  </p>
</body>
</html>`;
}

function loanAgreementFilename(loan, member) {
  return `acuerdo_pago_${slugify(member.name)}_${loan.date || todayISO()}`;
}

function downloadLoanAgreementHtml(filename, html) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
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
      El socio ${escapeHtml(member.name)} se ocultará de las listas activas, pero su historial quedará disponible en préstamos, ventas, servicios y reportes. También puede eliminar su deuda activa para pruebas sin borrar los movimientos existentes.
    </div>
    <div class="kpi-row" style="margin-top: 14px;">
      ${miniKpi("Deuda activa", money(pending), pending ? "Puede conservarse o eliminarse" : "Sin saldo activo")}
      ${miniKpi("Historial", "Conservado", "No se borran cuotas ni pagos")}
    </div>
    <div class="toolbar" style="margin-top: 14px;">
      <button class="danger-button" type="button" data-action="confirm-delete-member-with-debt" data-member-id="${memberId}">Eliminar socio y deuda</button>
      <button class="danger-button" type="button" data-action="confirm-delete-member-total" data-member-id="${memberId}">Borrar socio totalmente</button>
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
      ${miniKpi("Saldo a quitar", money(pending), "Préstamos, ventas fiadas y servicios pendientes")}
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
  openModal("Eliminar deuda del préstamo", `
    <div class="notice warning">
      Se quitará el saldo activo de este préstamo de ${escapeHtml(member?.name || "socio")}. El cronograma y los pagos registrados seguirán disponibles como historial.
    </div>
    <div class="kpi-row" style="margin-top: 14px;">
      ${miniKpi("Saldo a quitar", money(pending), escapeHtml(loan.purpose))}
      ${miniKpi("Historial", "Conservado", "No se borran cuotas")}
    </div>
    <div class="toolbar" style="margin-top: 14px;">
      <button class="danger-button" type="button" data-action="confirm-loan-archive" data-loan-id="${loanId}" ${pending <= 0 ? "disabled" : ""}>Eliminar deuda y conservar historial</button>
      <button class="danger-button" type="button" data-action="confirm-delete-loan-total" data-loan-id="${loanId}">Borrar préstamo totalmente</button>
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
      ${miniKpi("Saldo", money(pending), "Se quitará del comité")}
    </div>
    <div class="toolbar" style="margin-top: 14px;">
      <button class="danger-button" type="button" data-action="confirm-delete-debt" data-debt-id="${debtId}">Eliminar deuda general</button>
      <button class="ghost-button" type="button" data-action="close-modal">Cancelar</button>
    </div>
  `);
}

function openServiceDeleteModal(serviceId) {
  const service = state.machineryServices.find((item) => item.id === serviceId);
  if (!service) return;
  const pending = serviceDebtPending(service);
  openModal("Eliminar servicio de maquinaria", `
    <div class="notice warning">
      Puede quitar solo la deuda activa y conservar el historial, o borrar totalmente esta actividad y sus movimientos de caja relacionados.
    </div>
    <div class="kpi-row" style="margin-top: 14px;">
      ${miniKpi("Cliente", escapeHtml(service.clientName), escapeHtml(service.machineType))}
      ${miniKpi("Pendiente", money(pending), service.paymentStatus)}
    </div>
    <div class="toolbar" style="margin-top: 14px;">
      <button class="danger-button" type="button" data-action="confirm-archive-service-debt" data-id="${serviceId}" ${pending <= 0 || isServiceDebtArchived(service) ? "disabled" : ""}>Conservar historial</button>
      <button class="danger-button" type="button" data-action="confirm-delete-service-total" data-id="${serviceId}">Borrar totalmente</button>
      <button class="ghost-button" type="button" data-action="close-modal">Cancelar</button>
    </div>
  `);
}

function openSaleDeleteModal(saleId) {
  const sale = state.sales.find((item) => item.id === saleId);
  if (!sale) return;
  const pending = saleDebtPending(sale);
  openModal("Eliminar venta", `
    <div class="notice warning">
      Puede quitar solo la deuda activa y conservar la venta como historial, o borrar totalmente la actividad y devolver el stock.
    </div>
    <div class="kpi-row" style="margin-top: 14px;">
      ${miniKpi("Cliente", escapeHtml(sale.clientName), escapeHtml(productName(sale.productId)))}
      ${miniKpi("Pendiente", money(pending), sale.status)}
    </div>
    <div class="toolbar" style="margin-top: 14px;">
      <button class="danger-button" type="button" data-action="confirm-archive-sale-debt" data-id="${saleId}" ${pending <= 0 || isSaleDebtArchived(sale) ? "disabled" : ""}>Conservar historial</button>
      <button class="danger-button" type="button" data-action="confirm-delete-sale-total" data-id="${saleId}">Borrar totalmente</button>
      <button class="ghost-button" type="button" data-action="close-modal">Cancelar</button>
    </div>
  `);
}

function openProductDeleteModal(productId) {
  const product = state.products.find((item) => item.id === productId);
  if (!product) return;
  const salesCount = state.sales.filter((sale) => sale.productId === productId).length;
  openModal("Eliminar producto", `
    <div class="notice warning">
      Se borrara el producto del stock. Las ventas anteriores quedaran como historial, pero ya no tendran el nombre del producto disponible.
    </div>
    <div class="kpi-row" style="margin-top: 14px;">
      ${miniKpi("Producto", escapeHtml(product.name), `${product.stock} ${escapeHtml(product.unit)}`)}
      ${miniKpi("Ventas vinculadas", salesCount, "Historial conservado")}
    </div>
    <div class="toolbar" style="margin-top: 14px;">
      <button class="danger-button" type="button" data-action="confirm-delete-product" data-id="${productId}">Eliminar producto</button>
      <button class="ghost-button" type="button" data-action="close-modal">Cancelar</button>
    </div>
  `);
}

function openCashDeleteModal(movementId) {
  const movement = state.cashMovements.find((item) => item.id === movementId);
  if (!movement) return;
  openModal("Eliminar movimiento de caja", `
    <div class="notice warning">Se quitara este movimiento del saldo de caja.</div>
    <div class="kpi-row" style="margin-top: 14px;">
      ${miniKpi("Categoria", escapeHtml(movement.category), formatDate(movement.date))}
      ${miniKpi("Monto", money(movement.amount), movement.type)}
    </div>
    <div class="toolbar" style="margin-top: 14px;">
      <button class="danger-button" type="button" data-action="confirm-delete-cash" data-id="${movementId}">Eliminar movimiento</button>
      <button class="ghost-button" type="button" data-action="close-modal">Cancelar</button>
    </div>
  `);
}

function openCollectionDeleteModal(actionId) {
  const collection = state.collectionActions.find((item) => item.id === actionId);
  if (!collection) return;
  openModal("Eliminar gestión de cobranza", `
    <div class="notice warning">Se borrara esta gestion del historial de cobranza.</div>
    <div class="kpi-row" style="margin-top: 14px;">
      ${miniKpi("Socio", escapeHtml(memberById(collection.memberId)?.name || "Socio"), formatDate(collection.date))}
      ${miniKpi("Respuesta", escapeHtml(collection.response || "Sin detalle"), collection.promiseDate ? formatDate(collection.promiseDate) : "Sin promesa")}
    </div>
    <div class="toolbar" style="margin-top: 14px;">
      <button class="danger-button" type="button" data-action="confirm-delete-collection" data-id="${actionId}">Eliminar gestión</button>
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

function openModal(title, content, options = {}) {
  const dialog = document.createElement("dialog");
  dialog.className = `modal${options.wide ? " modal--wide" : ""}`;
  if (options.confirmSave) dialog.dataset.confirmSave = "true";
  dialog.innerHTML = `
      <div class="modal__box">
      <div class="modal__header">
        <h2>${escapeHtml(title)}</h2>
        <button class="icon-button" type="button" data-action="close-modal" aria-label="Cerrar">${renderIcon("close")}</button>
      </div>
      <div class="modal__content">${content}</div>
    </div>
  `;
  document.body.append(dialog);
  dialog.addEventListener("cancel", (event) => {
    if (!confirmLeavingDrafts(dialog)) event.preventDefault();
  });
  dialog.addEventListener("close", () => dialog.remove(), { once: true });
  dialog.showModal();
  restoreFormDrafts(dialog);
  return dialog;
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

function deleteMemberRecord(memberId) {
  const relatedLoanIds = new Set(state.memberLoans.filter((loan) => loan.memberId === memberId).map((loan) => loan.id));
  const relatedSaleIds = new Set(state.sales.filter((sale) => sale.memberId === memberId).map((sale) => sale.id));
  const relatedServiceIds = new Set(state.machineryServices.filter((service) => service.memberId === memberId).map((service) => service.id));

  state.members = state.members.filter((member) => member.id !== memberId);
  state.memberLoans = state.memberLoans.filter((loan) => loan.memberId !== memberId);
  state.sales = state.sales.filter((sale) => sale.memberId !== memberId);
  state.machineryServices = state.machineryServices.filter((service) => service.memberId !== memberId);
  state.collectionActions = state.collectionActions.filter((action) => action.memberId !== memberId);
  state.cashMovements = state.cashMovements.filter((movement) => {
    if (movement.relatedType === "prestamo_socio" && relatedLoanIds.has(movement.relatedId)) return false;
    if (movement.relatedType === "venta" && relatedSaleIds.has(movement.relatedId)) return false;
    if (movement.relatedType === "maquinaria" && relatedServiceIds.has(movement.relatedId)) return false;
    return true;
  });
  if (ui.selectedMemberId === memberId) ui.selectedMemberId = null;
}

function archiveLoanDebt(loanId, reason) {
  const loan = state.memberLoans.find((item) => item.id === loanId);
  if (!loan || isLoanArchived(loan)) return;
  loan.archivedDebtAt = todayISO();
  loan.archivedPendingAmount = rawLoanPending(loan);
  loan.archiveReason = reason;
  loan.status = "deuda_eliminada";
}

function deleteLoanRecord(loanId) {
  state.memberLoans = state.memberLoans.filter((loan) => loan.id !== loanId);
  state.collectionActions = state.collectionActions.filter((action) => action.loanId !== loanId);
  state.cashMovements = state.cashMovements.filter((movement) => !(movement.relatedType === "prestamo_socio" && movement.relatedId === loanId));
  if (ui.selectedLoanId === loanId) ui.selectedLoanId = null;
}

function archiveServiceDebt(serviceId, reason) {
  const service = state.machineryServices.find((item) => item.id === serviceId);
  if (!service || isServiceDebtArchived(service)) return;
  service.archivedDebtAt = todayISO();
  service.archivedPendingAmount = serviceDebtPending(service);
  service.archiveReason = reason;
  service.paymentStatus = "deuda_eliminada";
}

function deleteServiceRecord(serviceId) {
  state.machineryServices = state.machineryServices.filter((service) => service.id !== serviceId);
  state.cashMovements = state.cashMovements.filter((movement) => !(movement.relatedType === "maquinaria" && movement.relatedId === serviceId));
}

function archiveSaleDebt(saleId, reason) {
  const sale = state.sales.find((item) => item.id === saleId);
  if (!sale || isSaleDebtArchived(sale)) return;
  sale.archivedDebtAt = todayISO();
  sale.archivedPendingAmount = saleDebtPending(sale);
  sale.archiveReason = reason;
  sale.status = "deuda_eliminada";
}

function deleteSaleRecord(saleId) {
  const sale = state.sales.find((item) => item.id === saleId);
  if (!sale) return;
  const product = state.products.find((item) => item.id === sale.productId);
  if (product) product.stock = Number(product.stock) + Number(sale.quantity || 0);
  state.sales = state.sales.filter((item) => item.id !== saleId);
  state.cashMovements = state.cashMovements.filter((movement) => !(movement.relatedType === "venta" && movement.relatedId === saleId));
}

function deleteProductRecord(productId) {
  state.products = state.products.filter((product) => product.id !== productId);
}

function deleteCashMovement(movementId) {
  state.cashMovements = state.cashMovements.filter((movement) => movement.id !== movementId);
}

function deleteCollectionAction(actionId) {
  state.collectionActions = state.collectionActions.filter((action) => action.id !== actionId);
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
  applyNavigationTarget(view);
  history.replaceState(navigationState(), "");
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

function resolveMemberFromLookup(memberId, memberSearch) {
  const selected = memberById(memberId);
  if (selected && !selected.deletedAt) return selected;
  const query = clean(memberSearch).toLowerCase();
  if (!query) return null;
  return activeMembers().find((member) => {
    const values = [member.name, member.document, member.phone].map((value) => clean(value).toLowerCase());
    return values.some((value) => value === query);
  }) || null;
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

function formatMoneyInputValue(value) {
  const numeric = roundGs(num(value));
  return numeric ? numeric.toLocaleString("es-PY") : "";
}

function formatMoneyInput(input) {
  const digits = input.value.replace(/\D/g, "");
  input.value = digits ? Number(digits).toLocaleString("es-PY") : "";
}

function formatDate(iso) {
  if (!iso) return "Sin fecha";
  const [year, month, day] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat("es-PY", { day: "2-digit", month: "short", year: "numeric" })
    .format(new Date(year, month - 1, day));
}

function agreementDateParts(iso) {
  const [year, month, day] = (iso || todayISO()).split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return {
    day: String(day || date.getDate()),
    month: new Intl.DateTimeFormat("es-PY", { month: "long" }).format(date),
    year: String(year || date.getFullYear())
  };
}

function frequencyLabel(value) {
  return {
    mensual: "Mensual",
    trimestral: "Trimestral",
    semestral: "Semestral",
    anual: "Anual"
  }[value] || value || "Mensual";
}

function guaraniesInWords(value) {
  const amount = Math.abs(roundGs(value));
  return numberToSpanish(amount);
}

function numberToSpanish(value) {
  const number = Math.floor(Number(value) || 0);
  if (number === 0) return "cero";
  if (number < 1000) return numberUnderThousand(number);
  if (number < 1000000) {
    const thousands = Math.floor(number / 1000);
    const rest = number % 1000;
    const prefix = thousands === 1 ? "mil" : `${numberUnderThousand(thousands)} mil`;
    return rest ? `${prefix} ${numberUnderThousand(rest)}` : prefix;
  }
  if (number < 1000000000000) {
    const millions = Math.floor(number / 1000000);
    const rest = number % 1000000;
    const prefix = millions === 1 ? "un millón" : `${numberToSpanish(millions)} millones`;
    return rest ? `${prefix} ${numberToSpanish(rest)}` : prefix;
  }
  return number.toLocaleString("es-PY");
}

function numberUnderThousand(number) {
  const units = ["", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"];
  const teens = ["diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve"];
  const tens = ["", "", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
  const hundreds = ["", "ciento", "doscientos", "trescientos", "cuatrocientos", "quinientos", "seiscientos", "setecientos", "ochocientos", "novecientos"];
  const value = Number(number) || 0;

  if (value === 100) return "cien";
  if (value < 10) return units[value];
  if (value < 20) return teens[value - 10];
  if (value < 30) return value === 20 ? "veinte" : `veinti${units[value - 20]}`;
  if (value < 100) {
    const unit = value % 10;
    return unit ? `${tens[Math.floor(value / 10)]} y ${units[unit]}` : tens[value / 10];
  }

  const hundred = Math.floor(value / 100);
  const rest = value % 100;
  return rest ? `${hundreds[hundred]} ${numberUnderThousand(rest)}` : hundreds[hundred];
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
  const text = String(value || "").trim();
  if (!text) return 0;
  const cleaned = text.replace(/\s/g, "").replace(/[^\d,.-]/g, "");
  const normalized = /^\d{1,3}(\.\d{3})+(,\d+)?$/.test(cleaned)
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : /^\d{1,3}(,\d{3})+(\.\d+)?$/.test(cleaned)
      ? cleaned.replace(/,/g, "")
      : cleaned.replace(",", ".");
  return Number(normalized) || 0;
}

function roundGs(value) {
  return Math.round(Number(value) || 0);
}

function clean(value) {
  return String(value || "").trim();
}

function normalizedKey(value) {
  return clean(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-PY")
    .replace(/\s+/g, " ");
}

function titleCase(value) {
  return clean(value)
    .toLocaleLowerCase("es-PY")
    .replace(/(^|[\s'´-])(\p{L})/gu, (_, separator, letter) => `${separator}${letter.toLocaleUpperCase("es-PY")}`);
}

function formatDocumentNumber(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function documentDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function slugify(value) {
  return clean(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 48) || "documento";
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
