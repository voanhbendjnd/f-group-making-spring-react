package tech.djnd.sample.app.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import tech.djnd.sample.app.domain.Lecturer;
import tech.djnd.sample.app.domain.Major;
import tech.djnd.sample.app.domain.Student;
import tech.djnd.sample.app.domain.User;
import tech.djnd.sample.app.repository.*;
import tech.djnd.sample.app.service.dto.*;
import tech.djnd.sample.app.service.errors.BadRequestResourceException;
import tech.djnd.sample.app.service.errors.ExcelImportException;
import tech.djnd.sample.app.service.projection.StudentRow;

import java.io.IOException;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
public class StudentService {

    private static final long MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024L; // 5 MB
    private static final String XLSX_CONTENT_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    private static final int HEADER_ROW_INDEX = 0;
    private static final int TITLE_ROW_INDEX = 1;

    // Excel column indices (0-based)
    private static final int COL_ROLL_NUMBER = 1;   // Column B: Roll number
    private static final int COL_FULL_NAME   = 2;   // Column C: Full name
    private static final int COL_MAJOR       = 3;   // Column D: Major (BEN_CHN_ET_19C,...)
    private static final int COL_MEMBER_CODE = 4;   // Column E: Member code
    private static final int COL_EMAIL       = 5;   // Column F: Email
    private static final int COL_LECTURER_CODE = 9;
    private final StudentQueryRepository studentQueryRepository;
    private final StudentRepository studentRepository;
    private final MajorRepository majorRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final LecturerRepository lecturerRepository;
    private final NotificationAsyncService notificationAsyncService;

    public StudentService(
            StudentRepository studentRepository,
            MajorRepository majorRepository,
            UserRepository userRepository,
            UserService userService,
            NotificationAsyncService notificationAsyncService,
            StudentQueryRepository studentQueryRepository,
            LecturerRepository lecturerRepository
    ) {
        this.studentRepository = studentRepository;
        this.majorRepository = majorRepository;
        this.userRepository = userRepository;
        this.userService = userService;
        this.studentQueryRepository = studentQueryRepository;
        this.notificationAsyncService = notificationAsyncService;
        this.lecturerRepository = lecturerRepository;
    }


    /**
     * Import student list from Excel file (.xlsx).
     */
    public ImportResultDTO importFromExcel(MultipartFile file) {
        log.info("Starting Excel import: filename={}, size={} bytes",
                file.getOriginalFilename(), file.getSize());

        // Step 1: Validate file (format, size, empty)
        validateFile(file);

        // Step 2: Parse Excel file to DTO list
        List<StudentImportRowDTO> rows = parseExcelRows(file);

        if (rows.isEmpty()) {
            log.warn("Excel file is empty or contains only headers");
            throw new ExcelImportException("Excel file contains no student data.");
        }

        // Step 3: Validate each row according to business rules
        List<ImportRowErrorDTO> errors = validateRows(rows);

        // Step 4: All-or-nothing — if any errors exist, reject entire file
        if (!errors.isEmpty()) {
            log.warn("Import validation failed: {} error(s) found", errors.size());
            return ImportResultDTO.builder()
                    .success(false)
                    .totalImported(0)
                    .errors(errors)
                    .build();
        }

        // Step 5: Map DTO → Entity and persist to database
        List<StudentDTO> studentDTOs = mapToEntities(rows);
        Set<String> lecturerCodes = studentDTOs.stream().map(StudentDTO::getLecturerCode).collect(Collectors.toSet());
        for(String lecturerCode : lecturerCodes) {
            System.out.println("Lecturer code from set: " + lecturerCode);
        }
        // Create user accounts before creating student records
        List<User> userStudents = new ArrayList<>();
        studentDTOs.forEach(student -> {
            User user = new User();
            user.setEmail(student.getEmail());
            user.setName(student.getFullName());
            userStudents.add(user);
        });
        Map<String, Long> userStudentMap = userRepository.saveAll(userStudents).stream()
                .collect(Collectors.toMap(User::getEmail, User::getId));
        studentDTOs.forEach(student -> {
            Long userId = userStudentMap.get(student.getEmail());
            student.setUserId(userId);
        });


        studentRepository.saveAll(studentDTOs.stream().map(this::toEntity).toList());

        log.info("Import completed successfully: {} student(s) saved", studentDTOs.size());
        return ImportResultDTO.builder()
                .success(true)
                .totalImported(studentDTOs.size())
                .errors(List.of())
                .build();
    }

