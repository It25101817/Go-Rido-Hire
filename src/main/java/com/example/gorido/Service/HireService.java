package com.example.gorido.Service;
import com.example.gorido.DTO.HireRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.ui.Model;

import java.util.Map;

public interface HireService {
    Map<String, Object> processHire(Model model, HireRequest request, HttpSession session);
    String bookingRequests(Model model, HttpSession session);
    String assignDriver(int hireId, HttpSession session);
    String myBookings(Model model, HttpSession session);
    String myJobs(Model model, HttpSession session);
    String loadRoute(HttpSession session, int hireId, Model model);
    String endHire(HttpSession session, int hireId);
}
