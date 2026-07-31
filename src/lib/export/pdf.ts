import { jsPDF } from "jspdf";
import { autoTable } from "jspdf-autotable";

interface ExportarPdfParams {
  titulo: string;
  subtitulo?: string | string[];
  colunas: string[];
  linhas: (string | number)[][];
  nomeArquivo: string;
}

export function exportarPdf({ titulo, subtitulo, colunas, linhas, nomeArquivo }: ExportarPdfParams) {
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text(titulo, 14, 16);

  const linhasSubtitulo = subtitulo ? (Array.isArray(subtitulo) ? subtitulo : [subtitulo]) : [];
  let cursorY = 22;
  if (linhasSubtitulo.length > 0) {
    doc.setFontSize(9);
    doc.setTextColor(100);
    for (const linha of linhasSubtitulo) {
      doc.text(linha, 14, cursorY);
      cursorY += 5;
    }
  }

  autoTable(doc, {
    startY: cursorY + 3,
    head: [colunas],
    body: linhas,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 41, 59] },
  });

  doc.save(nomeArquivo);
}
