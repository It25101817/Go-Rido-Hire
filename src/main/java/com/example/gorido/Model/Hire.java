package com.example.gorido.Model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.Date;

@Entity
@Table(name = "hire")
public class Hire {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String pickup_location;
    private String drop_location;
    private Date requested_at;
    private LocalDateTime starting_at;
    private double distance;
    private double duration;
    private double base_fare;
    private double total_fare;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "driver_id")
    private Driver driver;

    @ManyToOne
    @JoinColumn(name = "hire_Status_id")
    private HireStatus hireStatus;

    @ManyToOne
    @JoinColumn(name = "vehicle_type_id")
    private VehicleType vehicleType;

    @ManyToOne
    @JoinColumn(name = "payment_id")
    private Payment payment;

    public void setId(int id) {
        this.id = id;
    }

    public int getId() {
        return id;
    }

    public void setPickup_location(String pickup_location) {
        this.pickup_location = pickup_location;
    }

    public String getPickup_location() {
        return pickup_location;
    }

    public void setDrop_location(String drop_location) {
        this.drop_location = drop_location;
    }

    public String getDrop_location() {
        return drop_location;
    }

    public void setRequested_at(Date requested_at) {
        this.requested_at = requested_at;
    }

    public Date getRequested_at() {
        return requested_at;
    }

    public void setStarting_at(LocalDateTime starting_at) {
        this.starting_at = starting_at;
    }

    public LocalDateTime getStarting_at() {
        return starting_at;
    }

    public void setDistance(double distance) {
        this.distance = distance;
    }

    public double getDistance() {
        return distance;
    }

    public void setDuration(double duration) {
        this.duration = duration;
    }

    public double getDuration() {
        return duration;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public User getUser() {
        return user;
    }

    public void setDriver(Driver driver) {
        this.driver = driver;
    }

    public Driver getDriver() {
        return driver;
    }

    public void setHireStatus(HireStatus hireStatus) {
        this.hireStatus = hireStatus;
    }

    public HireStatus getHireStatus() {
        return hireStatus;
    }

    public void setBase_fare(double base_fare) {
        this.base_fare = base_fare;
    }

    public double getBase_fare() {
        return base_fare;
    }

    public void setTotal_fare(double total_fare) {
        this.total_fare = total_fare;
    }

    public double getTotal_fare() {
        return total_fare;
    }

    public void setVehicleType(VehicleType vehicletype) {
        this.vehicleType = vehicletype;
    }

    public VehicleType getVehicleType() {
        return vehicleType;
    }

    public void setPayment(Payment payment) {
        this.payment = payment;
    }

    public Payment getPayment() {
        return payment;
    }
}
