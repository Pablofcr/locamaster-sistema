/**
 * Verificacao do saldo a faturar de um contrato no mes (src/lib/saldoFaturamento.ts).
 *
 * Rode com:  npm run verificar:saldo-faturamento
 *
 * O saldo decide se um contrato ainda aparece em "Gerar Faturas" num mes que
 * ja tem fatura — caso de contrato renovado depois de o mes ter sido faturado
 * so com o periodo antigo. Errar aqui gera fatura em dobro ou deixa de cobrar,
 * entao a logica e verificada por asserts. Rode sempre que mexer no arquivo.
 *
 * O script compila saldoFaturamento.ts para a pasta temporaria do sistema,
 * entao nao deixa resto no projeto.
 */

const { execFileSync } = require('child_process')
const os = require('os')
const path = require('path')
const fs = require('fs')

const raiz = path.resolve(__dirname, '..')
const saida = fs.mkdtempSync(path.join(os.tmpdir(), 'saldo-faturamento-'))

try {
  execFileSync(
    'npx',
    ['tsc', 'src/lib/saldoFaturamento.ts', '--outDir', saida, '--module', 'commonjs', '--target', 'es2017'],
    { cwd: raiz, stdio: 'inherit', shell: process.platform === 'win32' }
  )
} catch (e) {
  console.error('Falha ao compilar src/lib/saldoFaturamento.ts')
  process.exit(1)
}

const s = require(path.join(saida, 'saldoFaturamento.js'))

let falhas = 0
function eq(descricao, obtido, esperado) {
  const ok = JSON.stringify(obtido) === JSON.stringify(esperado)
  if (!ok) {
    falhas++
    console.log(`FALHOU  ${descricao}\n        esperado: ${JSON.stringify(esperado)}\n        obtido:   ${JSON.stringify(obtido)}`)
  } else {
    console.log(`ok      ${descricao}`)
  }
}

// formatarMoeda usa espaco nao separavel entre "R$" e o valor
const NBSP = ' '
const loc9 = { id: 11, numero: 'LOC-2026-009' }

console.log('\n--- valorFaturadoDoContrato ---')
eq('sem faturas', s.valorFaturadoDoContrato([], loc9), 0)
eq('fatura simples usa valor_original',
  s.valorFaturadoDoContrato([{ locacao_id: 11, locacao_numero: 'LOC-2026-009', valor: 2500, valor_original: 2880 }], loc9), 2880)
eq('fatura simples sem valor_original usa valor',
  s.valorFaturadoDoContrato([{ locacao_id: 11, locacao_numero: 'LOC-2026-009', valor: 2880, valor_original: null }], loc9), 2880)
eq('fatura simples sem locacao_numero, pelo id',
  s.valorFaturadoDoContrato([{ locacao_id: 11, locacao_numero: null, valor: 2880, valor_original: 2880 }], loc9), 2880)
eq('fatura de outro contrato nao conta',
  s.valorFaturadoDoContrato([{ locacao_id: 12, locacao_numero: 'LOC-2026-010', valor: 5000, valor_original: 5000 }], loc9), 0)
eq('numero parecido nao conta (LOC-2026-0090)',
  s.valorFaturadoDoContrato([{ locacao_id: 99, locacao_numero: 'LOC-2026-0090', valor: 5000, valor_original: 5000 }], loc9), 0)
eq('soma fatura original + complemento',
  s.valorFaturadoDoContrato([
    { locacao_id: 11, locacao_numero: 'LOC-2026-009', valor: 2880, valor_original: 2880 },
    { locacao_id: 11, locacao_numero: 'LOC-2026-009', valor: 4080, valor_original: 4080 },
  ], loc9), 6960)

const unificada = {
  locacao_id: 1,
  locacao_numero: 'LOC-2026-001, LOC-2026-002',
  valor: 3526.67,
  valor_original: 3526.67,
  observacoes: `LOC-2026-001: R$${NBSP}3.220,00 | LOC-2026-002: R$${NBSP}306,67`,
}
eq('unificada: parte do primeiro contrato',
  s.valorFaturadoDoContrato([unificada], { id: 1, numero: 'LOC-2026-001' }), 3220)