    private Student toEntity(StudentDTO dto){
        Student student = new Student();
        student.setUserId(dto.getUserId());
        student.setRollNumber(dto.getRollNumber());
        student.setFullName(dto.getFullName());
//        student.setEmail(dto.getEmail());
        student.setMemberCode(dto.getMemberCode());
        student.setMajorId(dto.getMajorId());
        student.setMajorCode(dto.getMajorCode());
        return student;
    }

    @Transactional(readOnly = true)
    public ResultPaginationDTO getStudents(
            String search, String majorCode, Boolean activated,
            Boolean hasActivationKey, Pageable pageable) {

        Specification<Student> spec =
                StudentSpecifications.withFilter(search, majorCode, activated, hasActivationKey);
        Page<StudentRow> page = studentQueryRepository.search(spec, pageable);

        List<StudentDTO> studentDTOs = page.getContent().stream()
                .map(this::toDTO)
                .toList();

        ResultPaginationDTO.Meta meta = ResultPaginationDTO.Meta.builder()
                .page(pageable.getPageNumber() + 1)
                .pageSize(pageable.getPageSize())
                .pages(page.getTotalPages())
                .total(page.getTotalElements())
                .build();

        return ResultPaginationDTO.builder()
                .meta(meta)
                .result(studentDTOs)
                .build();
    }

    private StudentDTO toDTO(StudentRow row) {
        boolean hasKey = row.activationKey() != null;
        boolean expired = row.activationKeyExpiresAt() != null
                && row.activationKeyExpiresAt().isBefore(Instant.now());

        return StudentDTO.builder()
                .userId(row.userId())
                .rollNumber(row.rollNumber())
                .fullName(row.fullName())
                .email(row.email())
                .memberCode(row.memberCode())
                .majorId(row.majorId())
                .majorCode(row.majorCode())
                .activated(Boolean.TRUE.equals(row.activated()))
                .hasActivationKey(hasKey)
                .activationKeyExpiresAt(row.activationKeyExpiresAt())
                .isKeyExpired(expired)
                .createdDate(row.createdDate())
                .lastModifiedDate(row.lastModifiedDate())
                .build();
    }

    /**
     * Get student details by userId.
     */
    @Transactional(readOnly = true)
    public StudentDTO getStudentByUserId(Long userId) {
        StudentRow student = studentRepository.findStudentProjectionById(userId)
                .orElseThrow(() -> new BadRequestResourceException(
                        "Student not found with ID: " + userId,
                        "studentManagement",
                        "studentnotfound"
                ));
        return toDTO(student);
    }

    /**
     * Activate and send emails to all unactivated students matching filter criteria.
     */
    public BatchActivationResultDTO activateAllMatching(String search, String majorCode) {
        Specification<Student> spec = StudentSpecifications.withFilter(search, majorCode, false, null);
        List<Student> matchingStudents = studentRepository.findAll(spec);

        List<Long> userIds = matchingStudents.stream()
                .map(Student::getUserId)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        if (userIds.isEmpty()) {
            return BatchActivationResultDTO.builder()
                    .totalRequested(0)
                    .totalProcessed(0)
                    .totalSkippedAlreadyActive(0)
                    .sentEmails(List.of())
                    .build();
        }

        List<UserDTO> usersToActivate = userService.initActivateKeyMulAccount(userIds);
        notificationAsyncService.sendMailActivatedAccount(usersToActivate);

        return BatchActivationResultDTO.builder()
                .totalRequested(userIds.size())
                .totalProcessed(usersToActivate.size())
                .totalSkippedAlreadyActive(userIds.size() - usersToActivate.size())
                .sentEmails(usersToActivate.stream().map(UserDTO::getEmail).toList())
                .build();
    }


