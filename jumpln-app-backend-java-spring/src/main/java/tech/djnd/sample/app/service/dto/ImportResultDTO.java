package tech.djnd.sample.app.service.dto;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.util.List;

/**
 * DTO trả về kết quả sau khi thực hiện import file Excel.
 * <ul>
 *   <li>Nếu {@code success = true}: tất cả dòng hợp lệ, {@code totalImported} là số dòng đã lưu.</li>
 *   <li>Nếu {@code success = false}: có ít nhất 1 lỗi, không dòng nào được lưu, {@code errors} chứa danh sách lỗi.</li>
 * </ul>
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ImportResultDTO {

    /** true nếu import thành công hoàn toàn, false nếu có lỗi validation */
    boolean success;

    /** Số sinh viên đã được lưu vào DB (0 nếu success = false) */
    int totalImported;

    /** Danh sách lỗi chi tiết (rỗng nếu success = true) */
    List<ImportRowErrorDTO> errors;
}
