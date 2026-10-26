import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import { getNodesBounds, getViewportForBounds, Node, Edge } from '@xyflow/react';
import { Project } from '../types';
import { getActiveLogoBase64 } from './branding';

export interface ReportGenerationOptions {
  project: Project | null;
  nodes: Node[];
  edges: Edge[];
  stoiRows?: Array<{ id: number; name: string; conc: number; flow: number; isLimiting?: boolean }>;
  flowRateUnit?: 'mL/min' | 'L/h';
  customLogo?: string | null;
  viewportElement?: HTMLElement | null;
  isDarkMode?: boolean;
  setupPhoto?: string | null;
  setupPhotoCaption?: string;
}

/**
 * Measure natural dimensions of any Base64/dataURL image.
 */
export function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth || img.width || 800,
        height: img.naturalHeight || img.height || 600,
      });
    };
    img.onerror = () => {
      resolve({ width: 800, height: 600 });
    };
    img.src = dataUrl;
  });
}

/**
 * Capture high-DPI image of React Flow canvas diagram as a Data URL.
 */
export async function captureCanvasImage(
  nodes: Node[],
  viewportElement: HTMLElement,
  isDarkMode = false
): Promise<{ dataUrl: string; width: number; height: number }> {
  const nodesBounds = getNodesBounds(nodes);
  const padding = 80;
  const rawWidth = (nodesBounds.width || 800) + padding * 2;
  const rawHeight = (nodesBounds.height || 600) + padding * 2;

  // Ultra-crisp export resolution
  const minTargetRes = 2400;
  const scaleFactor = Math.max(1.5, minTargetRes / Math.max(rawWidth, rawHeight));
  const exportWidth = Math.round(rawWidth * scaleFactor);
  const exportHeight = Math.round(rawHeight * scaleFactor);

  const transform = getViewportForBounds(
    nodesBounds,
    exportWidth,
    exportHeight,
    0.1,
    4,
    0.08
  );

  const canvasBg = '#ffffff'; // Always clean white background for reports

  const dataUrl = await toPng(viewportElement, {
    backgroundColor: canvasBg,
    width: exportWidth,
    height: exportHeight,
    pixelRatio: 2.5,
    style: {
      width: `${exportWidth}px`,
      height: `${exportHeight}px`,
      transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.zoom})`,
    },
  });

  return { dataUrl, width: exportWidth, height: exportHeight };
}

/**
 * Generate and export a branded PDF with the organization's custom Base64 logo.
 */
export async function exportBrandedPdf(options: ReportGenerationOptions): Promise<void> {
  const { project, nodes, viewportElement, customLogo, setupPhoto, setupPhotoCaption } = options;
  if (!viewportElement || nodes.length === 0) {
    throw new Error('Canvas has no equipment modules to export.');
  }

  // 1. Capture diagram & load Base64 logo in parallel
  const [canvasCapture, logoBase64] = await Promise.all([
    captureCanvasImage(nodes, viewportElement, false),
    getActiveLogoBase64(customLogo),
  ]);

  const { dataUrl: diagramDataUrl, width: diagW, height: diagH } = canvasCapture;

  // 2. Setup PDF document (A4 Landscape or custom high-res)
  const isLandscape = diagW >= diagH;
  const pdfWidth = isLandscape ? 1120 : 840;
  const pdfHeight = isLandscape ? 790 : 1120;

  const pdf = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'px',
    format: [pdfWidth, pdfHeight],
    compress: true,
  });

  const margin = 36;
  const headerHeight = 70;

  // Header Background bar
  pdf.setFillColor(248, 250, 252); // slate-50
  pdf.rect(0, 0, pdfWidth, headerHeight, 'F');

  // Separator line
  pdf.setDrawColor(226, 232, 240); // slate-200
  pdf.setLineWidth(1.5);
  pdf.line(0, headerHeight, pdfWidth, headerHeight);

  // Embed Logo in Top-Left
  try {
    const logoMaxW = 140;
    const logoMaxH = 46;
    pdf.addImage(logoBase64, 'PNG', margin, 12, logoMaxW, logoMaxH, undefined, 'FAST');
  } catch (e) {
    console.warn('Could not render logo in PDF, drawing text fallback:', e);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(15, 23, 42);
    pdf.text('FLOW CHEMISTRY SUITE', margin, 38);
  }

  // Project title & timestamp on Top-Right
  const projectName = project?.name || 'Untitled Flow Chemistry Process';
  const exportDateStr = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(15, 23, 42);
  pdf.text(projectName, pdfWidth - margin, 32, { align: 'right' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(100, 116, 139);
  pdf.text(`Exported: ${exportDateStr}  |  ${nodes.length} Equipment Modules`, pdfWidth - margin, 48, { align: 'right' });

  // Draw Main Schematic Diagram
  const availW = pdfWidth - margin * 2;
  const availH = pdfHeight - headerHeight - margin * 2;

  let renderW = availW;
  let renderH = (diagH * availW) / diagW;

  if (renderH > availH) {
    renderH = availH;
    renderW = (diagW * availH) / diagH;
  }

  const renderX = margin + (availW - renderW) / 2;
  const renderY = headerHeight + margin / 2 + (availH - renderH) / 2;

  // Diagram border container
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(renderX - 4, renderY - 4, renderW + 8, renderH + 8, 4, 4, 'F');
  pdf.setDrawColor(226, 232, 240);
  pdf.roundedRect(renderX - 4, renderY - 4, renderW + 8, renderH + 8, 4, 4, 'S');

  pdf.addImage(diagramDataUrl, 'PNG', renderX, renderY, renderW, renderH, undefined, 'FAST');

  // Bottom footer watermark for Page 1
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(148, 163, 184);
  pdf.text(
    setupPhoto
      ? 'Flow Chemistry Process Diagram & Experimental Design  •  Page 1: Schematic (Actual Setup Photo Attached on Page 2)'
      : 'Flow Chemistry Process Diagram & Experimental Design  •  Offline Branded Document',
    margin,
    pdfHeight - 14
  );

  // 3. Attach Setup Photo Page at end of document if provided
  if (setupPhoto) {
    const photoDims = await getImageDimensions(setupPhoto);
    const photoW = photoDims.width || 800;
    const photoH = photoDims.height || 600;

    // Use same dimensions or adapt
    const page2Width = pdfWidth;
    const page2Height = pdfHeight;

    pdf.addPage([page2Width, page2Height], isLandscape ? 'landscape' : 'portrait');

    // Header Background bar on Page 2
    pdf.setFillColor(248, 250, 252);
    pdf.rect(0, 0, page2Width, headerHeight, 'F');

    // Separator line
    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(1.5);
    pdf.line(0, headerHeight, page2Width, headerHeight);

    // Embed Logo
    try {
      const logoMaxW = 140;
      const logoMaxH = 46;
      pdf.addImage(logoBase64, 'PNG', margin, 12, logoMaxW, logoMaxH, undefined, 'FAST');
    } catch {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(15, 23, 42);
      pdf.text('FLOW CHEMISTRY SUITE', margin, 38);
    }

    // Title on right: Project Name - Actual Experimental Setup
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(15);
    pdf.setTextColor(15, 23, 42);
    pdf.text(projectName, page2Width - margin, 28, { align: 'right' });

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(5, 150, 105); // emerald-600
    pdf.text('Actual Experimental Setup Photo', page2Width - margin, 44, { align: 'right' });

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Attached Document: Setup Configuration  |  ${exportDateStr}`, page2Width - margin, 58, { align: 'right' });

    // Available area for setup picture & caption
    const captionReservedH = setupPhotoCaption?.trim() ? 50 : 34;
    const availPhotoW = page2Width - margin * 2;
    const availPhotoH = page2Height - headerHeight - margin * 2 - captionReservedH;

    let renderPhotoW = availPhotoW;
    let renderPhotoH = (photoH * availPhotoW) / photoW;

    if (renderPhotoH > availPhotoH) {
      renderPhotoH = availPhotoH;
      renderPhotoW = (photoW * availPhotoH) / photoH;
    }

    const renderPhotoX = margin + (availPhotoW - renderPhotoW) / 2;
    const renderPhotoY = headerHeight + margin / 2 + (availPhotoH - renderPhotoH) / 2;

    // Draw picture container border and subtle shadow box
    pdf.setFillColor(255, 255, 255);
    pdf.roundedRect(renderPhotoX - 6, renderPhotoY - 6, renderPhotoW + 12, renderPhotoH + 12, 6, 6, 'F');
    pdf.setDrawColor(203, 213, 225); // slate-300
    pdf.setLineWidth(1.5);
    pdf.roundedRect(renderPhotoX - 6, renderPhotoY - 6, renderPhotoW + 12, renderPhotoH + 12, 6, 6, 'S');

    // Add Image
    const imgFormat = setupPhoto.includes('image/jpeg') || setupPhoto.includes('image/jpg') ? 'JPEG' : 'PNG';
    pdf.addImage(setupPhoto, imgFormat, renderPhotoX, renderPhotoY, renderPhotoW, renderPhotoH, undefined, 'FAST');

    // Caption Box below picture
    const captionY = renderPhotoY + renderPhotoH + 16;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(11);
    pdf.setTextColor(30, 41, 59);
    pdf.text('Figure 2: Actual Physical Laboratory Setup', renderPhotoX, captionY);

    if (setupPhotoCaption?.trim()) {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.setTextColor(71, 85, 105);
      pdf.text(setupPhotoCaption.trim(), renderPhotoX, captionY + 14, { maxWidth: renderPhotoW });
    }

    // Page 2 Footer
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);
    pdf.text(
      'Flow Chemistry Process Diagram & Experimental Design  •  Attached Setup Documentation  •  Page 2',
      margin,
      page2Height - 14
    );
  }

  const safeFilename = (projectName.replace(/[^a-z0-9_-]/gi, '_') || 'project') + '_report.pdf';
  pdf.save(safeFilename);
}
