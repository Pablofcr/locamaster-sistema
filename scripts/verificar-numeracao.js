/**
 * Verificacao da numeracao de orcamentos e contratos (src/lib/numeracao.ts).
 *
 * Rode com:  npm run verificar:numeracao
 *
 * O projeto nao tem framework de testes. Como a numeracao e logica pura e
 * gera numeros que vao para documentos assinados por clientes, ela e
 * verificada aqui por asserts. Rode sempre que mexer em numeracao.ts.
 *
 * O script compila numeracao.ts para a pasta temporaria do sistema, entao
 * nao deixa resto no projeto.
 */

const { execFileSync } = require('child_process')
const os = require('os')
const path = require('path')
const fs = require('fs')

const raiz = path.resolve(__dirname, '..')
const saida = fs.mkdtempSync(path.join(os.tmpdir(), 'numeracao-'))

try {
  execFileSync(
    'npx',
    ['tsc', 'src/lib/numeracao.ts', '--outDir', saida, '--module', 'commonjs', '--target', 'es2017'],
    { cwd: raiz, stdio: 'inherit', shell: process.platform === 'win32' }
  )
} catch (e) {
  console.error('Falha ao compilar src/lib/numeracao.ts')
  process.exit(1)
}

const n = require(path.join(saida, 'numeracao.js'))

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

console.log('\n--- extrairSequencial ---')
eq('orcamento novo', n.extrairSequencial('ORC-0012'), 12)
eq('contrato novo', n.extrairSequencial('LOC-2026-0012'), 12)
eq('renovacao R2', n.extrairSequencial('LOC-2026-0012-R2'), 12)
eq('renovacao R10 (2 digitos)', n.extrairSequencial('LOC-2026-0012-R10'), 12)
eq('contrato legado 3 digitos', n.extrairSequencial('LOC-2026-009'), 9)
eq('minusculo', n.extrairSequencial('orc-0012'), 12)
eq('com espacos', n.extrairSequencial('  LOC-2026-0012  '), 12)
eq('nulo', n.extrairSequencial(null), null)
eq('vazio', n.extrairSequencial(''), null)
eq('lixo', n.extrairSequencial('CONSORCIO'), null)
eq('prefixo desconhecido', n.extrairSequencial('FAT-2026-0012'), null)
eq('sem sequencial', n.extrairSequencial('ORC-ABC'), null)

console.log('\n--- proximoSequencial (a prova de delecao) ---')
eq('base mista orcamentos + contratos',
  n.proximoSequencial(['ORC-0011', 'ORC-0010', 'LOC-2026-009', 'LOC-2026-008']), 12)
eq('ignora buracos por delecao (0011 apagado)',
  n.proximoSequencial(['ORC-0010', 'ORC-0012']), 13)
eq('contrato avulso passa na frente do orcamento',
  n.proximoSequencial(['ORC-0010', 'LOC-2026-0015']), 16)
eq('renovacao nao avanca o contador',
  n.proximoSequencial(['ORC-0010', 'LOC-2026-0010-R3']), 11)
eq('base vazia comeca em 1', n.proximoSequencial([]), 1)
eq('so lixo comeca em 1', n.proximoSequencial([null, '', 'ABC']), 1)

console.log('\n--- formatacao ---')
eq('orcamento', n.formatarNumeroOrcamento(12), 'ORC-0012')
eq('orcamento 4 digitos cheios', n.formatarNumeroOrcamento(1234), 'ORC-1234')
eq('orcamento estoura o padding', n.formatarNumeroOrcamento(12345), 'ORC-12345')
eq('contrato', n.formatarNumeroLocacao(12, 2026), 'LOC-2026-0012')
eq('contrato ano seguinte nao reseta', n.formatarNumeroLocacao(43, 2027), 'LOC-2027-0043')
eq('renovacao 1', n.formatarNumeroRenovacao('LOC-2026-0012', 1), 'LOC-2026-0012-R1')
eq('renovacao 2', n.formatarNumeroRenovacao('LOC-2026-0012', 2), 'LOC-2026-0012-R2')
eq('renovacao sobre contrato legado', n.formatarNumeroRenovacao('LOC-2026-009', 1), 'LOC-2026-009-R1')

console.log('\n--- heranca orcamento -> contrato ---')
eq('herda o sequencial', n.numeroLocacaoDoOrcamento('ORC-0012', 2026), 'LOC-2026-0012')
eq('ORC-0010 vira LOC-2026-0010', n.numeroLocacaoDoOrcamento('ORC-0010', 2026), 'LOC-2026-0010')
eq('orcamento sem numero devolve null', n.numeroLocacaoDoOrcamento(null, 2026), null)
eq('orcamento ilegivel devolve null', n.numeroLocacaoDoOrcamento('rascunho', 2026), null)

console.log('\n--- ordenacao alfabetica (o traco preserva a ordem) ---')
const ordenado = ['LOC-2026-0011', 'LOC-2026-0010-R1', 'LOC-2026-0010', 'LOC-2026-0010-R2'].sort()
eq('renovacoes ficam entre 0010 e 0011', ordenado,
  ['LOC-2026-0010', 'LOC-2026-0010-R1', 'LOC-2026-0010-R2', 'LOC-2026-0011'])

console.log('\n--- busca cruzada ---')
eq('acha contrato pelo numero do orcamento', n.numeroCorrespondeBusca('LOC-2026-0012', 'ORC-0012'), true)
eq('acha contrato pelo proprio numero', n.numeroCorrespondeBusca('LOC-2026-0012', 'LOC-2026-0012'), true)
eq('acha contrato por parte do numero', n.numeroCorrespondeBusca('LOC-2026-0012', '2026-0012'), true)
eq('acha contrato pelo numero da renovacao', n.numeroCorrespondeBusca('LOC-2026-0012', 'LOC-2026-0012-R1'), true)
eq('acha contrato so pelo sequencial', n.numeroCorrespondeBusca('LOC-2026-0012', '12'), true)
eq('acha contrato pelo sequencial com zeros', n.numeroCorrespondeBusca('LOC-2026-0012', '0012'), true)
eq('nao casa sequencial diferente', n.numeroCorrespondeBusca('LOC-2026-0012', 'ORC-0013'), false)
eq('nao casa numero diferente', n.numeroCorrespondeBusca('LOC-2026-0012', '13'), false)
eq('termo vazio casa tudo', n.numeroCorrespondeBusca('LOC-2026-0012', ''), true)
eq('termo de texto nao casa numero', n.numeroCorrespondeBusca('LOC-2026-0012', 'consorcio'), false)
eq('contrato sem numero nao quebra', n.numeroCorrespondeBusca(null, '12'), false)
eq('legado achavel pelo sequencial', n.numeroCorrespondeBusca('LOC-2026-009', '9'), true)

try { fs.rmSync(saida, { recursive: true, force: true }) } catch { /* ignore */ }

console.log('')
if (falhas > 0) {
  console.log(`${falhas} verificacao(oes) FALHARAM`)
  process.exit(1)
}
console.log('Todas as verificacoes passaram.')
