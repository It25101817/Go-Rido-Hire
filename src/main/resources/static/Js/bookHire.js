function loadTypes(){
    var typeSelect = document.getElementById("vehicle_type");

    var request = new XMLHttpRequest();

    request.onreadystatechange = function(){

        if(request.readyState == 4 && request.status == 200){

            var type = request.responseText;
            var types = type.split(",");

            typeSelect.innerHTML = '<option disabled value="" selected>Select type</option>';

            for (var i = 0; i < types.length; i++){

                if (types[i] === "") continue;

                var typeData = types[i].split(":");

                var opt = document.createElement("option");

                opt.value = typeData[0];
                opt.innerHTML = typeData[1];

                typeSelect.appendChild(opt);
            }
        }
    }

    request.open("GET", "/hire/loadTypes", true);
    request.send();
}

function selectVehicle(type, element) {

    document.getElementById("vehicle_type").value = type;
    document.querySelectorAll(".vehicle-card").forEach(card => {
        card.classList.remove(
            "ring-2",
            "scale-[1.02]",
            "ring-green-400",
            "ring-yellow-400",
            "ring-cyan-400"
        );

        const radio = card.querySelector(".vehicle-radio");
        radio.classList.remove(
            "bg-green-400",
            "bg-yellow-400",
            "bg-cyan-400"
        );
    });

    let ringColor = "";
    let radioColor = "";

    if (type == 1) {
        ringColor = "ring-green-400";
        radioColor = "bg-green-400";
    } else if (type == 2) {
        ringColor = "ring-yellow-400";
        radioColor = "bg-yellow-400";
    } else if (type == 3) {
        ringColor = "ring-cyan-400";
        radioColor = "bg-cyan-400";
    }

    element.classList.add("ring-2", "scale-[1.02]", ringColor);
    element.querySelector(".vehicle-radio").classList.add(radioColor);
}

var bookingMode = "now";

function setMode(mode) {

    bookingMode = mode;

    const panel = document.getElementById("schedule-panel");

    const nowBtn = document.getElementById("now-btn");
    const laterBtn = document.getElementById("later-btn");

    if (mode === "later") {

        panel.classList.remove("hidden");

        laterBtn.className =
            "py-3 rounded-xl bg-yellow-400 text-zinc-950 font-semibold text-sm shadow-sm transition-all";

        nowBtn.className =
            "py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm font-semibold transition-all";

    } else {

        panel.classList.add("hidden");

        nowBtn.className =
            "py-3 rounded-xl bg-yellow-400 text-zinc-950 font-semibold text-sm shadow-sm transition-all";

        laterBtn.className =
            "py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-sm font-semibold transition-all";
    }
}

function confirmBooking(event) {

    event.preventDefault();

    var pickup = document.getElementById("pickup-input");
    var destination = document.getElementById("dest-input");
    var vehicleType = document.getElementById("vehicle_type");

    var distanceText =
        document.getElementById("est-distance").textContent;

    var distance = parseFloat(distanceText);

    var durationText = document.getElementById("est-duration").textContent;

    var duration = parseFloat(durationText);

    var dateInput = document.querySelector('input[type="date"]');
    var timeInput = document.querySelector('input[type="time"]');

    var msg = document.getElementById("msg");

    msg.classList.add("hidden");

    pickup.classList.remove("border-red-500");
    destination.classList.remove("border-red-500");
    vehicleType.classList.remove("border-red-500");

    var isNow = bookingMode === "now";

    if (!vehicleType.value) {

        msg.innerText = "Select vehicle type";
        msg.classList.remove("hidden");

        vehicleType.classList.add("border-red-500");

        return;
    }

    var finalDateTime = null;

    if (isNow) {

        var now = new Date();

        var year = now.getFullYear();
        var month = String(now.getMonth() + 1).padStart(2, '0');
        var day = String(now.getDate()).padStart(2, '0');

        var hours = String(now.getHours()).padStart(2, '0');
        var minutes = String(now.getMinutes()).padStart(2, '0');
        var seconds = String(now.getSeconds()).padStart(2, '0');

        finalDateTime =
            `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

    } else {

        if (!dateInput.value || !timeInput.value) {

            msg.innerText = "Please select date and time";
            msg.classList.remove("hidden");

            return;
        }

        var selectedDateTime =
            new Date(dateInput.value + "T" + timeInput.value);

        var now = new Date();

        now.setSeconds(0, 0);

        if (selectedDateTime < now) {

            msg.innerText = "You cannot select past date/time";
            msg.classList.remove("hidden");

            return;
        }

        finalDateTime =
            dateInput.value + "T" + timeInput.value + ":00";
    }

    if (pickup.value.trim() === "") {

        msg.innerText = "Pickup location required";
        msg.classList.remove("hidden");

        pickup.classList.add("border-red-500");

        return;
    }

    if (destination.value.trim() === "") {

        msg.innerText = "Destination required";
        msg.classList.remove("hidden");

        destination.classList.add("border-red-500");

        return;
    }

    var form = new FormData();

    form.append("pickup", pickup.value);
    form.append("destination", destination.value);
    form.append("duration", duration);
    form.append("vehicleTypeId", vehicleType.value);
    form.append("dateTime", finalDateTime);
    form.append("distance", distance);

    var request = new XMLHttpRequest();

    request.onreadystatechange = function () {

        if (request.readyState === 4) {

            if (request.status === 200) {

                var response = JSON.parse(request.responseText);

                if (response.status === "success") {

                    document.getElementById("hireId").innerText =
                        response.hireId;

                    document.getElementById("baseFareText").innerText =
                        response.baseFare;

                    document.getElementById("pricePerKmText").innerText =
                        response.pricePerKm;

                    document.getElementById("totalFareText").innerText =
                        response.totalFare;

                    showFareModal();

                } else {

                    alert(response.message);
                }

            } else {

                alert("Something went wrong");
            }
        }
    };

    request.open("POST", "/hire/confirm", true);

    request.send(form);
}

function showFareModal() {
    document.getElementById("fare-modal-overlay").classList.remove("hidden");
}

function closeFareModal() {
    document.getElementById("fare-modal-overlay").classList.add("hidden");
}

function payHire() {
    var id = document.getElementById("hireId").innerText;
    window.location.href = "/payment/ui?id=" + id;
}