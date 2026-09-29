package tech.djnd.sample.app.web.rest;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import tech.djnd.sample.app.security.AuthoritiesConstants;
import tech.djnd.sample.app.service.StudentService;
import tech.djnd.sample.app.service.dto.ImportResultDTO;

/**
 * REST controller quản lý nghiệp vụ liên quan đến {@link tech.djnd.sample.app.domain.Student}.
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
     * POST /api/students/import : Import danh sách sinh viên từ file Excel (.xlsx).
     *
     * <p>Chỉ ADMIN mới có quyền thực hiện thao tác này.</p>
     *
     * <p>File Excel phải theo định dạng chuẩn:
     * <ul>
     *   <li>Cột B (index 1): Mã sinh viên (rollNumber)</li>
     *   <li>Cột C (index 2): Họ và tên (fullName)</li>
     *   <li>Cột D (index 3): Ngành gốc (originalMajor), ví dụ: BEN_CHN_ET_19C</li>
     * </ul>
     * </p>
     *
     * @param file File Excel được upload (multipart/form-data, field name: "file")
     * @return {@link ImportResultDTO}
     *         <ul>
     *           <li>HTTP 200 + {@code success=true}: Import thành công, {@code totalImported} là số dòng đã lưu.</li>
     *           <li>HTTP 200 + {@code success=false}: Có lỗi validation, {@code errors} chứa chi tiết từng lỗi.</li>
     *           <li>HTTP 400: File không hợp lệ (sai định dạng, rỗng, vượt dung lượng).</li>
     *         </ul>
     */
    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAuthority(\"" + AuthoritiesConstants.ADMIN + "\")")
    public ResponseEntity<ImportResultDTO> importStudentsFromExcel(
            @RequestParam("file") MultipartFile file) {

        log.debug("REST request to import students from Excel: filename={}", file.getOriginalFilename());
        ImportResultDTO result = studentService.importFromExcel(file);
        return ResponseEntity.ok(result);
    }
}
