import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import { getNodesBounds, Node, Edge } from '@xyflow/react';
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
 * Capture high-DPI image of React Flow canvas diagram as a Data URL with zero blur.
 *
 * CRITICAL ARCHITECTURE NOTE:
 * Do NOT use CSS `scale(...)` inside html-to-image style transforms. Inside SVG foreignObject,
 * browser rasterizers create an internal offscreen bitmap at native 1x CSS font resolution and
 * then bilinearly stretch it, creating fuzzy, blurry text and lines.
 * Instead, we keep CSS `scale: 1` and apply `pixelRatio: 3.5`, which forces the browser's
 * font and vector graphics engine to rasterize glyphs and SVG paths directly at 350+ DPI.
 */
export async function captureCanvasImage(
  nodes: Node[],
  viewportElement: HTMLElement,
  _isDarkMode = false
): Promise<{ dataUrl: string; width: number; height: number }> {
  const nodesBounds = getNodesBounds(nodes);
  // Clean, tight padding around the modules so the schematic fills the page legibly
  const padding = 28;
  const contentWidth = Math.ceil((nodesBounds.width || 800) + padding * 2);
  const contentHeight = Math.ceil((nodesBounds.height || 600) + padding * 2);

  // Translate coordinates so top-left of the bounding box aligns with (padding, padding)
  const translateX = -nodesBounds.x + padding;
  const translateY = -nodesBounds.y + padding;

  // Ultra-crisp export: dynamically size pixelRatio for 3200+ physical pixels resolution
  const longestDimension = Math.max(contentWidth, contentHeight);
  const pixelRatio = Math.min(4.0, Math.max(3.0, 3200 / longestDimension));

  const dataUrl = await toPng(viewportElement, {
    backgroundColor: '#ffffff', // Clean engineering white background
    width: contentWidth,
    height: contentHeight,
    pixelRatio,
    cacheBust: true,
    style: {
      width: `${contentWidth}px`,
      height: `${contentHeight}px`,
      transform: `translate(${translateX}px, ${translateY}px)`,
      transformOrigin: '0 0',
    },
    filter: (domNode: HTMLElement) => {
      // Exclude interactive selection boxes and connection drag handles
      if (domNode.classList) {
        if (
          domNode.classList.contains('react-flow__handle-connecting') ||
          domNode.classList.contains('react-flow__selection')
        ) {
          return false;
        }
      }
      // Exclude interactive deletion/trash buttons to keep the schematic pristine
      if (domNode.tagName === 'BUTTON') {
        const title = domNode.getAttribute('title') || '';
        const aria = domNode.getAttribute('aria-label') || '';
        if (title.includes('Delete') || title.includes('Remove') || aria.includes('Delete')) {
          return false;
        }
      }
      return true;
    },
  });

  return {
    dataUrl,
    width: Math.round(contentWidth * pixelRatio),
    height: Math.round(contentHeight * pixelRatio),
  };
}

/**
 * Generate and export a branded PDF with the exact logo displayed in the software (top-right),
 * project title & description (top-left), no enclosing scheme border, and clean layout with no bottom footer.
 */
