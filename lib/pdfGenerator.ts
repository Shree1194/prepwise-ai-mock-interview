import jsPDF from "jspdf";

interface PDFReportData {
  userName: string;
  date: string;
  subject: string;
  questions: string[];
  totalScore: number;
  categoryScores: Array<{
    name: string;
    score: number;
    comment: string;
  }>;
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
}

export function generatePDFReport(data: PDFReportData): void {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let y = margin;

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // ─── HEADER ──────────────────────────────────────────────────
  // Background header bar
  doc.setFillColor(30, 27, 75); // deep indigo
  doc.rect(0, 0, pageWidth, 48, "F");

  // Accent bar
  doc.setFillColor(99, 102, 241); // indigo-500
  doc.rect(0, 45, pageWidth, 3, "F");

  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("E&TC Mock Interview Report", margin, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(196, 197, 254); // light indigo
  doc.text("AI-Powered Performance Analysis", margin, 30);
  doc.text(`Generated on: ${data.date}`, margin, 38);

  // Score badge
  const scoreColor: [number, number, number] =
    data.totalScore >= 80
      ? [16, 185, 129]
      : data.totalScore >= 60
      ? [245, 158, 11]
      : [239, 68, 68];

  doc.setFillColor(...scoreColor);
  doc.roundedRect(pageWidth - 60, 8, 40, 30, 4, 4, "F");
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(`${data.totalScore}`, pageWidth - 53, 26, { align: "left" });
  doc.setFontSize(10);
  doc.text("/100", pageWidth - 38, 26);
  doc.setFontSize(8);
  doc.text("OVERALL SCORE", pageWidth - 57, 35);

  y = 60;

  // ─── CANDIDATE INFO ──────────────────────────────────────────
  doc.setFillColor(240, 240, 255);
  doc.roundedRect(margin, y, contentWidth, 30, 3, 3, "F");
  doc.setFillColor(99, 102, 241);
  doc.roundedRect(margin, y, 4, 30, 2, 2, "F");

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 27, 75);
  doc.text(data.userName, margin + 10, y + 10);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 120);
  doc.text(`Subject: ${data.subject}`, margin + 10, y + 18);
  doc.text(`Date: ${data.date}`, margin + 10, y + 25);

  y += 40;

  // ─── SCORE BREAKDOWN ─────────────────────────────────────────
  checkPageBreak(80);

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 27, 75);
  doc.text("Performance Breakdown", margin, y);
  y += 6;

  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(0.5);
  doc.line(margin, y, margin + 60, y);
  y += 8;

  data.categoryScores.forEach((cat) => {
    checkPageBreak(22);

    const barColor: [number, number, number] =
      cat.score >= 80
        ? [16, 185, 129]
        : cat.score >= 60
        ? [99, 102, 241]
        : [239, 68, 68];

    // Category name
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 27, 75);
    doc.text(cat.name, margin, y + 4);
    doc.text(`${cat.score}/100`, margin + contentWidth - 15, y + 4);

    // Progress bar background
    doc.setFillColor(220, 220, 240);
    doc.roundedRect(margin, y + 6, contentWidth, 4, 2, 2, "F");

    // Progress bar fill
    doc.setFillColor(...barColor);
    doc.roundedRect(margin, y + 6, (contentWidth * cat.score) / 100, 4, 2, 2, "F");

    // Comment
    y += 12;
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(80, 80, 120);
    const commentLines = doc.splitTextToSize(cat.comment, contentWidth);
    doc.text(commentLines, margin, y);
    y += commentLines.length * 4 + 5;
  });

  y += 5;

  // ─── FINAL ASSESSMENT ────────────────────────────────────────
  checkPageBreak(40);

  doc.setFillColor(248, 248, 255);
  const assessment = doc.splitTextToSize(data.finalAssessment, contentWidth - 15);
  const assessHeight = assessment.length * 5 + 20;
  doc.roundedRect(margin, y, contentWidth, assessHeight, 3, 3, "F");
  doc.setFillColor(99, 102, 241);
  doc.roundedRect(margin, y, 4, assessHeight, 2, 2, "F");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 27, 75);
  doc.text("Final Assessment", margin + 10, y + 8);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 100);
  doc.text(assessment, margin + 10, y + 16);

  y += assessHeight + 8;

  // ─── STRENGTHS ───────────────────────────────────────────────
  checkPageBreak(40);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(16, 185, 129);
  doc.text("✓ Strengths", margin, y);
  y += 6;

  data.strengths.forEach((s) => {
    checkPageBreak(12);
    doc.setFillColor(240, 255, 247);
    const lines = doc.splitTextToSize(`• ${s}`, contentWidth - 5);
    doc.roundedRect(margin, y - 2, contentWidth, lines.length * 5 + 4, 2, 2, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(30, 80, 60);
    doc.text(lines, margin + 3, y + 3);
    y += lines.length * 5 + 6;
  });

  y += 4;

  // ─── AREAS FOR IMPROVEMENT ───────────────────────────────────
  checkPageBreak(40);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(239, 68, 68);
  doc.text("↑ Areas for Improvement", margin, y);
  y += 6;

  data.areasForImprovement.forEach((a) => {
    checkPageBreak(12);
    doc.setFillColor(255, 245, 245);
    const lines = doc.splitTextToSize(`• ${a}`, contentWidth - 5);
    doc.roundedRect(margin, y - 2, contentWidth, lines.length * 5 + 4, 2, 2, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 30, 30);
    doc.text(lines, margin + 3, y + 3);
    y += lines.length * 5 + 6;
  });

  y += 4;

  // ─── QUESTIONS ASKED ─────────────────────────────────────────
  if (data.questions && data.questions.length > 0) {
    checkPageBreak(30);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 27, 75);
    doc.text("Questions Asked", margin, y);
    y += 8;

    data.questions.forEach((q, i) => {
      checkPageBreak(18);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(99, 102, 241);
      doc.text(`Q${i + 1}.`, margin, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 27, 75);
      const lines = doc.splitTextToSize(q, contentWidth - 12);
      doc.text(lines, margin + 8, y);
      y += lines.length * 5 + 4;
    });
  }

  // ─── FOOTER ──────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFillColor(30, 27, 75);
    doc.rect(0, pageHeight - 12, pageWidth, 12, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(196, 197, 254);
    doc.text(
      `E&TC Mock Interview Platform • Page ${i} of ${totalPages}`,
      margin,
      pageHeight - 4
    );
    doc.text(
      "Generated by AI Mock Interview System",
      pageWidth - margin,
      pageHeight - 4,
      { align: "right" }
    );
  }

  // Save
  const filename = `${data.userName.replace(/\s+/g, "_")}_${data.subject.replace(/[^a-z0-9]/gi, "_")}_Interview_Report.pdf`;
  doc.save(filename);
}
