$(document).on('click', '.back-btn, .modal-background', event => {
    console.log(event.target)
    if (event.target === $modalBackground.get()[0] || event.target === $('.back-btn').get()[0]) {
        $modalBackground.fadeOut('fast')
    }
});
