/**
 * Verificacao das formas de pagamento da configuracao
 * (src/lib/configuracaoPagamento.ts).
 *
 * Rode com:  npm run verificar:configuracao-pagamento
 *
 * Essas funcoes decidem o que sai como instrucao de pagamento no PDF e quando
 * o sistema avisa que a configuracao esta incompleta. Errar aqui manda fatura
 * sem como o cliente pagar, ou esconde o aviso justamente de quem precisa.
 *
 * O script compila o modulo para a pasta temporaria do sistema, entao nao
 * deixa resto no projeto.
 */

const { execFileSync } = require('child_process')
const os = require('os')
const path = require('path')
const fs = require('fs')

const raiz = path.resolve(__dirname, '..')
const saida = fs.mkdtempSync(path.join(os.tmpdir(), 'config-pagamento-'))

try {
  execFileSync(
    'npx',
    ['tsc', 'src/lib/configuracaoPagamento.ts', '--outDir', saida, '--module', 'commonjs', '--target', 'es2017'],
    { cwd: raiz, stdio: 'inherit', shell: process.platform === 'win32' }
  )
} catch (e) {
  console.error('Falha ao compilar src/lib/configuracaoPagamento.ts')
  process.exit(1)
}

const c = require(path.join(saida, 'configuracaoPagamento.js'))

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

// Entrada: como a conta e digitada na tela. Saida: sempre com a marca `principal`.
const itau = { nome: 'Itau', agencia: '1234', conta: '56789-0', titular: 'BRALOC LTDA' }
const bb = { nome: 'Banco do Brasil', agencia: '4321', conta: '09876-5', titular: 'BRALOC LTDA' }
const lido = (conta, principal = false) => ({ ...conta, principal })
const configAntiga = { banco_nome: 'Itau', banco_agencia: '1234', banco_conta: '56789-0', banco_titular: 'BRALOC LTDA' }

console.log('\n--- lerContasBancarias ---')
eq('sem configuracao', c.lerContasBancarias(null), [])
eq('configuracao vazia', c.lerContasBancarias({}), [])
eq('formato antigo (uma conta nas colunas) ja e a principal',
  c.lerContasBancarias(configAntiga), [lido(itau, true)])
eq('lista nova com duas contas', c.lerContasBancarias({ bancos: [itau, bb] }), [lido(itau), lido(bb)])
eq('lista nova em texto JSON', c.lerContasBancarias({ bancos: JSON.stringify([bb]) }), [lido(bb)])
eq('marca de principal e preservada',
  c.lerContasBancarias({ bancos: [itau, { ...bb, principal: true }] }), [lido(itau), lido(bb, true)])
eq('lista nova tem prioridade sobre as colunas antigas',
  c.lerContasBancarias({ ...configAntiga, bancos: [bb] }), [lido(bb)])
eq('lista vazia cai para as colunas antigas',
  c.lerContasBancarias({ ...configAntiga, bancos: [] }), [lido(itau, true)])
eq('entradas em branco sao descartadas',
  c.lerContasBancarias({ bancos: [itau, { nome: '', agencia: '', conta: '', titular: '' }] }), [lido(itau)])
eq('conta so com o nome ainda vale',
  c.lerContasBancarias({ bancos: [{ nome: 'Caixa' }] }), [{ nome: 'Caixa', agencia: '', conta: '', titular: '', principal: false }])
eq('espacos em volta sao limpos',
  c.lerContasBancarias({ bancos: [{ nome: ' Itau ', agencia: ' 1234', conta: '56789-0 ', titular: 'BRALOC LTDA' }] }), [lido(itau)])
eq('JSON invalido nao derruba, cai para as colunas antigas',
  c.lerContasBancarias({ ...configAntiga, bancos: '{[' }), [lido(itau, true)])
eq('valor que nao e lista e ignorado', c.lerContasBancarias({ bancos: { nome: 'Itau' } }), [])

console.log('\n--- contaPrincipal ---')
eq('sem conta cadastrada', c.contaPrincipal({}), null)
eq('a conta marcada como principal',
  c.contaPrincipal({ bancos: [itau, { ...bb, principal: true }] }), lido(bb, true))
eq('sem marcacao, vale a primeira da lista',
  c.contaPrincipal({ bancos: [itau, bb] }), lido(itau))
eq('formato antigo', c.contaPrincipal(configAntiga), lido(itau, true))
eq('duas marcadas: vale a primeira marcada',
  c.contaPrincipal({ bancos: [itau, { ...bb, principal: true }, { ...itau, nome: 'Caixa', principal: true }] }), lido(bb, true))

console.log('\n--- descreverConta ---')
eq('conta completa', c.descreverConta(itau), 'Itau | Ag: 1234 | Cc: 56789-0 | BRALOC LTDA')
eq('sem titular', c.descreverConta({ nome: 'Caixa', agencia: '1', conta: '2', titular: '' }), 'Caixa | Ag: 1 | Cc: 2')
eq('campos vazios viram tracos', c.descreverConta({ nome: '', agencia: '', conta: '', titular: '' }), '- | Ag: - | Cc: -')

console.log('\n--- statusConfiguracao ---')
eq('nada configurado: avisa',
  c.statusConfiguracao({}), { temPix: false, temBanco: false, temObservacoes: false, semFormaDePagamento: true })
eq('so PIX: nao avisa',
  c.statusConfiguracao({ pix_chave: '53.666.786/0001-47' }),
  { temPix: true, temBanco: false, temObservacoes: false, semFormaDePagamento: false })
eq('so banco: nao avisa',
  c.statusConfiguracao({ bancos: [itau] }),
  { temPix: false, temBanco: true, temObservacoes: false, semFormaDePagamento: false })
eq('PIX em branco nao conta',
  c.statusConfiguracao({ pix_chave: '   ' }),
  { temPix: false, temBanco: false, temObservacoes: false, semFormaDePagamento: true })
eq('tudo configurado',
  c.statusConfiguracao({ pix_chave: 'chave', bancos: [itau, bb], observacoes_padrao: 'Obrigado!' }),
  { temPix: true, temBanco: true, temObservacoes: true, semFormaDePagamento: false })

console.log(falhas === 0 ? '\nTudo certo.' : `\n${falhas} verificacao(oes) falharam.`)
process.exit(falhas === 0 ? 0 : 1)
