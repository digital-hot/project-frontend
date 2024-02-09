console.log("Working!")

createAccountsPerPage()
createPagingButtons()
fillTable()

function fillTable(pageNumber = 0, pageSize = $('.accounts-per-page').val()) {

    $.get(`/rest/players?pageNumber=${pageNumber}&pageSize=${pageSize}`, (playerData) => {
        $('.players-table tbody').empty();
        let $table = $('.players-table');

        $.each(playerData, function (i, item) {

            let $row = $('<tr data-id="' + item.id + '">').append(
                $('<td class="header-cell" >').text(item.id),
                $('<td class="header-cell" data-call-name="' + item.id + '">').text(item.name),
                $('<td class="header-cell" data-call-title>').text(item.title),
                $('<td class="header-cell" data-call-race>').text(item.race),
                $('<td class="header-cell" data-call-profession>').text(item.profession),
                $('<td class="header-cell" >').text(item.level),
                $('<td class="header-cell" >').text(new Date(item.birthday).toLocaleDateString()),
                $('<td class="header-cell" >').text(item.banned ? "Yes" : "No"),
                $('<td class="header-cell cell-small" >').html(
                    '<Button class="edit-button" data-id="' + item.id + '"><img src="../img/edit.png" class="edit-icon"/></Button>'),
                $('<td class="header-cell cell-small" >').html(
                    '<Button class="delete-button" data-id="' + item.id + '"><img src="../img/delete.png" class="delete-icon"/></Button>'),
            );
            $table.append($row);
        });
    });
}

function createPagingButtons() {
    $.get("/rest/players/count", function (pageCount) {
        const $pagination = $('.pagination-buttons').empty();
        for (let i = 1; i <= Math.ceil(pageCount / $('.accounts-per-page').val()); i++) {
            const $button = $('<button>')
                .addClass('page-btn' + (i === 1 ? ' activeButton' : ''))
                .text(i)
                .data('pageNumber', i - 1);
            $pagination.append($button);
        }
    });
}

function createAccountsPerPage() {
    let $countPage = $('.accounts-per-page').empty();
    for (let i = 3; i <= 20; i++) {
        const $option = $('<option>').val(i).text(i);
        $countPage.append($option);
    }
}

function setActiveButton(activePage) {
    $('.pagination-buttons .page-btn').removeClass('activeButton')
        .filter(function () {
            return $(this).data('pageNumber') == activePage;
        }).addClass('activeButton');
}

$('.accounts-per-page-wrapper').change(() => {
    createPagingButtons();
    fillTable();
});

$('.pagination-buttons').on('click', '.page-btn', function () {
    const pageNumber = $(this).data('pageNumber')
    fillTable(pageNumber);
    setActiveButton(pageNumber);
});

//delete button
$('.players-table').on('click', '.delete-button', function () {
    const itemId = $(this).data('id');
    console.log("test", itemId);
    $.ajax({
        url: `/rest/players/${itemId}`,
        type: 'DELETE',
        success: function () {
            createPagingButtons()
            fillTable()
        }
    });
});

//edit button
$('.players-table').on('click', '.edit-button', function () {
    const itemId = $(this).data('id');
    const editRow = $('.players-table').find(`tr[data-id="${itemId}"]`);
    editRow.find(`.delete-button`).hide();


    const $editName = editRow.find(`[data-call-name]`);
    const currentText = $editName.text();
    const inputField = $('<input>', {
        type: 'text',
        value: currentText,
        class: 'header-cell',
        'data-call-name': itemId
    });


    $editName.replaceWith(inputField);

    $(this).find('img').attr('src', 'img/save.png');

    $(this).removeClass('edit-button').addClass('save-button');
});

$('.players-table').on('click', '.save-button', function () {
    const itemId = $(this).data('id');
    console.log("test", itemId);
    console.log($(`[data-call-name="${itemId}"]`).data('data-call-name'));
    const data = JSON.stringify({

        name: $(`[data-call-name ="${itemId}"]`).val(),

    });

    $.ajax({
        url: `/rest/players/${itemId}`,
        type: 'POST',
        data: data,
        dataType: "json",
        contentType: "application/json",
        success: function () {
            createPagingButtons()
            fillTable()
        }
    });
});


$('.createAccountForm').submit(function (event) {
    event.preventDefault();

    const formData = {
        name: $('#name').val(),
        title: $('#title').val(),
        race: $('#race').val(),
        profession: $('#profession').val(),
        level: $('#level').val(),
        birthday: new Date($('#birthday').val()).getTime(),
        banned: $('#banned').is(':checked')
    };


    $.ajax({
        url: '/rest/players',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(formData),
        success: function (result) {
            console.log('create Account:', result);
            createPagingButtons()
            fillTable()
        },
        error: function (error) {
            console.error('error create Account:', error);
        }
    });
});
