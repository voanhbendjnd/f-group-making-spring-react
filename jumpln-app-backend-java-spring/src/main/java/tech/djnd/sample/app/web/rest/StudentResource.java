package tech.djnd.sample.app.web.rest;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tech.djnd.sample.app.security.AuthoritiesConstants;
import tech.djnd.sample.app.service.StudentService;
import tech.djnd.sample.app.service.dto.BatchActivationResultDTO;
import tech.djnd.sample.app.service.dto.ImportResultDTO;
import tech.djnd.sample.app.service.dto.ResultPaginationDTO;
import tech.djnd.sample.app.service.dto.StudentDTO;
import tech.djnd.sample.app.util.anotation.ApiMessage;

/**
 * REST controller for managing {@link tech.djnd.sample.app.domain.Student}.
 *
 * <p>Endpoint prefix: {@code /api/students}</p>
 */
@Slf4j
@RestController
@RequestMapping("/api/students")
public class StudentResource {

    private final StudentService studentService;

    public StudentResource(StudentService studentService) {
        this.studentService = studentService;
    }

    /**
     * GET /api/students : Get paginated, searched, and filtered student list.
     *
     * <p>Only ADMIN can perform this operation.</p>
     */
    @GetMapping
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    @ApiMessage("Get student list successfully")
    public ResponseEntity<ResultPaginationDTO> getAllStudents(
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "majorCode", required = false) String majorCode,
            @RequestParam(name = "activated", required = false) Boolean activated,
            @RequestParam(name = "hasActivationKey", required = false) Boolean hasActivationKey,
            Pageable pageable) {

        log.debug("REST request to get students with filter: search={}, majorCode={}, activated={}, hasKey={}",
                search, majorCode, activated, hasActivationKey);
        ResultPaginationDTO result = studentService.getStudents(search, majorCode, activated, hasActivationKey, pageable);
        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/students/{userId} : Get student details by user ID.
     *
     * <p>Only ADMIN can perform this operation.</p>
     */
    @GetMapping("/{userId}")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    @ApiMessage("Get student details successfully")
    public ResponseEntity<StudentDTO> getStudentByUserId(@PathVariable("userId") Long userId) {
        log.debug("REST request to get student details for userId={}", userId);
        StudentDTO result = studentService.getStudentByUserId(userId);
        return ResponseEntity.ok(result);
    }

    /**
     * POST /api/students/activate/all : Send activation emails to all matching unactivated students.
     *
     * <p>Only ADMIN can perform this operation.</p>
     */
    @PostMapping("/activate/all")
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    @ApiMessage("Batch activation request accepted successfully")
    public ResponseEntity<BatchActivationResultDTO> activateAllStudents(
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "majorCode", required = false) String majorCode) {

        log.debug("REST request to activate all matching unactivated students: search={}, majorCode={}", search, majorCode);
        BatchActivationResultDTO result = studentService.activateAllMatching(search, majorCode);
        return ResponseEntity.ok(result);
    }

    /**
     * POST /api/students/import : Import student list from Excel file (.xlsx).
     *
     * <p>Only ADMIN can perform this operation.</p>
     */
    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    @ApiMessage("Import students successfully")
    public ResponseEntity<ImportResultDTO> importStudentsFromExcel(
            @RequestParam("file") MultipartFile file) {

        log.debug("REST request to import students from Excel: filename={}", file.getOriginalFilename());
        ImportResultDTO result = studentService.importFromExcel(file);
        return ResponseEntity.ok(result);
    }
}
