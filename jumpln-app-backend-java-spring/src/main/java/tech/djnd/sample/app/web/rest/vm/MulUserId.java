package tech.djnd.sample.app.web.rest.vm;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public class MulUserId {
    @NotNull(message = "User ID not found")
   private List<Long> userIds;

    public List<Long> getUserIds() {
        return userIds;
    }

    public void setUserIds(List<Long> userIds) {
        this.userIds = userIds;
    }
}
