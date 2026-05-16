export async function generatePDF(
  docTitle: string,
  docContent: string,
  homeownerSignature: string,
  chaserSignature: string,
  chaserName: string
): Promise<Blob> {
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 50;
  const contentWidth = pageWidth - (margin * 2);

  const pdf = createPDF();

  let currentPage = 1;
  let yPosition = margin;

  const addNewPage = () => {
    if (currentPage > 1) {
      pdf.pages.push(createPage());
    }
    currentPage++;
    yPosition = margin;
  };

  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      addNewPage();
    }
  };

  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  pdf.pages[0].content.push({
    type: 'text',
    text: docTitle,
    x: margin,
    y: yPosition,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a'
  });
  yPosition += 35;

  pdf.pages[0].content.push({
    type: 'line',
    x1: margin,
    y1: yPosition,
    x2: pageWidth - margin,
    y2: yPosition,
    color: '#d1d5db',
    width: 1
  });
  yPosition += 20;

  pdf.pages[0].content.push({
    type: 'text',
    text: `Document Date: ${date}`,
    x: margin,
    y: yPosition,
    fontSize: 11,
    color: '#6b7280'
  });
  yPosition += 30;

  const paragraphs = docContent.split('\n\n');

  paragraphs.forEach((paragraph) => {
    if (!paragraph.trim()) return;

    const lines = wrapText(paragraph, contentWidth, paragraph.startsWith('PROPERTY') || paragraph.startsWith('INSURANCE') ? 16 : 11);
    const lineHeight = paragraph.startsWith('PROPERTY') || paragraph.startsWith('INSURANCE') ? 24 : 16;

    checkPageBreak(lines.length * lineHeight + 15);

    lines.forEach((line) => {
      const currentPageIndex = currentPage - 1;
      if (!pdf.pages[currentPageIndex]) {
        pdf.pages.push(createPage());
      }

      pdf.pages[currentPageIndex].content.push({
        type: 'text',
        text: line,
        x: margin,
        y: yPosition,
        fontSize: paragraph.startsWith('PROPERTY') || paragraph.startsWith('INSURANCE') ? 14 : 10,
        fontWeight: paragraph.startsWith('PROPERTY') || paragraph.startsWith('INSURANCE') ? 'bold' : 'normal',
        color: paragraph.startsWith('PROPERTY') || paragraph.startsWith('INSURANCE') ? '#1a1a1a' : '#374151'
      });
      yPosition += lineHeight;
    });

    yPosition += 8;
  });

  checkPageBreak(200);
  yPosition += 20;

  const currentPageIndex = currentPage - 1;
  if (!pdf.pages[currentPageIndex]) {
    pdf.pages.push(createPage());
  }

  pdf.pages[currentPageIndex].content.push({
    type: 'line',
    x1: margin,
    y1: yPosition,
    x2: pageWidth - margin,
    y2: yPosition,
    color: '#d1d5db',
    width: 1
  });
  yPosition += 30;

  pdf.pages[currentPageIndex].content.push({
    type: 'text',
    text: 'SIGNATURES',
    x: margin,
    y: yPosition,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a'
  });
  yPosition += 30;

  pdf.pages[currentPageIndex].content.push({
    type: 'text',
    text: 'Homeowner Signature:',
    x: margin,
    y: yPosition,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151'
  });
  yPosition += 5;

  pdf.pages[currentPageIndex].content.push({
    type: 'rect',
    x: margin,
    y: yPosition,
    width: 250,
    height: 80,
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderStyle: 'dashed',
    fillColor: '#f9fafb'
  });

  pdf.pages[currentPageIndex].content.push({
    type: 'image',
    dataUrl: homeownerSignature,
    x: margin + 5,
    y: yPosition + 5,
    width: 240,
    height: 70
  });

  pdf.pages[currentPageIndex].content.push({
    type: 'text',
    text: `Signed on: ${date}`,
    x: margin,
    y: yPosition + 95,
    fontSize: 9,
    color: '#6b7280'
  });

  pdf.pages[currentPageIndex].content.push({
    type: 'text',
    text: `Chaser: ${chaserName}`,
    x: margin + 280,
    y: yPosition,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151'
  });
  yPosition += 5;

  pdf.pages[currentPageIndex].content.push({
    type: 'rect',
    x: margin + 280,
    y: yPosition,
    width: 250,
    height: 80,
    borderColor: '#d1d5db',
    borderWidth: 1,
    borderStyle: 'dashed',
    fillColor: '#f9fafb'
  });

  pdf.pages[currentPageIndex].content.push({
    type: 'image',
    dataUrl: chaserSignature,
    x: margin + 285,
    y: yPosition + 5,
    width: 240,
    height: 70
  });

  pdf.pages[currentPageIndex].content.push({
    type: 'text',
    text: `Signed on: ${date}`,
    x: margin + 280,
    y: yPosition + 95,
    fontSize: 9,
    color: '#6b7280'
  });

  return await renderPDFToBlob(pdf, pageWidth, pageHeight);
}

