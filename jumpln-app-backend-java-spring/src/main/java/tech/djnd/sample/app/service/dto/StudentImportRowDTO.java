package tech.djnd.sample.app.service.dto;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

/**
 * DTO đại diện cho một dòng dữ liệu được parse từ file Excel.
 * Được dùng nội bộ trong quá trình validate và import.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StudentImportRowDTO {

    /** Số thứ tự dòng trong file Excel (bắt đầu từ 2, dòng 1 là header) */
    int rowIndex;

    /** Mã sinh viên, ví dụ: CE190001 */
    String rollNumber;

    /** Họ tên đầy đủ của sinh viên */
    String fullName;

    /**
     * Ngành gốc từ file Excel, ví dụ: BEN_CHN_ET_19C.
     * Đây là giá trị thô chưa qua xử lý.
     */
    String originalMajor;

    /**
     * Mã ngành được parse từ originalMajor (token thứ 2 sau "_").
     * Ví dụ: BEN_CHN_ET_19C → CHN
     */
    String majorCode;

    String memberCode;
    String email;
}
