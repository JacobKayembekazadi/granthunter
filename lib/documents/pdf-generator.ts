import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { generateDOCX } from './docx-generator';

// For now, convert DOCX to PDF via a service or use puppeteer
// In production, you might want to use a dedicated PDF library or service
export async function generatePDF(proposalId: string): Promise<Buffer> {
  // Option 1: Generate DOCX first, then convert (requires external service)
  // Option 2: Use pdf-lib directly (more limited formatting)
  // Option 3: Use puppeteer to render HTML to PDF (best formatting)

  // For now, return a simple PDF using pdf-lib
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([612, 792]); // US Letter size
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Get proposal data
  const { db } = await import('@/db');
  const { proposals, proposalSections } = await import('@/db/schema');
  const { eq } = await import('drizzle-orm');

  const [proposal] = await db
    .select()
    .from(proposals)
    .where(eq(proposals.id, proposalId))
    .limit(1);

  if (!proposal) {
    throw new Error('Proposal not found');
  }

  const sections = await db
    .select()
    .from(proposalSections)
    .where(eq(proposalSections.proposalId, proposalId))
    .orderBy(proposalSections.order);

  let y = 750;
  const margin = 50;
  const lineHeight = 14;

  // Title
  page.drawText(proposal.name, {
    x: margin,
    y,
    size: 18,
    font: boldFont,
  });
  y -= 30;

  // Sections
  for (const section of sections) {
    // Section title
    page.drawText(`${section.sectionNumber}. ${section.title}`, {
      x: margin,
      y,
      size: 14,
      font: boldFont,
    });
    y -= 20;

    // Section content (split into lines)
    const words = (section.content || '').split(' ');
    let line = '';
    for (const word of words) {
      const testLine = line + word + ' ';
      const width = font.widthOfTextAtSize(testLine, 10);
      if (width > 500 && line.length > 0) {
        page.drawText(line, {
          x: margin,
          y,
          size: 10,
          font,
        });
        y -= lineHeight;
        line = word + ' ';
        if (y < 50) {
          const newPage = pdfDoc.addPage([612, 792]);
          y = 750;
        }
      } else {
        line = testLine;
      }
    }
    if (line.length > 0) {
      page.drawText(line, {
        x: margin,
        y,
        size: 10,
        font,
      });
      y -= lineHeight * 2;
    }
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