export async function exportBrandedPdf(options: ReportGenerationOptions): Promise<void> {
  const { project, nodes, viewportElement, customLogo, setupPhoto, setupPhotoCaption } = options;
  if (!viewportElement || nodes.length === 0) {
    throw new Error('Canvas has no equipment modules to export.');
  }

  // 1. Retrieve the single active logo currently displayed in the software
  const activeLogoBase64 = await getActiveLogoBase64(customLogo);

  // Load canvas capture and logo natural dimensions in parallel
  const [canvasCapture, logoDims] = await Promise.all([
    captureCanvasImage(nodes, viewportElement, false),
    getImageDimensions(activeLogoBase64),
  ]);

  const { dataUrl: diagramDataUrl, width: diagW, height: diagH } = canvasCapture;

  // Setup PDF document (adapt landscape height to schematic aspect ratio to eliminate dead space)
  const isLandscape = diagW >= diagH;
  const diagramAspect = diagW / Math.max(diagH, 1);

  let pdfWidth = 1140;
  let pdfHeight = 780;

  if (isLandscape) {
    if (diagramAspect > 2.2) {
      pdfWidth = 1160;
      pdfHeight = Math.max(680, Math.min(780, Math.round(1160 / Math.min(diagramAspect, 2.5)) + 120));
    } else {
      pdfWidth = 1140;
      pdfHeight = 800;
    }
  } else {
    pdfWidth = 840;
    pdfHeight = 1140;
  }

  const pdf = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'px',
    format: [pdfWidth, pdfHeight],
    compress: true,
  });

  const margin = 36;
  const headerHeight = 70;

  const projectName = project?.name || 'Untitled Flow Chemistry Process';
  const exportDateStr = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Render Branded Header Helper for Page 1 & Page 2
  const renderHeader = (isPage2 = false) => {
    // Header Background Bar
    pdf.setFillColor(248, 250, 252); // slate-50
    pdf.rect(0, 0, pdfWidth, headerHeight, 'F');

    // Divider Line
    pdf.setDrawColor(226, 232, 240); // slate-200
    pdf.setLineWidth(1.5);
    pdf.line(0, headerHeight, pdfWidth, headerHeight);

    // 1. Single Active Logo in Top-Right Corner (the exact logo displayed in the software)
    const logoMaxH = 44;
    const logoMaxW = 155;
    const logoAspect = logoDims.width / Math.max(logoDims.height, 1);
    let logoH = logoMaxH;
    let logoW = Math.round(logoH * logoAspect);
    if (logoW > logoMaxW) {
      logoW = logoMaxW;
      logoH = Math.round(logoW / logoAspect);
    }
    const logoX = pdfWidth - margin - logoW;
    const logoY = Math.round((headerHeight - logoH) / 2);

    try {
      pdf.addImage(activeLogoBase64, 'PNG', logoX, logoY, logoW, logoH, undefined, 'SLOW');
    } catch (e) {
      console.warn('Could not render logo in header:', e);
    }

    // 2. Project Title & Description on Left (Clean start at margin)
    const textStartX = margin;
    const textMaxWidth = logoX - textStartX - 20;

    if (!isPage2) {
      // Page 1: Process Diagram Details
      const projectDescription = project?.comments?.trim() || (project as any)?.description?.trim() || '';

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(15);
      pdf.setTextColor(15, 23, 42); // slate-900

      if (projectDescription) {
        pdf.text(projectName, textStartX, 25, { maxWidth: textMaxWidth });

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9.5);
        pdf.setTextColor(71, 85, 105); // slate-600
        pdf.text(projectDescription, textStartX, 40, { maxWidth: textMaxWidth });

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(148, 163, 184); // slate-400
        pdf.text(`Exported: ${exportDateStr}`, textStartX, 54, { maxWidth: textMaxWidth });
      } else {
        pdf.text(projectName, textStartX, 30, { maxWidth: textMaxWidth });

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8.5);
        pdf.setTextColor(148, 163, 184); // slate-400
        pdf.text(`Exported: ${exportDateStr}`, textStartX, 46, { maxWidth: textMaxWidth });
      }
    } else {
      // Page 2: Physical Setup Details
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14.5);
      pdf.setTextColor(15, 23, 42);
      pdf.text(projectName, textStartX, 27, { maxWidth: textMaxWidth });

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9.5);
      pdf.setTextColor(5, 150, 105); // emerald-600
      pdf.text('Actual Physical Laboratory Setup Documentation', textStartX, 42, { maxWidth: textMaxWidth });

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(100, 116, 139);
      pdf.text(`Attached Setup Photo   |   Exported: ${exportDateStr}`, textStartX, 55, { maxWidth: textMaxWidth });
    }
  };

  // Render Page 1 Header
  renderHeader(false);

  // Draw Main Schematic Diagram with Lossless Compression (Border removed per user specification)
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

  // Embed schematic directly onto clean canvas with 'SLOW' (lossless Flate) compression with no border
  pdf.addImage(diagramDataUrl, 'PNG', renderX, renderY, renderW, renderH, undefined, 'SLOW');

  // Attach Setup Photo Page if provided
  if (setupPhoto) {
    const photoDims = await getImageDimensions(setupPhoto);
    const photoW = photoDims.width || 800;
    const photoH = photoDims.height || 600;

    const page2Width = pdfWidth;
    const page2Height = pdfHeight;

    pdf.addPage([page2Width, page2Height], isLandscape ? 'landscape' : 'portrait');

    // Page 2 Branded Header with Software Logo on Top-Right
    renderHeader(true);

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

    // Add Image with lossless compression
    const imgFormat = setupPhoto.includes('image/jpeg') || setupPhoto.includes('image/jpg') ? 'JPEG' : 'PNG';
    pdf.addImage(setupPhoto, imgFormat, renderPhotoX, renderPhotoY, renderPhotoW, renderPhotoH, undefined, 'SLOW');

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
  }

  const safeFilename = (projectName.replace(/[^a-z0-9_-]/gi, '_') || 'project') + '_report.pdf';
  pdf.save(safeFilename);
}

