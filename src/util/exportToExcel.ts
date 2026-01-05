// src/utils/exportToExcel.ts
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';
import { getViagens } from '../controller/Viagem';
import { parse, isAfter, isBefore, isEqual, eachDayOfInterval, format } from 'date-fns';
import { getUsers } from '../controller/Usuario';
import { getAdiantamentos } from '../controller/Adiantamento';
import { getAllcontas } from '../controller/PrestacaoContas';
import { createCollection, storage } from './FirebaseConnection';
import { listAll, ref, uploadBytes } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';

export async function exportViagensComPrestacoes(
  dataInicio: string, // no formato 'dd/MM/yyyy'
  dataFim:    string,  // no formato 'dd/MM/yyyy'
  contrato: string,
) {
  // 1) monta as datas de início e fim
  const formato = 'dd/MM/yyyy';
  const inicio = parse(dataInicio, formato, new Date());
  const fim    = parse(dataFim,    formato, new Date());
  if (isAfter(inicio, fim)) {
    // opcional: lançar erro ou trocar de ordem
    throw new Error('Data de início não pode ser maior que data de fim');
  }

  // 2) busca todas as viagens e filtra por dataVolta dentro do intervalo (inclusive)
  const todas = await getViagens();
  const users = await getUsers();
  const adiantamentos = await getAdiantamentos();
  const prestacao = await getAllcontas();

  const viagens = todas.filter(v => {
    const volta = parse(v.dataVolta, formato, new Date());

    const dentroDoPeriodo =
      (isEqual(volta, inicio) || isAfter(volta, inicio)) &&
      (isEqual(volta, fim)    || isBefore(volta, fim));

    const semRelatorio = v.nroRelatorio == null || v.nroRelatorio === 0; // exclui quando existe e != 0
    const mesmoContrato = v.contrato === contrato;
    return dentroDoPeriodo && semRelatorio && mesmoContrato;
  });

  // 3) cria workbook + worksheet
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Viagens');

  // 4) define colunas (só largura e cabeçalho)
 const columns = [
    { header: 'ID Viagem',     key: 'id',         width: 10 },
    { header: 'Colaborador',     key: 'colaborador',         width: 40 },
    { header: 'Nº Relatório de viagem',    key: 'nRelatorio',width: 10 },
    { header: 'Nº BMS',         key: 'nBms',     width: 10 },
    { header: 'Gerência',        key: 'gerencia',    width: 20 },
    { header: 'Data Saída',       key: 'dataSaida',    width: 15 },
    { header: 'Origem',     key: 'origem',  width: 25 },
    { header: 'Data Retorno', key: 'dataRetorno',       width: 12 },
    { header: 'Destino',   key: 'destino',     width: 25 },
    { header: 'Refência',       key: 'referencia',    width: 12 },
    { header: 'Transporte base',     key: 'transporteBase',  width: 12 },
    ...(contrato === '4600679817' ? [
        { header: 'Transporte corporativo', key: 'transporteCorporativo', width: 12 }
      ] : []),
    { header: 'Alimentação', key: 'alimentacao',       width: 12 },
    { header: 'Total adiantamento',   key: 'totalAdiantamento',     width: 12 },
    { header: 'Notas Transporte',     key: 'notasTransporte',  width: 12 },
    { header: 'Notas alimentação', key: 'notasAlimentacao',       width: 12 },
    { header: 'Notas outros', key: 'notasOutros',       width: 12 },
    { header: 'Total notas',   key: 'totalNotas',     width: 12 },
    { header: 'Situação',     key: 'situacao',  width: 15 },
    { header: 'Diferença', key: 'diferenca',       width: 12 },
    { header: 'Observações',   key: 'observacao',     width: 50 }
  ];
  ws.columns = columns;

  const relatoriosRoot = ref(storage, 'relatorios/');
  const list = await listAll(relatoriosRoot);
  const nextIndex = list.items.length + 1;

  //registra as viagens no relatorio
  viagens.forEach(async (v) => {
    const vRef = doc(createCollection('VIAGENS'), v.id.toString());
    await updateDoc(vRef, {
      nroRelatorio: nextIndex
    });
  })

  // 5) prepara as linhas da tabela
  const tableRows = viagens.flatMap(v => {
      const partida = parse(v.dataIda, formato, new Date());
      const retorno = parse(v.dataVolta, formato, new Date());
      const colb    = users.find(u => u.email === v.colaborador);
      const adiant = adiantamentos.find(a => a.idViagem === v.id.toString());
      const prest = prestacao.find(p => p.idViagem === v.id.toString());

      return eachDayOfInterval({ start: partida, end: retorno }).map(dia  => [
          v.id,
          colb?.nomeCompleto || v.colaborador,
          v.id,
          nextIndex,
          colb?.gerenciaPb || '',
          format(dia, formato),
          v.origem,
          format(dia, formato),
          v.destino,
          format(dia, 'MM/yyyy'),
          adiant?.itens.find(a => a.dataReferencia === format(dia, formato))?.deslocamento || '0',
          adiant?.itens.find(a => a.dataReferencia === format(dia, formato))?.alimentacao || '0',
          adiant?.itens.find(a => a.dataReferencia === format(dia, formato))?.total || '',
          prest?.notas?.find(n => n.diaViagem === format(dia, formato) && n.tipo === 'transporte')?.valor || '0',
          ...(contrato === '4600679817'
          ? [prest?.notas?.find(n => n.diaViagem === format(dia, formato) && n.tipo === 'transporte corporativo')?.valor || '0']
          : []),
          prest?.notas?.find(n => n.diaViagem === format(dia, formato) && n.tipo === 'alimentação')?.valor || '0',
          prest?.notas?.find(n => n.diaViagem === format(dia, formato) && n.tipo === 'outros')?.valor || '0',
          '',
          prest?.status || '',
          '',
          v.obsProgramador || ''
      ]);
  });

  // 6) adiciona como tabela do Excel (com filtros e estilo)
  ws.addTable({
  name: 'TabelaViagens',
  ref: 'A1',
  headerRow: true,
  totalsRow: false,
  style: {
      theme: 'TableStyleMedium9',
      showRowStripes: true,
  },
  columns: columns.map(c => ({ name: c.header as string })),
  rows: tableRows,  // agora é um any[][] correto
  });

    // 6.1) insere a fórmula na coluna "Diferença" (coluna R)
  ws.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // pula o cabeçalho
    const cll = row.getCell(17);
    cll.value = {
      formula: `N${rowNumber}+O${rowNumber}+P${rowNumber}`
    };
    // 'R' é a 18ª coluna, 'M' a 13ª e 'P' a 16ª
    const cell = row.getCell(19);
    cell.value = {
      formula: `M${rowNumber}-Q${rowNumber}`
    };
    
  });

  // 7) estiliza alinhamento e cabeçalho
  ws.eachRow((row, rowNumber) => {
    row.eachCell(cell => {
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
      if (rowNumber === 1) {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4B9CD3' },
        };
        if (cell.address === "N1" || cell.address === "O1" || cell.address === "P1" || cell.address === 'Q1') {
          cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFC107' },
        };
        }
      }
    });
  });

  // 8) gera buffer e dispara o download
  const buf = await wb.xlsx.writeBuffer();

  // 9) prepara nome de arquivo e pasta no Storage
  
  const hoje = new Date();
  const hojeStr = format(hoje, "dd-MM-yyyy");
  const fileName = `Relatório_${nextIndex}_${hojeStr}.xlsx`;
  const destinoRef = ref(storage, `relatorios/${fileName}`);

  // 10) faz o upload
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  await uploadBytes(destinoRef, blob, {
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  // 11) baixa no cliente
  saveAs(blob, fileName);
}