interface PDFContent {
  type: 'text' | 'line' | 'rect' | 'image';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface PDFPage {
  content: PDFContent[];
}

interface PDF {
  pages: PDFPage[];
}

function createPDF(): PDF {
  return {
    pages: [createPage()]
  };
}

function createPage(): PDFPage {
  return {
    content: []
  };
}

function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
  const avgCharWidth = fontSize * 0.5;
  const maxCharsPerLine = Math.floor(maxWidth / avgCharWidth);

  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach((word) => {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    if (testLine.length > maxCharsPerLine && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

async function renderPDFToBlob(pdf: PDF, pageWidth: number, pageHeight: number): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const scale = 2;
  canvas.width = pageWidth * scale;
  canvas.height = (pageHeight * pdf.pages.length) * scale;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(scale, scale);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, pageWidth, pageHeight * pdf.pages.length);

  const imageCache = new Map<string, HTMLImageElement>();

  const loadImage = (dataUrl: string): Promise<HTMLImageElement> => {
    if (imageCache.has(dataUrl)) {
      return Promise.resolve(imageCache.get(dataUrl)!);
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      if (!dataUrl.startsWith('data:')) {
        img.crossOrigin = "anonymous";
      }
      img.onload = () => {
        imageCache.set(dataUrl, img);
        resolve(img);
      };
      img.onerror = reject;
      img.src = dataUrl;
    });
  };

  for (let pageIndex = 0; pageIndex < pdf.pages.length; pageIndex++) {
    const page = pdf.pages[pageIndex];
    const pageOffsetY = pageIndex * pageHeight;

    for (const item of page.content) {
      const y = pageOffsetY + item.y;

      if (item.type === 'text') {
        ctx.fillStyle = item.color || '#000000';
        ctx.font = `${item.fontWeight || 'normal'} ${item.fontSize || 12}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
        ctx.fillText(item.text, item.x, y);
      } else if (item.type === 'line') {
        ctx.strokeStyle = item.color || '#000000';
        ctx.lineWidth = item.width || 1;
        ctx.beginPath();
        ctx.moveTo(item.x1, y);
        ctx.lineTo(item.x2, pageOffsetY + item.y2);
        ctx.stroke();
      } else if (item.type === 'rect') {
        if (item.fillColor) {
          ctx.fillStyle = item.fillColor;
          ctx.fillRect(item.x, y, item.width, item.height);
        }
        if (item.borderColor) {
          ctx.strokeStyle = item.borderColor;
          ctx.lineWidth = item.borderWidth || 1;
          if (item.borderStyle === 'dashed') {
            ctx.setLineDash([5, 5]);
          }
          ctx.strokeRect(item.x, y, item.width, item.height);
          ctx.setLineDash([]);
        }
      } else if (item.type === 'image') {
        const img = await loadImage(item.dataUrl);
        ctx.drawImage(img, item.x, y, item.width, item.height);
      }
    }

    if (pageIndex < pdf.pages.length - 1) {
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(0, (pageIndex + 1) * pageHeight);
      ctx.lineTo(pageWidth, (pageIndex + 1) * pageHeight);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob!);
    }, 'image/png', 1.0);
  });
}

export function getDocumentContent(docId: string): string {
  const contents: Record<string, string> = {
    '1': `PROPERTY DAMAGE ASSESSMENT AGREEMENT

This Property Damage Assessment Agreement ("Agreement") is entered into on the date signed below between the property owner ("Owner") and National Fire Alerts ("Company").

1. SCOPE OF ASSESSMENT
The Company agrees to conduct a comprehensive assessment of property damage resulting from the reported incident. This assessment will include documentation of all visible damage, photographic evidence, and preliminary cost estimates for repairs.

2. PROPERTY ACCESS
The Owner grants the Company and its authorized representatives the right to access the property at reasonable times for the purpose of conducting damage assessments and necessary evaluations.

3. DOCUMENTATION
The Company will provide detailed documentation of all findings, including but not limited to photographs, written reports, and damage classifications. All documentation will be made available to the Owner and their insurance provider.

4. OWNER RESPONSIBILITIES
The Owner agrees to provide accurate information regarding the property condition, previous damage, and any relevant insurance coverage. The Owner confirms they are the legal owner or authorized representative of the property.

5. LIABILITY
The Company will exercise reasonable care during all assessment activities. The Owner acknowledges that the assessment is for informational purposes and does not constitute a guarantee of insurance coverage or repair costs.

By signing below, I acknowledge that I have read, understood, and agree to the terms of this Property Damage Assessment Agreement.`,

    '2': `INSURANCE CLAIM AUTHORIZATION

This Insurance Claim Authorization ("Authorization") grants permission to National Fire Alerts ("Company") to act on behalf of the property owner ("Owner") in matters related to insurance claims.

1. AUTHORIZATION SCOPE
The Owner authorizes the Company to communicate with insurance providers, adjusters, and other relevant parties regarding the property damage claim. This includes providing documentation, responding to inquiries, and facilitating the claims process.

2. INFORMATION RELEASE
The Owner authorizes their insurance carrier to release claim information, coverage details, and payment status to the Company. This authorization extends to all communications necessary for efficient claim processing.

3. CLAIM ASSISTANCE
The Company agrees to provide reasonable assistance in documenting damage, preparing claim submissions, and coordinating with insurance adjusters. The Company will keep the Owner informed of all significant developments.

4. OWNER CONTROL
The Owner retains full control over all final decisions regarding the claim, including settlement acceptance. The Company's role is advisory and facilitative only.

5. CONFIDENTIALITY
All information obtained during the claims process will be kept confidential and used solely for the purpose of processing the Owner's insurance claim.

6. DURATION
This authorization remains in effect until the claim is resolved or until revoked in writing by the Owner.

By signing below, I authorize National Fire Alerts to assist with my insurance claim as described above.`,

    '3': `EMERGENCY SERVICES AGREEMENT

This Emergency Services Agreement ("Agreement") establishes the terms under which National Fire Alerts ("Company") will provide emergency response services to the property owner ("Owner").

1. EMERGENCY SERVICES
The Company agrees to provide immediate emergency response services including but not limited to damage mitigation, temporary repairs, water extraction, and property protection measures as deemed necessary.

2. AUTHORIZATION
The Owner authorizes the Company to take immediate action to prevent further damage to the property. This includes making emergency repairs, boarding up openings, placing tarps, and removing water or debris.

3. ACCESS AND ENTRY
The Owner grants the Company 24/7 access to the property for emergency response purposes. The Company will make reasonable efforts to notify the Owner before entering the property except in cases of immediate emergency.

4. SERVICES PROVIDED
Emergency services may include: temporary roof repairs, board-up services, water extraction, dehumidification, debris removal, and temporary power or climate control as needed to protect the property.

5. COST AND PAYMENT
The Owner agrees that emergency services will be billed at standard rates. Charges will be submitted to the Owner's insurance carrier when applicable. The Owner remains ultimately responsible for payment of services rendered.

6. LIMITATION OF LIABILITY
The Company will exercise reasonable professional judgment in all emergency response activities. The Owner acknowledges that emergency situations may require immediate decisions and that the Company is not liable for pre-existing conditions or damage that cannot be prevented despite best efforts.

By signing below, I authorize National Fire Alerts to provide emergency services as described in this agreement.`,

    '4': `PROPERTY ACCESS CONSENT

This Property Access Consent ("Consent") grants National Fire Alerts ("Company") permission to access and inspect the property described below.

1. ACCESS PERMISSION
The property owner ("Owner") grants the Company and its authorized representatives permission to enter and inspect the property located at the address specified in the incident report.

2. PURPOSE OF ACCESS
Access is granted for the following purposes: damage assessment, documentation through photographs and videos, measurement of affected areas, moisture detection, structural evaluation, and coordination with insurance adjusters.

3. TIMING AND DURATION
The Company may access the property during reasonable hours, typically between 8:00 AM and 6:00 PM, unless emergency circumstances require different timing. Access permission remains valid for the duration of the damage assessment and repair period.

4. AUTHORIZED PERSONNEL
Only Company employees, contractors, and authorized representatives will be granted access. All personnel will carry proper identification and will respect the Owner's property.

5. PROPERTY PROTECTION
The Company agrees to take reasonable precautions to secure the property after each visit, including locking doors and windows. Any keys or access codes provided will be kept secure and confidential.

6. NOTIFICATION
The Company will make reasonable efforts to notify the Owner prior to accessing the property, except in emergency situations or when prior arrangements have been made.

7. REVOCATION
The Owner may revoke this consent at any time by providing written notice to the Company.

By signing below, I consent to property access as described in this agreement.`,

    '5': `PHOTO AND VIDEO RELEASE AUTHORIZATION

This Photo and Video Release Authorization ("Release") grants National Fire Alerts ("Company") permission to document property conditions through photographs and videos.

1. DOCUMENTATION PERMISSION
The property owner ("Owner") authorizes the Company to take photographs, videos, and other visual documentation of the property, including interior and exterior areas affected by the incident.

2. PURPOSE
Visual documentation will be used for: damage assessment records, insurance claim documentation, before-and-after comparisons, work progress tracking, and quality assurance purposes.

3. SHARING AND DISTRIBUTION
Documentation may be shared with: the Owner, insurance carriers and adjusters, contractors and repair professionals, and regulatory authorities as required. The Company will not use images for marketing or promotional purposes without separate written consent.

4. PROPERTY PRIVACY
The Company agrees to exercise discretion when documenting the property and will focus on damaged areas and relevant structural elements. Personal items and private areas not related to the damage will be avoided when possible.

5. SECURE STORAGE
All photographs and videos will be stored securely and maintained according to professional standards. Digital files will be protected with appropriate security measures.

6. OWNER ACCESS
The Owner will be provided access to all documentation upon request. Copies of photographs and videos relevant to the insurance claim will be made available to the Owner and their insurance provider.

7. RETENTION
Documentation will be retained for a period of at least seven years or as required by applicable laws and regulations.

By signing below, I authorize the documentation of property conditions as described in this release.`,

    '6': `TEMPORARY REPAIRS AUTHORIZATION

This Temporary Repairs Authorization ("Authorization") grants National Fire Alerts ("Company") permission to perform emergency temporary repairs to prevent further property damage.

1. REPAIR AUTHORIZATION
The property owner ("Owner") authorizes the Company to perform temporary repairs necessary to protect the property from additional damage, including but not limited to: roof tarping, board-up services, temporary window protection, water extraction, and structural stabilization.

2. SCOPE OF WORK
Temporary repairs are defined as immediate protective measures intended to prevent further damage until permanent repairs can be completed. These repairs are not intended as final solutions and will need to be replaced with permanent repairs.

3. PROFESSIONAL STANDARDS
All temporary repairs will be performed according to industry standards and local building codes. The Company will use appropriate materials and methods for temporary protection while preserving the ability to complete permanent repairs.

4. COST AND BILLING
The Owner agrees to pay for temporary repairs at standard rates. Charges will be submitted to the Owner's insurance carrier when applicable. The Owner understands they are ultimately responsible for payment of all services.

5. INSURANCE COORDINATION
The Company will document all temporary repairs with photographs and detailed descriptions for insurance purposes. Documentation will be provided to the Owner and their insurance carrier.

6. TIMEFRAME
Temporary repairs will be completed as quickly as conditions and safety permit. The Company will prioritize repairs based on urgency and weather conditions.

7. LIMITATION
Temporary repairs are intended to prevent further damage but may not address all property vulnerabilities. The Owner acknowledges that permanent repairs will be necessary.

8. OWNER OBLIGATIONS
The Owner agrees to maintain temporary repairs and notify the Company immediately if temporary protection fails or requires adjustment.

By signing below, I authorize temporary repairs as described in this authorization.`,
  };

  return contents[docId] || 'Document content not available.';
}
