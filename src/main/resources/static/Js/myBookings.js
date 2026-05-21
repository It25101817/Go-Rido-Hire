function showBookingTab(sectionId, clickedBtn) {

    var sections = document.querySelectorAll('.booking-section');

    for (var i = 0; i < sections.length; i++) {

        sections[i].classList.add('hidden');
    }

    document.getElementById(sectionId)
        .classList.remove('hidden');

    var buttons = document.querySelectorAll('.booking-tab-btn');

    for (var j = 0; j < buttons.length; j++) {

        buttons[j].classList.remove(
            'bg-white',
            'text-zinc-950',
            'shadow-lg'
        );

        buttons[j].classList.add(
            'text-zinc-400'
        );
    }

    clickedBtn.classList.remove('text-zinc-400');

    clickedBtn.classList.add(
        'bg-white',
        'text-zinc-950',
        'shadow-lg'
    );
}

function cancelBooking(btn) {
    var id = btn.getAttribute("data-id");

    var form = new FormData();
    form.append("hireId", id);

    var request = new XMLHttpRequest();

    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == 200) {
            var response = request.responseText;

            if (response !== "success") {
                alert(response);
            } else {
                location.reload();
            }
        }
    };

    request.open("POST", "/hire/cancelBooking", true);
    request.send(form);
}