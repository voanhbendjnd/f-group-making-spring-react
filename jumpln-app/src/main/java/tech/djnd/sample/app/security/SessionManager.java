package tech.djnd.sample.app.security;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import tech.djnd.sample.app.repository.UserRepository;

import java.util.UUID;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class SessionManager {
    UserRepository userRepository;
    public String initSessionId(Long userId){
        String newSessionId = UUID.randomUUID().toString();
        int updated = userRepository.updateSessionIdById(userId, newSessionId);
        if(updated > 0){
            return newSessionId;
        }
        throw new ResourceNotFoundException("Cannot init session ID!");
    }

}
