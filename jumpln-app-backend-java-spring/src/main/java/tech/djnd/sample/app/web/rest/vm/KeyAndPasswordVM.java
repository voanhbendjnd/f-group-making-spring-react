package tech.djnd.sample.app.web.rest.vm;

public class KeyAndPasswordVM {
    private String resetKey;
    private String newPassword;

    public String getResetKey() {
        return resetKey;
    }

    public void setResetKey(String resetKey) {
        this.resetKey = resetKey;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