    // =========================================================================
    // PRIVATE METHODS
    // =========================================================================

    /**
     * Validate file before processing.
     */
    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ExcelImportException("File must not be empty.");
        }
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new ExcelImportException(
                    String.format("File size exceeds maximum allowed limit (%.1f MB).", MAX_FILE_SIZE_BYTES / (1024.0 * 1024)));
        }
        String contentType = file.getContentType();
        String originalFilename = Objects.requireNonNullElse(file.getOriginalFilename(), "");
        boolean isXlsxByType = XLSX_CONTENT_TYPE.equals(contentType);
        boolean isXlsxByName = originalFilename.toLowerCase().endsWith(".xlsx");
        if (!isXlsxByType && !isXlsxByName) {
            throw new ExcelImportException("Only .xlsx files are supported.");
        }
    }

    /**
     * Parse Excel rows into DTO list.
     */
    private List<StudentImportRowDTO> parseExcelRows(MultipartFile file) {
        List<StudentImportRowDTO> rows = new ArrayList<>();
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            for (Row row : sheet) {
                if (row.getRowNum() == HEADER_ROW_INDEX || row.getRowNum() == TITLE_ROW_INDEX) {
                    continue;
                }
                if (isRowEmpty(row)) {
                    continue;
                }
                String rollNumber    = getCellValueAsString(row, COL_ROLL_NUMBER).trim();
                String fullName      = getCellValueAsString(row, COL_FULL_NAME).trim();
                String originalMajor = getCellValueAsString(row, COL_MAJOR).trim();
                String memberCode    = getCellValueAsString(row, COL_MEMBER_CODE).trim();
                String email         = getCellValueAsString(row, COL_EMAIL).trim().toLowerCase(Locale.ENGLISH);
                String majorCode     = parseMajorCode(originalMajor);
                String lecturerCode = getCellValueAsString(row, COL_LECTURER_CODE).trim();


                rows.add(StudentImportRowDTO.builder()
                        .rowIndex(row.getRowNum() + 1)
                        .rollNumber(rollNumber)
                        .fullName(fullName)
                        .email(email)
                        .memberCode(memberCode)
                        .originalMajor(originalMajor)
                        .majorCode(majorCode)
                        .lecturerCode(lecturerCode)
                        .build());
            }
        } catch (IOException e) {
            log.error("Failed to read Excel file: {}", e.getMessage(), e);
            throw new ExcelImportException("Cannot read Excel file. Please verify file format.");
        }
        return rows;
    }

    /**
     * Validate all rows and collect error details.
     */
    private List<ImportRowErrorDTO> validateRows(List<StudentImportRowDTO> rows) {
        List<ImportRowErrorDTO> errors = new ArrayList<>();
        List<String> rollNumbersInFile = rows.stream()
                .map(StudentImportRowDTO::getRollNumber)
                .filter(r -> r != null && !r.isBlank())
                .toList();
        List<String> memberCodesInFile = rows.stream()
                .map(StudentImportRowDTO::getMemberCode)
                .filter(m -> m != null && !m.isBlank())
                .toList();
        List<String> emailsInFile = rows.stream()
                .map(StudentImportRowDTO::getEmail)
                .filter(e -> e != null && !e.isBlank())
                .toList();

        Set<String> existingRollNumbers = studentRepository
                .findByRollNumberIn(rollNumbersInFile)
                .stream()
                .map(Student::getRollNumber)
                .collect(Collectors.toSet());
        Set<String> existingMemberCodes = studentRepository
                .findByMemberCodeIgnoreCaseIn(memberCodesInFile)
                .stream()
                .map(Student::getMemberCode)
                .collect(Collectors.toSet());
        Set<String> existingEmails = userRepository
                .findByEmailIn(emailsInFile)
                .stream()
                .map(User::getEmail)
                .collect(Collectors.toSet());

        Map<String, Major> majorsByCode = majorRepository.findAll()
                .stream()
                .collect(Collectors.toMap(Major::getCode, m -> m));

        Map<String, Integer> seenRollNumbers = new HashMap<>();
        Map<String, Integer> seenMemberCodes = new HashMap<>();
        Map<String, Integer> seenEmails = new HashMap<>();

        for (StudentImportRowDTO row : rows) {
            validateSingleRow(row, existingRollNumbers, existingMemberCodes, existingEmails, majorsByCode, seenRollNumbers, seenMemberCodes, seenEmails, errors);
        }
        return errors;
    }

    /**
     * Validate an individual row according to all business rules.
     */
    private void validateSingleRow(
            StudentImportRowDTO row,
            Set<String> existingRollNumbers,
            Set<String> existingMemberCodes,
            Set<String> existingEmails,
            Map<String, Major> majorsByCode,
            Map<String, Integer> seenRollNumbers,
            Map<String, Integer> seenMemberCodes,
            Map<String, Integer> seenEmails,
            List<ImportRowErrorDTO> errors) {
        // lecturer code skip -> cause if exist not add to db
        // Rule 1: rollNumber must not be empty
        if (row.getRollNumber() == null || row.getRollNumber().isBlank()) {
            errors.add(ImportRowErrorDTO.builder()
                    .row(row.getRowIndex())
                    .rollNumber(null)
                    .field("rollNumber")
                    .message("Student roll number must not be empty.")
                    .build());
            return;
        }

        // Rule 2a: rollNumber duplicate within file
        if (seenRollNumbers.containsKey(row.getRollNumber())) {
            errors.add(ImportRowErrorDTO.builder()
                    .row(row.getRowIndex())
                    .rollNumber(row.getRollNumber())
                    .field("rollNumber")
                    .message(String.format(
                            "Roll number '%s' is duplicated in file (already appeared at row %d).",
                            row.getRollNumber(), seenRollNumbers.get(row.getRollNumber())))
                    .build());
        } else {
            seenRollNumbers.put(row.getRollNumber(), row.getRowIndex());
        }

        // Rule 2b: memberCode duplicate within file
        if (row.getMemberCode() != null && !row.getMemberCode().isBlank()) {
            if (seenMemberCodes.containsKey(row.getMemberCode())) {
                errors.add(ImportRowErrorDTO.builder()
                        .row(row.getRowIndex())
                        .rollNumber(row.getRollNumber())
                        .field("memberCode")
                        .message(String.format(
                                "Member code '%s' is duplicated in file (already appeared at row %d).",
                                row.getMemberCode(), seenMemberCodes.get(row.getMemberCode())))
                        .build());
            } else {
                seenMemberCodes.put(row.getMemberCode(), row.getRowIndex());
            }
        }

        // Rule 2c: email duplicate within file
        if (row.getEmail() != null && !row.getEmail().isBlank()) {
            if (seenEmails.containsKey(row.getEmail())) {
                errors.add(ImportRowErrorDTO.builder()
                        .row(row.getRowIndex())
                        .rollNumber(row.getRollNumber())
                        .field("email")
                        .message(String.format(
                                "Email '%s' is duplicated in file (already appeared at row %d).",
                                row.getEmail(), seenEmails.get(row.getEmail())))
                        .build());
            } else {
                seenEmails.put(row.getEmail(), row.getRowIndex());
            }
        }

        // Rule 3: duplicate check against DB
        if (existingRollNumbers.contains(row.getRollNumber())) {
            errors.add(ImportRowErrorDTO.builder()
                    .row(row.getRowIndex())
                    .rollNumber(row.getRollNumber())
                    .field("rollNumber")
                    .message(String.format("Roll number '%s' already exists in the system.", row.getRollNumber()))
                    .build());
        }
        if (existingMemberCodes.contains(row.getMemberCode())) {
            errors.add(ImportRowErrorDTO.builder()
                    .row(row.getRowIndex())
                    .rollNumber(row.getRollNumber())
                    .field("memberCode")
                    .message(String.format("Member code '%s' already exists in the system.", row.getMemberCode()))
                    .build()
            );
        }
        if (existingEmails.contains(row.getEmail())) {
            errors.add(ImportRowErrorDTO.builder()
                    .row(row.getRowIndex())
                    .rollNumber(row.getRollNumber())
                    .field("email")
                    .message(String.format("Email '%s' already exists in the system.", row.getEmail()))
                    .build()
            );
        }

        // Rule 4: fullName must not be empty
        if (row.getFullName() == null || row.getFullName().isBlank()) {
            errors.add(ImportRowErrorDTO.builder()
                    .row(row.getRowIndex())
                    .rollNumber(row.getRollNumber())
                    .field("fullName")
                    .message("Student full name must not be empty.")
                    .build());
        }

        // Rule 5: originalMajor must not be empty
        if (row.getOriginalMajor() == null || row.getOriginalMajor().isBlank()) {
            errors.add(ImportRowErrorDTO.builder()
                    .row(row.getRowIndex())
                    .rollNumber(row.getRollNumber())
                    .field("originalMajor")
                    .message("Major information must not be empty.")
                    .build());
            return;
        }

        // Rule 6: originalMajor format
        if (row.getMajorCode() == null) {
            errors.add(ImportRowErrorDTO.builder()
                    .row(row.getRowIndex())
                    .rollNumber(row.getRollNumber())
                    .field("originalMajor")
                    .message(String.format(
                            "Major format '%s' is invalid. Required format: PREFIX_MAJORCODE_... (e.g. BEN_CHN_ET_19C).",
                            row.getOriginalMajor()))
                    .build());
            return;
        }

        // Rule 7: majorCode must exist in DB
        if (!majorsByCode.containsKey(row.getMajorCode())) {
            errors.add(ImportRowErrorDTO.builder()
                    .row(row.getRowIndex())
                    .rollNumber(row.getRollNumber())
                    .field("majorCode")
                    .message(String.format(
                            "Major code '%s' (parsed from '%s') does not exist in the system.",
                            row.getMajorCode(), row.getOriginalMajor()))
                    .build());
        }

        // Rule 8: member code must not be null/blank
        if (row.getMemberCode() == null || row.getMemberCode().isBlank()) {
            errors.add(ImportRowErrorDTO.builder()
                    .row(row.getRowIndex())
                    .field("memberCode")
                    .message("Member code must not be empty.")
                    .build()
            );
            return;
        }

        // Rule 9: email must not be null/blank
        if (row.getEmail() == null || row.getEmail().isBlank()) {
            errors.add(ImportRowErrorDTO.builder()
                    .row(row.getRowIndex())
                    .field("email")
                    .message("Email must not be empty.")
                    .build()
            );
        }
    }

    /**
     * Map validated DTO list to Student entity list.
     */
    private List<StudentDTO> mapToEntities(List<StudentImportRowDTO> rows) {
        Map<String, Major> majorsByCode = majorRepository.findAll()
                .stream()
                .collect(Collectors.toMap(Major::getCode, m -> m));
        return rows.stream().map(row -> {
            Major major = majorsByCode.get(row.getMajorCode());
            StudentDTO student = new StudentDTO();
            student.setRollNumber(row.getRollNumber());
            student.setFullName(row.getFullName());
            student.setEmail(row.getEmail());
            student.setMemberCode(row.getMemberCode());
            student.setMajorId(major.getId());
            student.setMajorCode(row.getOriginalMajor());
            student.setLecturerCode(row.getLecturerCode());
            return student;
        }).toList();
    }

    // =========================================================================
    // EXCEL UTILITIES
    // =========================================================================

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

    private String getCellValueAsString(Row row, int colIndex) {
        Cell cell = row.getCell(colIndex, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (cell == null) {
            return "";
        }
        return switch (cell.getCellType()) {
            case STRING  -> cell.getStringCellValue();
            case NUMERIC -> {
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
