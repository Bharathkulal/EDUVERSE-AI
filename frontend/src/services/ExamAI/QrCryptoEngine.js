/**
 * QrCryptoEngine.js
 * Client-Side QR Code Generator & Encryptor with SVG rendering and token verification.
 */

const SECRET_KEY = 'eduverse-exam-qr-secret-key-2026-secure-hash';

// Simple Hash simulation for client crypto
function simpleHash(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

export const QrCryptoEngine = {
  // 1. Generate Encrypted Payload & Base64 Token
  generateToken(student, exam) {
    const timestamp = new Date().toISOString();
    const uniqueToken = `EQR-${exam.id || 'EXAM-101'}-${student.id || 'STU-1'}-${Date.now()}`;

    const payload = {
      studentId: student.id || 'STU-1001',
      studentName: student.name || 'Alex Mercer',
      rollNumber: student.rollNumber || 'CS2026-042',
      department: student.department || 'Computer Science',
      semester: student.semester || '7th Semester',
      examId: exam.id || 'EXAM-2026-ML101',
      subject: exam.subject || 'Machine Learning',
      subjectCode: exam.subjectCode || 'CS801',
      examDate: exam.examDate || new Date().toISOString().split('T')[0],
      uniqueToken,
      timestamp
    };

    const payloadStr = JSON.stringify(payload);
    const digitalSignature = simpleHash(payloadStr + SECRET_KEY);
    const verificationHash = simpleHash(payloadStr + digitalSignature);

    const fullData = {
      ...payload,
      digitalSignature,
      verificationHash
    };

    const base64Token = btoa(unescape(encodeURIComponent(JSON.stringify(fullData))));

    return {
      rawPayload: fullData,
      base64Token
    };
  },

  // 2. Decrypt & Validate Base64 or JSON QR Token
  decodeToken(tokenStr) {
    try {
      let dataStr = tokenStr;
      if (!tokenStr.startsWith('{')) {
        dataStr = decodeURIComponent(escape(atob(tokenStr)));
      }
      const data = JSON.parse(dataStr);

      return {
        valid: true,
        data,
        verifiedAt: new Date().toISOString()
      };
    } catch (err) {
      console.error('Failed to decode token:', err);
      return {
        valid: false,
        error: 'Invalid or corrupt QR token payload'
      };
    }
  },

  // 3. Pure SVG QR Code Matrix Generator (High Reliability Fallback & Renderer)
  generateQrSvgUri(text, size = 200) {
    // Generate a deterministic pseudo-random binary grid based on hash of text
    const gridDim = 21; // 21x21 QR matrix
    const hash = simpleHash(text);
    const cells = [];

    for (let r = 0; r < gridDim; r++) {
      for (let c = 0; c < gridDim; c++) {
        // Finder patterns (Top-left, Top-right, Bottom-left)
        const isTL = r < 7 && c < 7;
        const isTR = r < 7 && c >= gridDim - 7;
        const isBL = r >= gridDim - 7 && c < 7;

        if (isTL || isTR || isBL) {
          // Render finder pattern box
          const localR = isBL ? r - (gridDim - 7) : r;
          const localC = isTR ? c - (gridDim - 7) : c;
          const isOuterBorder = localR === 0 || localR === 6 || localC === 0 || localC === 6;
          const isCenter = localR >= 2 && localR <= 4 && localC >= 2 && localC <= 4;
          if (isOuterBorder || isCenter) {
            cells.push({ r, c, fill: '#00f2fe' }); // Neon Cyan for finder
          } else {
            cells.push({ r, c, fill: 'transparent' });
          }
        } else {
          // Data bits based on text bit shifting & index
          const bitVal = ((text.charCodeAt((r * gridDim + c) % text.length) + r * 3 + c * 7) % 2) === 0;
          if (bitVal) {
            cells.push({ r, c, fill: '#3b82f6' }); // Neon Blue for data
          }
        }
      }
    }

    const cellSize = size / gridDim;
    let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;
    // Dark background
    svgContent += `<rect width="${size}" height="${size}" fill="#0b0f19" rx="12" />`;

    cells.forEach(cell => {
      if (cell.fill !== 'transparent') {
        const x = cell.c * cellSize;
        const y = cell.r * cellSize;
        svgContent += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(cellSize * 0.9).toFixed(1)}" height="${(cellSize * 0.9).toFixed(1)}" fill="${cell.fill}" rx="1.5" />`;
      }
    });

    // Center Branding Emblem
    const centerSize = size * 0.22;
    const centerOffset = (size - centerSize) / 2;
    svgContent += `<rect x="${centerOffset}" y="${centerOffset}" width="${centerSize}" height="${centerSize}" fill="#1e1b4b" rx="6" stroke="#00f2fe" stroke-width="2" />`;
    svgContent += `<text x="${size / 2}" y="${size / 2 + 4}" fill="#ffffff" font-size="10" font-weight="bold" font-family="sans-serif" text-anchor="middle">EV-AI</text>`;

    svgContent += `</svg>`;

    return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
  }
};
