package tech.djnd.sample.app.service;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import tech.djnd.sample.app.domain.Major;
import tech.djnd.sample.app.domain.Student;
import tech.djnd.sample.app.domain.User;
import tech.djnd.sample.app.repository.MajorRepository;
import tech.djnd.sample.app.repository.StudentRepository;
import tech.djnd.sample.app.repository.UserRepository;
import tech.djnd.sample.app.service.dto.ImportResultDTO;
import tech.djnd.sample.app.service.dto.ImportRowErrorDTO;
import tech.djnd.sample.app.service.dto.StudentImportRowDTO;
import tech.djnd.sample.app.service.errors.ExcelImportException;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Transactional
public class StudentService {

    static final long MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024L; // 5 MB
    static final String XLSX_CONTENT_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    static final int HEADER_ROW_INDEX = 0;
    static final int TITLE_ROW_INDEX = 1;

    // Chỉ số cột trong file Excel (0-based)
    static final int COL_ROLL_NUMBER = 1;   // Cột B: Mã sinh viên
    static final int COL_FULL_NAME   = 2;   // Cột C: Họ tên
    static final int COL_MAJOR       = 3;   // Cột D: Ngành (BEN_CHN_ET_19C,...)
    static final int COL_MEMBER_CODE = 4;
    static final int COL_EMAIL = 5;
    StudentRepository studentRepository;
    MajorRepository majorRepository;
    UserRepository userRepository;
    // =========================================================================
    // PUBLIC API
    // =========================================================================

    /**
     * Import danh sách sinh viên từ file Excel (.xlsx).
     *
     * <p><b>Business Rules:</b></p>
     * <ol>
     *   <li>File phải là .xlsx, không rỗng, tối đa 5MB.</li>
     *   <li>Dòng đầu tiên (header) sẽ bị bỏ qua.</li>
     *   <li>{@code rollNumber} là bắt buộc, không trùng trong file và không trùng trong DB.</li>
     *   <li>{@code fullName} là bắt buộc, không được blank.</li>
     *   <li>{@code originalMajor} phải có định dạng ít nhất 2 token phân tách bởi "_", ví dụ: BEN_CHN_...</li>
     *   <li>Token thứ 2 ({@code majorCode}) phải tồn tại trong bảng {@code majors}.</li>
     *   <li><b>All-or-nothing</b>: Nếu bất kỳ dòng nào lỗi, toàn bộ file bị reject.</li>
     * </ol>
     *
     * @param file MultipartFile Excel được upload từ client
     * @return {@link ImportResultDTO} chứa kết quả và danh sách lỗi (nếu có)
     * @throws ExcelImportException nếu file không hợp lệ hoặc không đọc được
     */
    public ImportResultDTO importFromExcel(MultipartFile file) {
        log.info("Starting Excel import: filename={}, size={} bytes",
                file.getOriginalFilename(), file.getSize());

        // Bước 1: Validate file (format, size, empty)
        validateFile(file);

        // Bước 2: Parse file Excel thành danh sách DTO
        List<StudentImportRowDTO> rows = parseExcelRows(file);

        if (rows.isEmpty()) {
            log.warn("Excel file is empty or contains only headers");
            throw new ExcelImportException("File Excel không có dữ liệu sinh viên.");
        }

        // Bước 3: Validate từng dòng theo business rules
        List<ImportRowErrorDTO> errors = validateRows(rows);

        // Bước 4: All-or-nothing — nếu có lỗi, không lưu gì cả
        if (!errors.isEmpty()) {
            log.warn("Import validation failed: {} error(s) found", errors.size());
            return ImportResultDTO.builder()
                    .success(false)
                    .totalImported(0)
                    .errors(errors)
                    .build();
        }

        // Bước 5: Map DTO → Entity và lưu vào DB
        List<Student> students = mapToEntities(rows);

        // create student after create user
        List<User> userStudents = new ArrayList<>();
        students.forEach(student -> {
            User user = new User();
            user.setEmail(student.getEmail());
            user.setName(student.getFullName());
            userStudents.add(user);
        });
        Map<String, Long> userStudentMap = userRepository.saveAll(userStudents).stream().collect(Collectors.toMap(User::getEmail, User::getId));
        students.forEach(student -> {
            Long userId = userStudentMap.get(student.getEmail());
            student.setUserId(userId);
        }) ;
        studentRepository.saveAll(students);

        log.info("Import completed successfully: {} student(s) saved", students.size());
        return ImportResultDTO.builder()
                .success(true)
                .totalImported(students.size())
                .errors(List.of())
                .build();
    }

