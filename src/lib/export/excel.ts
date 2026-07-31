import * as XLSX from "xlsx";

interface ExportarExcelParams {
  nomeAba: string;
  colunas: string[];
  linhas: (string | number)[][];
  nomeArquivo: string;
}

export function exportarExcel({ nomeAba, colunas, linhas, nomeArquivo }: ExportarExcelParams) {
  const planilha = XLSX.utils.aoa_to_sheet([colunas, ...linhas]);
  const livro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(livro, planilha, nomeAba);
  XLSX.writeFile(livro, nomeArquivo);
}
