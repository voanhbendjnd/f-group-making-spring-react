import * as XLSX from 'xlsx';
import type { ParsedStudentRow } from '../types';

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

export interface ParseExcelResult {
  rows: ParsedStudentRow[];
  totalRows: number;
  validCount: number;
  invalidCount: number;
  hasErrors: boolean;
}

export async function parseExcelClientSide(file: File): Promise<ParseExcelResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array' });

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('Tệp Excel không chứa trang tính (sheet) nào.');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  // Parse sheet into 2D array of rows
  const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: '',
    blankrows: false,
  });

  const parsedRows: ParsedStudentRow[] = [];
  const seenRollNumbers = new Set<string>();

  // Backend skips row index 0 and 1, starting from Excel row 3 (0-indexed rawRows[2])
  for (let i = 2; i < rawRows.length; i++) {
    const rawRow = rawRows[i];
    const excelRowNumber = i + 1; // 1-indexed Excel row

    // Extract columns B to F (indices 1 to 5)
    const rollNumber = String(rawRow[1] ?? '').trim();
    const fullName = String(rawRow[2] ?? '').trim();
    const originalMajor = String(rawRow[3] ?? '').trim();
    const memberCode = String(rawRow[4] ?? '').trim();
    const email = String(rawRow[5] ?? '').trim().toLowerCase();

    // Check if entire row is empty
    if (!rollNumber && !fullName && !originalMajor && !memberCode && !email) {
      continue;
    }

    const errors: string[] = [];

    if (!rollNumber) {
      errors.push('Thiếu Mã sinh viên (Cột B)');
    } else if (seenRollNumbers.has(rollNumber.toLowerCase())) {
      errors.push(`Mã sinh viên "${rollNumber}" bị trùng lặp trong tệp`);
    } else {
      seenRollNumbers.add(rollNumber.toLowerCase());
    }

    if (!fullName) {
      errors.push('Thiếu Họ và tên (Cột C)');
    } else if (fullName.length > 50) {
      errors.push('Họ và tên dài hơn 50 ký tự');
    }

    let extractedMajorCode = '';
    if (!originalMajor) {
      errors.push('Thiếu Mã ngành (Cột D)');
    } else {
      const parts = originalMajor.split('_');
      if (parts.length >= 2) {
        extractedMajorCode = parts[1];
      } else {
        extractedMajorCode = originalMajor;
      }
    }

    if (!memberCode) {
      errors.push('Thiếu Mã thành viên (Cột E)');
    }

    if (!email) {
      errors.push('Thiếu Email (Cột F)');
    } else if (!EMAIL_REGEX.test(email)) {
      errors.push(`Định dạng email "${email}" không hợp lệ`);
    }

    parsedRows.push({
      rowNumber: excelRowNumber,
      rollNumber,
      fullName,
      originalMajor,
      extractedMajorCode,
      memberCode,
      email,
      isValid: errors.length === 0,
      validationErrors: errors,
    });
  }

  const validCount = parsedRows.filter((r) => r.isValid).length;
  const invalidCount = parsedRows.length - validCount;

  return {
    rows: parsedRows,
    totalRows: parsedRows.length,
    validCount,
    invalidCount,
    hasErrors: invalidCount > 0,
  };
}
