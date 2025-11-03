package com.g3appdev.noteably;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.boot.test.mock.mockito.MockBean;
import com.g3appdev.noteably.NoteablyApplication;
import com.g3appdev.noteably.config.SecurityConfig;

@SpringBootTest(classes = NoteablyApplication.class)
@Import(SecurityConfig.class)
class NoteablyApplicationTests {

	@MockBean
    private com.g3appdev.noteably.Service.StudentService studentService;

    @MockBean
    private com.g3appdev.noteably.config.JWTAuthFilter jwtAuthFilter;

	@Test
	void contextLoads() {
	}
}
