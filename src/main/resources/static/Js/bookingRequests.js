function acceptBooking(btn) {

    var hireId = btn.getAttribute("data-id");

    var request = new XMLHttpRequest();

    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == 200) {

            window.location.reload();
        }
    };

    request.open("GET", "/hire/assignDriver?hireId=" + hireId, true);
    request.send();
}