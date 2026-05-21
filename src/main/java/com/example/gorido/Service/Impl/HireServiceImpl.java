package com.example.gorido.Service.Impl;

import com.example.gorido.DTO.HireRequest;
import com.example.gorido.Model.Passengers;
import com.example.gorido.Model.*;
import com.example.gorido.Model.VehicleColor;
import com.example.gorido.Model.VehicleType;
import com.example.gorido.Repository.*;
import com.example.gorido.Service.HireService;
import jakarta.servlet.http.HttpSession;
import org.apache.catalina.User;
import org.springframework.stereotype.Service;
import org.springframework.ui.Model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class HireServiceImpl implements HireService {
    private final UserRepository userRepository;
    private final VehicleTypeRepository vehicleTypeRepository;
    private final HireStatusRepository hireStatusRepository;
    private final HireRepository hireRepository;
    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;

    public HireServiceImpl(UserRepository userRepository, VehicleTypeRepository vehicleTypeRepository,
                           HireStatusRepository hireStatusRepository, HireRepository hireRepository,
                           VehicleRepository vehicleRepository, DriverRepository driverRepository){
        this.userRepository = userRepository;
        this.vehicleTypeRepository = vehicleTypeRepository;
        this.hireStatusRepository = hireStatusRepository;
        this.hireRepository = hireRepository;
        this.vehicleRepository = vehicleRepository;
        this.driverRepository = driverRepository;
    }

    public Map<String, Object> processHire(Model model, HireRequest request, HttpSession session) {

        Map<String, Object> response = new HashMap<>();
        String email = (String) session.getAttribute("userEmail");

        if (email == null) {
            response.put("status", "error");
            response.put("message", "session expired");

            return response;
        }

        Optional<User> user = userRepository.findByEmailAndStatusId_Id(email, 1);

        if (user.isEmpty()) {
            response.put("status", "error");
            response.put("message", "not_logged_in");

            return response;
        }

        VehicleType type = vehicleTypeRepository.findById(request.getVehicleTypeId()).orElse(null);
        if (type == null) {
            response.put("status", "error");
            response.put("message", "type not found");

            return response;
        }

        Optional<HireStatus> status = hireStatusRepository.findById(5);
        if (status.isEmpty()) {
            response.put("status", "error");
            response.put("message", "status not found");

            return response;
        }

        double baseFare = type.getPricePerKm() * request.getDistance();
        double totalFare = baseFare + 70;

        baseFare = Math.round(baseFare * 100.0) / 100.0;
        totalFare = Math.round(totalFare * 100.0) / 100.0;

        Hire hire = new Hire();
        hire.setUser(user.get());
        hire.setPickup_location(request.getPickup());
        hire.setDrop_location(request.getDestination());
        hire.setDuration(request.getDuration());
        hire.setStarting_at(request.getDateTime());
        hire.setDistance(request.getDistance());
        hire.setVehicleType(type);
        hire.setBase_fare(baseFare);
        hire.setTotal_fare(totalFare);
        hire.setRequested_at(new Date());
        hire.setHireStatus(status.get());
        hireRepository.save(hire);

        response.put("status", "success");
        response.put("hireId", hire.getId());
        response.put("baseFare", baseFare);
        response.put("pricePerKm", type.getPricePerKm());
        response.put("totalFare", totalFare);

        return response;
    }

    public String bookingRequests(Model model, HttpSession session){

        String email = (String) session.getAttribute("userEmail");

        if (email == null) {
            return "redirect:/signin";
        }

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return "redirect:/signin";
        }

        Driver driver = driverRepository.findByUserId(user).orElse(null);
        if (driver == null){
            return "redirect:/driverregi";
        }

        List<Vehicle> vehicles = vehicleRepository.findByDriverId(driver);

        List<Integer> vtpIds = vehicles.stream()
                .map(v -> v.getTypeHasBrand().getVehicleType().getId())
                .toList();

        List<Hire> hires = hireRepository.findMatchingHires(vtpIds);

        model.addAttribute("hires", hires);
        model.addAttribute("activePage", "bookingRequests");

        return "bookingRequests";
    }

    public String assignDriver(int hireId, HttpSession session){
        String email = (String) session.getAttribute("userEmail");

        if (email == null){
            return "signin";
        }

        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null){
            return "signup";
        }

        Driver driver = user.getDriver();
        if (driver == null){
            return "driverregi";
        }

        Hire hire = hireRepository.findById(hireId).orElse(null);
        if (hire == null){
            return "Hire not exists";
        }

        Optional<HireStatus> status = hireStatusRepository.findById(2);
        if (status.isEmpty()) {
            return "error: status not found";
        }

        hire.setDriver(driver);
        hire.setHireStatus(status.get());
        hireRepository.save(hire);

        return "Success";
    }

    public String myBookings(Model model, HttpSession session){

        Integer userId = (Integer) session.getAttribute("userId");

        if(userId == null){
            return "redirect:/signin";
        }

        List<Hire> todayHires = hireRepository.findTodayHires(userId);
        LocalDateTime tomorrow = LocalDate.now().plusDays(1).atStartOfDay();
        List<Hire> upcomingHires = hireRepository.findUpcomingHires(userId, tomorrow);
        List<Hire> pastHires = hireRepository.findPastHires(userId);

        model.addAttribute("todayHires", todayHires);
        model.addAttribute("upcomingHires", upcomingHires);
        model.addAttribute("pastHires", pastHires);
        model.addAttribute("activePage", "myBookings");

        return "myBookings";
    }

    public String loadRoute(HttpSession session, int hireId, Model model){
        String userEmail = (String) session.getAttribute("userEmail");
        if (userEmail == null) return "Session expired";

        Hire hire = hireRepository.findById(hireId).orElse(null);
        if (hire == null){
            return "Something went wrong";
        }

        model.addAttribute("hire", hire);
        return "viewRoute";
    }

    public String endHire(HttpSession session, int hireId){
        String userEmail = (String) session.getAttribute("userEmail");
        if (userEmail == null) return "Session expired";

        Hire hire = hireRepository.findById(hireId).orElse(null);
        if (hire == null){
            return "Something went wrong";
        }

        Optional<HireStatus> status = hireStatusRepository.findById(4);
        if (status.isEmpty()) {
            return "Hire status not found";
        }
        hire.setHireStatus(status.get());

        hireRepository.save(hire);
        return "success";
    }
}
