package tech.djnd.sample.app.service;

import org.springframework.cache.CacheManager;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tech.djnd.sample.app.domain.Authority;
import tech.djnd.sample.app.domain.User;
import tech.djnd.sample.app.repository.AuthorityRepository;
import tech.djnd.sample.app.repository.UserRepository;
import tech.djnd.sample.app.security.AuthoritiesConstants;
import tech.djnd.sample.app.service.dto.UserDTO;
import tech.djnd.sample.app.service.errors.AccessDeniedException;
import tech.djnd.sample.app.service.errors.BadRequestResourceException;
import tech.djnd.sample.app.service.errors.DataResourceNotFoundException;
import tech.djnd.sample.app.web.rest.errors.LoginAlreadyUsedException;
import tech.jhipster.security.RandomUtil;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class UserService {
    private final UserRepository userRepository;
    private final CacheManager cacheManager;
    private final PasswordEncoder passwordEncoder;
    private final AuthorityRepository authorityRepository;
    public UserService(UserRepository userRepository,
                       CacheManager cacheManager,
                       PasswordEncoder passwordEncoder,
                       AuthorityRepository authorityRepository) {
        this.userRepository = userRepository;
        this.cacheManager = cacheManager;
        this.passwordEncoder = passwordEncoder;
        this.authorityRepository = authorityRepository;
    }
    public User registerUser(UserDTO dto, String password) {
        String normalizedEmail = dto.getEmail().trim().toLowerCase(Locale.ENGLISH);
        userRepository.findOneByEmail(normalizedEmail).ifPresent(existingUser -> {
            boolean removed = this.removeNoneActivatedUser(existingUser);
            if(!removed){
                throw new LoginAlreadyUsedException();
            }
        });
        User newUser = new User();
        newUser.setEmail(normalizedEmail);
        String encryptedPassword = passwordEncoder.encode(password);
        newUser.setPassword(encryptedPassword);
        newUser.setActivated(false);
        Set<Authority> authorities = new HashSet<>();
        authorityRepository.findById(AuthoritiesConstants.STUDENT).ifPresent(authorities::add);
        newUser.setAuthorities(authorities);
        return newUser;
    }
    private boolean removeNoneActivatedUser(User existingUser){
        if(existingUser.getActivated()){
            return false;
        }
        userRepository.delete(existingUser);
        userRepository.flush();
        this.clearUserCaches(existingUser);
        return true;
    }
    private void clearUserCaches(User user){
        var cacheByEmail = cacheManager.getCache(UserRepository.USERS_BY_EMAIL_CACHE);
        if(cacheByEmail != null){
            cacheByEmail.evict(user.getEmail().trim().toLowerCase(Locale.ENGLISH));
        }
    }

    /*
     * check after 3 day
     * and check 0 second - 0 minutes - 1 AM - Every day - Every week
     * */
    @Scheduled(cron = "0 0 1 * * ?")
    public void removeNotActivatedUsers(){
        List<User> currentUsers = userRepository.findAllByActivatedIsFalseAndActivationKeyNotNullAndCreatedDateBefore(Instant.now().minus(3, ChronoUnit.DAYS));
        List<Long> currentUserIds = currentUsers.stream().map(User::getId).toList();
        userRepository.deleteByIdIn(currentUserIds);
        currentUsers.forEach(this::clearUserCaches);
    }

    public UserDTO initActivatedKeyAccount(String email){
        String normalizedEmail = email.trim().toLowerCase(Locale.ENGLISH);
        User user = userRepository.findOneByEmail(normalizedEmail).orElseThrow(() -> new DataResourceNotFoundException(String.format("Email '%s' not found", normalizedEmail), "userManagement", "emailnotfound"));
        if(user.getActivated()){
            throw new AccessDeniedException("account");
        }
        user.setActivationKey(RandomUtil.generateActivationKey());
        userRepository.save(user);
        UserDTO dto = new UserDTO();
        dto.setEmail(normalizedEmail);
        dto.setActivationKey(user.getActivationKey());
        return dto;
    }
    public List<UserDTO> initActivateKeyMulAccount(List<Long> userIds){
        List<User> currentUsers = userRepository.findByIdIn(userIds);
        Set<Long> userIdSet = currentUsers.stream().map(User::getId).collect(Collectors.toSet());
        List <String> errorMessages = new ArrayList<>();
        for(Long userId : userIds){
            if(!userIdSet.contains(userId)){
                errorMessages.add(String.format("User with ID '%d' not found", userId));
            }
        }
        if(!errorMessages.isEmpty()){
            throw new BadRequestResourceException(String.join("/n", errorMessages), "userManagement", "idnotfound");
        }
        List<UserDTO> res = new ArrayList<>();
        for(User user : currentUsers){
            UserDTO dto = new UserDTO();
            dto.setEmail(user.getEmail());
            dto.setActivationKey(RandomUtil.generateActivationKey());
            res.add(dto);
        }
        return res;
    }

}
