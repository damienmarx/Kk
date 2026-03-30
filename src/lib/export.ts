import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToText = (filename: string, content: string) => {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToPDF = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element, {
    backgroundColor: '#050505',
    scale: 2,
  });
  
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgProps = pdf.getImageProperties(imgData);
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  
  pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(`${filename}.pdf`);
};
