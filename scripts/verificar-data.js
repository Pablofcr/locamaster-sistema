/**
 * Verificacao dos helpers de data (src/lib/data.ts).
 *
 * Rode com:  npm run verificar:data
 *
 * O ponto central e provar que a data local nao vira o dia seguinte a noite,
 * que era o bug de `new Date().toISOString()`. Por isso o teste roda com
 * TZ=America/Sao_Paulo e com relogio congelado em horarios criticos.
 */

const { execFileSync } = require('child_process')
const os = require('os')
const path = require('path')
const fs = require('fs')

const raiz = path.resolve(__dirname, '..')
const saida = fs.mkdtempSync(path.join(os.tmpdir(), 'data-'))

try {
  execFileSync(
    'npx',
    ['tsc', 'src/lib/data.ts', '--outDir', saida, '--module', 'commonjs', '--target', 'es2017'],
    { cwd: raiz, stdio: 'inherit', shell: process.platform === 'win32' }
  )
} catch (e) {
  console.error('Falha ao compilar src/lib/data.ts')
  process.exit(1)
}

if (process.env.TZ !== 'America/Sao_Paulo') {
  // Reexecuta no fuso de Brasilia: e nele que o bug original aparecia.
  const r = require('child_process').spawnSync(process.execPath, [__filename], {
    stdio: 'inherit',
    env: { ...process.env, TZ: 'America/Sao_Paulo' },
  })
  process.exit(r.status === null ? 1 : r.status)
}

const d = require(path.join(saida, 'data.js'))

let falhas = 0
function eq(descricao, obtido, esperado) {
  const ok = obtido === esperado
  if (!ok) {
    falhas++
    console.log(`FALHOU  ${descricao}\n        esperado: ${esperado}\n        obtido:   ${obtido}`)
  } else {
    console.log(`ok      ${descricao}`)
  }
}

/** Congela o relogio em um instante e roda o corpo. */
function comRelogioEm(iso, corpo) {
  const Real = Date
  const fixo = new Real(iso).getTime()
  // eslint-disable-next-line no-global-assign
  Date = class extends Real {
    constructor(...args) {
      if (args.length === 0) super(fixo)
      else super(...args)
    }
    static now() { return fixo }
  }
  try { corpo() } finally { Date = Real }
}

console.log(`\nFuso do teste: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`)

console.log('\n--- hojeISO nos horarios em que o UTC ja virou ---')
// 22h de 09/09 em Brasilia = 01h de 10/09 em UTC. O bug antigo dava 10.
comRelogioEm('2026-09-10T01:00:00Z', () => {
  eq('22h do dia 9 continua sendo dia 9', d.hojeISO(), '2026-09-09')
})
comRelogioEm('2026-09-10T02:59:00Z', () => {
  eq('23h59 do dia 9 continua sendo dia 9', d.hojeISO(), '2026-09-09')
})
comRelogioEm('2026-09-10T03:00:00Z', () => {
  eq('meia-noite vira o dia 10', d.hojeISO(), '2026-09-10')
})
comRelogioEm('2026-09-09T15:00:00Z', () => {
  eq('meio-dia do dia 9 e dia 9', d.hojeISO(), '2026-09-09')
})

console.log('\n--- virada de mes (o caso que corrompe o fechamento) ---')
comRelogioEm('2026-10-01T01:00:00Z', () => {
  eq('22h de 30/09 ainda e setembro', d.hojeISO(), '2026-09-30')
})
comRelogioEm('2027-01-01T02:00:00Z', () => {
  eq('23h de 31/12 ainda e 2026', d.hojeISO(), '2026-12-31')
})

console.log('\n--- paraISO ---')
eq('meia-noite local', d.paraISO(new Date(2026, 8, 9, 0, 0, 0)), '2026-09-09')
eq('23h59 local', d.paraISO(new Date(2026, 8, 9, 23, 59, 0)), '2026-09-09')
eq('meio-dia local', d.paraISO(new Date(2026, 8, 9, 12, 0, 0)), '2026-09-09')
eq('ultimo dia do mes', d.paraISO(new Date(2026, 8, 30, 22, 0, 0)), '2026-09-30')
eq('ano bissexto', d.paraISO(new Date(2028, 1, 29, 22, 0, 0)), '2028-02-29')

console.log('\n--- hojeMaisDias ---')
comRelogioEm('2026-09-10T01:00:00Z', () => {
  eq('validade de 30 dias a partir do dia 9', d.hojeMaisDias(30), '2026-10-09')
  eq('zero dias e hoje', d.hojeMaisDias(0), '2026-09-09')
  eq('dias negativos voltam no tempo', d.hojeMaisDias(-9), '2026-08-31')
})
comRelogioEm('2026-01-31T15:00:00Z', () => {
  eq('atravessa a virada de mes', d.hojeMaisDias(1), '2026-02-01')
})

console.log('\n--- doISO: aritmetica ancorada ao meio-dia ---')
const base = d.doISO('2026-09-09')
eq('ida e volta preserva o dia', d.paraISO(base), '2026-09-09')
const mais1 = d.doISO('2026-09-30'); mais1.setDate(mais1.getDate() + 1)
eq('somar 1 dia atravessa o mes', d.paraISO(mais1), '2026-10-01')
const menos1 = d.doISO('2026-03-01'); menos1.setDate(menos1.getDate() - 1)
eq('subtrair 1 dia volta para fevereiro', d.paraISO(menos1), '2026-02-28')
const mes = d.doISO('2026-01-31'); mes.setMonth(mes.getMonth() + 1)
eq('somar 1 mes em 31/01 cai em marco (comportamento do JS)', d.paraISO(mes), '2026-03-03')

try { fs.rmSync(saida, { recursive: true, force: true }) } catch { /* ignore */ }

console.log('')
if (falhas > 0) {
  console.log(`${falhas} verificacao(oes) FALHARAM`)
  process.exit(1)
}
console.log('Todas as verificacoes passaram.')