eq('unificada: parte do segundo contrato',
  s.valorFaturadoDoContrato([unificada], { id: 2, numero: 'LOC-2026-002' }), 306.67)
eq('unificada com espaco comum e milhar',
  s.valorFaturadoDoContrato([{ ...unificada, observacoes: 'LOC-2026-001: R$ 14.000,00 | LOC-2026-002: R$ 7.466,67' }], { id: 2, numero: 'LOC-2026-002' }), 7466.67)
eq('unificada com renovacao: le o valor antes da anotacao do periodo',
  s.valorFaturadoDoContrato([{ ...unificada, locacao_numero: 'LOC-2026-009, LOC-2026-010',
    observacoes: `LOC-2026-009: R$${NBSP}4.080,00 (Renovação 1 — período 13/08/2026 a 30/08/2026) | LOC-2026-010: R$${NBSP}500,00` }], loc9), 4080)
eq('unificada sem a parte do contrato nas observacoes: considera ja faturado',
  s.valorFaturadoDoContrato([{ ...unificada, observacoes: 'editada pelo usuario' }], { id: 2, numero: 'LOC-2026-002' }), Infinity)

console.log('\n--- saldoAFaturar ---')
eq('mes nunca faturado: medicao inteira', s.saldoAFaturar(6960, 0), 6960)
eq('renovacao depois de faturar: diferenca', s.saldoAFaturar(6960, 2880), 4080)
eq('mes ja fechado', s.saldoAFaturar(4320, 4320), 0)
eq('arredondamento de centavo nao gera saldo', s.saldoAFaturar(4293.33, 4293.34), 0)
eq('centavo a menos na fatura nao reabre o mes', s.saldoAFaturar(2146.67, 2146.66), 0)
eq('faturado a maior nao gera saldo negativo', s.saldoAFaturar(5000, 6000), 0)
eq('parte desconhecida: sem saldo', s.saldoAFaturar(5000, Infinity), 0)
eq('saldo sai em centavos exatos', s.saldoAFaturar(6960.01, 2880.3), 4079.71)

// LOC-2026-009: contrato 13/07 a 12/08 a R$ 7.200, renovado 13/08 a 12/09 a R$ 6.800
const periodos9 = [
  { data_inicio: '2026-07-13', data_fim: '2026-08-12', valor_total: 7200 },
  { data_inicio: '2026-08-13', data_fim: '2026-09-12', valor_total: 6800 },
]
const resumo = partes => partes.map(p => [p.rotulo, p.data_inicio, p.data_fim, p.dias, Math.round(p.valor * 100) / 100])

console.log('\n--- partesDoMes ---')
eq('julho: so o contrato original, dia 31 fora',
  resumo(s.partesDoMes(periodos9, '2026-07')), [['Contrato original', '2026-07-13', '2026-07-30', 18, 4320]])
eq('agosto: original e renovacao',
  resumo(s.partesDoMes(periodos9, '2026-08')), [
    ['Contrato original', '2026-08-01', '2026-08-12', 12, 2880],
    ['Renovação 1', '2026-08-13', '2026-08-30', 18, 4080],
  ])
eq('setembro: so a renovacao',
  resumo(s.partesDoMes(periodos9, '2026-09')), [['Renovação 1', '2026-09-01', '2026-09-12', 12, 2720]])
eq('outubro: nada', resumo(s.partesDoMes(periodos9, '2026-10')), [])
eq('fevereiro de 28 dias segue a regra atual (dias reais ate 30)',
  resumo(s.partesDoMes([{ data_inicio: '2026-01-01', data_fim: '2026-12-31', valor_total: 3000 }], '2026-02')),
  [['Contrato original', '2026-02-01', '2026-02-28', 28, 2800]])

console.log('\n--- faturasDoContrato ---')
eq('lista a parte do contrato em cada fatura',
  s.faturasDoContrato([
    { numero: 'FAT-2026-025', status: 'pago', locacao_id: 11, locacao_numero: 'LOC-2026-009', valor: 2500, valor_original: 2880 },
    { numero: 'FAT-2026-030', status: 'emitido', locacao_id: 1, locacao_numero: 'LOC-2026-009, LOC-2026-010', valor: 4580, valor_original: 4580,
      observacoes: `LOC-2026-009: R$${NBSP}4.080,00 (Renovação 1) | LOC-2026-010: R$${NBSP}500,00` },
    { numero: 'FAT-2026-031', status: 'pago', locacao_id: 12, locacao_numero: 'LOC-2026-010', valor: 1, valor_original: 1 },
  ], loc9),
  [{ numero: 'FAT-2026-025', status: 'pago', valor: 2880 }, { numero: 'FAT-2026-030', status: 'emitido', valor: 4080 }])
