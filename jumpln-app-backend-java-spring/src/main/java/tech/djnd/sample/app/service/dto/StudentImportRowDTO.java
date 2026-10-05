package tech.djnd.sample.app.service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;


@Builder
@AllArgsConstructor
public class StudentImportRowDTO {

    private int rowIndex;
    @NotBlank(message = "Roll number student not found")
    private String rollNumber;
    @NotBlank(message = "Name student not found")
   private String fullName;

    @NotBlank(message = "Major code student not found")
    private String originalMajor;

    private String majorCode;
    @NotBlank(message = "Member code student not found")
    private String memberCode;
    @NotBlank(message = "Email student not found")
    private String email;
    @NotBlank(message = "Lecturer code not found")
    private String lecturerCode;

    public String getLecturerCode() {
        return lecturerCode;
    }

    public void setLecturerCode(String lecturerCode) {
        this.lecturerCode = lecturerCode;
    }

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
