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
@Builder
@AllArgsConstructor
public class StudentImportRowDTO {

    /** Số thứ tự dòng trong file Excel (bắt đầu từ 2, dòng 1 là header) */
    private int rowIndex;

    /** Mã sinh viên, ví dụ: CE190001 */
    private String rollNumber;

    /** Họ tên đầy đủ của sinh viên */
   private String fullName;

    /**
     * Ngành gốc từ file Excel, ví dụ: BEN_CHN_ET_19C.
     * Đây là giá trị thô chưa qua xử lý.
     */
    private String originalMajor;

    /**
     * Mã ngành được parse từ originalMajor (token thứ 2 sau "_").
     * Ví dụ: BEN_CHN_ET_19C → CHN
     */
    private String majorCode;

    private String memberCode;
    private String email;

    public int getRowIndex() {
        return rowIndex;
    }

    public void setRowIndex(int rowIndex) {
        this.rowIndex = rowIndex;
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getOriginalMajor() {
        return originalMajor;
    }

    public void setOriginalMajor(String originalMajor) {
        this.originalMajor = originalMajor;
    }

    public String getMajorCode() {
        return majorCode;
    }

    public void setMajorCode(String majorCode) {
        this.majorCode = majorCode;
    }

    public String getMemberCode() {
        return memberCode;
    }

    public void setMemberCode(String memberCode) {
        this.memberCode = memberCode;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
