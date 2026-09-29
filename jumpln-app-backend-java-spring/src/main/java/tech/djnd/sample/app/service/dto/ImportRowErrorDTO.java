package tech.djnd.sample.app.service.dto;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

/**
 * DTO mô tả một lỗi validation tại một dòng cụ thể trong file Excel.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ImportRowErrorDTO {

    /** Số dòng trong file Excel (bắt đầu từ 2) */
    int row;

    /** Mã sinh viên tại dòng lỗi (có thể null nếu rollNumber thiếu) */
    String rollNumber;

    /** Tên trường bị lỗi, ví dụ: "rollNumber", "fullName", "majorCode" */
    String field;

    /** Thông điệp lỗi mô tả chi tiết vấn đề */
    String message;
}
