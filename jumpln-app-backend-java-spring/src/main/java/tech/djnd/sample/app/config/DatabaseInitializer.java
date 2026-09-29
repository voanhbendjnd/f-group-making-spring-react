package tech.djnd.sample.app.config;


import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import tech.djnd.sample.app.domain.Authority;
import tech.djnd.sample.app.domain.Major;
import tech.djnd.sample.app.domain.User;
import tech.djnd.sample.app.repository.AuthorityRepository;
import tech.djnd.sample.app.repository.MajorRepository;
import tech.djnd.sample.app.repository.UserRepository;
import tech.djnd.sample.app.security.AuthoritiesConstants;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor(access = AccessLevel.PRIVATE)
@Slf4j
public class DatabaseInitializer implements CommandLineRunner {

    UserRepository userRepository;
    AuthorityRepository authorityRepository;
    MajorRepository majorRepository;
    PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        log.info("Database start check initialization...");
        Long totalUsers = userRepository.count();
        Long totalAuthority = authorityRepository.count();
        Set<Authority> authorities = new HashSet<>();

        if (totalAuthority.equals(0L)) {
            log.info("Start create authority...");

            Authority adminAuthority = new Authority();
            adminAuthority.setName(AuthoritiesConstants.ADMIN);
            Authority userAuthority = new Authority();
            userAuthority.setName(AuthoritiesConstants.STUDENT);
            Authority anonymousAuthority = new Authority();
            anonymousAuthority.setName(AuthoritiesConstants.ANONYMOUS);
            authorities.addAll(List.of(adminAuthority, userAuthority, anonymousAuthority));
            authorityRepository.saveAll(authorities);
        }

        if (totalUsers.equals(0L)) {
            log.info("Start create user...");
            User admin = new User();
            admin.setName("Hoàng admin");
            admin.setActivated(true);
            admin.setEmail("hoangtlt.ce190272@gmail.com");
            admin.setPassword(passwordEncoder.encode("admin@123"));
            admin.setAuthorities(authorities);
            userRepository.save(admin);
            User admin2 = new User();
            admin2.setName("Djnd");
            admin2.setActivated(false);
            admin2.setEmail("voanhbendjnd@gmail.com");
            admin2.setPassword(passwordEncoder.encode("123123"));
            admin2.setAuthorities(authorities);
            userRepository.save(admin2);
        }

        // Seed Major data — chỉ insert nếu chưa có dữ liệu
        initMajors();

        if (totalUsers > 0 || totalAuthority > 0) {
            log.info("Skip processing initialize...");
        } else {
            log.info("End init data and init data success");
        }
    }

    /**
     * Khởi tạo dữ liệu ngành học (Major) vào DB nếu chưa tồn tại.
     * Major được seed tại đây để StudentService có thể lookup khi import Excel.
     *
     * <p>Danh sách Major tương ứng với các mã ngành xuất hiện trong file Excel
     * (token thứ 2 khi split originalMajor theo "_", ví dụ: BEN_<b>CHN</b>_ET_19C).</p>
     */
    private void initMajors() {
        if (majorRepository.count() > 0) {
            log.info("Majors already initialized, skipping...");
            return;
        }
        log.info("Start seeding Major data...");

        List<Major> majors = List.of(
                buildMajor("KT", "Korean Studies"),
                buildMajor("ENG", "English"),
                buildMajor("CHN", "Chinese"),
                buildMajor("KR",  "Korean"),
                buildMajor("IB",  "International Business"),
                buildMajor("SE",  "Software Engineering"),
                buildMajor("GD",  "Graphic Design"),
                buildMajor("IA",  "Information Assurance"),
                buildMajor("MC",  "Multimedia Communications"),
                buildMajor("HM",  "Hotel Management"),
                buildMajor("TM",  "Tourism Management"),
                buildMajor("FIN", "Finance"),
                buildMajor("MKT", "Marketing")
        );

        majorRepository.saveAll(majors);
        log.info("Seeded {} major(s) successfully.", majors.size());
    }

    private Major buildMajor(String code, String name) {
        Major major = new Major();
        major.setCode(code);
        major.setName(name);
        return major;
    }
}