    // =========================================================================
    // PRIVATE METHODS
    // =========================================================================

    /**
     * Bước 1: Validate file trước khi xử lý.
     */
    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ExcelImportException("File không được để trống.");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new ExcelImportException(
                    String.format("File vượt quá dung lượng tối đa cho phép (%.1f MB).", MAX_FILE_SIZE_BYTES / (1024.0 * 1024)));
        }
        String contentType = file.getContentType();
        String originalFilename = Objects.requireNonNullElse(file.getOriginalFilename(), "");
        boolean isXlsxByType = XLSX_CONTENT_TYPE.equals(contentType);
        boolean isXlsxByName = originalFilename.toLowerCase().endsWith(".xlsx");
        if (!isXlsxByType && !isXlsxByName) {
            throw new ExcelImportException("Chỉ chấp nhận file định dạng .xlsx.");
        }
    }

    /**
     * Bước 2: Đọc file Excel và parse thành danh sách {@link StudentImportRowDTO}.
     * Bỏ qua dòng header (dòng 0) và các dòng trống hoàn toàn.
     */
    private List<StudentImportRowDTO> parseExcelRows(MultipartFile file) {
        List<StudentImportRowDTO> rows = new ArrayList<>();
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            for (Row row : sheet) {
                if (row.getRowNum() == HEADER_ROW_INDEX || row.getRowNum() == TITLE_ROW_INDEX) {
                    continue; // bỏ qua dòng header
                }
                // Bỏ qua dòng trống hoàn toàn
                if (isRowEmpty(row)) {
                    continue;
                }
                String rollNumber    = getCellValueAsString(row, COL_ROLL_NUMBER).trim();
                String fullName      = getCellValueAsString(row, COL_FULL_NAME).trim();
                String originalMajor = getCellValueAsString(row, COL_MAJOR).trim();
                String memberCode = getCellValueAsString(row, COL_MEMBER_CODE).trim();
                String email = getCellValueAsString(row, COL_EMAIL).trim().toLowerCase(Locale.ENGLISH);
                // Parse majorCode: token thứ 2 sau "_"
                String majorCode = parseMajorCode(originalMajor);

                rows.add(StudentImportRowDTO.builder()
                        .rowIndex(row.getRowNum() + 1) // 1-based cho user
                        .rollNumber(rollNumber)
                        .fullName(fullName)
                                .email(email)
                                .memberCode(memberCode)
                        .originalMajor(originalMajor)
                        .majorCode(majorCode)
                        .build());
            }
        } catch (IOException e) {
            log.error("Failed to read Excel file: {}", e.getMessage(), e);
            throw new ExcelImportException("Không thể đọc file Excel. Vui lòng kiểm tra lại định dạng file.");
        }
        return rows;
    }

    /**
     * Bước 3: Validate tất cả các dòng và thu thập lỗi.
     * Tối ưu hiệu năng bằng cách pre-load tập dữ liệu cần check từ DB 1 lần.
     */
    private List<ImportRowErrorDTO> validateRows(List<StudentImportRowDTO> rows) {
        List<ImportRowErrorDTO> errors = new ArrayList<>();

        // Pre-load: lấy tập rollNumbers đã tồn tại trong DB (batch query, không N+1)
        List<String> rollNumbersInFile = rows.stream()
                .map(StudentImportRowDTO::getRollNumber)
                .filter(r -> r != null && !r.isBlank())
                .toList();
        List<String> memberCodesInFile = rows.stream().map(StudentImportRowDTO::getRollNumber)
                .filter(m -> m != null && !m.isBlank())
                .toList();
        List<String> emailsInFile = rows.stream().map(StudentImportRowDTO::getEmail)
                .filter(e -> e != null && !e.isBlank())
                .toList();
        Set<String> existingRollNumbers = studentRepository
                .findByRollNumberIn(rollNumbersInFile)
                .stream()
                .map(Student::getRollNumber)
                .collect(Collectors.toSet());
        Set<String> existingMemberCodes = studentRepository.findByMemberCodeIgnoreCaseIn(memberCodesInFile).stream().map(Student::getMemberCode).collect(Collectors.toSet());
        Set<String> existingEmails = studentRepository.findByEmailIn(emailsInFile).stream().map(Student::getEmail).collect(Collectors.toSet());
        // Pre-load: lấy tất cả Major để tránh query DB từng dòng
        Map<String, Major> majorsByCode = majorRepository.findAll()
                .stream()
                .collect(Collectors.toMap(Major::getCode, m -> m));

        // Theo dõi rollNumber trong file để phát hiện duplicate trong cùng file
        Map<String, Integer> seenRollNumbers = new HashMap<>();

        for (StudentImportRowDTO row : rows) {
            validateSingleRow(row, existingRollNumbers,existingMemberCodes, existingEmails ,majorsByCode, seenRollNumbers,errors);
        }
        return errors;
    }

    /**
     * Validate một dòng đơn lẻ theo tất cả business rules.
     */
    private void validateSingleRow(
            StudentImportRowDTO row,
            Set<String> existingRollNumbers,
            Set< String> existingMemberCodes,
            Set<String> existingEmails,
            Map<String, Major> majorsByCode,
            Map<String, Integer> seenRollNumbers,

            List<ImportRowErrorDTO> errors) {

        // Rule 1: rollNumber không được trống
        if (row.getRollNumber() == null || row.getRollNumber().isBlank()) {
            errors.add(ImportRowErrorDTO.builder()
                    .row(row.getRowIndex())
                    .rollNumber(null)
                    .field("rollNumber")
                    .message("Mã sinh viên không được để trống.")
                    .build());
            return; // không thể validate thêm nếu không có rollNumber
        }


        // Rule 2: rollNumber không được trùng trong cùng file
        if (seenRollNumbers.containsKey(row.getRollNumber())) {
            errors.add(ImportRowErrorDTO.builder()
                    .row(row.getRowIndex())
                    .rollNumber(row.getRollNumber())
                    .field("rollNumber")
                    .message(String.format(
                            "Mã sinh viên '%s' bị trùng lặp trong file (đã xuất hiện tại dòng %d).",
                            row.getRollNumber(), seenRollNumbers.get(row.getRollNumber())))
                    .build());
        } else {
            seenRollNumbers.put(row.getRollNumber(), row.getRowIndex());
        }

        // Rule 3: rollNumber không được trùng trong DB
        if (existingRollNumbers.contains(row.getRollNumber())) {
            errors.add(ImportRowErrorDTO.builder()
                    .row(row.getRowIndex())
                    .rollNumber(row.getRollNumber())
                    .field("rollNumber")
                    .message(String.format("Mã sinh viên '%s' đã tồn tại trong hệ thống.", row.getRollNumber()))
                    .build());
        }
        if(existingMemberCodes.contains(row.getMemberCode())) {
            errors.add(ImportRowErrorDTO.builder()
                    .row(row.getRowIndex())
                    .rollNumber(row.getMemberCode())
                    .field("memberCode")
                    .message(String.format("Member code '%s' đã tồn tại trong hệ thống.", row.getMemberCode()))
                    .build()
            );
        }
        if(existingEmails.contains(row.getEmail())) {
            errors.add(ImportRowErrorDTO.builder()
                    .row(row.getRowIndex())
                    .rollNumber(row.getEmail())
                    .field("email")
                    .message(String.format("Email '%s' đã tồn tại trong hệ thống.", row.getEmail()))
                    .build()
            );
        }
        // Rule 4: fullName không được trống
        if (row.getFullName() == null || row.getFullName().isBlank()) {
            errors.add(ImportRowErrorDTO.builder()
                    .row(row.getRowIndex())
                    .rollNumber(row.getRollNumber())
                    .field("fullName")
                    .message("Họ tên sinh viên không được để trống.")
                    .build());
        }

        // Rule 5: originalMajor không được trống
        if (row.getOriginalMajor() == null || row.getOriginalMajor().isBlank()) {
            errors.add(ImportRowErrorDTO.builder()
                    .row(row.getRowIndex())
                    .rollNumber(row.getRollNumber())
                    .field("originalMajor")
                    .message("Thông tin ngành không được để trống.")
                    .build());
            return; // không thể validate majorCode nếu originalMajor trống
        }

        // Rule 6: originalMajor phải có đúng định dạng (ít nhất 2 token khi split "_")
        if (row.getMajorCode() == null) {
            errors.add(ImportRowErrorDTO.builder()
                    .row(row.getRowIndex())
                    .rollNumber(row.getRollNumber())
                    .field("originalMajor")
                    .message(String.format(
                            "Định dạng ngành '%s' không hợp lệ. Yêu cầu dạng: PREFIX_MAJORCODE_... (ví dụ: BEN_CHN_ET_19C).",
                            row.getOriginalMajor()))
                    .build());
            return;
        }

        // Rule 7: majorCode phải tồn tại trong DB
        if (!majorsByCode.containsKey(row.getMajorCode())) {
            errors.add(ImportRowErrorDTO.builder()
                    .row(row.getRowIndex())
                    .rollNumber(row.getRollNumber())
                    .field("majorCode")
                    .message(String.format(
                            "Mã ngành '%s' (parse từ '%s') không tồn tại trong hệ thống.",
                            row.getMajorCode(), row.getOriginalMajor()))
                    .build());
        }
        // member code not null
        if(row.getMemberCode() == null || row.getMemberCode().isBlank()) {
            errors.add(ImportRowErrorDTO.builder()
                    .row(row.getRowIndex())
                    .field("memberCode")
                    .message("Member code không được để trống.")
                    .build()
            );
            return;
        }
        if(row.getEmail() == null || row.getEmail().isBlank()) {
            errors.add(ImportRowErrorDTO.builder()
                    .row(row.getRowIndex())
                    .field("email")
                    .message("Email không được để trống.")
                    .build()
            );
            return;
        }

    }

    /**
     * Bước 5: Map danh sách DTO đã validate thành danh sách {@link Student} entity.
     * Tại bước này, data đã được validate nên có thể lookup Major an toàn.
     */
    private List<Student> mapToEntities(List<StudentImportRowDTO> rows) {
        // Pre-load tất cả major cần dùng (tối ưu N+1)
        Map<String, Major> majorsByCode = majorRepository.findAll()
                .stream()
                .collect(Collectors.toMap(Major::getCode, m -> m));

        return rows.stream().map(row -> {
            Major major = majorsByCode.get(row.getMajorCode());
            Student student = new Student();
            student.setRollNumber(row.getRollNumber());
            student.setFullName(row.getFullName());
            student.setEmail(row.getEmail());
            student.setMemberCode(row.getMemberCode());
            student.setMajorId(major.getId());
            student.setMajorCode(row.getOriginalMajor()); // lưu giá trị gốc từ Excel
            return student;
        }).toList();
    }

    // =========================================================================
    // EXCEL UTILITIES
    // =========================================================================

    /**
     * Parse mã ngành từ chuỗi originalMajor bằng cách lấy token thứ 2 sau "_".
     * Ví dụ: "BEN_CHN_ET_19C" → "CHN"
     *
     * @return majorCode hoặc {@code null} nếu định dạng không hợp lệ
     */
    private String parseMajorCode(String originalMajor) {
        if (originalMajor == null || originalMajor.isBlank()) {
            return null;
        }
        String[] tokens = originalMajor.split("_");
        if (tokens.length < 2 || tokens[1].isBlank()) {
            return null;
        }
        return tokens[1].toUpperCase().trim();
    }

    /**
     * Đọc giá trị của một ô và trả về dạng String.
     * Hỗ trợ các kiểu: NUMERIC (số nguyên), STRING, BOOLEAN, FORMULA.
     */
    private String getCellValueAsString(Row row, int colIndex) {
        Cell cell = row.getCell(colIndex, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (cell == null) {
            return "";
        }
        return switch (cell.getCellType()) {
            case STRING  -> cell.getStringCellValue();
            case NUMERIC -> {
                // Tránh trường hợp mã số bị hiển thị dạng 1.9E8
                double numericValue = cell.getNumericCellValue();
                if (numericValue == Math.floor(numericValue)) {
                    yield String.valueOf((long) numericValue);
                }
                yield String.valueOf(numericValue);
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> {
                try {
                    yield cell.getStringCellValue();
                } catch (Exception ex) {
                    yield String.valueOf(cell.getNumericCellValue());
                }
            }
            default -> "";
        };
    }

    /**
     * Kiểm tra một dòng trong Excel có trống hoàn toàn không
     * (tất cả các ô đều null hoặc blank).
     */
    private boolean isRowEmpty(Row row) {
        if (row == null) return true;
        for (int i = row.getFirstCellNum(); i < row.getLastCellNum(); i++) {
            Cell cell = row.getCell(i);
            if (cell != null && cell.getCellType() != CellType.BLANK
                    && !getCellValueAsString(row, i).isBlank()) {
                return false;
            }
        }
        return true;
    }
}