eq('parte desconhecida na unificada: null', s.faturasDoContrato([{ ...unificada, observacoes: '' }], { id: 1, numero: 'LOC-2026-001' }), null)

console.log('\n--- comporMes ---')
const partesAgo = s.partesDoMes(periodos9, '2026-08')
eq('renovacao depois da fatura do original',
  s.comporMes(partesAgo, [{ numero: 'FAT-2026-025', status: 'pago', valor: 2880 }], 4080), {
    faturadas: [{ numero: 'FAT-2026-025', status: 'pago', valor: 2880, rotulo: 'Contrato original', data_inicio: '2026-08-01', data_fim: '2026-08-12' }],
    pendente: { rotulo: 'Renovação 1', data_inicio: '2026-08-13', data_fim: '2026-08-30', valor: 4080 },
  })
eq('fatura que cobriu o original e parte da renovacao',
  s.comporMes(partesAgo, [{ numero: 'FAT-X', status: 'emitido', valor: 4013.33 }], 2946.67), {
    faturadas: [{ numero: 'FAT-X', status: 'emitido', valor: 4013.33, rotulo: 'Contrato original + Renovação 1', data_inicio: '2026-08-01', data_fim: '2026-08-17' }],
    pendente: { rotulo: 'Renovação 1', data_inicio: '2026-08-18', data_fim: '2026-08-30', valor: 2946.67 },
  })
eq('duas faturas em sequencia, mes fechado',
  s.comporMes(partesAgo, [
    { numero: 'FAT-A', status: 'pago', valor: 2880 },
    { numero: 'FAT-B', status: 'vencido', valor: 4080 },
  ], 0), {
    faturadas: [
      { numero: 'FAT-A', status: 'pago', valor: 2880, rotulo: 'Contrato original', data_inicio: '2026-08-01', data_fim: '2026-08-12' },
      { numero: 'FAT-B', status: 'vencido', valor: 4080, rotulo: 'Renovação 1', data_inicio: '2026-08-13', data_fim: '2026-08-30' },
    ],
    pendente: null,
  })
eq('arredondamento de centavo nao cria um dia a mais',
  s.comporMes(partesAgo, [{ numero: 'FAT-A', status: 'pago', valor: 2879.99 }], 4080).faturadas[0].data_fim, '2026-08-12')

console.log('\n--- periodoCobertoPelaFatura ---')
const faturasAgo = [
  { numero: 'FAT-2026-025', status: 'pago', valor: 2880 },
  { numero: 'FAT-2026-026', status: 'emitido', valor: 4080 },
]
eq('fatura da renovacao: so os dias dela',
  s.periodoCobertoPelaFatura(partesAgo, faturasAgo, 'FAT-2026-026'), { data_inicio: '2026-08-13', data_fim: '2026-08-30' })
eq('fatura do original',
  s.periodoCobertoPelaFatura(partesAgo, faturasAgo, 'FAT-2026-025'), { data_inicio: '2026-08-01', data_fim: '2026-08-12' })
eq('mes inteiro sem renovacao: do dia 1 ao ultimo dia faturavel',
  s.periodoCobertoPelaFatura(
    s.partesDoMes([{ data_inicio: '2025-10-21', data_fim: '2026-01-31', valor_total: 5000 }], '2025-11'),
    [{ numero: 'FAT-2026-016', status: 'pago', valor: 5000 }], 'FAT-2026-016'),
  { data_inicio: '2025-11-01', data_fim: '2025-11-30' })
eq('fatura fora da lista (ex.: cancelada): null',
  s.periodoCobertoPelaFatura(partesAgo, faturasAgo, 'FAT-2026-099'), null)

console.log(falhas === 0 ? '\nTudo certo.' : `\n${falhas} verificacao(oes) falharam.`)
process.exit(falhas === 0 ? 0 : 1)
